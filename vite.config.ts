/// <reference types="vitest/config" />
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { viteSingleFile } from 'vite-plugin-singlefile'

/*
  Two ways to build:

  npm run build       The installable web app (PWA) for hosting online.
                      Output: dist/

  npm run build:file  ONE self-contained file, Vector.html, that opens by
                      double-clicking it. No server, no internet, no install.
                      Made for submitting on Canvas. Output: submission/

  base: './' keeps every path relative, so either build works from any folder.
*/
export default defineConfig(({ mode }) => {
  const single = mode === 'single'

  return {
    base: './',
    // The lessons are bundled into the app so it works offline; that makes the
    // main file big on purpose (about 210 KB gzipped).
    build: single ? { outDir: 'dist-single', emptyOutDir: true, chunkSizeWarningLimit: 5000 } : { chunkSizeWarningLimit: 1000 },
    resolve: single
      ? {
          // A plain file can't run a service worker, so offline caching is
          // swapped for a do-nothing stand-in. (The file is already offline.)
          alias: { 'virtual:pwa-register': fileURLToPath(new URL('./src/pwa-stub.ts', import.meta.url)) },
        }
      : undefined,
    plugins: single
      ? [react(), viteSingleFile(), inlineFavicon()]
      : [
          react(),
          VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['logo.svg'],
            pwaAssets: {
              image: 'public/logo.svg',
              preset: 'minimal-2023',
              includeHtmlHeadLinks: true,
              overrideManifestIcons: true,
            },
            manifest: {
              name: 'Vector: Money Skills',
              short_name: 'Vector',
              description: 'Learn money skills in bite-sized, game-like lessons.',
              theme_color: '#1FB760',
              background_color: '#FFFFFF',
              display: 'standalone',
              orientation: 'any',
              start_url: './',
              scope: './',
              categories: ['education', 'finance'],
            },
            workbox: {
              globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
              navigateFallback: 'index.html',
            },
          }),
        ],
    test: {
      environment: 'node',
      // The content registry uses import.meta.glob, which a cached transform
      // won't refresh when new unit files appear. Always re-transform.
      fsModuleCache: false,
      // Some UI tests play whole lessons in a fake browser; give them room on slow machines.
      testTimeout: 30_000,
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    },
  }
})

/** Puts the logo right into the page as the tab icon, so the single file needs nothing else. */
function inlineFavicon(): Plugin {
  return {
    name: 'vector-inline-favicon',
    transformIndexHtml(html) {
      const svg = readFileSync(new URL('./public/logo.svg', import.meta.url), 'utf8')
      const href = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
      return html.replace('</head>', `    <link rel="icon" type="image/svg+xml" href="${href}" />\n  </head>`)
    },
  }
}
