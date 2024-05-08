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
  // 获取 setup 方法的执行结果
  const state = setupFn && setupFn()
  // 执行 render 函数获取 DOM 结果
  instance.block = component.setup ? component.render(state) : state 
}

export function insert(block, parent, anchor = null) {
    block = block.block ? block.block : block
    parent.insertBefore(block, anchor)
}
