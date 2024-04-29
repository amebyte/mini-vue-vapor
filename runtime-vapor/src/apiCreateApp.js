import { render } from "./render"
export function createApp(rootComponent) {
    // 创建 Vue3 应用实例对象
    const app = {
        // 实例挂载方法
        mount(rootContainer) {
            // 把根组件的挂载到 #app 节点上
            render(rootComponent, rootContainer)
        }
    }
    return app
}