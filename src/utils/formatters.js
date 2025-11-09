export const formatNumber = (num) => {
  return Number(num ?? 0).toLocaleString();
};

export const formatPrice = (price) => {
  return `${formatNumber(price)}원`;
};
