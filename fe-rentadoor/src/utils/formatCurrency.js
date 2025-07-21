
export function formatCurrency(price, currency) {
  if (!price) return 'Consultar';
  if (currency === 'USD') return `U$S ${Number(price).toLocaleString('es-AR')}`;
  return `$ ${Number(price).toLocaleString('es-AR')}`;
} 