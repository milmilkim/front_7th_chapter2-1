import ProductCard from "./ProductCard";
import LoadingSkeleton from "./LoadingSkeleton";
import LoadingSpinner from "./LoadingSpinner";

/**
 * 상품 목록 컴포넌트
 */
const ProductList = ({ products = [], pagination = {}, isLoading = false, hasNext = true }) => {
  return `
    <div class="mb-6">
      <div>
        ${
          pagination.total
            ? `<div class="mb-4 text-sm text-gray-600">총 <span class="font-medium text-gray-900">${pagination.total}</span>개의 상품</div>`
            : ""
        }
        <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
          ${products?.map((p) => ProductCard(p)).join("")}
          ${isLoading ? LoadingSkeleton().repeat(4) : ""}
        </div>
        ${
          hasNext
            ? `<div id="sentinel" class="h-4"></div>`
            : ` <div class="text-center py-4 text-sm text-gray-500">
                모든 상품을 확인했습니다
              </div>`
        }
        ${isLoading ? `<div class="text-center py-4">${LoadingSpinner()}</div>` : ""}
      </div>
    </div>
  `;
};

export default ProductList;
