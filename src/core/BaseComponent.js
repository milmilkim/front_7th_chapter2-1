export const createComponent = (setup) => {
  return ({ root, props = {}, options }) => {
    let state = {};
    let view = () => "";

    /**
     * lifecycle callbacks
     */
    const beforeMountCallbacks = [];
    const mountedCallbacks = [];
    const updatedCallbacks = [];
    const unmountCallbacks = [];

    let isMounted = false;

    const mountedCleanups = [];

    const getState = () => ({ ...state });
    const setState = (patch) => {
      state = typeof patch === "function" ? patch(state) : { ...state, ...patch };
      render();
    };

    const template = (fn) => {
      view = fn;
    };

    // DOM 이벤트 헬퍼 (자동 cleanup)
    const on = (target, event, handler) => {
      if (!target) return;
      target.addEventListener(event, handler);
      unmountCallbacks.push(() => target.removeEventListener(event, handler));
    };

    const onBeforeMount = (fn) => {
      beforeMountCallbacks.push(fn);
    };

    const onMounted = (fn) => {
      mountedCallbacks.push(fn);
    };

    const onUpdated = (fn) => {
      updatedCallbacks.push(fn);
    };

    const onUnmount = (fn) => {
      unmountCallbacks.push(fn);
    };

    // 스토어 구독 헬퍼 - subscribe만 처리
    const useStore = (store) => {
      const unsubscribe = store.subscribe(() => {
        render();
      });

      mountedCleanups.push(unsubscribe);
    };

    const render = () => {
      root.innerHTML = view(state);

      // 최초 렌더링일 경우 실행
      if (!isMounted) {
        console.log(`✅ onMounted: ${options?.name || "component"}`);
        mountedCallbacks.forEach((fn) => fn && fn());
        isMounted = true;
      }

      updatedCallbacks.forEach((fn) => {
        fn();
      });
    };

    setup({ root, props, getState, setState, template, onBeforeMount, onMounted, onUnmount, onUpdated, on, useStore });

    beforeMountCallbacks.forEach((fn) => {
      fn();
    });

    const unmount = () => {
      console.log(`🧨 unmount: ${options?.name || "component"}`);
      unmountCallbacks.forEach((fn) => fn());
      mountedCleanups.forEach((fn) => fn());

      root.replaceChildren();

      unmountCallbacks.length = 0;
      mountedCleanups.length = 0;
    };

    return {
      getState,
      setState,
      unmount,
      render,
    };
  };
};
