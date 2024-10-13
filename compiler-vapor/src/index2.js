import { baseParse } from "../../compiler-core/src"

export function transform(root) {
    return root
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