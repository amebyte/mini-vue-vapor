import { NodeTypes, baseParse } from "../../compiler-core/src"
const IRNodeTypes = {
    ROOT: 1,
    TEMPLATE_GENERATOR: 2
}

export function transform(root) {
  const template = transformChildren(root.children)
  return {
    type: IRNodeTypes.ROOT,
    template: [
      {
        type: IRNodeTypes.TEMPLATE_GENERATOR,
        template,
        loc: root.loc
      }
    ],
  }
}

function transformChildren(children) {
    let template = ''
    children.forEach((child, i) => walkNode(child, children.length > i + 1))
    return template
  
    function walkNode(node) {
      switch (node.type) {
        case NodeTypes.ELEMENT: {
          template += transformElement(node)
          break
        }
        case NodeTypes.TEXT:
          template += node.content
          break
      }
    }
}

function transformElement(node) {
    const { tag, children } = node
    let template = `<${tag}`
    // todo 处理属性
    template += `>`
  
    if (children.length > 0) {
      template += transformChildren(children)
    }
  
    template += `</${tag}>`
  
    return template
}

export function generate2(ast) {
  let code = ''
  let preamble = "import { template } from '../runtime-vapor/src'\n"

  preamble += ast.template
  .map((template) => `const _tmpl$ = template(\`${template.template}\`)`)
  .join('\n')

  code += 'const el = _tmpl$()\n'
  code += 'return el'
  const functionName = `render`
  code = `${preamble}\nexport function ${functionName}() {\n${code}\n}`
  return {
    code,
    ast: ast,
    preamble,
  }
}

export function generate(ast) {
  const preamble = ''
  const code = `
  import { template } from "../runtime-vapor/src"
  \nexport function render() {
    const _tmpl$ = template('<div>掘金签约作者：Cobyte</div>')
    const el = _tmpl$()
    return el
  }
  `
  return {
    code,
    ast,
    preamble,
  }
}

export function compile(template) {
    const ast = baseParse(template)
    const ir = transform(ast)
    return generate(ir)
}