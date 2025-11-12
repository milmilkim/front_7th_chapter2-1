/**
 * EventBus - 옵저버 패턴 기반 싱글턴 이벤트 버스
 *
 * 전역 이벤트를 중앙에서 관리하여 컴포넌트 간 통신을 용이하게 합니다.
 * 구독(on) 시 자동 cleanup을 위한 unsubscribe 함수를 반환합니다.
 */
class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * 이벤트 구독
   * @param {string} event - 이벤트 이름
   * @param {Function} callback - 콜백 함수
   * @returns {Function} unsubscribe 함수
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // cleanup을 위한 unsubscribe 함수 반환 (함수형!)
    return () => this.off(event, callback);
  }

  /**
   * 이벤트 발행
   * @param {string} event - 이벤트 이름
   * @param {*} data - 전달할 데이터
   */
  emit(event, data) {
    const listenerSet = this.listeners.get(event);
    if (!listenerSet || listenerSet.size === 0) return;
    // 스냅샷을 떠서 emit 중 구독/해제에 의한 재진입/중복 호출 방지
    const snapshotListeners = [...listenerSet];
    for (const listener of snapshotListeners) {
      try {
        listener(data);
      } catch (error) {
        // 개별 리스너 예외는 버스 전체에 전파하지 않음
        // 필요 시 로깅 훅을 추가할 수 있음
        console.error("EventBus listener error on", event, error);
      }
    }
  }

  /**
   * 이벤트 구독 해제
   * @param {string} event - 이벤트 이름
   * @param {Function} callback - 콜백 함수
   */
  off(event, callback) {
    this.listeners.get(event)?.delete(callback);
  }

  /**
   * 모든 이벤트 리스너 제거 (테스트용)
   */
  clear() {
    this.listeners.clear();
  }
}

export const eventBus = new EventBus();

/**
 * 이벤트 이름 상수
 */
export const Events = {
  // 모달 관련
  CART_MODAL_OPEN: "cart:modal:open",
  CART_MODAL_CLOSE: "cart:modal:close",
};
