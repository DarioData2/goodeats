export function weekStart(date = new Date()): string {
  const monday = new Date(date);
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
  return dateKey(monday);
}
function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function dayDate(week: string, offset: number): Date {
  const [year, month, day] = week.split('-').map(Number);
  return new Date(year, month - 1, day + offset, 12);
}
export function shiftWeek(week: string, offset: number): string { return dateKey(dayDate(week, offset * 7)); }
export function shortDate(date: Date): string { return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }); }
