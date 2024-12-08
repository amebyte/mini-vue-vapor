export default function rollupPluginTest() {  
    return {
      name: 'rollup-plugin-test2',
      resolveId(id) {
        console.log('resolveId2', id);
      },
      load(id) {
        console.log('load2', id);
      },
      transform(code, id) { 
        console.log('transform2', id);
      }
    }
}