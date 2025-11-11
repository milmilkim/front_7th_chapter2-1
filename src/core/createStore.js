export function createStore(createState) {
  const listeners = new Set();
  let state;

  const setState = (partial) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;

    if (nextState !== state) {
      state = { ...state, ...nextState };
      listeners.forEach((listener) => {
        try {
          listener(state);
        } catch (error) {
          console.error("Store listener error:", error);
        }
      });
    }
  };

  const getState = () => state;

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  state = createState(setState, getState);

  return {
    getState,
    subscribe,
  };
}
