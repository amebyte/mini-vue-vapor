// 省略...
export default function pluginVue() {
    return {
        name: 'rollup-plugin-vue',
        // 省略...
        transform(code, id) {  
            if (/\.vue$/.test(id)) {
                // 省略...
                // 脚本导入的虚拟模块
                const scriptID = `${id}?vue&type=script`;
                const scriptRequest = JSON.stringify(scriptID);
                const scriptImport = `import script from ${scriptRequest}\n`
                // 模板导入的虚拟模块
                const templateID = `${id}?vue&type=template`;
                const templateRequest = JSON.stringify(templateID);
                const templateImport = `import { render } from ${templateRequest}\n`
                // 缓存编译结果
                cache.set(scriptID, scriptCode)
                cache.set(templateID, templateCode)
                // 省略...
                return {
                  // 省略...
                }
            }     
        }
    }
}