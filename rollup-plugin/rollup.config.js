// import VuePlugin from 'rollup-plugin-vue'
// import PostCSS from 'rollup-plugin-postcss'
// import NodeResolve from '@rollup/plugin-node-resolve'
// import VuePlugin from './rollup-plugin-vue2.js'
// import PostCSS from './rollup-plugin-postcss.js'
import TestPlugin from './rollup-plugin-test.js'

export default [
  {
    input: './index.js',
    output: {
      file: 'dist/output.js',
      format: 'esm',
    },
    plugins: [
      TestPlugin()
    ],
    // external: ['vue'],
  },
]
