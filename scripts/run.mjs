import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
const localNode = path.resolve('node_modules/node/bin/node.exe');
const runtime = existsSync(localNode) ? localNode : process.execPath;
const [command, ...args] = process.argv.slice(2);
const entries = {
  test: ['vitest/vitest.mjs', 'run'],
  prisma: ['prisma/build/index.js'],
  seed: ['tsx/dist/cli.mjs', 'prisma/seed.ts'],
  e2e: ['@playwright/test/cli.js', 'test'],
};
const entry = entries[command] ?? ['next/dist/bin/next', command];
const result = spawnSync(
  runtime,
  [path.resolve('node_modules', entry[0]), ...entry.slice(1), ...args],
  {
    stdio: 'inherit',
    env: { ...process.env, PATH: `${path.dirname(runtime)}${path.delimiter}${process.env.PATH}` },
  },
);
process.exit(result.status ?? 1);
