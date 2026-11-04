// @vitest-environment node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

const ROOT = join(__dirname, '..');
const DOMAIN_DIRS = ['models', 'engines', 'core', 'services'];
const BANNED = [/\bDate\.now\b/, /\bnew Date\b/, /\bMath\.random\b/, /\brandomUUID\b/, /\bgetRandomValues\b/, /\bperformance\.now\b/];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(p) && !/\.test\.tsx?$/.test(p) ? [p] : [];
  });
}

describe('determinism guard (no ambient time/randomness/ids in domain code)', () => {
  it('domain sources contain no banned calls', () => {
    const hits = DOMAIN_DIRS.flatMap((d) => walk(join(ROOT, d))).flatMap((file) =>
      readFileSync(file, 'utf8').split('\n').flatMap((line, i) =>
        !/^\s*(\/\*|\*)/.test(line) && BANNED.some((re) => re.test(line.replace(/\/\/.*$/, ''))) ? [`${relative(ROOT, file)}:${i + 1}`] : [],
      ),
    );
    expect(hits).toEqual([]);
  });

  it('the ESLint rule rejects banned calls and cross-layer imports', async () => {
    const eslint = new ESLint({ cwd: join(ROOT, '..') });
    const lint = async (code: string, path: string) =>
      (await eslint.lintText(code, { filePath: join(ROOT, path) }))[0]!.messages.map((m) => m.ruleId);
    expect(await lint('export const t = Date.now();\n', 'engines/x.ts')).toContain('no-restricted-syntax');
    expect(await lint('export const r = Math.random();\n', 'core/x.ts')).toContain('no-restricted-syntax');
    expect(await lint('export const u = crypto.randomUUID();\n', 'models/x.ts')).toContain('no-restricted-syntax');
    expect(await lint('export const d = new Date();\n', 'services/x.ts')).toContain('no-restricted-syntax');
    expect(await lint("import { Ledger } from '../core/state';\nexport { Ledger };\n", 'engines/x.ts')).toContain('no-restricted-imports');
    expect(await lint("import { a } from '../engines/accounting';\nexport { a };\n", 'models/x.ts')).toContain('no-restricted-imports');
    expect(await lint("import { a } from '../services/x';\nexport { a };\n", 'core/x.ts')).toContain('no-restricted-imports');
    expect(await lint('export const ok = 1;\n', 'engines/x.ts')).toEqual([]);
  }, 30_000);
});
