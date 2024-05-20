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

export function normalizePropsOptions(comp) {
    const raw = comp.props
    // props 标准化后的存储对象
    const normalized = {}
    // 是否需要转换
    const needCastKeys = []
  
    for (const key in raw) {
      // 判断属性名称是否合法
      if (validatePropName(key)) {
        const opt = raw[key]
        // 主要针对 props 配置为数组和原生类型进行标准化配置，我们设置的 props: { count: Number } 中的 Number 其实就是一个原生的类型构造函数
        normalized[key] = Array.isArray(opt) || typeof opt === 'function' ? { type: opt } : raw[key]
      }
    }
  
    return [normalized, needCastKeys]
  }