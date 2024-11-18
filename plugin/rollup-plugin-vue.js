import compiler from '@vue/compiler-sfc'
  
function parseVueRequest(id) {  
  const [filename] = id.split('?');  
  return { filename };  
}  
  
const cache = new Map();  
  
function createDescriptor(filename, source, options) {  
  const { descriptor } = compiler.parse(source, { filename });  
  const normalizedPath = path.relative(options.root, filename);  
  descriptor.id = `${normalizedPath}-${Math.random().toString(36).substr(2, 9)}`;  
  cache.set(filename, descriptor);  
  return descriptor;  
}  
  
function getDescriptor(source, filename, options) {  
  if (cache.has(filename)) {  
    return cache.get(filename);  
  }  
//   const source = fs.readFileSync(filename, 'utf-8');  
  return createDescriptor(filename, source, options);  
}  
  
function transformMain(code, filename, options) {  
  const descriptor = getDescriptor(code, filename, options);  
    
  const script = descriptor.script;  
  let scriptCode = `const script = {};`;  
  if (script) {  
    if (script.src) {  
      throw new Error('Script src not supported in simplified version.');  
    }  
    scriptCode = compiler.compileScript(descriptor, { id: descriptor.id }).code;  
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
  
  return {  
    code: `  
      ${scriptCode}  
      ${templateCode}  
      export default { script, render };  
    `,  
    map: null  
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
    api: {  
      version  
    },  
    async transform(code, id) {  
      const { filename } = parseVueRequest(id);  
      if (!options.include.test(filename)) return;  
      return transformMain(code, filename, options);  
    }  
  };  
}  
