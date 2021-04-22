#!/usr/bin/env node

import sade from 'sade';
import { loadConfig } from './config';
import { migrate } from './migrate';

const prog = sade('sanity-migrate');

prog
  .command('migrate', 'Migrate the Sanity dataset', { default: true })
  .option('--cwd', 'The working directory - equivalent to "(cd FOO && wmr)"')
	.action(opts => {
    const config = loadConfig(opts.cwd);
	  migrate(config);
	});

prog.parse(process.argv);
