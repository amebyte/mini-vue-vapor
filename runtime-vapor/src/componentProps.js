// 模拟开发环境变量
const __DEV__ = true

export function initProps(instance, rawProps) {
    const props = {}
    const [options] = instance.propsOptions
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

    // 开发环境进行检查 props 的数据是否合规
    if (__DEV__) {
        validateProps(rawProps, props, options || {})
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

// 因为在 Vue 内部也使用 $ 开头作为方法和属性，所以为了防止冲突，也禁止使用 $ 开头的 prop
function validatePropName(key) {
    if (key[0] !== '$') {
      return true
    } else if (__DEV__) {
      // 开发环境会进行警告
      console.warn(`Invalid prop name: "${key}" is a reserved property.`)
    }
    return false
}

function validateProps(
    rawProps,
    props,
    options,
) {
    const presentKeys = []
    // 收集传递过来的 props 属性然后在后面判断是否存在 props 配置中
    rawProps && presentKeys.push(...Object.keys(rawProps))
  
    for (const key in options) {
      const opt = options[key]
      if (opt != null)
        validateProp(
          key,
          props[key],
          opt,
          props,
          !presentKeys.some(k => k === key), // 判断传过来的 prop 是否存在配置中
        )
    }  
}

function validateProp(
    name,
    value,
    option,
    props,
    isAbsent
  ) {
    const { required, validator } = option
    // 必填项校验
    if (required && isAbsent) {
      console.warn('Missing required prop: "' + name + '"')
      return
    }
  
    // 自定义校验器校验
    if (validator && !validator(value, props)) {
      console.warn('Invalid prop: custom validator check failed for prop "' + name + '".')
    }
}