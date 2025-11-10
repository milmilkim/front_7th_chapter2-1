import Header from "../components/Header";
import Toast from "../components/Toast";

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
};

export default MainLayout;
