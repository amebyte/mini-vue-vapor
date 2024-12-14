export default function vitePluginTest() {  
    return {
      name: 'vite-plugin-test',
      resolveId(id) {
        console.log('vite-resolveId', id);
        if (id === 'virtual-module') {
            return id
        }
      },
      load(id) {
        console.log('vite-load', id);
        // 如果模块 ID 是 'virtual-module'，则加载特定内容  
        if (id === 'virtual-module') {  
            return 'export default "我是 {{Cobyte}} ~";';  
        } 
      },
      transform(code, id) { 
        console.log('vite-transform', id);
        // 如果模块 ID 是 'virtual-module'，则转换其内容  
        if (id === 'virtual-module') {  
            return {  
                code: code.replace('{{Cobyte}}', 'Cobyte 掘金签约作者'),   
            };  
        }  
      }
    }
}