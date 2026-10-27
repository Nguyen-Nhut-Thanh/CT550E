import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const apiRoot = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const children = new Set();
let serverStarted = false;
let stopping = false;
let compilerOutput = '';

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  for (const child of children) child.kill();
}

function start(args, compiler = false) {
  const child = spawn(process.execPath, args, { cwd: apiRoot, env: process.env, stdio: ['inherit', 'pipe', 'pipe'] });
  children.add(child);
  child.stdout.on('data', data => {
    process.stdout.write(data);
    if (!compiler || serverStarted) return;
    compilerOutput = (compilerOutput + data.toString()).slice(-2048);
    // Do not start the API until its entry point and dependencies have compiled.
    if (/Found 0 errors\. Watching/.test(compilerOutput)) {
      serverStarted = true;
      start(['--watch-path=dist', 'dist/main.js']);
    }
  });
  child.stderr.on('data', data => process.stderr.write(data));
  child.on('error', error => { console.error(error); stop(1); });
  child.on('exit', code => {
    children.delete(child);
    if (!stopping) stop(code ?? 1);
  });
}

process.once('SIGINT', () => stop());
process.once('SIGTERM', () => stop());
start([require.resolve('typescript/bin/tsc'), '--watch', '--preserveWatchOutput', '-p', resolve(apiRoot, 'tsconfig.json')], true);
