import { ref, template, effect } from '../runtime-vapor/src'
const ChildComponent = {
    setup(props) {
        return (() => {
            const _tmpl$ = template('<div id="child"></div>')
            // 真正进行创建模板内容的地方
            const el = _tmpl$()
            effect(() => {
                el.textContent = props.count
            }) 
            return el
        })()
    }
}

export default ChildComponent