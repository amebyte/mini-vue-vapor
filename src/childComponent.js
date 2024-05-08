import { ref, template, effect } from '../runtime-vapor/src'
const ChildComponent = {
    setup() {
        const name = ref('掘金签约作者')
        return { name }
    },
    render(_ctx) {
       // 生成创建 button 标签的函数
        const _tmpl$ = template('<div></div>')
        // 真正进行创建模板内容的地方
        const el = _tmpl$()
        effect(() => {
            el.textContent = _ctx.name.value
        }) 
        return el
    }
}

export default ChildComponent