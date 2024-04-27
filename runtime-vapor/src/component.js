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