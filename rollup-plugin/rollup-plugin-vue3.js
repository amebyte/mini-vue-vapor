import compiler from '@vue/compiler-sfc'
export default function pluginVue() {
    return {
        name: 'rollup-plugin-vue',
        transform(code, id) {  
            if (id.endsWith('.vue')) {
                const result = compiler.parse(code);
                // 创建组件的唯一标识符，用于样式作用域等
                const scopeId = `${Math.random().toString(36).substr(2, 9)}`;
                const scriptCode = compiler.compileScript(result.descriptor, { id: scopeId });
                const templateCode = compiler.compileTemplate({ source: result.descriptor.template.content, id: scopeId })
                // 脚本导入的虚拟模块
                const scriptImport = `import script from '${id}?vue&type=script'\n`
                // 模板导入的虚拟模块
                const templateImport = `import { render } from '${id}?vue&type=template'\n`

                // 组装
                const renderReplace = `script.render = render\n`
                const exportDefault = `export default script`
                return {
                    code: `
                        ${scriptImport}
                        ${templateImport}
                        ${renderReplace}
                        ${exportDefault}
                    `
                }
            }
        }
    }
}