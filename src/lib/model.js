import { uid } from './format'
import { DEFAULT_SOURCE } from './presets'

export const emptySprint = (roles = []) => ({
  id: uid(),
  title: '',
  features: '',
  kpiAnalytics: '',
  kpiCom: '',
  days: Object.fromEntries(roles.map((r) => [r.id, 0])),
  status: 'todo',
  actualCost: '',
})

export const emptyProject = (name = 'Nouveau projet') => ({
  id: uid(),
  name,
  title: 'Du cadrage à la bêta, sprint par sprint',
  weeksPerSprint: 2,
  daysPerSprint: 10,
  pmPercent: 20,
  colors: { dark: '#1F2F23', highlight: '#C4F24F', accent: '#DE4446' },
  roles: [],
  sprints: [],
  finance: { years: [0, 0, 0], revenuePerClient: 0, revenueLabel: 'CA prévu' },
  source: DEFAULT_SOURCE,
  updatedAt: Date.now(),
})

// Remet d'aplomb un projet importé (champs manquants, anciennes versions)
export const normalize = (p) => {
  const base = emptyProject(p?.name)
  const project = { ...base, ...p, colors: { ...base.colors, ...(p?.colors || {}) }, finance: { ...base.finance, ...(p?.finance || {}) } }
  project.roles = (project.roles || []).map((r) => ({ id: r.id || uid(), name: r.name || '', tjm: r.tjm ?? 0, range: r.range || '' }))
  project.sprints = (project.sprints || []).map((s) => ({ ...emptySprint(project.roles), ...s, days: { ...(s.days || {}) } }))
  if (!Array.isArray(project.finance.years) || !project.finance.years.length) project.finance.years = [0]
  return project
}
