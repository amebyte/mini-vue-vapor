import path from 'path'
import compiler from '@vue/compiler-sfc'
  
function parseVueRequest(id) {  
    const [filename, rawQuery] = id.split('?', 2);  
    const query = new URLSearchParams(rawQuery);  
    return { filename, query };  
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
  
function transformMain(code, filename, options) {  
  const descriptor = getDescriptor(filename, code, options);  
    
  const script = descriptor.script || descriptor.scriptSetup;  
  let scriptCode = `const script = {};`;  
  if (script) {  
    if (script.src) {  
      throw new Error('Script src not supported in simplified version.');  
    }  
    const resolved = compiler.compileScript(descriptor, { id: descriptor.id });
    scriptCode = resolved.content;  
  }  
  
  const template = descriptor.template;  
  let templateCode = `const render = () => {};`;  
  if (template) {  
    if (template.src) {  
      throw new Error('Template src not supported in simplified version.');  
    }  
    const result = compiler.compileTemplate({  
      ...options.templateCompilerOptions,  
      source: template.content,  
      filename  
    });  
    templateCode = result.code;  
  }

  let stylesCode = '';  

  if (descriptor.styles && descriptor.styles.length) {  
    stylesCode = descriptor.styles.map((style, index) => {  
      return `import style${index} from '${filename}?vue&type=style&index=${index}';`;  
    }).join('\n');  
    stylesCode += '\nconst styles = [' + descriptor.styles.map((_, index) => `style${index}`).join(',') + '];';  
  }  
  console.log('stylesCode', stylesCode);
  return {  
    code: `  
      ${scriptCode}  
      ${templateCode}
      ${stylesCode}
      export default { script, render };  
    `,  
    map: null  
  };  
} 

async function transformStyle(code, descriptor, index, options) {  
    // 简化版中仅返回代码，省略样式编译逻辑  
    return {  
      code,  
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
    load(id) {
        console.log('load', id);
        const { filename, query } = parseVueRequest(id); 
        if (query.type === "style") {  
            const descriptor = getDescriptor(filename)
            if (descriptor) {
                const block = query.type === 'style' ? descriptor.styles[query.index] : null
                if (block) {
                    return {
                      code: block.content,
                      map: null,
                    }
                }
            }
        }
    },
    transform(code, id) {  
        console.log('idd', id);
        const { filename, query } = parseVueRequest(id);  
        console.log('query', query);
        if (!query.vue) {  
          return transformMain(code, filename, options);  
        } else if (query.type === "style") {  
          const descriptor = createDescriptor(filename, code, options);  
          return transformStyle(code, descriptor.styles[Number(query.index)], Number(query.index), options);  
        }
    }  
  };  
}  
