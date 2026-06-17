import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import type { LogLevel, RolldownLog } from 'rolldown'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import Pages from 'vite-plugin-pages'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    Pages({
      dirs: 'src/pages',
      exclude: ['**/*.spec.*', '**/*.test.*', '**/__tests__/**'],
    }),
    AutoImport({
      include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/],
      exclude: [
        /[\\/]node_modules[\\/]/,
        /[\\/]dist[\\/]/,
        /[\\/]nuxt-compat\.ts$/,
        /[\\/]useDashboard\.ts$/,
        /[\\/]useSettings\.ts$/,
        /[\\/]supabase\.ts$/,
      ],
      imports: [
        'vue',
        'vue-router',
        {
          '@unhead/vue': ['useHead', 'useSeoMeta'],
          '@vueuse/core': ['useWindowScroll', 'useStorage', 'useDark', 'useToggle', 'useOnline', 'watchDebounced'],
        },
      ],
      dts: 'src/auto-imports.d.ts',
      dirs: ['src/composables', 'src/lib'],
      vueTemplate: true,
    }),
    Components({
      include: [/\.vue$/, /\.vue\?vue/],
      exclude: [/[\\/]node_modules[\\/]/, /[\\/]dist[\\/]/],
      dirs: ['src/components'],
      deep: true,
      dts: 'src/components.d.ts',
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: 'Aemy Finance',
        short_name: 'Aemy',
        description: 'Personal finance manager with multi-currency support, budgets, bills, goals, and partner sharing.',
        theme_color: '#c24232',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,ico,png,svg,woff2}'],
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.iconify\.design\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'iconify-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
              fetchOptions: { mode: 'cors' },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/api\.exchangerate\.fun\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'exchangerate-api-cache',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'unsplash-image-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
              fetchOptions: { mode: 'cors' },
            },
          },
          {
            urlPattern: /^https:\/\/[a-z]+\.[a-z]+\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            method: 'GET',
            options: {
              cacheName: 'supabase-api-cache',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rolldownOptions: {
      output: {
        entryFileNames: '[hash:12].js',
        chunkFileNames: '[hash:12].js',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const match = id.match(/[\\/]node_modules[\\/]((?:@[^\\/]+[\\/])?[^\\/]+)[\\/]/)
            if (match) {
              const pkg = match[1].replace('/', '-')
              return `vendor-${pkg}`
            }
          }
        },
      },
      onLog(level: LogLevel, log: RolldownLog) {
        if (log.code === 'INVALID_ANNOTATION' && log.message.includes('@vueuse/core')) {
          return
        }
      },
    },
    cssCodeSplit: true,
    chunkSizeWarningLimit: 500,
  },
  optimizeDeps: {
    include: ['@unovis/vue', '@unovis/ts'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
