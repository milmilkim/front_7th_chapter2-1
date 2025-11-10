// 토스트 템플릿들
const toastTemplates = {
  success: (message) => /*html*/ `
    <div class="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm">
      <div class="flex-shrink-0">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <p class="text-sm font-medium">${message}</p>
      <button id="toast-close-btn" class="toast-close-btn flex-shrink-0 ml-2 text-white hover:text-gray-200">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `,
  info: (message) => /*html*/ `
    <div class="bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm">
      <div class="flex-shrink-0">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <p class="text-sm font-medium">${message}</p>
      <button id="toast-close-btn" class="toast-close-btn flex-shrink-0 ml-2 text-white hover:text-gray-200">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `,
  error: (message) => /*html*/ `
    <div class="bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm">
      <div class="flex-shrink-0">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </div>
      <p class="text-sm font-medium">${message}</p>
      <button id="toast-close-btn" class="toast-close-btn flex-shrink-0 ml-2 text-white hover:text-gray-200">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `,
};

const Toast = () => {
  return /*html*/ `
    <div id="toast-container" class="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[60]"></div>
  `;
};

export const showToast = (message, type = "success") => {
  const container = document.getElementById("toast-container");
  if (!container) return;

  // 기존 토스트 모두 제거
  container.innerHTML = "";

  const template = toastTemplates[type] || toastTemplates.success;
  const toastHtml = template(message);

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = toastHtml.trim();
  const toastElement = tempDiv.firstChild;

  container.appendChild(toastElement);

  const closeBtn = toastElement.querySelector("#toast-close-btn");
  const handleClose = () => {
    toastElement.remove();
    closeBtn?.removeEventListener("click", handleClose);
  };

  closeBtn?.addEventListener("click", handleClose);

  setTimeout(() => {
    toastElement.remove();
    closeBtn?.removeEventListener("click", handleClose);
  }, 3000);
};

export default Toast;
