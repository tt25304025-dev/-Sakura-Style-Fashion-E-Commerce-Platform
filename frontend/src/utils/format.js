/**
 * Format amounts as Japanese Yen (整円、小数なし).
 * @param {number|string} amount
 * @returns {string} e.g. "¥4,500"
 */
export function formatYen(amount) {
  const value = Number(amount);
  if (Number.isNaN(value)) {
    return '¥0';
  }
  return `¥${Math.round(value).toLocaleString('ja-JP')}`;
}
