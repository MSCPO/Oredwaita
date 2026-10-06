#!/usr/bin/env node
/* Token hygiene guard for OreDwaita:
 *  1. No raw colors (hex, rgba()/hsl(), CSS named colors) in component SCSS —
 *     colors live only in src/styles/oredwaita.scss.
 *  2. Every var(--ore-*) referenced in src must be defined in the token file. */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokenFile = join(root, 'src/styles/oredwaita.scss');

const tokenSrc = readFileSync(tokenFile, 'utf8');
const defined = new Set([...tokenSrc.matchAll(/(--ore-[a-z0-9-]+)\s*:/g)].map((m) => m[1]));

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.scss$/.test(e.name)) out.push(p);
  }
  return out;
}

const componentScss = walk(join(root, 'src/components'));
const violations = [];
const referenced = new Map();

const NAMED_COLORS =
  /\b(white|black|silver|gray|grey|red|maroon|yellow|olive|lime|green|aqua|cyan|teal|blue|navy|fuchsia|magenta|purple|brown|orange|pink|gold)\b/gi;
const ALLOWED_KEYWORDS = new Set(['transparent', 'currentcolor', 'inherit', 'none']);
const FUNCTION_NAMES_WITH_COLOR_WORDS = /\b(grayscale|drop-shadow)\b/gi;

function stripComments(line) {
  return line.replace(/\/\*.*?\*\//g, '').replace(/\/\/.*$/, '');
}

for (const file of componentScss) {
  const src = readFileSync(file, 'utf8');
  const lines = src.split('\n');
  lines.forEach((rawLine, i) => {
    const line = stripComments(rawLine);
    const hex = line.match(/#[0-9a-fA-F]{3,8}\b/);
    if (hex) violations.push(`${relative(root, file)}:${i + 1}  raw hex "${hex[0]}" — use a --ore-* token`);
    const funcColor = line.match(/\b(?:rgba?|hsla?|color-mix|oklch|lab|lch)\s*\(/i);
    if (funcColor) violations.push(`${relative(root, file)}:${i + 1}  raw color function "${funcColor[0].trim()}" — use a --ore-* token`);
    // Named colors are only meaningful as declaration values; scan the value part and
    // ignore var(...) token references, strings and function names that embed color words.
    const decl = line.match(/^\s*([-a-zA-Z][-a-zA-Z0-9]*)\s*:\s*([^;{}]+);?/);
    if (decl && !decl[1].startsWith('--')) {
      const value = decl[2]
        .replace(/var\([^)]*\)/gi, '')
        .replace(/(["']).*?\1/g, '')
        .replace(FUNCTION_NAMES_WITH_COLOR_WORDS, '');
      for (const m of value.matchAll(NAMED_COLORS)) {
        if (!ALLOWED_KEYWORDS.has(m[0].toLowerCase())) {
          violations.push(`${relative(root, file)}:${i + 1}  raw named color "${m[0]}" — use a --ore-* token`);
        }
      }
    }
    for (const m of line.matchAll(/var\((--ore-[a-z0-9-]+)/g)) {
      if (!referenced.has(m[1])) referenced.set(m[1], []);
      referenced.get(m[1]).push(`${relative(root, file)}:${i + 1}`);
    }
  });
}

const undefinedTokens = [...referenced.keys()].filter((t) => !defined.has(t));
for (const t of undefinedTokens) {
  violations.push(`undefined token ${t} referenced at:\n    ${referenced.get(t).join('\n    ')}`);
}

if (violations.length) {
  console.error(`✖ check-tokens failed (${violations.length}):\n`);
  for (const v of violations) console.error(`  ${v}`);
  process.exit(1);
}
console.log(`✓ check-tokens: ${componentScss.length} SCSS files clean, ${referenced.size} tokens verified`);
