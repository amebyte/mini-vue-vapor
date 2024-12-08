import compiler from '@vue/compiler-sfc'
import qs from 'querystring'

const cache = new Map();

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
        load(id) {
            // 调用 parseVuePartRequest 函数解析模块 ID
            const query = parseVuePartRequest(id);
            // 解析结果如果 query.vue 为 true 表示这是一个 Vue 组件请求，则返回原始的模块 ID，这样该插件后续就会继续处理这个模块
            if (query.vue) {
              if (query.type === 'script') {
                // 返回 script 部分的代码
                const code = cache.get(id).content
                return {
                  code,
                }
              } else if (query.type === 'template') {
                // 返回 template 部分的代码
                const code = cache.get(id).code
                return {
                  code,
                }
              }
            }
        },
        transform(code, id) {  
          if (/\.vue$/.test(id)) {
              const result = compiler.parse(code);
              // 创建组件的唯一标识符，用于样式作用域等
              const scopeId = `${Math.random().toString(36).substr(2, 9)}`;
              const scriptCode = compiler.compileScript(result.descriptor, { id: scopeId });
              const templateCode = compiler.compileTemplate({ source: result.descriptor.template.content, id: scopeId })
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
              
              // 编译 style 模块
              let stylesCode = ``
              if (result.descriptor.styles.length) {
                result.descriptor.styles.forEach((style, i) => {
                  const attrsQuery = '&lang.css'
                  const idQuery = `&id=${scopeId}`
                  const query = `?vue&type=style&index=${i}${idQuery}`
                  const styleRequest = descriptor.filename + query + attrsQuery
                  stylesCode += `\nimport ${JSON.stringify(styleRequest)}`
                })
              }

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