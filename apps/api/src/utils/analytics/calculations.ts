export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) {
    if (current === 0) return 0;
    return 100;
  }
  return Number(((current - previous) / previous * 100).toFixed(1));
}

export function calculateChurnRate(
  canceled: number,
  total: number,
): number {
  if (total === 0) return 0;
  return Number(((canceled / total) * 100).toFixed(1));
}

export function calculateAverageRevenuePerUser(
  totalRevenue: number,
  activeUsers: number,
): number {
  if (activeUsers === 0) return 0;
  return Number((totalRevenue / activeUsers).toFixed(2));
}
