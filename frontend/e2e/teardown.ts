import fs from 'node:fs';
import { fixtureCommand, stateFile } from './fixtures';

export default function teardown() {
  if (!fs.existsSync(stateFile)) return;
  fixtureCommand('cleanup', fs.readFileSync(stateFile, 'utf8'));
  fs.unlinkSync(stateFile);
}
