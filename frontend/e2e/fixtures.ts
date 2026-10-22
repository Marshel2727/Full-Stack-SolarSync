import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export const stateFile = path.resolve(__dirname, '../.e2e-state/accounts.json');
export type Accounts = { tag: string; password: string; admin: { id: string; email: string }; customer: { id: string; email: string; token: string } };
export function accounts(): Accounts { return JSON.parse(fs.readFileSync(stateFile, 'utf8')); }
export function fixtureCommand(action: string, input?: string): string {
  const args = ['compose'];
  if (process.env.E2E_COMPOSE_PROJECT) args.push('-p', process.env.E2E_COMPOSE_PROJECT);
  args.push('exec', '-T', 'solarsync-backend', 'python', '-m', 'tests.e2e_accounts', action);
  return execFileSync('docker', args, { cwd: path.resolve(__dirname, '../..'), input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'inherit'] });
}
