export default function vitePluginVirtualVue() {  
    return {
      name: 'rollup-plugin-virtual-vue',
      resolveId(id) {
        if(id === 'virtual:script' || id === 'virtual:template') {
          return id
        }
      },
      load(id) {
        // 返回 script 部分的代码
        if (id === 'virtual:script') {
          return { 
            code: `
              export default { 
                name: 'App', 
                setup() {
                    console.log('我是 script 部分')
                } 
            }
          `}
        } else if (id === 'virtual:template') {
          // 返回 template 部分的代码
          return {
            code: `
              export function render() {
                console.log('template 的编译结果');
              }
            `
          }
        }
      },
      transform(code, id) { 
        // 模拟如果是 Vue 文件则返回编译后结果，在实际过程中这里会调用 @vue/compiler-sfc 解析 vue 文件，我们目前这里是模拟，我们就不调用 @vue/compiler-sfc 进行解析了，这部分内容将在下一章节详细讲解。
        if (/\.vue$/.test(id)) {
            return {  
                code: `
                    import script from 'virtual:script'\n
                    import { render } from 'virtual:template'\n
                    script.render = render\n
                    export default script
                `,   
            };  
        }  
      }
    }
}