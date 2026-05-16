#!/usr/bin/env tsx
/**
 * Create or update an admin user.
 *
 * Usage:
 *   pnpm admin:create
 *     -> prompts interactively for email + password
 *
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... pnpm admin:create
 *     -> non-interactive (use for one-off Vercel runs / CI)
 *
 * Password must be ≥ 12 chars. Stored as bcrypt hash (12 rounds).
 */

import * as readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function prompt(label: string, hide = false): Promise<string> {
  const rl = readline.createInterface({ input: stdin, output: stdout, terminal: !hide });
  if (hide) {
    process.stdout.write(label);
    // Hide input
    (stdin as NodeJS.ReadStream & { setRawMode?: (m: boolean) => void }).setRawMode?.(true);
    return await new Promise<string>((resolve) => {
      let buf = '';
      stdin.on('data', (chunk: Buffer) => {
        const s = chunk.toString();
        for (const ch of s) {
          if (ch === '\r' || ch === '\n') {
            stdin.removeAllListeners('data');
            (stdin as NodeJS.ReadStream & { setRawMode?: (m: boolean) => void }).setRawMode?.(false);
            process.stdout.write('\n');
            rl.close();
            resolve(buf);
            return;
          }
          if (ch === '') process.exit(1);
          if (ch === '') {
            buf = buf.slice(0, -1);
            continue;
          }
          buf += ch;
        }
      });
    });
  }
  const ans = await rl.question(label);
  rl.close();
  return ans;
}

async function main() {
  const envEmail = process.env.ADMIN_EMAIL?.trim();
  const envPass = process.env.ADMIN_PASSWORD;

  const email = (envEmail || (await prompt('Admin email: '))).trim().toLowerCase();
  if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email)) {
    console.error('Invalid email.');
    process.exit(1);
  }

  const password = envPass || (await prompt('Admin password (min 12): ', true));
  if (!password || password.length < 12) {
    console.error('Password must be at least 12 characters.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await db.user.upsert({
    where: { email },
    update: { role: 'ADMIN', passwordHash },
    create: { email, role: 'ADMIN', passwordHash, emailVerified: new Date() },
  });

  console.log(`+ admin ready: ${user.email} (id=${user.id})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
