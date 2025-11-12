import { matchRoute, normalizePath } from "./utils";
import { routes } from "./routes";

// 파라미터 객체 비교 헬퍼 함수
const isParamsEqual = (params1, params2) => {
  // null/undefined 체크
  if (!params1 && !params2) return true;
  if (!params1 || !params2) return false;

  const keys1 = Object.keys(params1);
  const keys2 = Object.keys(params2);

  if (keys1.length !== keys2.length) return false;

  return keys1.every((key) => params1[key] === params2[key]);
};

// 즉시 실행 함수를 이용한 싱글턴 라우터
export const useRouter = (() => {
  const listeners = new Set();

  let current = {
    path: normalizePath(window.location.pathname),
    params: {},
    query: new URLSearchParams(window.location.search),
  };

  const notify = () => {
    for (const fn of listeners) {
      fn({ ...current });
    }
  };

  const update = () => {
    const path = normalizePath(window.location.pathname);
    let params = {};

    for (const route of routes) {
      const res = matchRoute(path, route.path);
      if (res.match) {
        params = res.params || {};
        break;
      }
    }

    // 경로와 파라미터가 같으면 쿼리스트링만 업데이트
    // 하지만 notify는 호출하여 구독자들이 변경을 감지할 수 있도록 함
    if (current.path === path && isParamsEqual(current.params, params)) {
      current.query = new URLSearchParams(window.location.search);
      notify();
      return;
    }

    current = {
      path,
      params,
      query: new URLSearchParams(window.location.search),
    };
    notify();
  };

  const subscribe = (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  };

  const push = (url) => {
    window.history.pushState({}, "", url);
    update();
  };

  const replace = (url) => {
    window.history.replaceState({}, "", url);
    update();
  };

  // 뒤로가기/앞으로가기 감지
  window.addEventListener("popstate", update);
  // pushState/replaceState로 인한 url 감지 방지
  window.addEventListener("urlchange", update);

  // data-link
  document.addEventListener("click", (e) => {
    const linkEl = e.target.closest("[data-link]");
    if (!linkEl) return;

    e.preventDefault();
    const path = linkEl.getAttribute("data-link")?.trim() || "/";
    router.push(path);
  });

  // 뒤로가기 버튼
  document.addEventListener("click", (e) => {
    const backButton = e.target.closest("#back-button");
    if (backButton) {
      e.preventDefault();
      window.history.back();
    }
  });

  const router = {
    getCurrent: () => current,
    subscribe,
    push,
    replace,
  };

  return () => router;
})();

export const initRouter = () => {
  const router = useRouter();
  const root = document.getElementById("router-view");

  let currentPageInstance = null;
  let lastRenderedPath = null;
  let lastRenderedParams = {};

  const render = (current) => {
    let matchedRoute = null;
    let params = {};

    // 먼저 라우트 매칭 수행
    for (const route of routes) {
      const { match, params: found } = matchRoute(current.path, route.path);
      if (match) {
        matchedRoute = route;
        params = found || {};
        break;
      }
    }

    if (!matchedRoute) {
      matchedRoute = routes.find((route) => route.path === "*");
      if (!matchedRoute) {
        console.error("No route matched:", current.path);
        return;
      }
      params = {};
    }

    // 매칭된 경로와 파라미터가 같으면 렌더링 건너뛰기 (쿼리스트링만 변경된 경우)
    if (lastRenderedPath === current.path && isParamsEqual(lastRenderedParams, params)) {
      return;
    }

    router.getCurrent().params = params;

    if (currentPageInstance && currentPageInstance.unmount) {
      currentPageInstance.unmount();
      currentPageInstance = null;
    }
    const Page = matchedRoute.component;
    Page({ root, options: { name: matchedRoute.name } }).render?.();
    currentPageInstance = Page;

    // 렌더링된 경로와 파라미터 저장
    lastRenderedPath = current.path;
    lastRenderedParams = { ...params };
  };

  // 초기 렌더
  const initialCurrent = router.getCurrent();
  render(initialCurrent);

  // 변경 감지 후 재렌더
  // 쿼리스트링만 변경될 때는 render를 호출 X
  router.subscribe((current) => {
    const shouldRender = lastRenderedPath !== current.path || !isParamsEqual(lastRenderedParams, current.params);

    if (shouldRender) {
      render(current);
    }
  });
};

export const useParams = () => {
  const router = useRouter();

  if (!router) {
    return {};
  }
  return router.getCurrent().params;
};

export const useQueryParams = () => {
  const router = useRouter();
  if (!router) {
    const query = new URLSearchParams(window.location.search);
    return Object.fromEntries(query);
  }
  return Object.fromEntries(router.getCurrent().query);
};

// 경로 변경 감지 훅 (쿼리스트링 변경은 무시)
export const useRouteChange = (callback) => {
  const router = useRouter();
  if (!router) return () => {};

  let lastPath = router.getCurrent().path;

  return router.subscribe((current) => {
    // 경로가 실제로 변경된 경우에만 콜백 호출
    if (lastPath !== current.path) {
      lastPath = current.path;
      callback(current.path, current);
    }
  });
};

// 쿼리스트링 변경 감지 훅 (경로 변경은 무시)
export const useQueryChange = (callback) => {
  const router = useRouter();
  if (!router) return () => {};

  return router.subscribe(() => {
    const queryParams = useQueryParams();
    callback(queryParams);
  });
};
