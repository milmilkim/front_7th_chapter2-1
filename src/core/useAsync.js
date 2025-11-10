/**
 * useAsync - 비동기 데이터 fetch 헬퍼
 *
 * 로딩, 에러, 데이터 상태를 자동으로 관리합니다.
 *
 * @param {Function} asyncFn - 비동기 함수
 * @param {Object} options - 옵션 (onSuccess, onError)
 * @returns {Function} execute - 실행 함수
 */
export function useAsync(setState, asyncFn, options = {}) {
  const { onSuccess, onError } = options;

  const execute = async (...args) => {
    setState({ isLoading: true, error: null });

    try {
      const data = await asyncFn(...args);
      setState({ data, isLoading: false, error: null });

      if (onSuccess) {
        onSuccess(data);
      }

      return data;
    } catch (error) {
      console.error("useAsync error:", error);
      setState({ error, isLoading: false, data: null });

      if (onError) {
        onError(error);
      }

      return null;
    }
  };

  return execute;
}
