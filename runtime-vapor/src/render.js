export function render(comp, container) {
    const render = typeof comp === 'function' ? comp : comp.render
    const block = render()
    insert(block, container)
}

export function insert(block, parent, anchor = null) {
    parent.insertBefore(block, anchor)
}