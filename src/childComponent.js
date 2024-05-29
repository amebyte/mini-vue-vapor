import { ref, template, effect, useAttrs } from '../runtime-vapor/src'
const ChildComponent = {
    props: {
        count: {
            type: Number,
            default: 520
        }
    },
    setup(props, context) {
        context.emit('update', { name : 'Cobyte' }, '参数2')
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