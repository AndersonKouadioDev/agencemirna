export function formatNumber(number: number | null | undefined): string {
  if (number == null || Number.isNaN(number)) return "";
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
