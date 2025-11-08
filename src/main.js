import App from "./App.js";
import { initRouter } from "./router.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

const render = () => {
  const root = document.getElementById("root");
  root.innerHTML = App();
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
