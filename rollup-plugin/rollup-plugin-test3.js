export default function rollupPluginTest3() {  
    return {
      name: 'rollup-plugin-test3',
      resolveId(id) {
        console.log('resolveId3', id);
      },
      load(id) {
        console.log('load3', id);
      },
      transform(code, id) { 
        console.log('transform3', id);
      }
    }
}