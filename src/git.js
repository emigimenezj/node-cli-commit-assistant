import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

function clearStdout(stdout) { return stdout.trim().split('\n').filter(Boolean); }

export async function getChangedFiles() {
  const { stdout } = await execAsync('git status --porcelain');
  return clearStdout(stdout).map(line => line.split(' ').at(-1));
}

export async function getStagedFiles() {
  const { stdout } = await execAsync('git diff --cached --name-only');
  return clearStdout(stdout);
}

export async function gitCommit({ commit } = {}) {
  const { stdout } = await execAsync(`git commit -m "${commit}"`);
  return clearStdout(stdout);
}

export async function gitAdd({ files = [] } = {}) {
  const filesLine = files.join(' ');
  const { stdout } = await execAsync(`git add ${filesLine}`);
  return clearStdout(stdout);
}