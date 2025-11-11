import { createComponent } from "./core/BaseComponent";
import MainLayout from "./pages/MainLayout";

const App = createComponent(({ template, onMounted, onUnmount }) => {
  template(() => /*html*/ `<div id="main-layout"></div>`);

  let mainLayout = null;
  onMounted(() => {
    mainLayout = MainLayout({ root: document.getElementById("main-layout"), options: { name: "mainLayout" } });
    mainLayout.render();
  });

  onUnmount(() => {
    mainLayout?.unmount();
  });
});

export default App;
