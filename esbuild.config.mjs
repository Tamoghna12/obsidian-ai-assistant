import { build, context } from 'esbuild';
import { readFile } from 'fs/promises';
import { join } from 'path';

const isProduction = process.argv.includes('production');

// Read the manifest to get the version
const manifest = JSON.parse(await readFile(join(process.cwd(), 'manifest.json'), 'utf-8'));
const version = manifest.version;

const options = {
  entryPoints: ['src/main.ts'],
  bundle: true,
  external: [
    'obsidian',
    'electron',
    '@codemirror/*',
    '@lezer/*',
    'ollama',
    'openai',
    '@anthropic-ai/sdk'
  ],
  format: 'cjs',
  globalName: 'AIAssistant',
  sourcemap: isProduction ? false : 'inline',
  define: {
    'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
    'PLUGIN_VERSION': JSON.stringify(version)
  },
  minify: isProduction,
  treeShaking: true,
  outfile: 'main.js',
  logLevel: 'info',
  tsconfig: 'tsconfig.json'
};

if (isProduction) {
  await build(options);
} else {
  const ctx = await context(options);
  await ctx.watch();
  console.log('Watching for changes...');
}