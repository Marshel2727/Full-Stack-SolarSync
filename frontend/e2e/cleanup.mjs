import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const state = path.join(root, 'frontend/.e2e-state/accounts.json');
if (fs.existsSync(state)) {
  const args = ['compose'];
  if (process.env.E2E_COMPOSE_PROJECT) args.push('-p', process.env.E2E_COMPOSE_PROJECT);
  args.push('exec', '-T', 'solarsync-backend', 'python', '-m', 'tests.e2e_accounts', 'cleanup');
  execFileSync('docker', args, { cwd: root, input: fs.readFileSync(state), stdio: ['pipe', 'inherit', 'inherit'] });
  fs.unlinkSync(state);
}
