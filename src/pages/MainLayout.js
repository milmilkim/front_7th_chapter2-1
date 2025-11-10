import Header from "../components/Header";
import Toast, { showToast } from "../components/Toast";
import { cartStore } from "../stores/cartStore";

const MainLayout = () => {
  return /*html*/ `
      <div class="min-h-screen bg-gray-50">
        <header id="header-container" class="bg-white shadow-sm sticky top-0 z-40"></header>
        <main class="max-w-md mx-auto px-4 py-4">
          <div id="router-view">
          </div>
        </main>
        <footer class="bg-white shadow-sm">
          <div class="max-w-md mx-auto py-8 text-center text-gray-500">
            <p>© 2025 항해플러스 프론트엔드 쇼핑몰</p>
          </div>
        </footer>
        <div id="notification-container"></div>
        ${Toast()}
      </div>
    `;
};

let headerInstance = null;

export const initMainLayout = () => {
  const headerContainer = document.getElementById("header-container");
  if (headerContainer && !headerInstance) {
    headerInstance = Header({ root: headerContainer });
  }

  const handleCartAdd = (e) => {
    const { id, quantity = 1, product } = e.detail || {};

    if (!id) {
      return;
    }

    if (!product) {
      showToast("장바구니 추가에 실패했습니다", "error");
      return;
    }

    const success = cartStore.addItem(id, quantity, product);

    if (success) {
      showToast("장바구니에 추가되었습니다", "success");
    } else {
      showToast("장바구니 추가에 실패했습니다", "error");
    }
  };

  window.removeEventListener("cart:add", handleCartAdd);
  window.addEventListener("cart:add", handleCartAdd);
};

export default MainLayout;
