// import VuePlugin from 'rollup-plugin-vue'
// import PostCSS from 'rollup-plugin-postcss'
// import NodeResolve from '@rollup/plugin-node-resolve'
import VuePlugin from './rollup-plugin-vue3.js'
// import PostCSS from './rollup-plugin-postcss.js'
import pluginVue from './rollup-plugin-test2.js'

export default [
  {
    input: './App.vue',
    output: {
      file: 'dist/output.js',
      format: 'esm',
    },
    plugins: [
      VuePlugin(),
      pluginVue(),
      
    ],
    // external: ['vue'],
  },
]
