export const createComponent = (setup) => {
  return ({ root, props = {}, options }) => {
    let state = {};
    let view = () => "";
    const mountCallbacks = [];
    const mountedCallbacks = [];
    const unmountCallbacks = [];
    const renderCallbacks = [];
    let isMounted = false;
    let mountCleanups = [];
    let renderCleanups = [];

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
      target.addEventListener(event, handler);
      mountCleanups.push(() => target.removeEventListener(event, handler));
    };

    // 최초 1번만 실행 (이벤트 구독 등)
    const onMount = (fn) => {
      console.log(`${options?.name || "component"} onMount`);

      mountCallbacks.push(fn);
    };

    // 언마운트 시 실행 (구독 해지 등)
    const onUnmount = (fn) => {
      unmountCallbacks.push(fn);
    };

    // 매 업데이트마다 실행 (DOM 이벤트 바인딩)
    const onUpdated = (fn) => {
      renderCallbacks.push(fn);
    };

    const onMounted = (fn) => {
      mountedCallbacks.push(fn);
    };

    const render = () => {
      // 이전 render 바인딩 제거
      renderCleanups.forEach((fn) => fn && fn());
      renderCleanups = [];

      // 그리기
      root.innerHTML = view(state);

      // render 후 콜백 실행 (DOM 이벤트용)
      renderCallbacks.forEach((fn) => {
        const cleanup = fn();
        if (typeof cleanup === "function") renderCleanups.push(cleanup);
      });

      if (isMounted) return;
      mountedCallbacks.forEach((fn) => fn && fn());
      isMounted = true;
    };

    // 스토어 구독 헬퍼 - subscribe만 처리 (반환 없음)
    const useStore = (store) => {
      const unsubscribe = store.subscribe(() => {
        // 스토어 변경 시 리렌더 트리거
        render();
      });

      mountCleanups.push(unsubscribe);
    };

    // setup 함수 실행 (props 전달)
    setup({ root, props, getState, setState, template, onMount, onMounted, onUnmount, onUpdated, on, useStore });
    // render();

    // mount 콜백 실행 (최초 1번만)
    mountCallbacks.forEach((fn) => {
      const cleanup = fn();
      if (typeof cleanup === "function") mountCleanups.push(cleanup);
    });

    const unmount = () => {
      console.log(`${options?.name || "component"} unmount`);
      unmountCallbacks.forEach((fn) => fn && fn());
      mountCleanups.forEach((fn) => fn && fn());
      renderCleanups.forEach((fn) => fn && fn());
      mountCleanups = [];
      renderCleanups = [];
      root.replaceChildren();
    };

    return {
      getState,
      setState,
      unmount,
      render,
    };
  };
};
