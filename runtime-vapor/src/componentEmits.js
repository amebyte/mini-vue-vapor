const __DEV__ = true
export function emit(
    instance,
    event,
    ...rawArgs
  ) {

    // 在开发环境中，代码会执行检查，而在生产环境中，为了性能考虑，这些检查会被省略。
    if (__DEV__) {
        const {
            emitsOptions,
            propsOptions,
        } = instance
        // 如果 emitsOptions 存在（即组件定义了 emits 选项），则继续检查。
        if (emitsOptions) {
            // 使用 in 运算符检查事件名 event 是否在 emitsOptions 中。
            if (!(event in emitsOptions)) {
                console.log('evvvv', event)
                // 如果不在，并且 propsOptions 也不存在或 event 不在 propsOptions 中，则输出一个警告，说明组件发射了一个事件，但该事件既没有在 emits 选项中声明，也没有作为一个 prop 声明。
                if (!propsOptions || !(event in propsOptions)) {
                    console.warn(
                        `Component emitted event "${event}" but it is neither declared in ` +
                        `the emits option nor as an "${event}" prop.`,
                    )
                }
            } else {
                // 如果事件在 emitsOptions 中存在，那么检查是否有为该事件定义的验证器（validator）。  
                const validator = emitsOptions[event]
                if (typeof validator === 'function') {
                    // 验证器是一个函数，则使用该函数来验证 `rawArgs`（可能是传递给事件的原始参数）
                    const isValid = validator(...rawArgs)
                    if (!isValid) {
                        // 验证失败，则输出一个警告，说明事件参数无效，事件验证失败。
                        console.warn(
                        `Invalid event arguments: event validation failed for event "${event}".`,
                        )
                    }
                }
            }
        }
    }

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