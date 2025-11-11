import App from "./App.js";
import { initRouter } from "./router.js";

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
  const app = App({ root, options: { name: "app" } });
  app.render();
};

const main = () => {
  render();
  // 라우터 뷰가 DOM에 존재한 후 라우터 초기화
  initRouter();
};

if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
