import { ref, template, effect, getCurrentInstance, insert } from "../runtime-vapor/src"
import { createComponent } from "../runtime-vapor/src/apiCreateComponent"
import ChildComponent from "./childComponent"
const App = {
    setup() {
        const count = ref(0)
        // 定义订阅者函数
        const handleUpdate = (data, data2) => {
            console.log('emit 触发成功', data, data2)
        }
        return { count, handleUpdate } 
    },
    render(_ctx) {
        // 生成创建 button 标签的函数
        const _tmpl$ = template('<button id="parent"></button>')
        // 真正进行创建模板内容的地方
        const el = _tmpl$()
        el.addEventListener('click', () => {
            _ctx.count++
        })
        const n1 = createComponent(ChildComponent, {
            count: () => _ctx.count,
            // 添加订阅者
            onUpdate: () => _ctx.handleUpdate
        })
        insert(n1, el)
        return el
    }
}

export default App