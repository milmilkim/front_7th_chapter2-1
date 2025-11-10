export const createComponent = (root, setup) => {
  let state = {};
  let view = () => "";
  const binders = [];
  let cleanups = [];

  const getState = () => ({ ...state });
  const setState = (patch) => {
    state = typeof patch === "function" ? patch(state) : { ...state, ...patch };
    render();
  };

  const template = (fn) => {
    view = fn;
  };
  const onMount = (fn) => {
    binders.push(fn);
  };

  const render = () => {
    // 이전 바인딩 제거
    cleanups.forEach((fn) => fn && fn());
    cleanups = [];

    // 그리기
    root.innerHTML = view(state);

    // 새 바인딩
    binders.forEach((fn) => {
      // 이벤트 리스너 자동 관리 헬퍼
      const on = (target, event, handler) => {
        target.addEventListener(event, handler);
        cleanups.push(() => target.removeEventListener(event, handler));
      };

      const c = fn({ root, getState, setState, on });
      if (typeof c === "function") cleanups.push(c);
    });
  };

  setup({ getState, setState, template, onMount });
  render();

  return {
    getState,
    setState,
    unmount() {
      cleanups.forEach((fn) => fn && fn());
      cleanups = [];
      root.replaceChildren();
    },
  };
};
