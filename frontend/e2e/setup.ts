import fs from 'node:fs';
import path from 'node:path';
import { fixtureCommand, stateFile } from './fixtures';

export default function setup() {
  if (fs.existsSync(stateFile)) throw new Error('Fixture sebelumnya belum dibersihkan. Jalankan npm run test:e2e:cleanup.');
  const data = JSON.parse(fixtureCommand('create'));
  fs.mkdirSync(path.dirname(stateFile), { recursive: true });
  fs.writeFileSync(stateFile, JSON.stringify(data), { mode: 0o600 });
}
