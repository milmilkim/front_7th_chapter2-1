import SearchFilter from "../components/SearchFilter";
import ProductList from "../components/ProductList";
import { useRouter, useQueryParams, useQueryChange } from "../router/index.js";
import { createComponent } from "../core/BaseComponent";
import { getProducts, getCategories } from "../api/productApi";
import { cartStore } from "../stores/cartStore";
import ErrorView from "../components/ErrorView";
import { showToast } from "../components/Toast";
const HomePage = createComponent(({ root, getState, setState, template, onBeforeMount, onUpdated, onUnmount, on }) => {
  const router = useRouter();
  const queryParams = useQueryParams();

  setState({
    data: null,
    searchValue: queryParams.search || "",
    filter: {
      page: 1,
      limit: parseInt(queryParams.limit) || 20,
      sort: queryParams.sort || "price_asc",
      category1: queryParams.category1 || "",
      category2: queryParams.category2 || "",
      search: queryParams.search || "",
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
    // 컴포넌트 로컬 상태
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

  // 무한 스크롤 옵저버
  let observer = null;

  // 쿼리스트링 변경 감지 구독
  const unsubscribeQueryChange = useQueryChange((queryParams) => {
    setState({
      searchValue: queryParams.search || "",
      filter: {
        page: parseInt(queryParams.current) || 1,
        limit: parseInt(queryParams.limit) || 20,
        sort: queryParams.sort || "price_asc",
        category1: queryParams.category1 || "",
        category2: queryParams.category2 || "",
        search: queryParams.search || "",
      },
    });
    fetchProducts();
  });

  // 최초 1번만 - DOM 이벤트 위임
  onBeforeMount(() => {
    // current 파라미터 삭제 (항상 1부터 시작)
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.has("current")) {
      queryParams.delete("current");
      window.history.replaceState({}, "", queryParams.toString() ? `/?${queryParams.toString()}` : "/");
    }

    // 무한 스크롤 옵저버 생성
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          console.log("무한 스크롤 옵저버 트리거");
          const { isLoading, data, filter } = getState();
          const pagination = data?.pagination || {};

          // 로딩 중이거나 더 이상 데이터가 없으면 요청하지 않음
          if (isLoading) return;
          if (!pagination.hasNext) return;

          // 다음 페이지로 쿼리스트링 업데이트 (데이터 페칭은 안함)
          const nextPage = filter.page + 1;
          const queryParams = new URLSearchParams(window.location.search);
          queryParams.set("current", nextPage.toString());
          router.replace(`/?${queryParams.toString()}`);
        }
      });
    });

    // 최초 데이터 로드
    fetchProducts();
    fetchCategories();
  });

  onUnmount(() => {
    if (unsubscribeQueryChange) unsubscribeQueryChange();
    if (observer) observer.disconnect();
  });

  const onCardClick = (e) => {
    console.log("onCardClick");
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

    e.stopPropagation();

    const id = btn.getAttribute("data-product-id");
    if (!id) return;

    const { data } = getState();
    const products = data?.products || [];
    const product = products.find((p) => p.productId === id);

    if (product) {
      cartStore.getState().addItem(id, 1, product);
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
    const queryParams = new URLSearchParams(window.location.search);
    if (searchValue) {
      queryParams.set("search", searchValue);
    } else {
      queryParams.delete("search");
    }
    queryParams.delete("current");
    router.push(`/?${queryParams.toString()}`);
  };

  const onRetry = (e) => {
    const btn = e.target.closest("#retry-btn");
    if (!btn) return;
    fetchProducts();
  };

  const onLoadMore = (e) => {
    const btn = e.target.closest("#load-more-btn");
    if (!btn) return;
    const { filter } = getState();
    const nextPage = filter.page + 1;

    // 쿼리스트링 업데이트 → useQueryChange 트리거 → 페칭
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set("current", nextPage.toString());
    router.replace(`/?${queryParams.toString()}`);
  };

  // 카테고리 클릭 핸들러
  const onCategoryClick = (e) => {
    const resetBtn = e.target.closest("[data-breadcrumb='reset']");
    if (resetBtn) {
      router.push(`/`);
      return;
    }

    // 카테고리1 클릭 (버튼 또는 브레드크럼)
    const category1Btn = e.target.closest(".category1-filter-btn");
    const category1Breadcrumb = e.target.closest("[data-breadcrumb='category1']");
    if (category1Btn || category1Breadcrumb) {
      const category1 = (category1Btn || category1Breadcrumb).getAttribute("data-category1");
      const queryParams = new URLSearchParams(window.location.search);
      queryParams.set("category1", category1);
      queryParams.delete("category2"); // category1 선택 시 category2 초기화
      queryParams.set("current", "1");
      router.push(`/?${queryParams.toString()}`);
      return;
    }

    // 카테고리2 클릭
    const category2Btn = e.target.closest(".category2-filter-btn");
    if (category2Btn) {
      const category2 = category2Btn.getAttribute("data-category2");
      const queryParams = new URLSearchParams(window.location.search);
      queryParams.set("category2", category2);
      queryParams.set("current", "1");
      router.push(`/?${queryParams.toString()}`);
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
      const queryParams = new URLSearchParams(window.location.search);
      queryParams.set("limit", limitSelect.value);
      queryParams.set("current", "1");
      router.push(`/?${queryParams.toString()}`);
      return;
    }

    const sortSelect = e.target.closest("#sort-select");
    if (sortSelect) {
      const queryParams = new URLSearchParams(window.location.search);
      queryParams.set("sort", sortSelect.value);
      queryParams.set("current", "1");
      router.push(`/?${queryParams.toString()}`);
      return;
    }
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
