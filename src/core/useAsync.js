/**
 * useAsync - 비동기 데이터 fetch 헬퍼
 *
 * 로딩, 에러, 데이터 상태를 별도 공간에서 관리합니다.
 * 간단한 경우: getState().data 사용
 * 복잡한 경우 (무한스크롤 등): onSuccess 콜백에서 직접 처리
 *
 * @param {Function} asyncFn - 비동기 함수
 * @param {Object} options - 옵션
 * @param {Function} options.onSuccess - 성공 콜백 (data) => void
 * @param {Function} options.onError - 에러 콜백 (error) => void
 * @returns {Object} { data, isLoading, error, execute, reset, getState, subscribe }
 */
export function useAsync(asyncFn, options = {}) {
  const { onSuccess, onError } = options;

  // data, 로딩, 에러 상태 모두 관리
  let state = {
    data: null,
    isLoading: false,
    error: null,
  };

  const listeners = [];

  const setState = (newState) => {
    state = { ...state, ...newState };
    listeners.forEach((listener) => listener(state));
  };

  const subscribe = (listener) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  };

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
      setState({ error, isLoading: false });

      if (onError) {
        onError(error);
      }

      return null;
    }
  };

  const reset = () => {
    setState({
      data: null,
      isLoading: false,
      error: null,
    });
  };

  const getState = () => state;

  return {
    execute,
    reset,
    getState,
    subscribe,
  };
}
