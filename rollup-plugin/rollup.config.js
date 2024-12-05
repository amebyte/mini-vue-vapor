// import VuePlugin from 'rollup-plugin-vue'
// import PostCSS from 'rollup-plugin-postcss'
// import NodeResolve from '@rollup/plugin-node-resolve'
// import VuePlugin from './rollup-plugin-vue2.js'
// import PostCSS from './rollup-plugin-postcss.js'

export default [
  {
    input: './index.js',
    output: {
      file: 'dist/output.js',
      format: 'esm',
    },
    // plugins: [
    //  NodeResolve(),
    //  VuePlugin(),
    //  PostCSS(),
    // ],
    // external: ['vue'],
  },
]
