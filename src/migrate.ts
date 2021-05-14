import sanity from '@sanity/client';
import fs, { promises as fsPromises } from 'fs';
import path from 'path';
import { MigrateConfig } from './config';
import url from 'url';

export type MigrationsDocumentType = {
  _id: string;
  _type: string;
  succeeded: string[];
  lastRun: Date;
}

export async function migrate(config: MigrateConfig, plan: boolean) {
  const client = sanity({
    projectId: config.projectId,
    dataset: config.dataset,
    token: config.token,
    withCredentials: true,
    useCdn: false,
    useProjectHostname: true,
    apiVersion: config.version || undefined,
  });

  const migrationsDirectory = path.resolve(config.cwd, 'migrations');
  const migrationsFolder = fs.existsSync(migrationsDirectory);

  if (!migrationsFolder) {
    console.warn(`Could not find a migration folder at ${migrationsDirectory}.`);
    return;
  }

  const migrations = await fsPromises.readdir(migrationsDirectory);

  let migrationsDocument: MigrationsDocumentType | undefined = await client.getDocument('__SANITY_MIGRATE_CLI__migrations');
  if (!migrationsDocument) {
    console.log(`Could not find an existing migrations document for the ${process.env.SANITY_DATASET} dataset, creating new...`);
    migrationsDocument = {
      _id: '__SANITY_MIGRATE_CLI__migrations',
      _type: 'sanity-migrate.migrations',
      succeeded: [],
      lastRun: new Date(),
    }
    if (!plan) await client.create(migrationsDocument);
  }

  if (!migrationsDocument.succeeded || !Array.isArray(migrationsDocument.succeeded)) {
    console.warn(`Corrupt migrations document.`);
    return;
  }

  if (migrationsDocument.succeeded.some(m => !migrations.includes(m))) {
    const migrationsMissing = migrationsDocument.succeeded.filter(m => !migrations.includes(m))
    console.error(`Corrupt migrations directory detected, missing:\n${migrationsMissing.join(', ')}.`);
    return;
  }

  const migrationToExecute = migrations.filter(m => !migrationsDocument!.succeeded.includes(m));
  const transation = client.transaction();
  try {
    for (const migration of migrationToExecute) {
      const { up } = await import(url.pathToFileURL(path.resolve(migrationsDirectory, migration)).toString());
      if (!up || typeof up !== 'function') {
        throw new Error(`${migration} does not export an "up" function.`);
      }
      await up(transation, client);
    }
  } catch (e) {
    console.error(`A migration errored... Rolling back`);
    console.error(e);
    transation.reset();
    return;
  }

  if (!plan) {
    try {
      const result = await transation.commit();
      console.log(`Migrations succeeded, the result:\n\n${JSON.stringify(result, undefined, 2)}`);
      await client.createOrReplace({
        _id: '__SANITY_MIGRATE_CLI__migrations',
        _type: 'sanity-migrate.migrations',
        succeeded: migrations,
        lastRun: new Date(),
      });
    } catch (e) {
      console.error(`A migration errored... Rolling back`);
      console.error(e);
      transation.reset();
      return;
    }
  } else {
    console.log(`Migrations output: ${transation.serialize()}`)
  }
}
