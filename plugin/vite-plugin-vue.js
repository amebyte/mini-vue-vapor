import compiler from '@vue/compiler-sfc'
export default function vitePluginVue() {  
    return {
      name: 'vite-plugin-vue', // 此名称将出现在警告和错误中
      transform(code, id, opt) {  
        if (id.endsWith('.vue')){
            return transformMain(
                code,
                id,
                options.value,
                this,
                ssr,
                customElementFilter.value(id)
            ); 
        }
      }  
    };  
}

async function transformMain(code, filename, options, pluginContext, ssr, customElement) {
    const { devServer, isProduction, devToolsEnabled } = options;
    const { descriptor, errors } = createDescriptor(filename, code, options);
    if (errors.length) {
        return null;
    }
    const attachedProps = [];
    const hasScoped = descriptor.styles.some((s) => s.scoped);
    const { code: scriptCode, map: scriptMap } = await genScriptCode(
      descriptor,
      options,
      pluginContext,
      ssr,
      customElement
    );
}

function createDescriptor(filename, source, { root, isProduction, sourceMap, compiler, template }, hmr = false) {
    const { descriptor, errors } = compiler.parse(source, {
        filename,
        sourceMap,
        templateParseOptions: template?.compilerOptions
    });
    return { descriptor, errors };
}

async function genScriptCode(descriptor, options, pluginContext, ssr, customElement) {
    let scriptCode = `const ${scriptIdentifier} = {}`;
    let map;
    const script = resolveScript(descriptor, options, ssr, customElement);
    
}

const scriptIdentifier = `_sfc_main`;
function resolveScript(descriptor, options, ssr, customElement) {
  if (!descriptor.script && !descriptor.scriptSetup) {
    return null;
  }
  let resolved = null;
  resolved = options.compiler.compileScript(descriptor, {
    ...options.script,
    id: descriptor.id,
    isProd: options.isProduction,
    inlineTemplate: isUseInlineTemplate(descriptor, options),
    templateOptions: resolveTemplateCompilerOptions(descriptor, options, ssr),
    sourceMap: options.sourceMap,
    genDefaultAs: canInlineMain(descriptor, options) ? scriptIdentifier : void 0,
    customElement,
    propsDestructure: options.features?.propsDestructure ?? options.script?.propsDestructure
  });
  return resolved;
}