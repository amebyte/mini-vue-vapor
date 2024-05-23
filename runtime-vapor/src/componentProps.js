// 模拟开发环境变量
const __DEV__ = true

export function initProps(instance, rawProps) {
  instance.rawProps = rawProps
  const props = {}
  const [options] = instance.propsOptions
  if (options) {
    for(const key in options) {
      registerProp(instance, props, key, rawProps[key])
    }
  }
  // 开发环境进行检查 props 的数据是否合规
  if (__DEV__) {
    validateProps(rawProps, props, options || {})
  }

  patchAttrs(instance)

  instance.props = props
}

function registerProp(
  instance,
  props,
  key,
  getter
) {
  // 如果已经存在的就不再处理
  if (key in props) return
  const [options, needCastKeys] = instance.propsOptions
  let value
  // 如果父组件没传相关 prop 
  if (getter === undefined) {
    // 检查是否存在默认值需要转换
    const needCast = needCastKeys && needCastKeys.includes(key)
    // 需要转换
    if (needCast) {
      value = resolvePropValue(options, props, key, getter ? getter() : undefined)
    }
  }
  Object.defineProperty(props, key, {
    get() {
      return getter === undefined ? value : getter()
    }
  })
}

function resolvePropValue(options, props, key, value) {
  const opt = options[key]
  // 存在配置项
  if (opt != null) {
    // 默认值必须是自身的属性
    const hasDefault = Object.prototype.hasOwnProperty.call(opt, 'default')
    // 如果存在默认值
    if (hasDefault) {
      const defaultValue = opt.default
      // 如果默认值是函数，且类型不是函数
      if (opt.type !== Function && typeof defaultValue === 'function') {
        // 默认值时函数需要把执行的结果返回再进行赋值，并且默认值中的函数不能访问组件实例 this 的，所以在执行的时候需要把里面的 this 通过 call 方法指向 null
        value = defaultValue.call(null, props)
      } else {
        // 默认值不是函数，直接赋值
        value = defaultValue
      }
    }
  }
  return value
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
        const prop = (normalized[key] = Array.isArray(opt) || typeof opt === 'function' ? { type: opt } : raw[key])
        if (prop) {
          // 如果存在默认值就需要转换
          if (Object.prototype.hasOwnProperty.call(prop, 'default')) {
            needCastKeys.push(key)
          }
        }
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