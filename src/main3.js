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

let uid = 0
export const createComponentInstance = (
  component
) => {
  const instance = {
    uid: uid++,
    block: null,
    container: null, // set on mount
    component,
    isMounted: false
    // TODO: registory of provides, appContext, lifecycles, ...
  }
  return instance
}


function mountComponent(
  instance,
  container
) {
  instance.container = container

  const { component } = instance
  const setupFn =
      typeof component === 'function' ? component : component.setup
  const state = setupFn && setupFn()
 
  const block = instance.block = component.setup ? component.render(state) : state
  insert(block, instance.container)
  instance.isMounted = true
  // TODO: lifecycle hooks (mounted, ...)
  // const { m } = instance
  // m && invoke(m)
}

function render(comp, container) {
    const instance = createComponentInstance(comp)
    mountComponent(instance, (container = normalizeContainer(container)))
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
    // 创建 Vue3 应用实例对象
    const app = {
        // 实例挂载方法
        mount(rootContainer) {
            // 把根组件的挂载到 #app 节点上
            render(rootComponent, rootContainer)
        }
    }
    return app
}

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

const app = createApp(App)
app.mount('#app')