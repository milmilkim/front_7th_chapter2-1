import SearchFilter from "../components/SearchFilter";
import ProductList from "../components/ProductList";
import { Router } from "../router";
import { createComponent } from "../core/BaseComponent";
import { getProducts, getCategories } from "../api/productApi";
import { cartStore } from "../stores/cartStore";
import ErrorView from "../components/ErrorView";
import { showToast } from "../components/Toast";

const HomePage = createComponent(({ root, getState, setState, template, onMount, onUpdated, on }) => {
  const router = Router();

  setState({
    data: null,
    searchValue: "",
    filter: {
      page: 1,
      limit: 20,
      sort: "price_asc",
      category1: "",
      category2: "",
    },
    categories: [],
    isCategoryLoading: false,
    isLoading: false,
    error: null,
  });

  const fetchProducts = async () => {
    const { filter, data: prevData } = getState();
    setState({ isLoading: true, error: null });

    try {
      const newData = await getProducts(filter);
      console.log(filter);

      if (filter.page === 1) {
        setState({ data: newData, isLoading: false });
      } else {
        setState({
          data: {
            ...newData,
            products: [...(prevData?.products || []), ...(newData.products || [])],
          },
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("상품 목록 로드 실패:", error);
      setState({ error, isLoading: false });
    }
  };

  const fetchCategories = async () => {
    setState({ isCategoryLoading: true });
    const categories = await getCategories();
    setState({ categories, isCategoryLoading: false });
  };

  template((state) => {
    const { searchValue = "", data, isLoading, error, filter, categories, isCategoryLoading } = state;

    if (error) {
      return `
        ${SearchFilter({
          isLoading: false,
          isCategoryLoading,
          searchValue,
          categories,
          category1: filter.category1 || "",
          category2: filter.category2 || "",
          limit: filter.limit || 10,
          sort: filter.sort || "price_asc",
        })}
        ${ErrorView({ message: error.message })}
      `;
    }

    const products = data?.products || [];
    const pagination = data?.pagination || {};

    return `
      ${SearchFilter({
        isLoading,
        isCategoryLoading,
        searchValue,
        categories,
        category1: filter.category1 || "",
        category2: filter.category2 || "",
        limit: filter.limit || 10,
        sort: filter.sort || "price_asc",
      })}
      ${ProductList({ products, pagination, isLoading, hasNext: pagination.hasNext })}
    `;
  });

  // 무한 스크롤 옵저버 (컴포넌트 레벨에서 한 번만 생성)
  let observer = null;

  // 최초 1번만 - DOM 이벤트 위임
  onMount(() => {
    // 무한 스크롤 옵저버 생성
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          console.log("무한 스크롤 옵저버 트리거");
          const { isLoading, data } = getState();
          const pagination = data?.pagination || {};

          // 로딩 중이거나 더 이상 데이터가 없으면 요청하지 않음
          if (isLoading) return;
          if (!pagination.hasNext) return;

          // 다음 페이지 로드
          const { filter } = getState();
          setState({ filter: { ...filter, page: filter.page + 1 } });
          fetchProducts();
        }
      });
    });

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

      const { data } = getState();
      const products = data?.products || [];
      const product = products.find((p) => p.productId === id);

      if (product) {
        cartStore.addItem(id, 1, product);
        showToast("장바구니에 추가되었습니다", "success");
      } else {
        console.error("상품을 찾을 수 없습니다:", id);
        showToast("상품 정보를 찾을 수 없습니다", "error");
      }
    };

    // 엔터키로 즉시 검색
    const onSearchKeydown = (e) => {
      const input = e.target.closest("#search-input");
      if (!input) return;
      if (e.key !== "Enter") return;

      const searchValue = input.value.trim();
      setState({
        searchValue,
        filter: { ...getState().filter, search: searchValue, page: 1 },
      });
      fetchProducts();
    };

    const onRetry = (e) => {
      const btn = e.target.closest("#retry-btn");
      if (!btn) return;
      fetchProducts();
    };

    const onLoadMore = (e) => {
      const btn = e.target.closest("#load-more-btn");
      if (!btn) return;
      setState({ filter: { ...getState().filter, page: getState().filter.page + 1 } });
      fetchProducts();
    };

    // 카테고리 클릭 핸들러
    const onCategoryClick = (e) => {
      const resetBtn = e.target.closest("[data-breadcrumb='reset']");
      if (resetBtn) {
        const currentFilter = getState().filter;
        setState({
          filter: { ...currentFilter, category1: "", category2: "", page: 1 },
          data: null,
        });
        fetchProducts();
        return;
      }

      // 카테고리1 클릭 (버튼 또는 브레드크럼)
      const category1Btn = e.target.closest(".category1-filter-btn");
      const category1Breadcrumb = e.target.closest("[data-breadcrumb='category1']");
      if (category1Btn || category1Breadcrumb) {
        const category1 = (category1Btn || category1Breadcrumb).getAttribute("data-category1");
        const currentFilter = getState().filter;

        // 카테고리1 선택 (카테고리2 항상 초기화)
        setState({
          filter: { ...currentFilter, category1, category2: "", page: 1 },
          data: null,
        });
        fetchProducts();
        return;
      }

      // 카테고리2 클릭
      const category2Btn = e.target.closest(".category2-filter-btn");
      if (category2Btn) {
        const category2 = category2Btn.getAttribute("data-category2");
        const currentFilter = getState().filter;

        setState({
          filter: { ...currentFilter, category2, page: 1 },
          data: null,
        });
        fetchProducts();
        return;
      }
    };

    on(root, "click", onCardClick);
    on(root, "click", onAddToCart);
    on(root, "click", onRetry);
    on(root, "click", onLoadMore);
    on(root, "click", onCategoryClick);
    on(root, "keydown", onSearchKeydown);
    on(root, "change", (e) => {
      const limitSelect = e.target.closest("#limit-select");
      if (limitSelect) {
        setState({ filter: { ...getState().filter, limit: parseInt(limitSelect.value), page: 1 } });
        fetchProducts();
        return;
      }

      const sortSelect = e.target.closest("#sort-select");
      if (sortSelect) {
        setState({ filter: { ...getState().filter, sort: sortSelect.value, page: 1 } });
        fetchProducts();
        return;
      }
    });

    // 최초 데이터 로드
    fetchProducts();
    fetchCategories();
  });

  // 매 렌더링마다 - sentinel 다시 관찰
  onUpdated(() => {
    if (!observer) return;

    const sentinel = document.querySelector("#sentinel");
    if (sentinel) {
      observer.observe(sentinel);
    }
  });
});

export default HomePage;
