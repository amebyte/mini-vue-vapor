export default function rollupPluginVirtualVue() {  
    return {
      name: 'rollup-plugin-virtual-vue', // 此名称将出现在警告和错误中
      load(id) {  
        // 如果模块 ID 是 'virtual:app.vue'，则加载 vue 模板，实际上不会在这里加载，这里只是模拟
        if (id === 'virtual:app.vue') {  
          return `
          <template><div>我是 Cobyte ~</div></template>
          <script setup>console.log('掘金签约作者：Cobyte')</script>
          <style>div{color: red;}</style>
          `;  
        }  
        return null; // 对于其他所有的模块ID，该插件不会进行加载操作，返回 null 表示这些模块应由其他插件或Rollup的默认行为来处理。
      },  
      transform(code, id) {  
        // 如果模块 ID 是 'virtual:app.vue'，则转换其内容  
        if (id === 'virtual:app.vue') {  
            // 在实际过程中这里会调用 @vue/compiler-sfc 解析 vue 文件，我们目前这里是模拟，我们就不调用 @vue/compiler-sfc 进行解析了，这部分内容将在下一章节详细讲解。
          return {  
            code: '解析之后的代码',  
            map: null // 如果有 source map，可以在这里提供  
          };  
        }  
        return null; // 对于其他所有的模块ID，该插件不会进行转换操作，返回 null 表示这些模块的代码应由其他插件或保持原样。
      }  
    };  
  }