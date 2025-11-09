import HomePage from "./pages/HomePage";
import DetailPage from "./pages/DetailPage";
import NotFound from "./pages/NotFound";

const routes = [
  {
    path: "/",
    component: HomePage,
  },
  {
    path: "/detail",
    component: DetailPage,
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

export const Router = (() => {
  let currentPath = window.location.pathname;

  return () => ({
    getPath: () => currentPath,
    push: (path) => {
      const normalizedCurrent = normalizePath(window.location.pathname);
      if (normalizedCurrent === path) return;
      currentPath = path;
      window.history.pushState({}, "", `${BASE_PATH}${path.replace(/^\//, "")}`);
      renderPage();
    },
    updateCurrentPath: (path) => {
      currentPath = path;
    },
  });
})();

export const renderPage = (routerId = "router-view") => {
  const path = normalizePath(window.location.pathname);
  const route = routes.find((r) => r.path === path);
  const routerRoot = document.getElementById(routerId);

  if (!routerRoot) return;

  if (route) {
    route.component({
      root: routerRoot,
    });
  } else {
    NotFound({
      root: routerRoot,
    });
  }
};

let initialized = false;

export const initRouter = () => {
  if (initialized) return;
  initialized = true;

  const router = Router();

  renderPage();

  // 뒤로가기
  window.addEventListener("popstate", () => {
    const path = normalizePath(window.location.pathname);
    router.updateCurrentPath(path);
    renderPage();
  });

  document.addEventListener("click", (e) => {
    const linkEl = e.target.closest("[data-link]");
    if (!linkEl) return;

    e.preventDefault();
    const path = linkEl.getAttribute("data-link")?.trim() || "/";
    router.push(path);
  });
};
