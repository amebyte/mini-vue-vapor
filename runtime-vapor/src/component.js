let uid = 0
export const createComponentInstance = (
  component
) => {
  const instance = {
    uid: uid++,
    block: null,
    container: null, // set on mount
    component,
    isMounted: false
    // TODO: registory of provides, appContext, lifecycles, ...
  }
  return instance
}

export let currentInstance = null

export const getCurrentInstance = () => currentInstance

export const setCurrentInstance = instance => {
  currentInstance = instance
}

export const unsetCurrentInstance = () => {
  currentInstance = null
}