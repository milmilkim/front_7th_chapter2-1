const ProductCard = (product) => {
  return /*html*/ `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden product-card" data-product-id="${product.productId}">
      <div class="aspect-square bg-gray-100 overflow-hidden cursor-pointer product-image">
        <img src="${product.image}" alt="${product.title}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-200" loading="lazy">
      </div>
      <div class="p-3">
        <div class="cursor-pointer product-info mb-3">
          <h3 class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">${product.title}</h3>
          <p class="text-xs text-gray-500 mb-2">${product.mallName}</p>
          <p class="text-lg font-bold text-gray-900">${Number(product.lprice).toLocaleString()}원</p>
        </div>
        <button class="w-full bg-blue-600 text-white text-sm py-2 px-3 rounded-md hover:bg-blue-700 transition-colors add-to-cart-btn" data-product-id="${product.productId}">
          장바구니 담기
        </button>
      </div>
    </div>
  `;
};

export default ProductCard;
