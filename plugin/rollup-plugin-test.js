export default function vitePluginTest() {  
  return {
    name: 'vite-plugin-test', // 此名称将出现在警告和错误中
    resolveId(id) {
      // 如果导入路径是 'virtual-module'，则解析为 'cobyte-module'  
      if (id === 'virtual-module') { 
        return 'cobyte-module';  
      }  
      return id; // 对于其他所有的导入路径，该插件不会进行任何修改，直接返回原始路径。
    },  
    load(id) {  
      // 如果模块 ID 是 'cobyte-module'，则加载特定内容  
      if (id === 'cobyte-module') {  
        return 'export default "我是 Cobyte ~";';  
      }  
      return null; // 对于其他所有的模块ID，该插件不会进行加载操作，返回 null 表示这些模块应由其他插件或Rollup的默认行为来处理。
    },  
    transform(code, id) {  
      // 如果模块 ID 是 'cobyte-module'，则转换其内容  
      if (id === 'cobyte-module') {  
        return {  
          code: code.replace('Cobyte ~', 'Cobyte ~ 掘金签约作者'),  
          map: null // 如果有 source map，可以在这里提供  
        };  
      }  
      return null; // 对于其他所有的模块ID，该插件不会进行转换操作，返回 null 表示这些模块的代码应由其他插件或保持原样。
    }  
  };  
}