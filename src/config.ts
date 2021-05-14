// @ts-ignore
import cosmiconfig from "cosmiconfig";

export type MigrateConfig = {
  dataset: string;
  projectId: string;
  token: string;
  version?: string;
  cwd: string;
}

export async function loadConfig(cwd?: string) {
	const { config }: { config: MigrateConfig } = (await (cosmiconfig('sanity-migrate')) || {});

  if (!config) {
    throw new Error(`Could not find a sanity-migrate.config in "${cwd}".`);
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
