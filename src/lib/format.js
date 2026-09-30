const nf0 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 })

export const num = (v) => {
  const x = parseFloat(String(v ?? '').replace(',', '.'))
  return Number.isFinite(x) && x >= 0 ? x : 0
}
export const eur = (n) => `${nf0.format(Math.round(n || 0))} €`
export const days = (n) => `${nf1.format(n || 0)} j`
export const dec = (n) => nf1.format(n || 0)
export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)
export const kilo = (n) => (n >= 1e6 ? `${nf1.format(n / 1e6)} M€` : n >= 1e3 ? `${nf0.format(n / 1e3)} k€` : eur(n))
