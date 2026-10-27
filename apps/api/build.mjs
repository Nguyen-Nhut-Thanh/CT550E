import { existsSync, lstatSync, readdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const apiRoot = dirname(fileURLToPath(import.meta.url));
const output = resolve(apiRoot, 'dist');
if (dirname(output) !== apiRoot || basename(output) !== 'dist') {
  throw new Error('Refusing to clean an unexpected output directory');
}
if (existsSync(output) && lstatSync(output).isSymbolicLink()) {
  throw new Error('Refusing to clean a linked output directory');
}

// Remove obsolete generated files when a module or type source has moved.
// Keep the watched directory itself alive. Replacing it detaches the running
// Windows dev server's directory watcher and leaves it serving stale routes.
if (existsSync(output)) {
  for (const entry of readdirSync(output)) {
    rmSync(resolve(output, entry), { recursive: true, force: true });
  }
}
const require = createRequire(import.meta.url);
const compiler = require.resolve('typescript/bin/tsc');
const result = spawnSync(process.execPath, [compiler, '-p', resolve(apiRoot, 'tsconfig.json')], {
  cwd: apiRoot,
  stdio: 'inherit',
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
