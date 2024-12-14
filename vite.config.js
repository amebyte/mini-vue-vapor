import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import * as CompilerVapor from './compiler-vapor/src/index2'
// import vitePluginTest from './plugin/rollup-plugin-test'
// import vitePlugin from './plugin/vite-plugin-vue'
// import vitePlugin from './plugin/rollup-plugin-virtual-vue'
import vitePlugin from './vite-plugin/vite-plugin-test'

export default defineConfig({
  plugins: [
    Vue({
      template: {
        compiler: CompilerVapor
      }
    }),
    vitePlugin()
  ]
})