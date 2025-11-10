/**
 * CartStore - 장바구니 상태 관리 (옵저버 패턴)
 *
 * 장바구니 상태를 중앙에서 관리하고, 변경 시 구독자들에게 자동으로 알립니다.
 */
class CartStore {
  constructor() {
    this.listeners = new Set();
    this.state = this.loadFromStorage();
  }

  /**
   * 장바구니 상태 구독
   * @param {Function} callback - 상태 변경 시 호출될 함수
   * @returns {Function} unsubscribe 함수
   */
  subscribe(callback) {
    this.listeners.add(callback);
    // 구독 즉시 현재 상태 전달
    callback(this.state);
    // cleanup 함수 반환
    return () => this.listeners.delete(callback);
  }

  /**
   * 현재 상태 가져오기
   */
  getState() {
    return { ...this.state };
  }

  /**
   * 장바구니 아이템 개수
   */
  getItemCount() {
    return this.state.items.length;
  }

  /**
   * 장바구니에 상품 추가
   */
  addItem(productId, quantity = 1, product = null) {
    if (!product) {
      console.error("상품 정보가 필요합니다");
      return false;
    }

    const existingItemIndex = this.state.items.findIndex((item) => item.id === productId);

    if (existingItemIndex !== -1) {
      // 이미 있으면 수량 증가
      this.state.items[existingItemIndex].quantity += quantity;
    } else {
      // 없으면 새로 추가
      this.state.items.push({
        id: String(product.productId || productId),
        title: product.title,
        image: product.image,
        price: Number(product.lprice || product.price || 0),
        quantity: quantity,
        selected: false,
      });
    }

    this.saveToStorage();
    this.notify();
    return true;
  }

  /**
   * 장바구니에서 상품 제거
   */
  removeItem(productId) {
    this.state.items = this.state.items.filter((item) => item.id !== productId);
    this.saveToStorage();
    this.notify();
    return true;
  }

  /**
   * 장바구니 비우기
   */
  clear() {
    this.state.items = [];
    this.saveToStorage();
    this.notify();
    return true;
  }

  /**
   * localStorage에서 불러오기
   */
  loadFromStorage() {
    try {
      const cartData = localStorage.getItem("shopping_cart");
      if (!cartData) {
        return { items: [] };
      }
      return JSON.parse(cartData);
    } catch (error) {
      console.error("장바구니 데이터 읽기 실패:", error);
      return { items: [] };
    }
  }

  /**
   * localStorage에 저장
   */
  saveToStorage() {
    try {
      localStorage.setItem("shopping_cart", JSON.stringify(this.state));
      return true;
    } catch (error) {
      console.error("장바구니 데이터 저장 실패:", error);
      return false;
    }
  }

  /**
   * 구독자들에게 상태 변경 알림
   */
  notify() {
    this.listeners.forEach((callback) => {
      try {
        callback(this.state);
      } catch (error) {
        console.error("CartStore listener error:", error);
      }
    });
  }
}

// 싱글턴 인스턴스
export const cartStore = new CartStore();
