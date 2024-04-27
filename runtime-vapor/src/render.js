import { createComponentInstance } from './component'
export function render(comp, container) {
    const instance = createComponentInstance(comp)
    mountComponent(instance, container)
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

export function insert(block, parent, anchor = null) {
    parent.insertBefore(block, anchor)
}