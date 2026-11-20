import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const cwd = dirname(fileURLToPath(import.meta.url));
const windows = process.platform === 'win32';
const venv = join(cwd, '.venv', windows ? 'Scripts/python.exe' : 'bin/python');
const localPython = windows && process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, 'Python/bin/python.exe') : '';
const executable = process.env.AI_PYTHON || (localPython && existsSync(localPython) ? localPython : windows ? 'python' : 'python3');
const tasks = {
  dev: ['main.py', '--reload'], start: ['main.py'],
  index: ['-m', 'app.scripts.index_tours'], test: ['-m', 'unittest', 'discover', '-s', 'tests'],
};
const task = process.argv[2];

function setupStep(command, args) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (task === 'setup') {
  if (!existsSync(venv)) setupStep(executable, ['-m', 'venv', '.venv']);
  setupStep(venv, ['-m', 'pip', 'install', '-r', 'requirements.txt']);
} else if (tasks[task]) {
  if (!existsSync(venv) && !process.env.AI_PYTHON) {
    console.error('Python AI dependencies are missing. Run npm run setup --workspace=ai first.');
    process.exit(1);
  }
  const child = spawn(existsSync(venv) ? venv : executable, tasks[task], { cwd, stdio: 'inherit' });
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => child.kill(signal));
  child.on('error', error => { console.error(error.message); process.exitCode = 1; });
  child.on('exit', code => { process.exitCode = code ?? 0; });
} else {
  throw new Error('Unknown AI workspace command');
}
