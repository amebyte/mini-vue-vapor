import hash from 'hash-sum'
import path from 'path'
import qs from 'querystring'
import compiler from '@vue/compiler-sfc'

function parseVuePartRequest(id) {
  const [filename, query] = id.split('?', 2)

  if (!query) return { vue: false, filename }

  const raw = qs.parse(query)

  if ('vue' in raw) {
    return {
      ...raw,
      filename,
      vue: true
    }
  }

  return { vue: false, filename }
}
  
const cache = new Map();  
  
function createDescriptor(filename, source, options) {  
  const { descriptor } = compiler.parse(source, { filename });  
  const normalizedPath = path.relative(options.root, filename);  
  descriptor.id = `${normalizedPath}-${Math.random().toString(36).substr(2, 9)}`;  
  cache.set(filename, descriptor);  
  return descriptor;  
}  
  
function getDescriptor(filename, source, options) {  
  if (cache.has(filename)) {  
    return cache.get(filename);  
  }  

  return createDescriptor(filename, source, options);  
}
const cacheToUse = new WeakMap()
function resolveScript(descriptor) {
  const cached = cacheToUse.get(descriptor)
  if (cached) {
    return cached;
  }
  const resolved = compiler.compileScript(descriptor, { id: descriptor.id, inlineTemplate: true, });
  cacheToUse.set(descriptor, resolved)
  return resolved
}

function genScriptCode(descriptor) {
  let scriptImport = `const script = {}`
  const script = resolveScript(descriptor)
  if (script) {
    const query = `?vue&type=script`
    const scriptRequest = JSON.stringify(descriptor.filename + query)
    scriptImport =
      `import script from ${scriptRequest}\n` + `export * from ${scriptRequest}`
  }
  return scriptImport;
}

function getResolvedScript(descriptor) {
  return cacheToUse.get(descriptor)
}

function genStyleCode(descriptor, scopeId) {
  let stylesCode = ``
  if (descriptor.styles.length) {
    descriptor.styles.forEach((style, i) => {
      const attrsQuery = '&lang.css'
      const idQuery = `&id=${scopeId}`
      const query = `?vue&type=style&index=${i}${idQuery}`
      const styleRequest = descriptor.filename + query + attrsQuery
      stylesCode += `\nimport ${JSON.stringify(styleRequest)}`
    })
  }
  return stylesCode;
}
  
function transformMain(code, filename, options) {  
  const descriptor = getDescriptor(filename, code, options);  
  const scopeId = hash(filename + code);  

  const scriptImport = genScriptCode(descriptor);
  const stylesCode = genStyleCode(descriptor, scopeId) 

  return {  
    code: `  
      ${scriptImport}
      ${stylesCode}
      export default script;  
    `,  
    map: null  
  };  
} 

async function transformStyle(code, query) {  
  const result = await compiler.compileStyleAsync({
    filename: query.filename,
    id: `data-v-${query.id}`,
    source: code
  })
  return {  
    code: result.code,  
    map: null // 简化版中省略 source map  
  };  
} 
  
export default function vuePlugin(options = {}) {  
  options = {  
    ...options,  
    root: process.cwd(),  
    include: /\.vue$/,  
  };  
  
  return {  
    name: 'rollup-plugin-vue',
    async resolveId(id) {
      const query = parseVuePartRequest(id);
      if (query.vue) {
        return id
      }
      return null
    },
    load(id) {
      const query = parseVuePartRequest(id); 
      if (query.vue) {
        const descriptor = getDescriptor(query.filename)
        if (descriptor) {
          let block
          if (query.type === "style") {  
            block = query.type === 'style' ? descriptor.styles[query.index] : null
          } else if (query.type === "script") {
            block = getResolvedScript(descriptor)
          }
          if (block) {
            return {
              code: block.content,
              map: null,
            }
          }
        }
      }
      return null
    },
    transform(code, id) {  
        const query = parseVuePartRequest(id)
        if (!query.vue && options.include.test(id)) {  
          return transformMain(code, query.filename, options);  
        } else if (query.type === "style") {   
          return transformStyle(code, query);  
        }
        return null
    }  
  };  
}  
