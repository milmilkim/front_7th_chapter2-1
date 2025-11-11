import { createComponent } from "../core/BaseComponent";
import { eventBus, Events } from "../core/EventBus";
import { cartStore } from "../stores/cartStore";
import { formatPrice } from "../utils/formatters";
import { showToast } from "./Toast";

const CartModal = createComponent(({ root, getState, setState, template, onBeforeMount, onUnmount, on, useStore }) => {
  setState({
    isOpen: false,
    selectedItems: new Set(),
  });

  useStore(cartStore);

  template((state) => {
    const { isOpen, selectedItems } = state;
    const items = cartStore.getState().items;

    if (!isOpen) {
      return /*html*/ `
        <div class="fixed inset-0 z-50 overflow-y-auto cart-modal" style="display: none;">
        </div>
      `;
    }

    const totalCount = items.length;
    const selectedCount = selectedItems.size;
    const allSelected = totalCount > 0 && selectedCount === totalCount;

    const selectedItemsArray = items.filter((item) => selectedItems.has(item.id));
    const selectedTotal = selectedItemsArray.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const renderEmptyCart = () => /*html*/ `
      <div class="flex-1 flex items-center justify-center p-8">
        <div class="text-center">
          <div class="text-gray-400 mb-4">
            <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">장바구니가 비어있습니다</h3>
          <p class="text-gray-600">원하는 상품을 담아보세요!</p>
        </div>
      </div>
    `;

    const renderCartItems = () => {
      if (items.length === 0) return renderEmptyCart();

      return /*html*/ `
        <div class="flex flex-col max-h-[calc(90vh-120px)]">
          <!-- 전체 선택 섹션 -->
          <div class="p-4 border-b border-gray-200 bg-gray-50">
            <label class="flex items-center text-sm text-gray-700">
              <input 
                type="checkbox" 
                id="cart-modal-select-all-checkbox" 
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                ${allSelected ? "checked" : ""}
              >
              전체선택 (${totalCount}개)
            </label>
          </div>
          <!-- 아이템 목록 -->
          <div class="flex-1 overflow-y-auto">
            <div class="p-4 space-y-4">
              ${items
                .map(
                  (item) => /*html*/ `
                <div class="flex items-center py-3 border-b border-gray-100 cart-item" data-product-id="${item.id}">
                  <!-- 선택 체크박스 -->
                  <label class="flex items-center mr-3">
                    <input 
                      type="checkbox" 
                      class="cart-item-checkbox w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                      data-product-id="${item.id}"
                      ${selectedItems.has(item.id) ? "checked" : ""}
                    >
                  </label>
                  <!-- 상품 이미지 -->
                  <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                    <img 
                      src="${item.image}" 
                      alt="${item.title}" 
                      class="w-full h-full object-cover cursor-pointer cart-item-image" 
                      data-product-id="${item.id}"
                    >
                  </div>
                  <!-- 상품 정보 -->
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-gray-900 truncate cursor-pointer cart-item-title" data-product-id="${item.id}">
                      ${item.title}
                    </h4>
                    <p class="text-sm text-gray-600 mt-1">
                      ${formatPrice(item.price)}
                    </p>
                    <!-- 수량 조절 -->
                    <div class="flex items-center mt-2">
                      <button 
                        class="quantity-decrease-btn w-7 h-7 flex items-center justify-center border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100" 
                        data-product-id="${item.id}"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                        </svg>
                      </button>
                      <input 
                        type="number" 
                        value="${item.quantity}" 
                        min="1" 
                        class="quantity-input w-12 h-7 text-center text-sm border-t border-b border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                        data-product-id="${item.id}"
                      >
                      <button 
                        class="quantity-increase-btn w-7 h-7 flex items-center justify-center border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100" 
                        data-product-id="${item.id}"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <!-- 가격 및 삭제 -->
                  <div class="text-right ml-3">
                    <p class="text-sm font-medium text-gray-900">
                      ${formatPrice(item.price * item.quantity)}
                    </p>
                    <button 
                      class="cart-item-remove-btn mt-1 text-xs text-red-600 hover:text-red-800" 
                      data-product-id="${item.id}"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
        </div>
        <!-- 하단 액션 -->
        <div class="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          ${
            selectedCount > 0
              ? /*html*/ `
            <div class="flex justify-between items-center mb-3 text-sm">
              <span class="text-gray-600">선택한 상품 (${selectedCount}개)</span>
              <span class="font-medium">${formatPrice(selectedTotal)}</span>
            </div>
          `
              : ""
          }
          <!-- 총 금액 -->
          <div class="flex justify-between items-center mb-4">
            <span class="text-lg font-bold text-gray-900">총 금액</span>
            <span class="text-xl font-bold text-blue-600">${formatPrice(totalPrice)}</span>
          </div>
          <!-- 액션 버튼들 -->
          <div class="space-y-2">
            ${
              selectedCount > 0
                ? /*html*/ `
              <button 
                id="cart-modal-remove-selected-btn" 
                class="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                선택한 상품 삭제 (${selectedCount}개)
              </button>
            `
                : ""
            }
            <div class="flex gap-2">
              <button 
                id="cart-modal-clear-cart-btn" 
                class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors text-sm"
              >
                전체 비우기
              </button>
              <button 
                id="cart-modal-checkout-btn" 
                class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                구매하기
              </button>
            </div>
          </div>
        </div>
      `;
    };

    return /*html*/ `
      <div class="fixed inset-0 z-50 overflow-y-auto cart-modal">
        <!-- 배경 오버레이 -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity cart-modal-overlay"></div>
        <!-- 모달 컨테이너 -->
        <div class="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
          <div class="relative bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden">
            <!-- 헤더 -->
            <div class="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 class="text-lg font-bold text-gray-900 flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
                </svg>
                장바구니
                ${totalCount > 0 ? `<span class="text-sm font-normal text-gray-600 ml-1">(${totalCount})</span>` : ""}
              </h2>
              <button id="cart-modal-close-btn" class="text-gray-400 hover:text-gray-600 p-1">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <!-- 컨텐츠 -->
            ${items.length === 0 ? renderEmptyCart() : renderCartItems()}
          </div>
        </div>
      </div>
    `;
  });

  let unsubscribeOpen = null;
  let unsubscribeClose = null;
  let handleEscape = null;

  onBeforeMount(() => {
    // 초기 선택 상태 동기화
    setState({
      selectedItems: new Set(
        Array.from(cartStore.getState().items.filter((item) => item.selected)).map((item) => item.id),
      ),
    });

    // 모달 열기/닫기 이벤트 구독
    unsubscribeOpen = eventBus.on(Events.CART_MODAL_OPEN, () => {
      setState({ isOpen: true });
      document.body.style.overflow = "hidden";
    });

    unsubscribeClose = eventBus.on(Events.CART_MODAL_CLOSE, () => {
      setState({ isOpen: false });
      document.body.style.overflow = "";
      // 포커스를 body로 이동 (버튼 포커스 방지)
      if (document.activeElement && document.activeElement !== document.body) {
        document.activeElement.blur();
      }
    });

    // ESC 키로 닫기
    handleEscape = (e) => {
      if (e.key === "Escape") {
        const state = getState();
        if (state.isOpen) {
          e.preventDefault();
          eventBus.emit(Events.CART_MODAL_CLOSE);
        }
      }
    };

    document.addEventListener("keydown", handleEscape);

    // 모달 닫기 핸들러
    const handleClose = (e) => {
      const closeBtn = e.target.closest("#cart-modal-close-btn");
      const overlay = e.target.closest(".cart-modal-overlay");
      if (closeBtn || overlay) {
        eventBus.emit(Events.CART_MODAL_CLOSE);
      }
    };

    // 전체 선택 체크박스
    const handleSelectAll = (e) => {
      const checkbox = e.target.closest("#cart-modal-select-all-checkbox");
      if (!checkbox) return;

      const items = cartStore.getState().items;
      if (checkbox.checked) {
        setState({
          selectedItems: new Set(items.map((item) => item.id)),
        });
        cartStore.getState().updateAllItemSelected(true);
      } else {
        setState({ selectedItems: new Set() });
        cartStore.getState().updateAllItemSelected(false);
      }
    };

    // 개별 아이템 체크박스
    const handleItemCheckbox = (e) => {
      const checkbox = e.target.closest(".cart-item-checkbox");
      if (!checkbox) return;

      const productId = checkbox.getAttribute("data-product-id");
      const state = getState();
      const newSelected = new Set(state.selectedItems);

      if (checkbox.checked) {
        newSelected.add(productId);
        cartStore.getState().updateItemSelected(productId, true);
      } else {
        newSelected.delete(productId);
        cartStore.getState().updateItemSelected(productId, false);
      }

      setState({ selectedItems: newSelected });
    };

    // 수량 증가
    const handleQuantityIncrease = (e) => {
      const btn = e.target.closest(".quantity-increase-btn");
      if (!btn) return;

      const productId = btn.getAttribute("data-product-id");
      const items = cartStore.getState().items;
      const item = items.find((i) => i.id === productId);
      if (item) {
        cartStore.getState().updateItemQuantity(productId, item.quantity + 1);
      }
    };

    // 수량 감소
    const handleQuantityDecrease = (e) => {
      const btn = e.target.closest(".quantity-decrease-btn");
      if (!btn) return;

      const productId = btn.getAttribute("data-product-id");
      const items = cartStore.getState().items;
      const item = items.find((i) => i.id === productId);
      if (item && item.quantity > 1) {
        cartStore.getState().updateItemQuantity(productId, item.quantity - 1);
      }
    };

    // 수량 직접 입력
    const handleQuantityInput = (e) => {
      const input = e.target.closest(".quantity-input");
      if (!input) return;

      const productId = input.getAttribute("data-product-id");
      const value = parseInt(input.value) || 1;
      const quantity = Math.max(1, value);

      cartStore.getState().updateItemQuantity(productId, quantity);
    };

    // 아이템 삭제
    const handleRemoveItem = (e) => {
      const btn = e.target.closest(".cart-item-remove-btn");
      if (!btn) return;

      const productId = btn.getAttribute("data-product-id");
      cartStore.getState().removeItem(productId);
      showToast("상품이 삭제되었습니다", "info");
    };

    // 선택한 상품 삭제
    const handleRemoveSelected = (e) => {
      const btn = e.target.closest("#cart-modal-remove-selected-btn");
      if (!btn) return;

      const state = getState();
      cartStore.getState().removeItems(Array.from(state.selectedItems));
      setState({ selectedItems: new Set() });
      showToast("선택된 상품들이 삭제되었습니다", "info");
    };

    // 전체 비우기
    const handleClearCart = (e) => {
      const btn = e.target.closest("#cart-modal-clear-cart-btn");
      if (!btn) return;

      cartStore.getState().clear();
      setState({ selectedItems: new Set() });
      showToast("장바구니가 비워졌습니다", "info");
    };

    // 구매하기
    const handleCheckout = (e) => {
      const btn = e.target.closest("#cart-modal-checkout-btn");
      if (!btn) return;

      if (cartStore.getState().items.length === 0) {
        showToast("장바구니가 비어있습니다", "error");
        return;
      }

      showToast("구매 기능은 추후 구현 예정입니다.", "info");
    };

    // 상품 클릭 (상세 페이지로 이동)
    const handleItemClick = (e) => {
      const image = e.target.closest(".cart-item-image");
      const title = e.target.closest(".cart-item-title");
      if (image || title) {
        const productId = (image || title).getAttribute("data-product-id");
        if (productId) {
          eventBus.emit(Events.CART_MODAL_CLOSE);
          window.location.href = `/product/${productId}`;
        }
      }
    };

    on(root, "click", handleClose);
    on(root, "click", handleSelectAll);
    on(root, "click", handleItemCheckbox);
    on(root, "click", handleQuantityIncrease);
    on(root, "click", handleQuantityDecrease);
    on(root, "input", handleQuantityInput);
    on(root, "click", handleRemoveItem);
    on(root, "click", handleRemoveSelected);
    on(root, "click", handleClearCart);
    on(root, "click", handleCheckout);
    on(root, "click", handleItemClick);
  });

  onUnmount(() => {
    if (unsubscribeOpen) unsubscribeOpen();
    if (unsubscribeClose) unsubscribeClose();
    if (handleEscape) {
      document.removeEventListener("keydown", handleEscape);
    }
    document.body.style.overflow = "";
  });
});

export default CartModal;
