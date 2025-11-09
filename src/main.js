import App from "./App.js";
import { initRouter } from "./router.js";
import { initMainLayout } from "./pages/MainLayout.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: {
        url: `${import.meta.env.VITE_BASE_PATH}mockServiceWorker.js`,
      },
    }),
  );

const render = () => {
  const root = document.getElementById("root");
  root.innerHTML = App();
  // MainLayout 이벤트 리스너 초기화
  initMainLayout();
};

const main = () => {
  render();
  initRouter();
};

if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
