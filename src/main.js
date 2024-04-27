import { template, effect, ref, render } from '../runtime-vapor/src'

// 生成创建 button 标签的函数
const _tmpl$ = template('<button></button>')
const App = {
setup() {
   const count = ref(0)
   return { count } 
},
render(_ctx) {
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
const root = document.getElementById('app')
render(App, root)