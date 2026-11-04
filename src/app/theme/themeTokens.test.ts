/**
 * Static checks for the theme: WCAG AA contrast of status colors and the amber
 * accent, and no hard-coded colors outside cryptex-theme.css.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = join(__dirname, '..', '..', '..');
const euiCss = readFileSync(join(root, 'node_modules/@enterprise-ui/react/dist/styles.css'), 'utf8');
const cxCss = readFileSync(join(__dirname, 'cryptex-theme.css'), 'utf8');

function block(css: string, selector: RegExp): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of css.matchAll(new RegExp(`${selector.source}\\s*\\{([^}]*)\\}`, 'g'))) {
    for (const d of (m[1] ?? '').matchAll(/(--[\w-]+)\s*:\s*([^;]+)/g)) out[d[1]!] = d[2]!.trim();
  }
  return out;
}

function tokens(theme: 'dark' | 'light'): Record<string, string> {
  return {
    ...block(euiCss, new RegExp(`\\[data-eui-theme=${theme}\\]`)),
    ...block(cxCss, /\[data-eui-theme\]/),
    ...block(cxCss, new RegExp(`\\[data-eui-theme='${theme}'\\]`)),
  };
}

function resolve(t: Record<string, string>, name: string): string {
  let v = t[name];
  for (let i = 0; v?.startsWith('var(') && i < 10; i++) v = t[v.slice(4, -1).trim()];
  if (!v) throw new Error(`unresolved ${name}`);
  return v;
}

function rgb(color: string, over?: [number, number, number]): [number, number, number] {
  let m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color);
  if (m) {
    const h = m[1]!.length === 3 ? [...m[1]!].map((c) => c + c).join('') : m[1]!;
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
  }
  m = /^rgba\(([^)]+)\)$/.exec(color);
  if (m && over) {
    const [r, g, b, a] = m[1]!.split(',').map(Number) as [number, number, number, number];
    return [r, g, b].map((c, i) => Math.round(c * a + over[i]! * (1 - a))) as [number, number, number];
  }
  throw new Error(`unsupported color ${color}`);
}

const lum = ([r, g, b]: [number, number, number]) => {
  const f = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrast = (a: [number, number, number], b: [number, number, number]) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p) as [number, number];
  return (x + 0.05) / (y + 0.05);
};

describe.each(['dark', 'light'] as const)('%s theme tokens', (theme) => {
  const t = tokens(theme);
  const surface = rgb(resolve(t, '--eui-color-surface'));

  it('uses the approved amber accent', () => {
    expect(resolve(t, '--eui-color-primary').toLowerCase()).toBe('#f59e0b');
  });

  it.each(['confirmed', 'pending', 'failed', 'warning'])('status %s text meets AA on surface and badge', (s) => {
    const text = rgb(resolve(t, `--cx-status-${s}-text`));
    const subtle = rgb(resolve(t, `--cx-status-${s}-subtle`), surface);
    expect(contrast(text, surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(text, subtle)).toBeGreaterThanOrEqual(4.5);
  });

  it('on-primary and selected text meet AA', () => {
    const primary = rgb(resolve(t, '--eui-color-primary'));
    expect(contrast(rgb(resolve(t, '--eui-color-on-primary')), primary)).toBeGreaterThanOrEqual(4.5);
    const selectedBg = rgb(resolve(t, '--eui-color-surface-selected'), surface);
    expect(contrast(rgb(resolve(t, '--eui-color-selected-text')), selectedBg)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('no hard-coded colors', () => {
  const srcDir = join(root, 'src');
  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? files(p) : [p];
    });
  const allowed = new Set(['src/app/theme/cryptex-theme.css']);
  const pattern = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i;

  it.each(
    files(srcDir)
      .filter((p) => /\.(css|tsx?)$/.test(p) && !p.endsWith('.test.ts') && !p.endsWith('.test.tsx'))
      .map((p) => relative(root, p).replaceAll('\\', '/'))
      .filter((p) => !allowed.has(p)),
  )('%s uses tokens only', (file) => {
    const offending = readFileSync(join(root, file), 'utf8')
      .split('\n')
      .filter((line) => pattern.test(line.replace(/&#\w+;/g, '')));
    expect(offending).toEqual([]);
  });
});
