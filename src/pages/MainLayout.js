import Header from "../components/Header";
import Toast from "../components/Toast";
import CartModal from "../components/CartModal";
import { createComponent } from "../core/BaseComponent";
import { initRouter } from "../router/index.js";
import Footer from "../components/Footer";

const MainLayout = createComponent(({ template, onMounted }) => {
  onMounted(() => {
    const header = Header({ root: document.getElementById("header-container"), options: { name: "header" } });
    header.render();

    const cartModal = CartModal({
      root: document.getElementById("cart-modal-container"),
      options: { name: "cartModal" },
    });
    cartModal.render();

    initRouter();
  });

  template(() => {
    return /*html*/ `
    <div class="min-h-screen bg-gray-50">
    <header id="header-container" class="bg-white shadow-sm sticky top-0 z-40"></header>
    <main class="max-w-md mx-auto px-4 py-4">
      <div id="router-view"></div>
    </main>
    ${Footer()}
    <div id="notification-container"></div>
    ${Toast()}
    <div id="cart-modal-container"></div>
  </div>`;
  });
});

export default MainLayout;
