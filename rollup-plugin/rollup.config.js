// import VuePlugin from 'rollup-plugin-vue'
// import PostCSS from 'rollup-plugin-postcss'
// import NodeResolve from '@rollup/plugin-node-resolve'
import TestPlugin from './rollup-plugin-test.js'
import TestPlugin2 from './rollup-plugin-test2.js'
// import PostCSS from './rollup-plugin-postcss.js'
import TestPlugin3 from './rollup-plugin-test3.js'

export default [
  {
    input: './index.js',
    output: {
      file: 'dist/output.js',
      format: 'esm',
    },
    plugins: [
      TestPlugin(),
      TestPlugin2(),
      TestPlugin3()
    ],
    // external: ['vue'],
  },
]
