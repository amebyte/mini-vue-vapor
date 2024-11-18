// import VuePlugin from 'rollup-plugin-vue'
// import PostCSS from 'rollup-plugin-postcss'
import NodeResolve from '@rollup/plugin-node-resolve'
import VuePlugin from './rollup-plugin-vue2.js'
import PostCSS from './rollup-plugin-postcss.js'

export default [
  {
    input: '../src/App.vue',
    output: {
      file: 'dist/App.js',
      format: 'esm',
      sourcemap: 'inline',
    },
    plugins: [
     NodeResolve(),
     VuePlugin(),
     PostCSS(),
    ],
    external: ['vue'],
  },
]
