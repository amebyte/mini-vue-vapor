import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import * as CompilerVapor from './compiler-vapor/src/index2'
import vitePluginTest from './plugin/rollup-plugin-test'

export default defineConfig({
  plugins: [
    Vue({
      template: {
        compiler: CompilerVapor
      }
    }),
    vitePluginTest()
  ]
})