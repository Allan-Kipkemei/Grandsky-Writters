const numberFormat = new Intl.NumberFormat("en-KE", {
  maximumFractionDigits: 0,
});

export function formatKsh(amount: number) {
  return `KSh ${numberFormat.format(amount)}`;
}
