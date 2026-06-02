import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import type { PreRenderedAsset } from 'rollup'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vuetify from 'vite-plugin-vuetify'
import Components from 'unplugin-vue-components/vite'
import ViteFonts from 'unplugin-fonts/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE')
  return {
    define: {
      __API_URL__: JSON.stringify(env.VITE_API_URL)
    },
    plugins: [
      vue(),
      vueJsx(),
      vuetify({ autoImport: true, styles: { configFile: 'src/styles/vuetify.scss' } }),
      Components(),
      ViteFonts({
        google: {
          families: [
            {
              name: 'Roboto',
              styles: 'wght@100;300;400;500;700;900',
            }
          ],
          display: 'optional',
        }
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      host: '0.0.0.0',
      port: 4173,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:5001/checkpoint-a9/europe-west3',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo: PreRenderedAsset) => {
            if (assetInfo.name === 'firebase-messaging-sw.js') {
              return '[name][extname]'
            }
            return 'assets/[name]-[hash][extname]'
          }
        }
      }
    }
  }
})
