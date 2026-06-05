import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: [
    './src/index.ts',
    './src/devtools/index.ts',
  ],
  format: 'esm',
  clean: true,
  platform: 'browser',
  dts: { resolve: true },
  external: ['react', 'react/jsx-runtime', 'react-dom', 'react-dom/client'],
  noExternal: [/.*/],
  treeshake: true,
  define: {
    global: 'globalThis',
  },
  nodeProtocol: true,
});