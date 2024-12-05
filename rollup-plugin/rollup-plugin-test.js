export default function rollupPluginTest() {  
    return {
      name: 'rollup-plugin-test',
      resolveId(id) {
        console.log('resolveId', id);
        if (id === 'loadsh-es') {
            return id
        }
      },
      load(id) {
        console.log('load', id);
        if (id === 'loadsh-es') {
            return {
                code: `export default {
                    last() {
                        console.log('来自 Rollup 插件中的代码');
                    }
                }`
            }
        }
      },
      transform(code, id) { 
        console.log('transform', id);
        if (id === 'loadsh-es') {
            return {
                code: code.replace('Rollup', '掘金签约作者：Cobyte')
            }
        }
      }
    }
}