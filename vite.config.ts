import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'
import path from "path";
import viteCompression from 'vite-plugin-compression'
const isProd = process.argv[process.argv.length - 1] == 'prod'
export default defineConfig({
  base: !isProd ? '/supply-report-dev' : '/supply-report',
  plugins: [
    vue(),
    legacy({
      targets: ['defaults', 'ie >= 11', 'chrome 52'],  //需要兼容的目标列表，可以设置多个
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      renderLegacyChunks: true,
      polyfills: [
        'es.symbol',
        'es.array.filter',
        'es.promise',
        'es.promise.finally',
        'es/map',
        'es/set',
        'es.array.for-each',
        'es.object.define-properties',
        'es.object.define-property',
        'es.object.get-own-property-descriptor',
        'es.object.get-own-property-descriptors',
        'es.object.keys',
        'es.object.to-string',
        'web.dom-collections.for-each',
        'esnext.global-this',
        'esnext.string.match-all'
      ]
    }),
    viteCompression(),

  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: `../h5/supply-report${isProd ? '' : '-dev'}`,
    manifest: true,
    emptyOutDir: true,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: isProd ? true : false,
        drop_debugger: isProd ? true : false,
      },
    },
    chunkSizeWarningLimit: 5000,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/entry/[name][hash].js',
        chunkFileNames: 'assets/chunk/[name][hash].js',
        assetFileNames: 'assets/file/[name][hash].[ext]',
        manualChunks(id) {
          const NODE_MODULES = 'node_modules'
          if (id.includes(NODE_MODULES)) return 'vendor'
        },

      },
    }
  },
  server: {
    host: "0.0.0.0",
    proxy: {
      "/escort": {
        target: "https://api.dev.uboxol.com",
        changeOrigin: true,
        // rewrite(path) {
        //   return path.replace('/escort-pre', '')
        // },
      },
    }
  }
})
