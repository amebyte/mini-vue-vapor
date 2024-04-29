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

function render(comp, container) {
    const render = typeof comp === 'function' ? comp : comp.render
    const block = render()
    insert(block, (container = normalizeContainer(container)))
}

function normalizeContainer(container) {
  return typeof container === 'string'
    ? (document.querySelector(container))
    : container
}

function insert(block, parent, anchor) {
    parent.insertBefore(block, anchor)
}

function createApp(rootComponent) {
    // 创建 Vue Vapor 应用实例对象
    const app = {
        // 实例挂载方法
        mount(rootContainer) {
            // 把根组件的挂载到 #app 节点上
            render(rootComponent, rootContainer)
        }
    }
    return app
}

const App = () => {
    const _tmpl$ = template('<button></button>')
    const count = ref(0)
    const el = _tmpl$()
    el.addEventListener('click', () => {
        count.value++
    })
    effect(() => {
        el.textContent = count.value
    })
    return el
}
const app = createApp(App)
app.mount('#app')