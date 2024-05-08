import { ref, template, effect } from "../runtime-vapor/src"
const App = {
    setup() {
        const count = ref(0)
        return { count } 
    },
    render(_ctx) {
        // 生成创建 button 标签的函数
        const _tmpl$ = template('<button></button>')
        // 真正进行创建模板内容的地方
        const el = _tmpl$()
        el.addEventListener('click', () => {
            _ctx.count.value++
        })
        effect(() => {
            el.textContent = _ctx.count.value
        })
        return el
    }
}

export default App