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
  const block = instance.block = instance.component()
  insert(block, instance.container)
  instance.isMounted = true
  // TODO: lifecycle hooks (mounted, ...)
  // const { m } = instance
  // m && invoke(m)
}

export function insert(block, parent, anchor = null) {
    parent.insertBefore(block, anchor)
}
