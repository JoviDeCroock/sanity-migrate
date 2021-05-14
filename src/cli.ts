#!/usr/bin/env node

import sade from 'sade';
import { loadConfig } from './config';
import { migrate } from './migrate';

const prog = sade('sanity-migrate');

prog
  .command('migrate', 'Migrate the Sanity dataset', { default: true })
  .option('--cwd', "The directory containing the migrations directory")
  .option('--plan', 'This option will prevent the transaction from performing a commit')
	.action(async opts => {
    try {
      const config = await loadConfig(opts.cwd);
      await migrate(config, !!opts.plan);
    } catch (e) {
      console.error(e);
    }
	});

prog.parse(process.argv);
