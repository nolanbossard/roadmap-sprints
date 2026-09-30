import { useState } from 'react'
import { computeProject } from '../lib/calc'
import { days, eur, num, uid } from '../lib/format'
import { emptySprint } from '../lib/model'
import { ROLE_PRESETS } from '../lib/presets'

const Section = ({ title, hint, children, action }) => (
  <section className="border-t border-line py-8 first:border-t-0 first:pt-2">
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {hint && <p className="mt-0.5 text-sm text-muted">{hint}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
)

const Field = ({ label, className = '', ...props }) => (
  <label className={className}>
    <span className="label">{label}</span>
    <input className="field" {...props} />
  </label>
)

const STATUS = { todo: 'À venir', doing: 'En cours', done: 'Terminé' }

export default function Editor({ project, onChange }) {
  const p = project
  const c = computeProject(p)
  const [preset, setPreset] = useState('0')

  const set = (patch) => onChange({ ...p, ...patch })
  const setRole = (id, patch) => set({ roles: p.roles.map((r) => (r.id === id ? { ...r, ...patch } : r)) })
  const setSprint = (id, patch) => set({ sprints: p.sprints.map((s) => (s.id === id ? { ...s, ...patch } : s)) })
  const setDays = (sid, rid, v) => setSprint(sid, { days: { ...p.sprints.find((s) => s.id === sid).days, [rid]: v } })
  const setFinance = (patch) => set({ finance: { ...p.finance, ...patch } })

  const addRole = () => {
    const pr = preset === 'other' ? { name: '', tjm: 500, range: '' } : ROLE_PRESETS[+preset]
    const role = { id: uid(), ...pr }
    set({ roles: [...p.roles, role], sprints: p.sprints.map((s) => ({ ...s, days: { ...s.days, [role.id]: 0 } })) })
  }
  const removeRole = (id) => {
    const used = p.sprints.some((s) => num(s.days[id]) > 0)
    if (used && !confirm('Ce métier a des jours saisis dans les sprints. Le retirer quand même ?')) return
    set({ roles: p.roles.filter((r) => r.id !== id), sprints: p.sprints.map(({ days: d, ...s }) => ({ ...s, days: Object.fromEntries(Object.entries(d).filter(([k]) => k !== id)) })) })
  }
  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= p.sprints.length) return
    const next = [...p.sprints]
    ;[next[i], next[j]] = [next[j], next[i]]
    set({ sprints: next })
  }
  const duplicate = (i) => {
    const copy = { ...structuredClone(p.sprints[i]), id: uid(), title: `${p.sprints[i].title} (copie)` }
    const next = [...p.sprints]
    next.splice(i + 1, 0, copy)
    set({ sprints: next })
  }
  const remove = (i) => {
    if (!confirm(`Supprimer le sprint S${i} ?`)) return
    set({ sprints: p.sprints.filter((_, k) => k !== i) })
  }

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-6">
      <Section title="Projet">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom du projet" value={p.name} onChange={(e) => set({ name: e.target.value })} />
          <Field label="Titre du rendu" value={p.title} onChange={(e) => set({ title: e.target.value })} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Field label="Semaines par sprint" type="number" min="1" value={p.weeksPerSprint} onChange={(e) => set({ weeksPerSprint: e.target.value })} />
          <Field label="Jours ouvrés par sprint" type="number" min="1" value={p.daysPerSprint} onChange={(e) => set({ daysPerSprint: e.target.value })} />
          <Field label="Chef de projet (%)" type="number" min="0" value={p.pmPercent} onChange={(e) => set({ pmPercent: e.target.value })} />
          {[
            ['dark', 'Couleur foncée'],
            ['highlight', 'Couleur vive'],
            ['accent', 'Couleur d’accent'],
          ].map(([k, l]) => (
            <label key={k}>
              <span className="label">{l}</span>
              <input
                type="color"
                className="h-[34px] w-full cursor-pointer rounded-md border border-line bg-white p-1"
                value={p.colors[k]}
                onChange={(e) => set({ colors: { ...p.colors, [k]: e.target.value } })}
              />
            </label>
          ))}
        </div>
      </Section>

      <Section title="Équipe" hint="Le chef de projet est calculé automatiquement, inutile de l’ajouter.">
        {p.roles.length > 0 && (
          <div className="mb-4 space-y-2">
            <div className="hidden grid-cols-[1fr_110px_150px_100px_32px] gap-3 text-xs font-medium text-muted sm:grid">
              <span>Métier</span>
              <span>TJM (€)</span>
              <span>Fourchette</span>
              <span className="text-right">Total</span>
              <span />
            </div>
            {p.roles.map((r) => {
              const t = c.roleTotals.find((x) => x.role.id === r.id)
              return (
                <div key={r.id} className="grid grid-cols-[1fr_110px_32px] items-center gap-3 sm:grid-cols-[1fr_110px_150px_100px_32px]">
                  <input className="field" aria-label="Métier" value={r.name} placeholder="Métier" onChange={(e) => setRole(r.id, { name: e.target.value })} />
                  <input className="field tnum text-right" aria-label="TJM" type="number" min="0" value={r.tjm} onChange={(e) => setRole(r.id, { tjm: e.target.value })} />
                  <input className="field hidden sm:block" aria-label="Fourchette" value={r.range} placeholder="450 à 650 €" onChange={(e) => setRole(r.id, { range: e.target.value })} />
                  <span className="tnum hidden text-right text-sm text-muted sm:block">{eur(t?.cost)}</span>
                  <button className="rounded-md p-1.5 text-muted hover:bg-paper hover:text-accent" aria-label={`Retirer ${r.name}`} onClick={() => removeRole(r.id)}>
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <select className="field w-auto" aria-label="Métier à ajouter" value={preset} onChange={(e) => setPreset(e.target.value)}>
            {ROLE_PRESETS.map((r, i) => (
              <option key={r.name} value={i}>
                {r.name} ({r.tjm} €)
              </option>
            ))}
            <option value="other">Autre métier</option>
          </select>
          <button className="btn-main" onClick={addRole}>
            Ajouter
          </button>
        </div>
      </Section>

      <Section
        title="Sprints"
        hint={p.sprints.length ? `${p.sprints.length} sprints · ${eur(c.total)} au total` : 'Un sprint = une période de travail avec ses fonctionnalités et son équipe.'}
      >
        {p.roles.length === 0 && <p className="mb-4 text-sm text-muted">Ajoutez d’abord l’équipe pour pouvoir saisir les jours.</p>}
        <div className="space-y-4">
          {p.sprints.map((s, i) => {
            const r = c.sprints[i]
            return (
              <div key={s.id} className="rounded-xl border border-line">
                <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-2.5">
                  <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-bold text-white">S{i}</span>
                  <input
                    className="min-w-0 flex-1 rounded-md border border-transparent px-2 py-1 font-semibold hover:border-line focus:border-ink focus:outline-none"
                    aria-label={`Titre du sprint S${i}`}
                    placeholder="Titre du sprint"
                    value={s.title}
                    onChange={(e) => setSprint(s.id, { title: e.target.value })}
                  />
                  <span className="text-xs text-muted">{r.weeks}</span>
                  <span className="tnum text-sm font-semibold">{eur(r.total)}</span>
                  <div className="flex text-muted">
                    <button className="rounded p-1.5 hover:bg-paper disabled:opacity-30" aria-label="Monter" disabled={i === 0} onClick={() => move(i, -1)}>
                      ↑
                    </button>
                    <button className="rounded p-1.5 hover:bg-paper disabled:opacity-30" aria-label="Descendre" disabled={i === p.sprints.length - 1} onClick={() => move(i, 1)}>
                      ↓
                    </button>
                    <button className="rounded px-2 py-1.5 text-xs hover:bg-paper" onClick={() => duplicate(i)}>
                      Dupliquer
                    </button>
                    <button className="rounded px-2 py-1.5 text-xs hover:bg-paper hover:text-accent" onClick={() => remove(i)}>
                      Supprimer
                    </button>
                  </div>
                </div>

                <div className="grid gap-5 p-4 md:grid-cols-[1.3fr_1fr]">
                  <div className="space-y-3">
                    <label className="block">
                      <span className="label">Fonctionnalités (une par ligne)</span>
                      <textarea className="field min-h-[84px] resize-y" value={s.features} onChange={(e) => setSprint(s.id, { features: e.target.value })} />
                    </label>
                    <Field label="KPI analytics" value={s.kpiAnalytics} placeholder="Ex. taux d’inscription ≥ 70 %" onChange={(e) => setSprint(s.id, { kpiAnalytics: e.target.value })} />
                    <Field label="KPI communication" value={s.kpiCom} placeholder="Ex. 50 créateurs pré-inscrits" onChange={(e) => setSprint(s.id, { kpiCom: e.target.value })} />
                  </div>

                  <div>
                    <span className="label">Jours par métier</span>
                    <div className="space-y-1.5">
                      {p.roles.map((role) => (
                        <div key={role.id} className="grid grid-cols-[1fr_72px_80px] items-center gap-2 text-sm">
                          <span className="truncate">{role.name || 'Sans nom'}</span>
                          <input
                            className="field tnum py-1 text-right"
                            type="number"
                            min="0"
                            step="0.5"
                            aria-label={`Jours ${role.name} sprint S${i}`}
                            value={s.days[role.id] ?? 0}
                            onChange={(e) => setDays(s.id, role.id, e.target.value)}
                          />
                          <span className="tnum text-right text-muted">{eur(num(s.days[role.id]) * num(role.tjm))}</span>
                        </div>
                      ))}
                      {r.base > 0 && (
                        <div className="grid grid-cols-[1fr_72px_80px] gap-2 border-t border-dashed border-line pt-1.5 text-sm text-muted">
                          <span>Chef de projet</span>
                          <span className="tnum text-right">{days(r.pmDays)}</span>
                          <span className="tnum text-right">{eur(r.pm)}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <label>
                        <span className="label">Statut</span>
                        <select className="field" value={s.status} onChange={(e) => setSprint(s.id, { status: e.target.value })}>
                          {Object.entries(STATUS).map(([k, v]) => (
                            <option key={k} value={k}>
                              {v}
                            </option>
                          ))}
                        </select>
                      </label>
                      <Field label="Coût réel (€)" type="number" min="0" placeholder="À mesurer" value={s.actualCost} onChange={(e) => setSprint(s.id, { actualCost: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <button className="btn-main mt-4" onClick={() => set({ sprints: [...p.sprints, emptySprint(p.roles)] })}>
          Ajouter un sprint
        </button>
      </Section>

      <Section title="Finances" hint="Chiffre d’affaires que le projet doit générer, pour calculer le ROI.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {p.finance.years.map((y, i) => (
            <Field
              key={i}
              label={`Année ${i + 1} (€)`}
              type="number"
              min="0"
              value={y}
              onChange={(e) => setFinance({ years: p.finance.years.map((v, k) => (k === i ? e.target.value : v)) })}
            />
          ))}
        </div>
        <div className="mt-2 flex gap-1">
          <button className="btn" onClick={() => setFinance({ years: [...p.finance.years, 0] })}>
            Ajouter une année
          </button>
          {p.finance.years.length > 1 && (
            <button className="btn text-muted" onClick={() => setFinance({ years: p.finance.years.slice(0, -1) })}>
              Retirer la dernière
            </button>
          )}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="CA annuel par client (€), pour le point mort" type="number" min="0" value={p.finance.revenuePerClient} onChange={(e) => setFinance({ revenuePerClient: e.target.value })} />
          <Field label="Libellé du CA dans le rendu" value={p.finance.revenueLabel} onChange={(e) => setFinance({ revenueLabel: e.target.value })} />
        </div>
        <label className="mt-4 block">
          <span className="label">Source des TJM (affichée sous le tableau)</span>
          <textarea className="field min-h-[60px] resize-y" value={p.source} onChange={(e) => set({ source: e.target.value })} />
        </label>
      </Section>
    </div>
  )
}
