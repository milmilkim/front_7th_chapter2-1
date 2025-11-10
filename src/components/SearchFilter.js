const LIMIT_OPTIONS = [
  { value: 10, label: "10개" },
  { value: 20, label: "20개" },
  { value: 50, label: "50개" },
  { value: 100, label: "100개" },
];

const SORT_OPTIONS = [
  { value: "price_asc", label: "가격 낮은순" },
  { value: "price_desc", label: "가격 높은순" },
  { value: "name_asc", label: "이름순" },
  { value: "name_desc", label: "이름 역순" },
];

const getCategoryTree = (categories) => {
  if (!categories || typeof categories !== "object") {
    return [];
  }

  // 배열로 온 경우
  if (Array.isArray(categories)) {
    return categories.map((category) => {
      return {
        name: category.name,
        children: category.children.map((child) => {
          return { name: child.name };
        }),
      };
    });
  }

  // 객체로 온 경우
  return Object.entries(categories).map(([category1Name, category2Obj]) => {
    return {
      name: category1Name,
      children: Object.keys(category2Obj).map((category2Name) => {
        return { name: category2Name };
      }),
    };
  });
};

const createCategory1Button = (categoryName) => /*html*/ `
  <button 
    data-category1="${categoryName}" 
    class="category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
    ${categoryName}
  </button>
`;

const createCategory2Button = (categoryName, isSelected = false) => /*html*/ `
  <button 
    data-category2="${categoryName}" 
    class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors ${isSelected ? "bg-blue-100 border-blue-300 text-blue-800" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}">
    ${categoryName}
  </button>
`;

const createOption = (option, selectedValue) => /*html*/ `
  <option value="${option.value}" ${option.value == selectedValue ? "selected" : ""}>
    ${option.label}
  </option>
`;

const SearchFilter = ({
  isCategoryLoading,
  category1 = "",
  category2 = "",
  searchValue = "",
  categories = [],
  limit = 10,
  sort = "price_asc",
}) => {
  const categoryTree = getCategoryTree(categories);
  const selectedCategory1 = categoryTree.find((cat) => cat.name === category1);
  return /*html*/ `
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <!-- 검색창 -->
            <div class="mb-4">
              <div class="relative">
                <input type="text" id="search-input" placeholder="상품명을 검색해보세요..." value="${searchValue}" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                            focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
            <!-- 필터 옵션 -->
            <div class="space-y-3">
              <!-- 카테고리 필터 -->
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <label class="text-sm text-gray-600">카테고리:</label>
                  <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>
                  ${
                    category1
                      ? `<span class="text-xs text-gray-500">&gt;</span>
                        <button data-breadcrumb="category1" data-category1="${category1}" class="text-xs hover:text-blue-800 hover:underline">${category1}</button>`
                      : ""
                  }
                  ${
                    category2
                      ? `<span class="text-xs text-gray-500">&gt;</span>
                        <span class="text-xs text-gray-600 cursor-default">${category2}</span>`
                      : ""
                  }
                </div>

                ${
                  isCategoryLoading
                    ? `<div class="text-sm text-gray-500 italic">카테고리 로딩 중...</div>`
                    : selectedCategory1
                      ? `
                        <div class="flex flex-wrap gap-2">
                          ${selectedCategory1.children.map((child) => createCategory2Button(child.name, child.name === category2)).join("")}
                        </div>
                      `
                      : `
                        <div class="flex flex-wrap gap-2">
                          ${categoryTree.map((category) => createCategory1Button(category.name)).join("")}
                        </div>
                      `
                }
               
              </div>
              <!-- 기존 필터들 -->
              <div class="flex gap-2 items-center justify-between">
                <!-- 페이지당 상품 수 -->
                <div class="flex items-center gap-2">
                  <label class="text-sm text-gray-600">개수:</label>
                  <select id="limit-select"
                          class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                    ${LIMIT_OPTIONS.map((option) => createOption(option, limit)).join("")}
                  </select>
                </div>
                <!-- 정렬 -->
                <div class="flex items-center gap-2">
                  <label class="text-sm text-gray-600">정렬:</label>
                  <select id="sort-select" class="text-sm border border-gray-300 rounded px-2 py-1
                               focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                    ${SORT_OPTIONS.map((option) => createOption(option, sort)).join("")}
                  </select>
                </div>
              </div>
            </div>
          </div>`;
};

export default SearchFilter;
