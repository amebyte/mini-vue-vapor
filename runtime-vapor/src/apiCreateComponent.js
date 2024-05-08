import { createComponentInstance } from './component'
import { setupComponent } from './render'

export function createComponent(
  comp,
  rawProps
) {
  const instance = createComponentInstance(
    comp,
    rawProps
  )
  setupComponent(instance)

  return instance
}