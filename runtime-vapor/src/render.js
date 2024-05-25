import { proxyRefs } from '@vue/reactivity'
import { createComponentInstance, setCurrentInstance, unsetCurrentInstance } from './component'
export function render(comp, container) {
    const instance = createComponentInstance(comp)
    mountComponent(instance, (container = normalizeContainer(container)))
}

function normalizeContainer(container) {
  return typeof container === 'string'
    ? (document.querySelector(container))
    : container
}

function mountComponent(
  instance,
  container
) {
  instance.container = container

  setupComponent(instance)
  
  const block = instance.block
  // 挂载组件DOM元素到到父级元素上
  insert(block, instance.container)
  // 设置已经挂载的标记
  instance.isMounted = true
  // TODO: lifecycle hooks (mounted, ...)
  const { m } = instance
  // m && invoke(m)
  if (m) {
    m.forEach(fn => fn())
  }

  unsetCurrentInstance()
}

export function setupComponent(instance) {
  setCurrentInstance(instance)
  const { component } = instance
  // 判断是状态组件还是函数组件
  const setupFn =
      typeof component === 'function' ? component : component.setup
  instance.setupContext = { attrs: instance.attrs }
  // 获取 setup 方法的执行结果，并且把 props 作为 setup 方法的第一个参数传递进去
  const stateOrNode = setupFn && setupFn(shallowReadonly(instance.props), instance.setupContext)
  let block
  if (stateOrNode && stateOrNode instanceof Node) {
    // setup 方法返回的也可能是 DOM 节点，所以如果是 DOM 节点则直接把 DOM 节点赋值给组件实例对象上的 block 属性
    block = stateOrNode
  } else {
    // 执行 render 函数获取 DOM 结果
    block = component.render(proxyRefs(stateOrNode))
  }
  instance.block = block
}

export function insert(block, parent, anchor = null) {
    block = block.block ? block.block : block
    parent.insertBefore(block, anchor)
}
