import {
    createSetupContext,
    getCurrentInstance,
} from './component'
const __DEV__ = true // 模拟开发环境
export function useAttrs() {
    // 通过获取 setupContext 来获取 attrs
    return getContext().attrs
}

// 获取 setupContext 上下文
function getContext() {
    // 获取组件实例对象
    const i = getCurrentInstance()
    // 如果是开发环境要判断是否存在组件实例对象
    if (__DEV__ && !i) {
        console.warn(`useContext() called without active instance.`)
    }
    // 如果存在 setupContext 就返回，否则就创建一个 setupContext
    return i.setupContext || (i.setupContext = createSetupContext(i))
}