import hash from 'hash-sum'
import path from 'path'
import qs from 'querystring'
import compiler from '@vue/compiler-sfc'
  
function parseVueRequest(id) {  
    const [filename, rawQuery] = id.split('?', 2);  
    const query = new URLSearchParams(rawQuery);  
    return { filename, query };  
}

export function parseVuePartRequest(id) {
  const [filename, query] = id.split('?', 2)

  if (!query) return { vue: false, filename }

  const raw = qs.parse(query)

  if ('vue' in raw) {
    return {
      ...raw,
      filename,
      vue: true,
      index: Number(raw.index),
      src: 'src' in raw,
      scoped: 'scoped' in raw,
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
//   const source = fs.readFileSync(filename, 'utf-8');  
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
      `import script from ${scriptRequest}\n` + `export * from ${scriptRequest}` // support named exports
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
  // const script = descriptor.script || descriptor.scriptSetup;  
  // let scriptCode = `const script = {};`;  
  // if (script) {  
  //   if (script.src) {  
  //     throw new Error('Script src not supported in simplified version.');  
  //   }  
  //   const resolved = compiler.compileScript(descriptor, { id: descriptor.id, inlineTemplate: true, });
  //   scriptCode = resolved.content;  
  // }  
  const scriptImport = genScriptCode(descriptor);
  
  // const template = descriptor.template;  
  // let templateCode = `const render = () => {};`;  
  // if (template) {  
  //   if (template.src) {  
  //     throw new Error('Template src not supported in simplified version.');  
  //   }  
  //   const result = compiler.compileTemplate({  
  //     ...options.templateCompilerOptions,  
  //     source: template.content,  
  //     filename  
  //   });  
  //   templateCode = result.code;  
  // }

  const stylesCode = genStyleCode(descriptor, scopeId) 

  // if (descriptor.styles && descriptor.styles.length) {  
  //   stylesCode = descriptor.styles.map((style, index) => {  
  //     return `import style${index} from '${filename}?vue&type=style&index=${index}';`;  
  //   }).join('\n');  
  //   stylesCode += '\nconst styles = [' + descriptor.styles.map((_, index) => `style${index}`).join(',') + '];';  
  // }  
  console.log('stylesCode', stylesCode);
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
    templateCompilerOptions: {}  
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
      console.log('load', id);
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
        console.log('idd', id);
        // const { filename, query } = parseVueRequest(id);  
        const query = parseVuePartRequest(id)
        console.log('query', query);
        if (!query.vue && options.include.test(id)) {  
          return transformMain(code, query.filename, options);  
        } else if (query.type === "style") {   
          return transformStyle(code, query);  
        }
        return null
    }  
  };  
}  
