export default function rollupPluginVirtualVue() {  
    return {
      name: 'rollup-plugin-virtual-vue', // 此名称将出现在警告和错误中
      resolveId(id) {
        console.log('resolveId', id);
        if (id.startsWith('virtual:app')) { 
          return id;  
        }  
        return null; // 对于其他所有的导入路径，该插件不会进行任何修改，直接返回原始路径。
      }, 
      load(id) {
        console.log('load', id);
        // 如果模块 ID 是 'virtual:app.vue'，则加载 vue 模板，实际上不会在这里加载，这里只是模拟
        if (id === 'virtual:app') {  
          return { code: `
          <template><div>我是 Cobyte ~</div></template>
          <script setup>console.log('掘金签约作者：Cobyte')</script>
          <style>div{color: red;}</style>
          `, map: null };  
        } else if (id === 'virtual:app?type=script') {
            // 返回 script 部分
            return { code:`
            export default {
                    name: 'App',
                    setup() {}
                }
            `, map: null }
        } else if (id === 'virtual:app?type=template') {
            // 返回渲染函数
            return { code: `
            export default () => {

                }
            `, map: null }
        } else if (id === 'virtual:app?type=style') {
            // 返回样式
            return { code: `
            export default 'body{ color: red; }'
            `, map: null }
        }
        return null; // 对于其他所有的模块ID，该插件不会进行加载操作，返回 null 表示这些模块应由其他插件或Rollup的默认行为来处理。
      },  
      transform(code, id) {  
        // 如果模块 ID 是 'virtual:app.vue'，则转换其内容  
        if (id === 'virtual:app') {  
            // 在实际过程中这里会调用 @vue/compiler-sfc 解析 vue 文件，我们目前这里是模拟，我们就不调用 @vue/compiler-sfc 进行解析了，这部分内容将在下一章节详细讲解。

            // script 部分
            const scriptImport = `import script from 'virtual:app?type=script'\n`
            // template 部分
            const templateCode = `import render from 'virtual:app?type=template'\n`
            // style 部分
            const stylesCode = `import 'virtual:app?type=style'\n`
            const renderReplace = `script.render = render\n`
            const exportDefault = `export default script`
          return {  
            code: `
            ${scriptImport}
            ${templateCode}
            ${stylesCode}
            ${renderReplace}
            ${exportDefault}
            `,  
            map: null // 如果有 source map，可以在这里提供  
          };  
        }  
        return null; // 对于其他所有的模块ID，该插件不会进行转换操作，返回 null 表示这些模块的代码应由其他插件或保持原样。
      }  
    };  
  }