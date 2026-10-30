import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function loadServerEnv() {
  // Resolve from this file so startup works from the project root, the server
  // folder, or a Nodemon configuration with another working directory.
  const serverDirectory = dirname(fileURLToPath(import.meta.url));
  const envFiles = [resolve(serverDirectory, '../../.env'), resolve(serverDirectory, '../../../.env')];
  for (const envPath of envFiles) {
    if (existsSync(envPath)) dotenv.config({ path: envPath });
  }
}
