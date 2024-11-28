import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx';
import postCssPxToRem from 'postcss-pxtorem'
import autoprefixer from 'autoprefixer'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(), vueJsx()
  ],
  esbuild: {
    loader: 'jsx',
    include: [
      // Only .js files in the `src` directory.
      'src/**/*.js',
      'src/**/*.jsx'
    ],
    // Exclude `node_modules` unless they are in the `src` directory.
    exclude: [],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  rules: [
    {
      test: /\.(png|jpe?g|gif)$/i,
      loader: 'file-loader',
      options: {
        name(_resourcePath, _resourceQuery) {
          // `resourcePath` - `/absolute/path/to/file.js`
          // `resourceQuery` - `?foo=bar`

          if (process.env.NODE_ENV === 'development') {
            return '[path][name].[ext]';
          }

          return '[contenthash].[ext]';
        },
      },
    },
  ],
  css: {
    postcss: {
      plugins: [
        postCssPxToRem({ // 自适应，px>rem转换
          rootValue: 16, // 1rem的大小
          propList: ['*'], // 需要转换的属性，这里选择全部都进行转换
          exclude: ['src/views/multiSearch/*'],
        }),
        autoprefixer({ // 自动添加前缀
          overrideBrowserslist: [
            "Android 4.1",
            "iOS 7.1",
            "Chrome > 31",
            "ff > 31",
            "ie >= 8"
            //'last 2 versions', // 所有主流浏览器最近2个版本
          ],
          grid: true
        })
      ]
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:9999/',
        // target: "http://xxxxxxxxx:9999/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/authapi': {
        target: 'http://xxxxxxxxx:3071/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/authapi/, '/authserver')
      }
    }
  }
})
