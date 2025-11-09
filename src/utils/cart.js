const CART_STORAGE_KEY = "shopping_cart";

export const getCart = () => {
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    if (!cartData) {
      return { items: [] };
    }
    return JSON.parse(cartData);
  } catch (error) {
    console.error("장바구니 데이터 읽기 실패:", error);
    return { items: [] };
  }
};

export const saveCart = (cart) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    return true;
  } catch (error) {
    console.error("장바구니 데이터 저장 실패:", error);
    return false;
  }
};

export const addToCart = (productId, quantity = 1, product = null) => {
  const cart = getCart();

  const existingItemIndex = cart.items.findIndex((item) => item.id === productId);

  if (existingItemIndex !== -1) {
    // 이미 있으면 수량 증가
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    // 없으면 새로 추가 (상품 정보가 있어야 함)
    if (!product) {
      return false;
    }
    cart.items.push({
      id: String(product.productId || productId),
      title: product.title,
      image: product.image,
      price: Number(product.lprice || product.price || 0),
      quantity: quantity,
      selected: false,
    });
  }

  const success = saveCart(cart);

  if (success) {
    window.dispatchEvent(new CustomEvent("cart:updated"));
  }

  return success;
};

export const removeFromCart = (productId) => {
  const cart = getCart();
  cart.items = cart.items.filter((item) => item.productId !== productId);
  return saveCart(cart);
};

export const clearCart = () => {
  return saveCart({ items: [] });
};

export const getCartItemCount = () => {
  const cart = getCart();
  return cart.items.length;
};
