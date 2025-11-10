import { createComponent } from "../core/BasePage";
import { Router } from "../router";
import ProductInfo from "../components/ProductInfo";
import RelatedProducts from "../components/RelatedProducts";
import { getProduct, getProducts } from "../api/productApi";

const pageLoading = () => {
  return /*html*/ `
    <div class="py-20 bg-gray-50 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">상품 정보를 불러오는 중...</p>
      </div>
    </div>
  `;
};

const DetailPage = ({ root, params }) => {
  const productId = params?.productId;
  const router = Router();

  return createComponent(root, ({ setState, template, onMount, getState }) => {
    setState({
      isLoading: true,
      product: {},
      quantity: 1,
      relatedProducts: [],
    });

    template((state) => {
      const { isLoading, product = {}, quantity = 1, relatedProducts = [] } = state;
      if (isLoading) return pageLoading();
      return `
        ${ProductInfo(product, quantity)}
        ${RelatedProducts({ products: relatedProducts, currentProductId: product.productId })}
      `;
    });

    onMount(({ root, on }) => {
      const onQuantityIncrease = (e) => {
        const btn = e.target.closest("#quantity-increase");
        if (!btn) return;
        const state = getState();
        const max = parseInt(state.product?.stock ?? 1);
        const currentQuantity = state.quantity || 1;
        if (currentQuantity < max) {
          setState({ quantity: currentQuantity + 1 });
        }
      };

      const onQuantityDecrease = (e) => {
        const btn = e.target.closest("#quantity-decrease");
        if (!btn) return;
        const state = getState();
        const currentQuantity = state.quantity || 1;
        if (currentQuantity > 1) {
          setState({ quantity: currentQuantity - 1 });
        }
      };

      const onQuantityInput = (e) => {
        const input = e.target.closest("#quantity-input");
        if (!input) return;
        const value = parseInt(e.target.value) || 1;
        const state = getState();
        const max = parseInt(state.product?.stock ?? 1);
        setState({ quantity: Math.max(1, Math.min(value, max)) });
      };

      const onQuantityChange = (e) => {
        const input = e.target.closest("#quantity-input");
        if (!input) return;
        const value = parseInt(e.target.value) || 1;
        const state = getState();
        const max = parseInt(state.product?.stock ?? 1);
        setState({ quantity: Math.max(1, Math.min(value, max)) });
      };

      const onAddToCart = (e) => {
        const btn = e.target.closest("#add-to-cart-btn");
        if (!btn) return;
        const state = getState();
        const productId = btn.getAttribute("data-product-id");

        console.log("productId", productId);

        // 상품 정보가 이미 state에 있음
        if (state.product) {
          window.dispatchEvent(
            new CustomEvent("cart:add", {
              detail: { id: productId, quantity: state.quantity, product: state.product },
            }),
          );
        } else {
          console.error("상품 정보가 없습니다");
        }
      };

      const onRelatedProductClick = (e) => {
        const card = e.target.closest(".related-product-card");
        if (!card) return;
        const id = card.getAttribute("data-product-id");
        if (id) router.push(`/product/${id}`);
      };

      const onGoToList = (e) => {
        const btn = e.target.closest(".go-to-product-list");
        if (!btn) return;
        router.push("/");
      };

      on(root, "click", onQuantityIncrease);
      on(root, "click", onQuantityDecrease);
      on(root, "input", onQuantityInput);
      on(root, "change", onQuantityChange);
      on(root, "click", onAddToCart);
      on(root, "click", onRelatedProductClick);
      on(root, "click", onGoToList);
    });

    (async () => {
      try {
        const product = await getProduct(productId);

        let relatedProducts = [];
        if (product?.category2) {
          try {
            const relatedData = await getProducts({
              category2: product.category2,
              limit: 2,
            });
            relatedProducts = relatedData?.products || [];
          } catch (err) {
            console.error("관련 상품 로드 실패:", err);
          }
        }

        setState({
          product: product || {},
          relatedProducts,
          isLoading: false,
        });
      } catch (err) {
        console.error("상품 로드 실패:", err);
        setState({ product: {}, relatedProducts: [], isLoading: false });
      }
    })();
  });
};

export default DetailPage;
