import { createComponent } from "../core/BaseComponent";
import { Router, useParams } from "../router";
import ProductInfo from "../components/ProductInfo";
import RelatedProducts from "../components/RelatedProducts";
import { getProduct, getProducts } from "../api/productApi";
import { cartStore } from "../stores/cartStore";
import { showToast } from "../components/Toast";

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

const DetailPage = createComponent(({ root, getState, setState, template, onMount, on }) => {
  const router = Router();
  const params = useParams();
  const productId = params?.productId;

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

  onMount(() => {
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

      if (state.product) {
        cartStore.addItem(productId, state.quantity, state.product);
        showToast("장바구니에 추가되었습니다", "success");
      } else {
        console.error("상품 정보를 찾을 수 없습니다");
        showToast("상품 정보를 찾을 수 없습니다", "error");
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
        const relatedData = await getProducts({
          category1: product.category1,
          category2: product.category2,
          limit: 20,
        });
        relatedProducts = (relatedData?.products || []).filter((p) => p.productId !== productId);
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

export default DetailPage;
