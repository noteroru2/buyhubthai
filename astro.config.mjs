// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { isProgrammaticSeoLocalPage } from './src/lib/sitemap-paths.mjs';

const LEGACY_ALIAS_PATHS = [
  '/about',
  '/contact',
  '/how-it-works',
  '/blog',
  '/sell',
  '/service-area'
];

function shouldIncludeInSitemap(page) {
  const pathname = new URL(page).pathname.replace(/\/$/, '') || '/';
  if (pathname.includes('/draft/')) {
    return false;
  }

  if (LEGACY_ALIAS_PATHS.some((legacyPath) => pathname === legacyPath || pathname.startsWith(`${legacyPath}/`))) {
    return false;
  }

  if (isProgrammaticSeoLocalPage(pathname)) {
    return false;
  }

  return true;
}

const disableAstroToolbarOptimizer = () => ({
  name: 'buyhub:disable-astro-toolbar-optimizer',
  configResolved(config) {
    const blockedDeps = new Set([
      'astro > aria-query',
      'astro > axobject-query',
      'astro > html-escaper',
      'astro/toolbar',
      'astro/runtime/client/dev-toolbar/entrypoint.js'
    ]);
    const optimizeDeps = config.optimizeDeps ?? {};

    optimizeDeps.include = (optimizeDeps.include ?? []).filter((dep) => !blockedDeps.has(dep));
    optimizeDeps.exclude = [
      ...new Set([
        ...(optimizeDeps.exclude ?? []),
        'aria-query',
        'axobject-query',
        'astro/toolbar',
        'astro/runtime/client/dev-toolbar/entrypoint.js',
        'astro:*',
        'virtual:astro:*',
        'astro/virtual-modules/prefetch.js'
      ])
    ];

    if (!optimizeDeps.include.length) {
      optimizeDeps.noDiscovery = true;
    }

    if (optimizeDeps.esbuildOptions?.plugins) {
      optimizeDeps.esbuildOptions.plugins = optimizeDeps.esbuildOptions.plugins.filter(
        (plugin) => plugin.name !== 'astro:strip-toolbar-sourcemap'
      );
    }
  }
});

// https://astro.build/config
export default defineConfig({
  site: 'https://buyhubthai.com',
  trailingSlash: 'never',
  compressHTML: true,
  devToolbar: {
    enabled: false
  },

  vite: {
    plugins: [tailwindcss(), disableAstroToolbarOptimizer()]
  },

  integrations: [
    sitemap({
      filter: shouldIncludeInSitemap
    })
  ]
});
