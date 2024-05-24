export function patchAttrs(instance) {
    // 获取组件实例对象上的属性
    const {
      attrs,
      rawProps,
      propsOptions: [options],
    } = instance    
    // 循环用户传递的 props
    for (const rawKey in rawProps) {
      // 通过一个函数处理
      const getter = rawProps[rawKey]
      // 如果传递的 prop 不存在组件 props 配置项中就进行设置
      if (!(rawKey in options)) {
        // attrs 的属性跟 props 一样需要通过 Object.defineProperty 进行劫持代理 
        Object.defineProperty(attrs, rawKey, {
          get: getter
        })        
      } 
    }
}