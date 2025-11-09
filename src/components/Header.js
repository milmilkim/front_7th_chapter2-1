// 경로에 따른 타이틀 텍스트 결정
export const getTitleByPath = (path) => {
  if (path === "/") return "쇼핑몰";
  if (path.startsWith("/product/")) return "상품 상세";
  return "쇼핑몰";
};

// 각 경로별 타이틀 영역 템플릿 컴포넌트
const getHomeTitleTemplate = (title) => {
  return /*html*/ `
    <h1 class="text-xl font-bold text-gray-900">
      <a href="/" data-link="">${title}</a>
    </h1>
  `;
};

const getDetailTitleTemplate = (title) => {
  return /*html*/ `
    <h1 class="text-lg font-bold text-gray-900">${title}</h1>
  `;
};

const getNotFoundTitleTemplate = (title) => {
  return /*html*/ `
    <h1 class="text-xl font-bold text-gray-900">
      <a href="/" data-link="">${title}</a>
    </h1>
  `;
};

// 경로에 따른 타이틀 템플릿 결정
const getTitleTemplateByPath = (path, title) => {
  if (path === "/") {
    return getHomeTitleTemplate(title);
  }
  if (path.startsWith("/product/")) {
    return getDetailTitleTemplate(title);
  }
  return getNotFoundTitleTemplate(title);
};

// 경로에 따라 뒤로가기 버튼 표시 여부 결정 (상세페이지에서만)
export const shouldShowBackButton = (path) => {
  return path.startsWith("/product/");
};

// 헤더 업데이트 함수 (initRouter에서 등록됨)
export const updateHeader = (path) => {
  const title = getTitleByPath(path);
  const showBack = shouldShowBackButton(path);

  const h1 = document.querySelector("header h1");
  const backButton = document.querySelector("header #back-button");

  if (!h1) return;

  const template = getTitleTemplateByPath(path, title);
  h1.outerHTML = template;

  if (backButton) {
    backButton.style.display = showBack ? "flex" : "none";
  }
};

const Header = () => {
  // 초기 상태 설정 (현재 경로만 읽어서 렌더링)
  const currentPath = window.location.pathname;
  const initialTitle = getTitleByPath(currentPath);
  const showBackButton = shouldShowBackButton(currentPath);
  const titleTemplate = getTitleTemplateByPath(currentPath, initialTitle);

  return /*html*/ `
    <header class="bg-white shadow-sm sticky top-0 z-40">
      <div class="max-w-md mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <button
              id="back-button"
              class="p-2 text-gray-700 hover:text-gray-900 transition-colors"
              style="display: ${showBackButton ? "flex" : "none"};"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            ${titleTemplate}
          </div>
          <div class="flex items-center space-x-2">
            <!-- 장바구니 아이콘 -->
            <button id="cart-icon-btn" class="relative p-2 text-gray-700 hover:text-gray-900 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  `;
};

export default Header;
