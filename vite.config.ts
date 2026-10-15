/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, type PluginOption } from 'vite';
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

export default defineConfig({
  plugins: [react(), ...imagePlugins],
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
});
