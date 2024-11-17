import vite from 'vite'
import { computed, shallowRef } from '@vue/reactivity';
import { compileScript, compileStyle, compileTemplate, parse } from '@vue/compiler-sfc';
const compiler = {
  compileScript, compileStyle, compileTemplate, parse
}
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

function isUseInlineTemplate(descriptor) {
  return !!descriptor.scriptSetup
}

export default function vitePluginVue(options = {}) {
  console.log('compiler', compiler);
  options = shallowRef({  
    ...options,  
    root: process.cwd(),  
    include: /\.vue$/,
    compiler
  }); 
  const filter = computed(
    () => vite.createFilter(options.value.include, options.value.exclude)
  );
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
              id
          ); 
      } else {
        const descriptor = getDescriptor(filename)
        if (query.type === 'style') {
          return transformStyle(
            code,
            descriptor,
            Number(query.index || 0)
          )
        }
      }
    }  
  };  
}

async function transformMain(code, filename) {
    const { descriptor, errors } = createDescriptor(filename, code);
    if (errors.length) {
        return null;
    }
    const attachedProps = [];
    const { code: scriptCode, map: scriptMap } = await genScriptCode(descriptor);

    const { code: templateCode, map: templateMap } = await genTemplateCode(descriptor)

    attachedProps.push(["render", "_sfc_render"]);

    const output = [
      scriptCode,
      templateCode,
      // stylesCode,
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

function createDescriptor(filename, source) {
  console.log('compiler', compiler);
    const { descriptor, errors } = compiler.parse(source, {
        filename
    });
    return { descriptor, errors };
}

async function genScriptCode(descriptor) {
    let map;
    const script = resolveScript(descriptor);
    const scriptCode = script.content
    map = script.map
    return {
      code: scriptCode,
      map,
    }
}


function resolveScript(descriptor) {
  if (!descriptor.script && !descriptor.scriptSetup) {
    return null;
  }
  let resolved = null;
  resolved = compiler.compileScript(descriptor, {
    id: descriptor.id,
    // inlineTemplate: isUseInlineTemplate(descriptor)
  });
  return resolved;
}

function genTemplateCode(descriptor) {
  const template = descriptor.template;
  return transformTemplateInMain(
    template.content,
    descriptor
  );
}

function transformTemplateInMain(code, descriptor) {
  const result = compile(
    code,
    descriptor
  );
  return {
    ...result,
    code: result.code.replace(
      /\nexport (function|const) (render|ssrRender)/,
      "\n$1 _sfc_$2"
    )
  };
}

function compile(code, descriptor) {
  resolveScript(descriptor);
  const result = compiler.compileTemplate({
    id: descriptor.id,
    filename: descriptor.filename,
    source: code
  });
  return result;
}