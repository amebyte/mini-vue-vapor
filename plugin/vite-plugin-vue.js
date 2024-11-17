import compiler from '@vue/compiler-sfc'

const EXPORT_HELPER_ID = "\0plugin-vue:export-helper";
const helperCode = `
export default (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
}
`;

function parseVueRequest(id) {
  filename
  query
} {
  const [filename, rawQuery] = id.split(`?`, 2)
  const query = Object.fromEntries(new URLSearchParams(rawQuery))
  if (query.vue != null) {
    query.vue = true
  }
  if (query.index != null) {
    query.index = Number(query.index)
  }
  if (query.raw != null) {
    query.raw = true
  }
  if (query.url != null) {
    query.url = true
  }
  if (query.scoped != null) {
    query.scoped = true
  }
  return {
    filename,
    query,
  }
}

function isUseInlineTemplate(
  descriptor,
  options,
) {
  return (
    !options.devServer &&
    !options.devToolsEnabled &&
    !!descriptor.scriptSetup &&
    !descriptor.template?.src
  )
}

export default function vitePluginVue(options = {}) {
  options = {  
    ...options,  
    root: process.cwd(),  
    include: /\.vue$/,  
    templateCompilerOptions: {}  
  };  
  return {
    name: 'vite-plugin-vue', // 此名称将出现在警告和错误中
    async resolveId(id) {
      if (id === EXPORT_HELPER_ID) {
        return id;
      }
      if (parseVueRequest(id).query.vue) {
        return id;
      }
    },
    load(id, opt) {
      if (id === EXPORT_HELPER_ID) {
        return helperCode;
      }
    },
    transform(code, id, opt) {
      const { filename, query } = parseVueRequest(id)
      if (query.raw || query.url) {
        return
      }

      if (!filter.value(filename) && !query.vue) {
        return
      }

      if (!query.vue) {
          return transformMain(
              code,
              id,
              options.value,
              this,
              ssr,
              customElementFilter.value(id)
          ); 
      } else {
        const descriptor = getDescriptor(filename, options.value)
        if (query.type === 'style') {
          return transformStyle(
            code,
            descriptor,
            Number(query.index || 0),
            options.value,
            this,
            filename,
          )
        }
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

    const { code: templateCode, map: templateMap } = await genTemplateCode(
      descriptor,
      options,
      pluginContext,
      ssr,
      customElement
    )

    attachedProps.push(["render", "_sfc_render"]);

    const output = [
      scriptCode,
      templateCode,
      stylesCode,
    ]

    output.push(
      `import _export_sfc from '${EXPORT_HELPER_ID}'`,
      `export default /*#__PURE__*/_export_sfc(_sfc_main, [${attachedProps.map(([key, val]) => `['${key}',${val}]`).join(",")}])`
    );

    return {
      code: output.join('\n'),
      map: {
        mappings: '',
      },
      meta: {
        vite: {
          lang: descriptor.script?.lang || descriptor.scriptSetup?.lang || 'js',
        },
      },
    }
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
    scriptCode = script.content
    map = script.map
    return {
      code: scriptCode,
      map,
    }
}


function resolveScript(descriptor, options, ssr, customElement) {
  if (!descriptor.script && !descriptor.scriptSetup) {
    return null;
  }
  let resolved = null;
  resolved = options.compiler.compileScript(descriptor, {
    ...options.script,
    id: descriptor.id,
    isProd: options.isProduction,
    inlineTemplate: isUseInlineTemplate(descriptor, options)
  });
  return resolved;
}

function genTemplateCode(descriptor, options, pluginContext, ssr, customElement) {
  const template = descriptor.template;
  return transformTemplateInMain(
    template.content,
    descriptor,
    options,
    pluginContext,
    ssr,
    customElement
  );
}

function transformTemplateInMain(code, descriptor, options, pluginContext, ssr, customElement) {
  const result = compile(
    code,
    descriptor,
    options,
    pluginContext,
    ssr,
    customElement
  );
  return {
    ...result,
    code: result.code.replace(
      /\nexport (function|const) (render|ssrRender)/,
      "\n$1 _sfc_$2"
    )
  };
}

function compile(code, descriptor, options, pluginContext, ssr, customElement) {
  resolveScript(descriptor, options, ssr, customElement);
  const result = options.compiler.compileTemplate({
    id: descriptor.id,
    filename: descriptor.filename,
    source: code
  });
  return result;
}