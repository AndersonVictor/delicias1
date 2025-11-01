export const formatPEN = (value: number) => {
  try {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
    }).format(value || 0);
  } catch {
    return `S/. ${Number(value || 0).toFixed(2)}`;
  }
};