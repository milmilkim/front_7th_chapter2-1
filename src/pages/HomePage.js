import SearchFilter from "../components/SearchFilter";
import LoadingSpinner from "../components/LoadingSpinner";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ProductCard from "../components/ProductCard";
import { Router } from "../router";
import { createComponent } from "../core/BaseComponent";
import { useAsync } from "../core/useAsync";
import { getProducts } from "../api/productApi";
import { cartStore } from "../stores/cartStore";
import { showToast } from "../components/Toast";
import ErrorView from "../components/ErrorView";

const HomePage = createComponent(({ root, getState, setState, template, onMount, on }) => {
  const router = Router();

  setState({
    data: null,
    isLoading: true,
    error: null,
    searchValue: "",
  });

  template((state) => {
    const { isLoading, error, data, searchValue = "" } = state;

    if (error) {
      return `
        ${SearchFilter({ isLoading: false, searchValue })}
        ${ErrorView({ message: error.message })}
      `;
    }

    const products = data?.products || [];
    const pagination = data?.pagination || {};

    return `
      ${SearchFilter({ isLoading, searchValue })}
      <div class="mb-6">
        <div>
          ${
            pagination.total
              ? `<div class="mb-4 text-sm text-gray-600">총 <span class="font-medium text-gray-900">${pagination.total}</span>개의 상품</div>`
              : ""
          }
          <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
            ${isLoading ? LoadingSkeleton().repeat(4) : products.map((p) => ProductCard(p)).join("")}
          </div>
          ${isLoading ? LoadingSpinner() : ""}
        </div>
      </div>
    `;
  });

  // 최초 1번만 - DOM 이벤트 위임 + 데이터 fetch
  onMount(() => {
    // 상품 목록 로드 (useAsync 사용)
    const fetchProducts = useAsync(setState, getProducts, {
      onError: (error) => {
        console.error("상품 목록 로드 실패:", error);
      },
    });

    fetchProducts();

    // DOM 이벤트 위임
    const onCardClick = (e) => {
      const btn = e.target.closest(".add-to-cart-btn");
      if (btn) return;
      const card = e.target.closest(".product-card");
      if (!card) return;
      const id = card.getAttribute("data-product-id");
      if (id) router.push(`/product/${id}`);
    };

    const onAddToCart = (e) => {
      const btn = e.target.closest(".add-to-cart-btn");
      if (!btn) return;
      const id = btn.getAttribute("data-product-id");
      if (!id) return;

      const state = getState();
      const products = state.data?.products || [];
      const product = products.find((p) => p.productId === id);

      if (product) {
        cartStore.addItem(id, 1, product);
        showToast("장바구니에 추가되었습니다", "success");
      } else {
        console.error("상품을 찾을 수 없습니다:", id);
        showToast("상품 정보를 찾을 수 없습니다", "error");
      }
    };

    const onSearch = (e) => {
      const input = e.target.closest("#search-input");
      if (!input) return;
      setState({ searchValue: input.value });
    };

    const onRetry = (e) => {
      const btn = e.target.closest("#retry-btn");
      if (!btn) return;
      fetchProducts();
    };

    on(root, "click", onCardClick);
    on(root, "click", onAddToCart);
    on(root, "click", onRetry);
    on(root, "input", onSearch);
  });
});

export default HomePage;
