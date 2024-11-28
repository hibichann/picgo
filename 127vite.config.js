import {defineConfig, loadEnv} from 'vite'
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import AutoImport from 'unplugin-auto-import/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
import path from 'path';

import {resolve} from "path";
import viteCompression from "vite-plugin-compression";
import { createHtmlPlugin } from 'vite-plugin-html';
import vitePluginMd2Vue from 'vite-plugin-md2vue';

export default defineConfig(({command, mode}) => {
  const env = loadEnv(mode, process.cwd());
  const {VITE_PUBLICPATH,NODE_ENV} = env;
  const htmlTemplate = (process.env.NODE_ENV === 'production'? "./index.html" : "./src/mock/index.html");
  return {
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
        imports:[
          'vue',
          {'lodash':['_']},
          {'element-plus':['ElMessage','ElMessageBox']},
          {'@/utils/AxiosRequest':['ajaxRequest']},
          {'@/utils/FileUtil':['getImageUrl','getFileUrl','getTempFileUrl']},
          {'@/utils/date':['formatDate','getDate','getTimeListIndex','getCurrentMonth']}
        ],
        dts:'./src/types/auto-imports.d.ts'
      }),
      Components({
        resolvers: [ElementPlusResolver({importStyle: 'sass'})],
        dts:'./src/types/components.d.ts'
      }),
      viteCompression({
        algorithm: 'gzip',
        threshold: 10240, // 只有大小大于该值的资源会被处理 10240
        deleteOriginFile: false // 删除原文件
      }),
      createHtmlPlugin({
        minify: true,
        template:htmlTemplate
      }),
      vitePluginMd2Vue(),
      // svg icon
      createSvgIconsPlugin({
        // 指定图标文件夹
        iconDirs: [path.resolve(process.cwd(), "src/icons/svg")],
        // 指定 symbolId 格式
        symbolId: "icon-[dir]-[name]"
      }),
    ],
    resolve: {
      // 设置文件目录别名; 根目录地址变更，也需要调整
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    base: VITE_PUBLICPATH,
    build: {
      outDir: `dist` + VITE_PUBLICPATH,
      cssCodeSplit: true,
      copyPublicDir: true,
      emptyOutDir: true, //构建时默认先清空dist目录
      minify: 'terser', // 混淆器，terser构建后文件体积更小
      terserOptions: {
        // 生产环境下移除console
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      rollupOptions: {
        output: {
          entryFileNames: `js/[name].[hash].js`,
          chunkFileNames: `js/[name].[hash].js`,
          assetFileNames: `[ext]/[name].[hash].[ext]`,
          // assetFileNames: (assetInfo)=>{
          //     let ext = assetInfo.name;
          //     if( (/[js]$/).test(ext) ){
          //         return `js/[name].[hash].[ext]`;
          //     }
          //     return `css/[name].[hash].[ext]`;
          // }
        }
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/assets/scss/theme/el-theme.scss" as *;`,
        },
      },
    },
    server: {
      open: true
    }
  }
});
