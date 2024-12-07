import compiler from '@vue/compiler-sfc'
import qs from 'querystring'

// 判断否是一个 Vue 单文件组件的请求
function parseVuePartRequest(id) {
    const [filename, query] = id.split('?', 2)

    if (!query) return { vue: false, filename }
    // 使用 qs.parse 方法解析查询字符串，将其转换成一个对象
    const raw = qs.parse(query)
    // 如果解析后的对象中包含 vue 键，说明这是一个 Vue 组件请求
    if ('vue' in raw) {
      return {
        ...raw,
        filename,
        vue: true
      }
    }
    // 如果不包含 vue 键，返回表示这不是 Vue 组件请求的对象
    return { vue: false, filename }
}

export default function pluginVue() {
    return {
        name: 'rollup-plugin-vue',
        async resolveId(id) {
            // 调用 parseVuePartRequest 函数解析模块 ID
            const query = parseVuePartRequest(id);
            // 解析结果如果 query.vue 为 true 表示这是一个 Vue 组件请求，则返回原始的模块 ID，这样该插件后续就会继续处理这个模块
            if (query.vue) {
              return id
            }
            // 如果不是 Vue 组件请求，返回 null，表示这个模块 ID 不应该由这个插件处理
            return null
        },
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