import { num } from './format'

export function sprintCost(project, sprint) {
  const lines = project.roles
    .map((r) => ({ role: r, days: num(sprint.days[r.id]), cost: num(sprint.days[r.id]) * num(r.tjm) }))
    .filter((l) => l.days > 0)
  const base = lines.reduce((a, l) => a + l.cost, 0)
  const baseDays = lines.reduce((a, l) => a + l.days, 0)
  const rate = num(project.pmPercent) / 100
  return { lines, base, baseDays, pm: base * rate, pmDays: baseDays * rate, total: base * (1 + rate) }
}

export function computeProject(p) {
  let cum = 0
  const sprints = p.sprints.map((s, i) => {
    const c = sprintCost(p, s)
    cum += c.total
    const w = num(p.weeksPerSprint) || 1
    const from = i * w + 1
    const to = (i + 1) * w
    const label = w === 1 ? `Semaine ${from}` : w === 2 ? `Semaines ${from} et ${to}` : `Semaines ${from} à ${to}`
    return { ...c, cum, weeks: label }
  })
  const roleTotals = p.roles.map((r) => {
    const d = p.sprints.reduce((a, s) => a + num(s.days[r.id]), 0)
    return { role: r, days: d, cost: d * num(r.tjm) }
  })
  const base = roleTotals.reduce((a, r) => a + r.cost, 0)
  const baseDays = roleTotals.reduce((a, r) => a + r.days, 0)
  const rate = num(p.pmPercent) / 100
  const total = base * (1 + rate)
  const years = p.finance.years.map(num)
  const revenue = years.reduce((a, b) => a + b, 0)
  const roi = total > 0 && revenue > 0 ? (revenue - total) / total : null
  const rpc = num(p.finance.revenuePerClient)
  const breakeven = rpc > 0 && total > 0 ? total / rpc : null
  let payback = null
  let acc = 0
  for (let i = 0; i < years.length; i++) {
    acc += years[i]
    if (total > 0 && acc >= total) { payback = i + 1; break }
  }
  const actual = p.sprints.reduce((a, s) => a + (String(s.actualCost).trim() ? num(s.actualCost) : 0), 0)
  const hasActual = p.sprints.some((s) => String(s.actualCost).trim())
  return {
    sprints, roleTotals, base, baseDays, pm: base * rate, pmDays: baseDays * rate, total,
    weeks: p.sprints.length * (num(p.weeksPerSprint) || 1), years, revenue, roi, breakeven, payback, actual, hasActual,
  }
}
