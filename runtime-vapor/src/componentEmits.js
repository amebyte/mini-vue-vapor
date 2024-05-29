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