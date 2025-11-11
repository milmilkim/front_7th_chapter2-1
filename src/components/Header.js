import { createComponent } from "../core/BaseComponent";
import { eventBus, Events } from "../core/EventBus";
import { cartStore } from "../stores/cartStore";

const getTitleByPath = (path) => {
  if (path === "/") return "쇼핑몰";
  if (path.startsWith("/product/")) return "상품 상세";
  return "쇼핑몰";
};

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

const getTitleTemplateByPath = (path, title) => {
  if (path === "/") {
    return getHomeTitleTemplate(title);
  }
  if (path.startsWith("/product/")) {
    return getDetailTitleTemplate(title);
  }
  return getNotFoundTitleTemplate(title);
};

const shouldShowBackButton = (path) => {
  return path.startsWith("/product/");
};

const Header = createComponent(({ root, setState, template, onMount, onUnmount, on, useStore }) => {
  setState({
    currentPath: window.location.pathname,
  });

  useStore(cartStore);

  let unsubscribeRouteChange = null;

  template((state) => {
    const { currentPath } = state;
    const cartCount = cartStore.getState().items.length;
    const title = getTitleByPath(currentPath);
    const showBackButton = shouldShowBackButton(currentPath);
    const titleTemplate = getTitleTemplateByPath(currentPath, title);

    return /*html*/ `
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
                  ${
                    cartCount > 0
                      ? `<span class="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">${cartCount}</span>`
                      : ""
                  }
                </button>
              </div>
            </div>
        </div>
    `;
  });

  // 최초 1번만 실행 - EventBus 구독
  onMount(() => {
    // 라우트 변경 이벤트 구독
    unsubscribeRouteChange = eventBus.on(Events.ROUTE_CHANGED, (path) => {
      if (path) {
        setState({ currentPath: path });
      }
    });

    // 장바구니 아이콘 클릭 시 모달 열기
    const handleCartIconClick = (e) => {
      const btn = e.target.closest("#cart-icon-btn");
      if (btn) {
        eventBus.emit(Events.CART_MODAL_OPEN);
      }
    };

    on(root, "click", handleCartIconClick);
  });

  onUnmount(() => {
    if (unsubscribeRouteChange) unsubscribeRouteChange();
  });
});

export default Header;
