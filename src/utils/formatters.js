export const formatNumber = (num) => {
  let number = Number(num ?? 0);
  return number.toLocaleString();
};

export const formatPrice = (price) => {
  return `${formatNumber(price)}원`;
};
