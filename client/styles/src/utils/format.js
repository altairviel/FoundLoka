/** Format angka ke Rupiah. Contoh: 1500000 → "Rp 1.500.000" */
export const fmt = (n) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);

/** Hitung persentase raised dari target (dibulatkan). */
export const pct = (raised, target) => Math.round((raised / target) * 100);
