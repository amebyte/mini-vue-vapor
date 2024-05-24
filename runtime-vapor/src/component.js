import { initProps, normalizePropsOptions } from "./componentProps"
export const createComponentInstance = (
  component,
  rawProps
) => {
  const instance = {
    block: null,
    container: null, // set on mount
    component,
    props: {}, // 父组件传递进来的 props 数据最终存储的地方
    attrs: {}, // 父组件传递进来的 props 但又不在子组件 props 配置选项中的 props
    propsOptions: normalizePropsOptions(component),
    isMounted: false
    // TODO: registory of provides, appContext, lifecycles, ...
  }
  // 初始化 props
  initProps(instance, rawProps)
  return instance
}

export let currentInstance = null

export const getCurrentInstance = () => currentInstance

export const setCurrentInstance = instance => {
  currentInstance = instance
}

export const unsetCurrentInstance = () => {
  currentInstance = null
}