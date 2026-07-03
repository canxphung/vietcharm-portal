import { spawn } from 'node:child_process';
import { statSync } from 'node:fs';
import { join } from 'node:path';

const startedAt = Date.now();
const indexPath = join(process.cwd(), 'dist', 'vietcharm-angular', 'browser', 'index.html');
let completed = false;
let exiting = false;

console.log('Starting Angular production build...');

const child = spawn(process.execPath, ['node_modules/@angular/cli/bin/ng.js', 'build', '--watch=false', '--progress=false'], {
  env: { ...process.env, CI: 'true', NG_CLI_ANALYTICS: 'false' },
  stdio: 'inherit',
});

const completeSuccessfully = () => {
  if (exiting) return;
  exiting = true;
  clearInterval(checkTimer);
  clearTimeout(timeoutTimer);
  child.kill('SIGTERM');
  process.exit(0);
};

const checkTimer = setInterval(() => {
  try {
    const stats = statSync(indexPath);
    if (stats.mtimeMs >= startedAt - 1000) {
      completed = true;
      clearInterval(checkTimer);
      setTimeout(completeSuccessfully, 1000);
    }
  } catch {
    // Build has not produced the browser index yet.
  }
}, 500);

const timeoutTimer = setTimeout(() => {
  if (completed) {
    completeSuccessfully();
    return;
  }
  console.error('Angular build timed out before producing browser output.');
  child.kill('SIGTERM');
  process.exit(1);
}, 120000);

child.on('error', (error) => {
  clearInterval(checkTimer);
  clearTimeout(timeoutTimer);
  console.error(error);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (exiting) return;
  clearInterval(checkTimer);
  clearTimeout(timeoutTimer);
  if (completed && (code === 0 || signal === 'SIGTERM')) process.exit(0);
  process.exit(code ?? 1);
});
