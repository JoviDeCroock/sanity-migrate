// @ts-ignore
import { loadCosmiConfig } from "cosmiconfig-lite";

export type MigrateConfig = {
  dataset: string;
  projectId: string;
  token: string;
  cwd: string;
}

export function loadConfig(cwd?: string) {
	const config: MigrateConfig = loadCosmiConfig(
		"sanity-migrate",
		cwd || process.cwd()
  );

  if (!config) {
    throw new Error(`Could not find a sanity-migrate.config in "${cwd || process.cwd()}".`);
  }

  if (!config.dataset || typeof config.dataset !== 'string') {
    throw new Error(`Could not find a valid dataset property in your config.`);
  }

  if (!config.token || typeof config.token !== 'string') {
    throw new Error(`Could not find a valid token property in your config.`);
  }

  if (!config.projectId || typeof config.projectId !== 'string') {
    throw new Error(`Could not find a valid projectId property in your config.`);
  }

	return {
    ...config,
    cwd: cwd || process.cwd(),
  };
}
