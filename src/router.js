import HomePage from "./pages/HomePage";
import DetailPage from "./pages/DetailPage";
import NotFound from "./pages/NotFound";
import { eventBus, Events } from "./core/EventBus";

const routes = [
  {
    path: "/",
    component: HomePage,
    name: "home",
  },
  {
    path: "/product/:productId",
    component: DetailPage,
    name: "detail",
  },
];

const BASE_PATH = import.meta.env.VITE_BASE_PATH || "/";

const normalizePath = (pathname) => {
  if (!pathname.startsWith(BASE_PATH)) return pathname;

  const pattern = new RegExp(`^${BASE_PATH}(?:/)?`);
  let path = pathname.replace(pattern, "/");

  // 중복된 슬래시 제거
  path = path.replace(/\/{2,}/g, "/");
  // 항상 /로 시작하도록 보정
  if (!path.startsWith("/")) path = "/" + path;

  return path === "" ? "/" : path;
};

// 경로 패턴을 정규식으로 변환하고 파라미터 이름 추출
const pathToRegex = (path) => {
  const paramNames = [];
  const pattern = path.replace(/\//g, "\\/").replace(/:(\w+)/g, (_, paramName) => {
    paramNames.push(paramName);
    return "([^/]+)";
  });

  return {
    regex: new RegExp(`^${pattern}$`),
    paramNames,
  };
};

// 경로와 라우트 패턴 매칭 및 파라미터 추출
const matchRoute = (path, routePath) => {
  if (routePath === path) {
    return { match: true, params: {} };
  }

  if (routePath.includes(":")) {
    const { regex, paramNames } = pathToRegex(routePath);
    const match = path.match(regex);

    if (match) {
      const params = {};
      paramNames.forEach((name, index) => {
        params[name] = match[index + 1];
      });
      return { match: true, params };
    }
  }

  return { match: false, params: {} };
};

let currentParams = {};

export const Router = (() => {
  let currentPath = window.location.pathname;
  let currentSearch = window.location.search;

  return () => ({
    getPath: () => currentPath,
    push: (path) => {
      // 경로와 쿼리스트링 분리
      const [pathname, queryString] = path.split("?");
      const normalizedCurrent = normalizePath(window.location.pathname);
      const normalizedNew = normalizePath(pathname.split("?")[0]);
      const newSearch = queryString ? `?${queryString}` : "";

      // pathname과 쿼리스트링이 모두 같으면 중복 이동 방지
      if (normalizedCurrent === normalizedNew && currentSearch === newSearch) {
        return;
      }

      currentPath = normalizedNew;
      currentSearch = newSearch;
      const fullPath = queryString
        ? `${BASE_PATH}${pathname.replace(/^\//, "")}?${queryString}`
        : `${BASE_PATH}${pathname.replace(/^\//, "")}`;

      // 항상 pushState 사용 (히스토리 쌓기)
      window.history.pushState({}, "", fullPath);
      // renderPage()는 urlchange 이벤트에서 자동으로 호출됨 (renderPage에서 분기 처리)
    },
    syncLocation: () => {
      currentPath = normalizePath(window.location.pathname);
      currentSearch = window.location.search;
    },
  });
})();

// 라우터 훅: 현재 라우트 params 가져오기
export const useParams = () => {
  return currentParams;
};

export const useQueryParams = () => {
  const params = new URLSearchParams(window.location.search);
  const paramsObj = Object.fromEntries(params);
  return paramsObj;
};

let currentPageInstance = null;
let previousPath = null;

export const renderPage = (routerId = "router-view") => {
  const path = normalizePath(window.location.pathname);
  const routerRoot = document.getElementById(routerId);

  if (!routerRoot) return;

  // path가 같고 쿼리만 다르면 전체 렌더링 건너뛰고 쿼리 파라미터만 업데이트
  if (previousPath === path && currentPageInstance) {
    const searchParams = new URLSearchParams(window.location.search);
    const queryParams = Object.fromEntries(searchParams);

    // 라우트 매칭하여 routeParams 가져오기
    let routeParams = {};
    for (const route of routes) {
      const { match, params } = matchRoute(path, route.path);
      if (match) {
        routeParams = params;
        break;
      }
    }

    const allParams = { ...routeParams, ...queryParams };
    currentParams = allParams;

    // 쿼리 파라미터 변경 이벤트 발생 (이벤트버스로 전달)
    eventBus.emit(Events.QUERY_CHANGED, queryParams);

    // 라우트 변경 완료 이벤트 발생 (Header 업데이트용)
    eventBus.emit(Events.ROUTE_CHANGED, path);
    previousPath = path;
    return;
  }

  // 이전 페이지 언마운트
  if (currentPageInstance && currentPageInstance.unmount) {
    currentPageInstance.unmount();
    currentPageInstance = null;
  }

  // 라우트 매칭 (정확한 매칭 우선, 그 다음 파라미터 매칭)
  let matchedRoute = null;
  let routeParams = {};

  for (const route of routes) {
    const { match, params } = matchRoute(path, route.path);
    if (match) {
      matchedRoute = route;
      routeParams = params;
      break;
    }
  }

  if (matchedRoute) {
    // 쿼리스트링 파라미터도 추가
    const searchParams = new URLSearchParams(window.location.search);
    const queryParams = Object.fromEntries(searchParams);
    const allParams = { ...routeParams, ...queryParams };

    // 현재 params 저장 (useParams에서 사용)
    currentParams = allParams;

    // 페이지 컴포넌트 실행 및 인스턴스 저장
    const pageInstance = matchedRoute.component({
      root: routerRoot,
      options: { name: matchedRoute.name },
    });

    // 페이지 인스턴스가 unmount 메서드를 가지고 있으면 저장
    if (pageInstance && pageInstance.unmount) {
      currentPageInstance = pageInstance;
    }
  } else {
    currentParams = {};
    const notFoundInstance = NotFound({
      root: routerRoot,
      options: { name: "notfound" },
    });

    // NotFound 인스턴스가 unmount 메서드를 가지고 있으면 저장
    if (notFoundInstance && notFoundInstance.unmount) {
      currentPageInstance = notFoundInstance;
    }
  }

  // 라우트 변경 완료 이벤트 발생 (Header 업데이트용)
  eventBus.emit(Events.ROUTE_CHANGED, path);
  previousPath = path;
};

let initialized = false;

export const initRouter = () => {
  if (initialized) return;
  initialized = true;

  const router = Router();

  // pushState와 replaceState 래핑하여 쿼리스트링 변경 감지
  ["pushState", "replaceState"].forEach((method) => {
    const original = history[method];
    history[method] = function (...args) {
      const result = original.apply(this, args);
      window.dispatchEvent(new Event("urlchange"));
      return result;
    };
  });

  renderPage();

  // 뒤로가기
  window.addEventListener("popstate", () => {
    router.syncLocation();
    renderPage();
  });

  // pushState/replaceState로 인한 URL 변경 감지
  window.addEventListener("urlchange", () => {
    router.syncLocation();
    renderPage();
  });

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

  // 초기 렌더링 시 location 동기화
  router.syncLocation();
};
