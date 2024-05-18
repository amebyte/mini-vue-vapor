export function initProps(instance, rawProps) {
    const props = {}
    if (rawProps) {
      for(const key in rawProps) {
        const valueGetter = rawProps[key]
        Object.defineProperty(props, key, {
          get() {
            return valueGetter()
          }
        })
      }
    }
    instance.props = props
}