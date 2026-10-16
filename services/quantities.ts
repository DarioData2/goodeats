// Significant digits remove floating-point noise without rounding small amounts to zero.
export function roundQuantity(value: number): number {
  return Number(value.toPrecision(15));
}

export function formatQuantity(value: number): string {
  return value.toLocaleString('es-CL', { maximumSignificantDigits: 15 });
}
