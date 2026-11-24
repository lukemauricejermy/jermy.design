// Cases are listed newest first, by the year the work started. Cases without a
// year go last, in the order Dato returns them.
export function byNewest<T extends { year?: string | null }>(cases: T[]): T[] {
  const year = (c: T) => {
    const n = parseInt(c.year ?? "", 10);
    return Number.isNaN(n) ? -Infinity : n;
  };
  return [...cases].sort((a, b) => year(b) - year(a));
}
