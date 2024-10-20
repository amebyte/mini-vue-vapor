import { NodeTypes, baseParse } from "../../compiler-core/src"

const IRNodeTypes = {
  ROOT: 1, // 表示根节点的类型，在后续的迭代中会有更多的节点类型
}
export function transform(root) {
  // 调用 transformChildren 函数处理 root 的子节点
  const template = transformChildren(root.children)
  // 回一个对象，其中包含生成的模板字符串和节点类型（这里是 ROOT）
  return {
    type: IRNodeTypes.ROOT, // 表示根类型
    template, // 因为我们在上述 generate 部分就设计了要由 transform 转换之后的返回的数据当中的 template 属性就是 HTML 模板
  }
}
// 将处理 AST 数据的子节点封装成一个函数
function transformChildren(children) {
  let template = ''
  // 遍历每个子节点并根据其类型进行处理
  children.forEach(node => {
    switch (node.type) {
      case NodeTypes.ELEMENT: {
        // 对于 ELEMENT 类型的节点，调用 transformElement 函数处理，并将结果追加到 template 字符串中
        template += transformElement(node)
        break
      }
      case NodeTypes.TEXT: {
        // 对于 TEXT 类型的节点，直接将其内容追加到 template 字符串中
        template += node.content
        break
      }
    }
  })
  return template
}
// 处理元素节点
function transformElement(node) {
  // 提取节点的 tag 和 children 属性
  const { tag, children } = node
  // 生成元素的开标签
  let template = `<${tag}`
  // todo 处理属性
  template += `>`

  if (children.length > 0) {
    // 子节点的转换结果
    template += transformChildren(children)
  }
  // 最后生成闭标签
  template += `</${tag}>`

  return template
}

export function generate(ast) {
  let preamble = 'import { template } from "../runtime-vapor/src"\n'
  preamble += `const _tmpl$ = template('${ast.template}')`
  const code = preamble + `
  \nexport function render() {
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