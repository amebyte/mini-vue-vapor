export function emit(
    instance,
    event,
    ...rawArgs
  ) {
    // 将事件名转换成 onXXX，on 后面第一个字母需要转换成大写
    const handleName = `on${event.charAt(0).toUpperCase() + event.slice(1)}`
    // 在组件实例对象上的 rawProps 判断有没有存在对应的事件，有就执行返回对应的事件函数
    const handler = instance.rawProps[handleName] && instance.rawProps[handleName]()
    // 执行在父组件注册的事件函数
    handler(...rawArgs)
}

// 规范化（或标准化）一个组件的 emits 选项
export function normalizeEmitsOptions(comp) {
    // 先尝试从传入的组件对象（comp）中获取 emits 属性，并将其存储在 raw 变量中
    const raw = comp.emits
    // 如果 raw 不存在（即组件没有定义 emits 属性），函数直接返回null
    if (!raw) return null
    // 创建一个空对象 normalized，用于存储规范化后的 emits 数据
    let normalized = {}
    // 如果raw是一个数组
    if (isArray(raw)) {
        // 遍历数组中的每个元素（这里假设每个元素都是一个字符串，即事件名称）
        raw.forEach(key => (normalized[key] = null))
    } else {
        // 如果raw不是一个数组则使用Object.assign方法将raw对象中的所有属性复制到normalized对象中。这意味着如果raw对象中的属性是事件验证器（即返回布尔值的函数或对象），它们将直接复制到normalized对象中
        Object.assign(normalized, raw)
    }
    // 返回标准化后的对象
    return normalized
}