export const createPage = (root, setup) => {
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
  const afterRender = (fn) => {
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
      const c = fn({ root, getState, setState });
      if (typeof c === "function") cleanups.push(c);
    });
  };

  setup({ getState, setState, template, afterRender });
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
