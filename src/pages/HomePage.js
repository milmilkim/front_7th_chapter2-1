import SearchFilter from "../components/SearchFilter";
import LoadingSpinner from "../components/LoadingSpinner";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ProductCard from "../components/ProductCard";
import { Router } from "../router";
import { createComponent } from "../core/BaseComponent";
import { getProducts } from "../api/productApi";
import { cartStore } from "../stores/cartStore";
import { showToast } from "../components/Toast";

const HomePage = ({ root }) => {
  const router = Router();

  return createComponent(root, ({ setState, template, onMount }) => {
    setState({
      isLoading: true,
      searchValue: "",
      products: [],
      pagination: {},
    });

    template((state) => {
      const { isLoading, searchValue = "", products = [], pagination = {} } = state;

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

    // 최초 1번만 - DOM 이벤트 위임
    onMount(({ root, getState, on }) => {
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
        const product = state.products?.find((p) => p.productId === id);

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

      on(root, "click", onCardClick);
      on(root, "click", onAddToCart);
      on(root, "input", onSearch);
    });

    (async () => {
      try {
        const data = await getProducts();
        setState({
          products: data.products || [],
          pagination: data.pagination || {},
          isLoading: false,
        });
      } catch (err) {
        console.error("상품 목록 로드 실패:", err);
        setState({ products: [], pagination: { total: 0 }, isLoading: false });
      }
    })();
  });
};

export default HomePage;
