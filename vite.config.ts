/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv, type Plugin, type PluginOption, type UserConfig } from 'vite';
import { imagetools } from 'vite-imagetools';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

/** Raster images under src/assets/images, imported without a query string. */
const RASTER_IMAGE = /\/src\/assets\/images\/.+\.(jpe?g|png)$/;

/**
 * Build-time directives per image group. Imports stay plain (`import hero from '….jpg'`);
 * the build re-encodes to WebP and caps the width (never upscales).
 * - Heroes and banners are full-bleed `object-cover`, so they keep 1920px.
 * - Key-art tiles are at most 767px wide already; they are only re-encoded.
 * - PNG logos keep alpha and get a higher quality to keep edges crisp.
 */
const imageDirectives = (url: URL) => {
  const path = url.pathname;
  if (/\/games\/.+keyart\.|\/games\/.+key-art\./.test(path)) {
    return new URLSearchParams({ w: '768', format: 'webp', quality: '80' });
  }
  if (/logo\.png$/.test(path)) {
    return new URLSearchParams({ w: '1200', format: 'webp', quality: '90' });
  }
  if (path.endsWith('.png')) {
    return new URLSearchParams({ w: '1920', format: 'webp', quality: '85' });
  }
  return new URLSearchParams({ w: '1920', format: 'webp', quality: '80' });
};

/** Image optimization runs in production builds only, so dev and tests stay fast. */
const imagePlugins: PluginOption[] = [
  { ...imagetools({ include: RASTER_IMAGE, defaultDirectives: imageDirectives }), apply: 'build' },
  // SVGO for SVG assets. Rasters are handled by imagetools above.
  ViteImageOptimizer({
    test: /\.svg$/i,
    svg: {
      multipass: true,
      plugins: [
        // SVGO 4's preset keeps viewBox, so logos still scale inside their containers.
        'preset-default',
        { name: 'cleanupNumericValues', params: { floatPrecision: 2 } },
        { name: 'convertPathData', params: { floatPrecision: 2 } },
      ],
    },
  }),
];

/** Server-only settings for the live agent. Never prefixed with VITE_, so they never reach the browser. */
const AGENT_ENV_KEYS = ['ANTHROPIC_API_KEY', 'AGENT_LIVE', 'AGENT_DAILY_BUDGET_USD'] as const;

/**
 * Serves api/agent.ts during `npm run dev` the way Vercel does in production, so live mode
 * works locally with ANTHROPIC_API_KEY in .env.local. Without a key the app uses the demo engine.
 */
const agentApiDev = (): Plugin => ({
  name: 'ea-help:agent-api-dev',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use('/api/agent', (req, res, next) => {
      const handle = async () => {
        const handlers = await server.ssrLoadModule('/api/agent.ts');
        const handler = req.method === 'POST' ? handlers.POST : req.method === 'GET' ? handlers.GET : undefined;
        if (typeof handler !== 'function') {
          res.statusCode = 405;
          res.end();
          return;
        }
        const chunks: Uint8Array[] = [];
        for await (const chunk of req) chunks.push(chunk as Uint8Array);
        const headers = new Headers();
        for (const [key, value] of Object.entries(req.headers)) {
          if (typeof value === 'string') headers.set(key, value);
        }
        const request = new Request(new URL(req.originalUrl ?? '/api/agent', 'http://localhost'), {
          method: req.method,
          headers,
          body: req.method === 'POST' ? Buffer.concat(chunks) : undefined,
        });
        const response = (await handler(request)) as Response;
        res.statusCode = response.status;
        response.headers.forEach((value, key) => res.setHeader(key, value));
        res.end(await response.text());
      };
      handle().catch(next);
    });
  },
});

const config = {
  plugins: [react(), ...imagePlugins, agentApiDev()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router'],
        },
      },
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
} satisfies UserConfig;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of AGENT_ENV_KEYS) {
    if (env[key] && !process.env[key]) process.env[key] = env[key];
  }
  return config;
});
