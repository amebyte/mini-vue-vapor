import { ref, template, effect, getCurrentInstance, insert } from "../runtime-vapor/src"
import { createComponent } from "../runtime-vapor/src/apiCreateComponent"
import ChildComponent from "./childComponent"
const App = {
    setup() {
        const instance = getCurrentInstance()
        instance.m = []
        instance.add = (fn) => {
            instance.m.push(fn)
        }
        instance.add(() => {
            console.log('mounted')
        })
        const count = ref(0)
        return { count } 
    },
    render(_ctx) {
        // 生成创建 button 标签的函数
        const _tmpl$ = template('<button></button>')
        // 真正进行创建模板内容的地方
        const el = _tmpl$()
        el.addEventListener('click', () => {
            _ctx.count++
        })
        const n1 = createComponent(ChildComponent)
        insert(n1, el)
        // effect(() => {
        //     el.textContent = _ctx.count.value
        // })
        return el
    }
}

export default App