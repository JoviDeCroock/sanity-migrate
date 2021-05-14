# Sanity migrations

## Introduction

While using [`SanityCMS`](https://www.sanity.io/) we were often faced with the issue of migrating data
due to us changing one datatype to another or other reasons, this tool aims at making this a bit more ergonomic.

## Configuration

For `Sanity-Migrate` to do its job it'll need to know something about your dataset, this is
why we're going to look for a configuration in your `package.json` or a file in the cwd.

- package.json ("sanity-migrate"-key)
- sanity-migrate.config.js
- sanity-migrate.config.cjs
- sanity-migrate.config.mjs
- sanity-migrate.config.ts

Will all do the job so you can say tell the cli what dataset it needs to target.

[An example config](./example/sanity-migrate.config.js)

## Migrations

By default the cli will look for `process.cwd()/migrations` and go over all the `.js` files in there,
every migration found will be used.

```js
export async function up(transaction) {
  // This is the current transactional client, if you use this to patch/... it won't be part
  // of the transaction. So only use this one to "GET" data. 
  const client = transaction.client;
  // This gets some document
  const document = await client.getDocument('x');
  console.log('Found', document);
  // We use the transaction to patch some property, for instance we've moved to a localised string and need
  // to move the existing title to the "en" property.
  transaction
    .patch('x', {
      set: { 'title': { en: document.title } }
    })

  return transaction;
}
```

When all migrations execute the migration will commit and the cli will write a document to your dataset that looks like this:

```js
const migrationsDocument = {
  _id: '__SANITY_MIGRATE_CLI__migrations',
  _type: 'sanity-migrate.migrations',
  succeeded: [], // Contains all filenames of the "migrations" directory.
  lastRun: new Date(),
}
```

This way we make sure that we won't be executing migrations twice for the same dataset. There are a few guards in place so we can't
just rename a file and have it run again, you will get a "corrupt migrations directory" warning if one is present in succeeded but not
in the directory.

## Run it

You can run the cli by executing

```sh
yarn add -D sanity-migrate
## or
npm install --save-dev sanity-migrate
```

and running

```sh
sanity-migrate 
```

you can optionally add `--plan` to test out the migration.
