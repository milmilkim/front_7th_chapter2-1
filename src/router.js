import HomePage from "./pages/HomePage";
import DetailPage from "./pages/DetailPage";

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

export const Router = (() => {
  let currentPath = window.location.pathname;

  return () => ({
    getPath: () => currentPath,
    push: (path) => {
      if (currentPath === path) return;
      currentPath = path;
      window.history.pushState({}, "", path);
      renderPage();
    },
  });
})();

export const renderPage = (routerId = "router-view") => {
  const path = window.location.pathname;
  const route = routes.find((r) => r.path === path);
  const routerRoot = document.getElementById(routerId);

  if (!routerRoot) return;

  if (route) {
    routerRoot.innerHTML = route.component();
  } else {
    routerRoot.innerHTML = "<h1>not found😂</h1>";
  }
};

let initialized = false;

export const initRouter = () => {
  if (initialized) return;
  initialized = true;

  const router = Router();

  renderPage();

  // 뒤로가기
  window.addEventListener("popstate", () => renderPage());

  document.addEventListener("click", (e) => {
    const { target } = e;
    if (target.dataset.routerLink) {
      router.push(target.dataset.routerLink);
    }
  });
};
