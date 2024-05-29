import { initProps, normalizePropsOptions } from "./componentProps"
import { emit } from './componentEmits'
const __DEV__ = true
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
    setupContext: null,
    attrsProxy: null,
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

export function createSetupContext(instance) {
  return Object.freeze({
    get attrs() {
      return getAttrsProxy(instance)
    },
    get emit() {
      return (event, ...args) => {
        emit(instance, event, ...args)
      }
    }
  })
}

function getAttrsProxy(instance) {
  // 把 attrs 通过 Proxy 生成一个代理对象设置到组件实例对象上 attrsProxy 属性上
  return (
    instance.attrsProxy ||
    (instance.attrsProxy = new Proxy(
      instance.attrs,
      __DEV__ // 只在开发环境才进行提醒
        ? {
            get(target, key) {
              return target[key]
            },
            set() {
              // 不允许修改
              console.warn(`setupContext.attrs is readonly.`)
              return false
            },
            deleteProperty() {
              // 不允许删除
              console.warn(`setupContext.attrs is readonly.`)
              return false
            },
          }
        : {
            get(target, key) {
              return target[key]
            },
          },
    ))
  )
}