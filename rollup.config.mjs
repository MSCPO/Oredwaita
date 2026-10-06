import { readFileSync } from 'fs';
import { defineConfig } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import url from '@rollup/plugin-url';
import svgr from '@svgr/rollup';
import external from 'rollup-plugin-peer-deps-external';
import styles from 'rollup-plugin-styles';
import typescriptEngine from 'typescript';

const packageJson = JSON.parse(readFileSync('./package.json'));

/* Fresh plugin instances per build — rollup-plugin-styles keeps internal CSS
 * state that must not leak between the ESM and CJS passes. */
const makePlugins = () => [
  external({ includeDependencies: true }),
  resolve({
    ignoreGlobal: false,
    include: ['node_modules/**'],
    skip: ['react', 'react-dom'],
  }),
  commonjs(),
  svgr(),
  url(),
  typescript({
    tsconfig: './tsconfig.json',
    typescript: typescriptEngine,
    sourceMap: true,
    exclude: [
      'coverage',
      '.storybook',
      'storybook-static',
      'config',
      'dist',
      'node_modules/**',
      '*.cjs',
      '*.mjs',
      '**/__snapshots__/*',
      '**/.storybook/*',
      '**/__tests__',
      '**/*.test.js+(|x)',
      '**/*.test.ts+(|x)',
      '**/*.mdx',
      '**/*.story.ts+(|x)',
      '**/*.story.js+(|x)',
      '**/*.stories.ts+(|x)',
      '**/*.stories.js+(|x)',
      'setupTests.ts',
      'vite.config.ts',
      'vitest.config.ts',
      'eslint.config.js',
    ],
  }),
  styles({
    // All SCSS is extracted to a single distributable stylesheet; the JS output
    // keeps no runtime injection. Consumers import 'oredwaita/styles.css'.
    mode: ['extract', 'oredwaita.css'],
    sourceMap: true,
  }),
  /* rollup-plugin-styles emits the stylesheet as a content-hashed asset; rename
   * it (and its source map) so package exports stay stable at 'oredwaita.css'. */
  {
    name: 'stable-css-filename',
    generateBundle(_options, bundle) {
      for (const key of Object.keys(bundle)) {
        const asset = bundle[key];
        if (asset.type !== 'asset') {
          continue;
        }
        if (/^assets\/oredwaita.*\.css$/.test(key)) {
          // Point the inline sourceMappingURL comment at the stable map name.
          asset.source = String(asset.source).replace(
            /sourceMappingURL=[^\s*'")]+\.css\.map/,
            'sourceMappingURL=oredwaita.css.map',
          );
          delete bundle[key];
          asset.fileName = 'oredwaita.css';
          bundle['oredwaita.css'] = asset;
        } else if (/^assets\/oredwaita.*\.css\.map$/.test(key)) {
          delete bundle[key];
          asset.fileName = 'oredwaita.css.map';
          // Keep the map's 'file' and 'sources' references in sync with the
          // renamed stylesheet and its new location at the dist root.
          const map = JSON.parse(String(asset.source));
          map.file = 'oredwaita.css';
          map.sources = map.sources.map((source) => source.replace(/^(\.\.\/)+src\//, '../src/'));
          asset.source = JSON.stringify(map);
          bundle['oredwaita.css.map'] = asset;
        }
      }
    },
  },
];

export default defineConfig([
  // ESM, module-preserving: consumer bundlers tree-shake unused components.
  {
    input: './src/index.ts',
    output: [
      {
        dir: 'dist',
        format: 'es',
        exports: 'named',
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        sourcemap: true,
      },
    ],
    plugins: makePlugins(),
  },
  // Single-file CJS for require() consumers (tree-shaking does not apply there).
  {
    input: './src/index.ts',
    output: [
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        exports: 'named',
        sourcemap: true,
      },
    ],
    plugins: makePlugins(),
  },
]);
