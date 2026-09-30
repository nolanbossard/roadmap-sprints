// Stockage local. Pour passer sur Supabase (ou autre), il suffit de réécrire
// ces trois fonctions en gardant la même signature asynchrone.
const KEY = 'roadmap-sprints:v1'

export async function loadAll() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : { projects: [], currentId: null }
  } catch {
    return { projects: [], currentId: null }
  }
}

export async function saveAll(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* quota plein ou stockage bloqué : on ignore, l'export JSON reste possible */
  }
}

export function download(filename, text, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const slug = (s) =>
  (s || 'projet').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'projet'
