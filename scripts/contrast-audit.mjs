#!/usr/bin/env node
/* WCAG contrast audit for OreDwaita key fg/bg pairs (light + dark).
 *
 * Tokens are parsed directly from src/styles/oredwaita.scss (regex + brace
 * tracking — no SCSS compilation, no dependencies). The light scope is the
 * `:root` primitives block plus the `:root, .ore-theme-light` block; the dark
 * scope is the primitives plus the
 * `@media (prefers-color-scheme: dark) { :root:not(.ore-theme-light) }` block
 * merged with the `.ore-theme-dark` block (duplicate definitions must agree).
 * `var(--ore-x)` references — including chains — are resolved recursively to
 * their underlying value with a cycle guard; rgba() and other literals are
 * kept as-is. Audit entries reference `--ore-*` token names (a raw color
 * literal is allowed only where the SCSS has no matching token). Exit code is
 * 1 if any pair misses its WCAG requirement, 0 otherwise. */
import fs from 'node:fs';

const SCSS_PATH = new URL('../src/styles/oredwaita.scss', import.meta.url);

const hexToRgb = (h) => {
  h = h.replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const lum = (hex) => {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (fg, bg) => {
  const [l1, l2] = [lum(fg), lum(bg)].sort((a, b) => b - a);
  return (l1 + 0.05) / (l2 + 0.05);
};

/* Collect `--ore-*: value;` declarations, grouped by scope:
 * base (:root primitives), light (:root, .ore-theme-light), darkMedia
 * (inside @media prefers-color-scheme: dark) and darkClass (.ore-theme-dark). */
const parseTokens = (scssText) => {
  const src = scssText.replace(/\/\*[\s\S]*?\*\//g, ' ');
  const scopes = { base: new Map(), light: new Map(), darkMedia: new Map(), darkClass: new Map() };
  const VAR_DECL = /^(--[\w-]+)\s*:\s*(.+)$/;
  const classify = (chain) => {
    const inner = chain[chain.length - 1].replace(/\s+/g, ' ').trim();
    if (inner === ':root:not(.ore-theme-light)') {
      if (!chain.some((s) => s.includes('prefers-color-scheme: dark'))) {
        throw new Error(`:root:not(.ore-theme-light) outside a dark media query: ${chain.join(' > ')}`);
      }
      return 'darkMedia';
    }
    if (inner === '.ore-theme-dark') return 'darkClass';
    if (inner === ':root') return 'base';
    if (inner === ':root, .ore-theme-light') return 'light';
    return null;
  };

  const stack = []; // selector preludes of open blocks
  let buf = ''; // text since the last {, } or ;
  const handleDecl = () => {
    if (!stack.length) return;
    const m = buf.trim().match(VAR_DECL);
    if (m) {
      const scope = classify(stack);
      if (scope) scopes[scope].set(m[1], m[2].trim());
    }
  };
  for (const ch of src) {
    if (ch === '{') {
      stack.push(buf);
      buf = '';
    } else if (ch === '}') {
      handleDecl();
      stack.pop();
      buf = '';
    } else if (ch === ';') {
      handleDecl();
      buf = '';
    } else {
      buf += ch;
    }
  }
  return scopes;
};

const buildScopes = (scssText) => {
  const { base, light, darkMedia, darkClass } = parseTokens(scssText);
  // Merge the two dark definitions; if a name appears in both they must agree.
  const dark = new Map(base);
  for (const [k, v] of darkMedia) dark.set(k, v);
  for (const [k, v] of darkClass) {
    if (dark.has(k) && dark.get(k) !== v) {
      throw new Error(
        `Dark token ${k} disagrees between the @media dark block ('${dark.get(k)}') and .ore-theme-dark ('${v}')`,
      );
    }
    dark.set(k, v);
  }
  return { light: new Map([...base, ...light]), dark };
};

const VAR_REF = /^var\(\s*(--[\w-]+)\s*(?:,[^)]*)?\)$/;
const resolveToken = (scope, name, seen = new Set()) => {
  if (!scope.has(name)) throw new Error(`Unknown token '${name}' in src/styles/oredwaita.scss`);
  if (seen.has(name)) throw new Error(`Cycle resolving '${name}': ${[...seen, name].join(' -> ')}`);
  seen.add(name);
  const raw = scope.get(name);
  const m = raw.match(VAR_REF);
  return m ? resolveToken(scope, m[1], seen) : raw;
};

/* An audit value is either a --ore-* token name (resolved for its scope) or a
 * literal color string, which passes through untouched. */
const color = (scope, v) => (v.startsWith('--') ? resolveToken(scope, v) : v);

const audits = [
  // [name, fg, bg, requirement (AA: 4.5 text, 3.0 UI/large)]
  // fg/bg are --ore-* token names resolved per scope from src/styles/oredwaita.scss;
  // the audit scope comes from the 'light:'/'dark:' prefix of the name.
  ['light: white on accent green fill #3C8527', '--ore-white', '--ore-green-3', 4.5],
  ['light: white on accent hover green', '--ore-white', '--ore-accent-hover', 3.0],
  ['light: white on destructive fill #D10133', '--ore-white', '--ore-red-3', 4.5],
  ['light: #111 on warning yellow', '--ore-black', '--ore-yellow-3', 4.5],
  ['light: navy-2 link on window', '--ore-navy-2', '--ore-window-bg-color', 4.5],
  ['light: window fg on window', '--ore-window-fg-color', '--ore-window-bg-color', 4.5],
  ['light: accent text (green-4) on window', '--ore-green-4', '--ore-window-bg-color', 4.5],
  ['light: destructive text (red-4) on window', '--ore-red-4', '--ore-window-bg-color', 4.5],
  ['dark: white on brand green fill #3C8527', '--ore-white', '--ore-green-3', 4.5],
  ['dark: white on destructive fill #D10133', '--ore-white', '--ore-red-3', 4.5],
  ['dark: white on destructive hover #E60039', '--ore-white', '--ore-red-bright', 3.0],
  ['dark: accent text (green hover) on window', '--ore-accent-color', '--ore-window-bg-color', 4.5],
  ['dark: destructive text (red-bright-2) on window', '--ore-red-bright-2', '--ore-window-bg-color', 4.5],
  ['dark: warning yellow on dark window', '--ore-yellow-3', '--ore-window-bg-color', 4.5],
  ['dark: window fg on dark window', '--ore-window-fg-color', '--ore-window-bg-color', 4.5],
];

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const scopes = buildScopes(fs.readFileSync(SCSS_PATH, 'utf8'));

let fail = 0;
console.log('Pair'.padEnd(48), 'ratio'.padEnd(7), 'req', ' verdict');
for (const [name, fgRef, bgRef, req] of audits) {
  const scope = name.startsWith('dark:') ? scopes.dark : scopes.light;
  const fg = color(scope, fgRef);
  const bg = color(scope, bgRef);
  if (!HEX.test(fg) || !HEX.test(bg)) {
    throw new Error(`Pair '${name}' resolved to a non-hex color (${fg} on ${bg}); audit math supports hex only`);
  }
  const r = ratio(fg, bg);
  const ok = r >= req;
  if (!ok) fail++;
  console.log(
    name.padEnd(48),
    r.toFixed(2).padEnd(7),
    String(req).padEnd(4),
    ok ? '✓' : '✗ FAIL',
  );
}
process.exit(fail ? 1 : 0);
