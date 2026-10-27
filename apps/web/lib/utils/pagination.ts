export function getPaginationPages(current: number, total: number) {
  const pages = new Set([1, total]);
  const start = Math.max(1, Math.min(current - 1, total - 3));
  const end = Math.min(total, Math.max(current + 1, 4));
  for (let page = start; page <= end; page++) pages.add(page);
  return [...pages].filter(page => page > 0 && page <= total).sort((a, b) => a - b);
}
