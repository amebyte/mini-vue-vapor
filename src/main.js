import { ref, effect } from '@vue/reactivity'
function template(html) {
    let node
    const create = () => {
        const t = document.createElement("template")
        t.innerHTML = html
        return t.content.firstChild
    }
    const fn = () => (node || (node = create())).cloneNode(true)
    return fn 
}

function render(component, parent) {
    parent.appendChild(component)
}

function insert(parent, accessor) {
    effect(() => {
        parent.textContent = accessor.value
    })
}

// 生成创建 button 标签的函数
const _tmpl$ = template('<button></button>')
const App = () => {
    const count = ref(0)
    // 真正进行创建模板内容的地方
    const el = _tmpl$()
    el.addEventListener('click', () => {
        count.value++
    })
    insert(el, count)
    return el
}
const root = document.getElementById('app')
render(App(), root)