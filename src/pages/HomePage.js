import SearchFilter from "../components/SearchFilter";
import LoadingSpinner from "../components/LoadingSpinner";
import { Router } from "../router";

const LoadingSkeleton = () => {
  return /*html*/ `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div class="aspect-square bg-gray-200"></div>
      <div class="p-3">
        <div class="h-4 bg-gray-200 rounded mb-2"></div>
        <div class="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
        <div class="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div class="h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  `;
};

const ProductCard = (product) => {
  return /*html*/ `
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden product-card"
        data-product-id="${product.productId}">
          <!-- 상품 이미지 -->
        <div class="aspect-square bg-gray-100 overflow-hidden cursor-pointer product-image">
          <img src="${product.image}"
                alt="${product.title}"
                class="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                loading="lazy">
        </div>
        <!-- 상품 정보 -->
        <div class="p-3">
          <div class="cursor-pointer product-info mb-3">
            <h3 class="text-sm font-medium text-#2b2929-900 line-clamp-2 mb-1">
              ${product.title}
            </h3>
            <p class="text-xs text-gray-500 mb-2">${product.mallName}</p>
            <p class="text-lg font-bold text-gray-900">
              ${Number(product.lprice).toLocaleString()}원
            </p>
          </div>
          <!-- 장바구니 버튼 -->
          <button class="w-full bg-blue-600 text-white text-sm py-2 px-3 rounded-md
                  hover:bg-blue-700 transition-colors add-to-cart-btn" data-product-id="${product.productId}">
            장바구니 담기
          </button>
        </div>
      </div>
  `;
};

const createFragment = (html) => {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content;
};

const HomePage = async ({ root }) => {
  let isLoading = true;
  let searchValue = "";
  let products = [];
  let pagination = {};

  const router = Router();

  const handleProductCardClick = (e) => {
    const productCard = e.target.closest(".product-card");
    const addToCartBtn = e.target.closest(".add-to-cart-btn");

    // 장바구니 버튼 클릭은 제외
    if (addToCartBtn) {
      return;
    }

    if (productCard) {
      e.preventDefault();
      const productId = productCard.getAttribute("data-product-id");
      router.push(`/detail?productId=${productId}`);
    }
  };

  root.addEventListener("click", handleProductCardClick);

  const getTemplate = () => /*html*/ `
    ${SearchFilter({ isLoading, searchValue })}
    <div class="mb-6">
      <div>
        ${
          pagination.total
            ? `<div class="mb-4 text-sm text-gray-600">
              총 <span class="font-medium text-gray-900">${pagination.total}</span>개의 상품
            </div>`
            : ""
        }
        
        <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
          ${isLoading ? LoadingSkeleton().repeat(4) : products.map(ProductCard).join("")}
        </div>
        ${isLoading ? LoadingSpinner() : ""}
      </div>
    </div>
  `;

  const render = () => {
    const fragment = createFragment(getTemplate());
    root.replaceChildren(fragment);

    const input = document.getElementById("search-input");
    if (input) {
      input.value = searchValue;
      input.addEventListener("input", (e) => {
        searchValue = e.target.value;
        console.log(searchValue);
      });
    }
  };

  render();

  const response = await fetch("/api/products");
  const data = await response.json();
  products = data.products;
  pagination = data.pagination;
  isLoading = false;

  render();

  return { render };
};

export default HomePage;
