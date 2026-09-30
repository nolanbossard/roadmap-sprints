import { computeProject } from '../lib/calc'
import { days, dec, eur, kilo, num } from '../lib/format'

const Label = ({ children, color }) => (
  <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color }}>
    {children}
  </p>
)

export default function Board({ project }) {
  const p = project
  const c = computeProject(p)
  const { dark, highlight, accent } = p.colors
  const n = p.sprints.length
  const years = p.finance.years.length

  return (
    <div className="print-wrap mx-auto max-w-[2600px] px-6 py-10 md:px-12">
      {/* En-tête */}
      <p className="text-sm font-bold uppercase tracking-[0.14em]" style={{ color: accent }}>
        {p.name} · Roadmap MVP
      </p>
      <h1 className="mt-2 font-display text-4xl uppercase leading-[1.02] md:text-6xl" style={{ color: dark }}>
        {p.title || 'Roadmap'}
      </h1>
      <p className="mt-4 max-w-4xl text-base leading-relaxed md:text-lg" style={{ color: dark }}>
        Méthode agile : {n} sprint{n > 1 ? 's' : ''} de {dec(num(p.weeksPerSprint))} semaine{num(p.weeksPerSprint) > 1 ? 's' : ''} (
        {dec(num(p.daysPerSprint))} jours ouvrés chacun), soit {dec(c.weeks)} semaines. Chaque sprint est documenté avec ses
        fonctionnalités, ses KPI analytics, communication et financiers, et son équipe. Chef de projet compté à {dec(num(p.pmPercent))} % du
        total des autres métiers.
      </p>

      {/* Sprints */}
      {n === 0 ? (
        <p className="no-print mt-10 text-sm text-muted">Ajoutez un premier sprint dans l’onglet Édition.</p>
      ) : (
        <div className="print-wrap mt-10 flex items-start gap-4 overflow-x-auto pb-4">
          {p.sprints.map((s, i) => {
            const r = c.sprints[i]
            const feats = s.features.split('\n').map((x) => x.trim()).filter(Boolean)
            return (
              <article key={s.id} className="w-[300px] shrink-0 rounded-2xl bg-paper p-5" style={{ color: dark }}>
                <div className="flex items-center gap-2.5">
                  <span className="rounded-full px-3 py-0.5 text-sm font-bold text-white" style={{ background: accent }}>
                    S{i}
                  </span>
                  <span className="text-sm text-muted">{r.weeks}</span>
                  {s.status === 'done' && <span className="ml-auto text-xs font-semibold text-muted">Terminé</span>}
                  {s.status === 'doing' && <span className="ml-auto text-xs font-semibold" style={{ color: accent }}>En cours</span>}
                </div>
                <h2 className="mt-3 text-xl font-bold leading-tight">{s.title || `Sprint ${i}`}</h2>

                {feats.length > 0 && (
                  <div className="mt-4">
                    <Label color={accent}>Fonctionnalités</Label>
                    <ul className="space-y-1 text-[13px] leading-snug">
                      {feats.map((f, k) => (
                        <li key={k} className="flex gap-2">
                          <span aria-hidden="true">•</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {s.kpiAnalytics.trim() && (
                  <div className="mt-4">
                    <Label color={accent}>KPI analytics</Label>
                    <p className="text-[13px] leading-snug">{s.kpiAnalytics}</p>
                  </div>
                )}
                {s.kpiCom.trim() && (
                  <div className="mt-4">
                    <Label color={accent}>KPI communication</Label>
                    <p className="text-[13px] leading-snug">{s.kpiCom}</p>
                  </div>
                )}

                <div className="mt-4">
                  <Label color={accent}>Équipe et coût</Label>
                  <div className="tnum space-y-0.5 text-[13px]">
                    {r.lines.map((l) => (
                      <div key={l.role.id} className="flex justify-between gap-3">
                        <span>
                          {l.role.name} · {days(l.days)}
                        </span>
                        <span className="font-semibold">{eur(l.cost)}</span>
                      </div>
                    ))}
                    {r.base > 0 && (
                      <div className="flex justify-between gap-3 text-muted">
                        <span>
                          Chef de projet ({dec(num(p.pmPercent))} %) · {days(r.pmDays)}
                        </span>
                        <span className="font-semibold">{eur(r.pm)}</span>
                      </div>
                    )}
                    {r.base === 0 && <p className="text-muted">Aucun jour saisi</p>}
                  </div>
                </div>

                <div className="mt-5 rounded-xl px-4 py-3" style={{ background: dark }}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: highlight }}>
                    KPI financier
                  </p>
                  <p className="tnum text-3xl font-bold text-white">{eur(r.total)}</p>
                  <p className="tnum text-[13px]" style={{ color: highlight }}>
                    Cumul du MVP : {eur(r.cum)}
                  </p>
                  {String(s.actualCost).trim() !== '' && (
                    <p className="tnum mt-1 text-[13px] text-white/80">
                      Réel : {eur(num(s.actualCost))} ({num(s.actualCost) - r.total > 0 ? '+' : ''}
                      {eur(num(s.actualCost) - r.total)})
                    </p>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Synthèse */}
      <div className="mt-10 grid items-start gap-5 xl:grid-cols-[1.5fr_0.9fr_1.1fr]">
        <section className="rounded-2xl bg-paper p-6" style={{ color: dark }}>
          <h2 className="text-2xl font-bold">TJM et coût par métier</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="tnum w-full min-w-[560px] text-left text-sm [&_td:not(:first-child)]:whitespace-nowrap [&_th]:whitespace-nowrap">
              <thead>
                <tr className="text-white" style={{ background: dark }}>
                  {['Métier', 'TJM retenu', 'Fourchette', 'Jours', 'Coût MVP'].map((h, i) => (
                    <th key={h} className={`px-3 py-2.5 font-semibold ${i === 0 ? 'rounded-l-lg' : ''} ${i === 4 ? 'rounded-r-lg' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {c.roleTotals.map(({ role, days: d, cost }) => (
                  <tr key={role.id} className="border-b border-line">
                    <td className="px-3 py-2.5 font-semibold">{role.name}</td>
                    <td className="px-3 py-2.5">{eur(num(role.tjm))}</td>
                    <td className="px-3 py-2.5">{role.range}</td>
                    <td className="px-3 py-2.5">{days(d)}</td>
                    <td className="px-3 py-2.5">{eur(cost)}</td>
                  </tr>
                ))}
                <tr className="border-b border-line">
                  <td className="px-3 py-2.5 font-semibold">Chef de projet ({dec(num(p.pmPercent))} % des autres)</td>
                  <td className="px-3 py-2.5">Forfait</td>
                  <td className="px-3 py-2.5"></td>
                  <td className="px-3 py-2.5">{days(c.pmDays)}</td>
                  <td className="px-3 py-2.5">{eur(c.pm)}</td>
                </tr>
                <tr className="font-semibold" style={{ background: highlight }}>
                  <td className="rounded-l-lg px-3 py-2.5">Total MVP</td>
                  <td></td>
                  <td></td>
                  <td className="px-3 py-2.5">{days(c.baseDays + c.pmDays)}</td>
                  <td className="rounded-r-lg px-3 py-2.5">{eur(c.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {p.source && <p className="mt-3 text-xs leading-relaxed text-muted">{p.source}</p>}
        </section>

        <section className="rounded-2xl p-6" style={{ background: highlight, color: dark }}>
          <p className="text-xs font-bold uppercase tracking-[0.12em]">Coût du MVP complet</p>
          <p className="tnum mt-1 font-display text-5xl uppercase leading-none">{eur(c.total)} HT</p>
          <p className="mt-4 text-base leading-relaxed">
            {n} sprint{n > 1 ? 's' : ''}, {dec(c.weeks)} semaines
            <br />
            {days(c.baseDays)} métiers + {days(c.pmDays)} de chef de projet
            {n > 0 && (
              <>
                <br />
                Soit environ {eur(c.total / n)} par sprint en moyenne
              </>
            )}
          </p>
          {c.hasActual && <p className="tnum mt-2 text-sm font-semibold">Coût réel saisi : {eur(c.actual)}</p>}
          <p className="mt-3 text-sm opacity-80">Hors coûts récurrents : hébergement, outils, maintenance.</p>
        </section>

        <section className="rounded-2xl p-6 text-white" style={{ background: dark }}>
          <p className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: highlight }}>
            ROI global visé
          </p>
          {c.roi === null ? (
            <p className="mt-3 text-base text-white/80">Renseignez le CA prévu par année dans l’onglet Édition pour calculer le ROI.</p>
          ) : (
            <>
              <p className="tnum mt-1 font-display text-5xl uppercase leading-none">
                x {dec(c.roi)} à {years} an{years > 1 ? 's' : ''}
              </p>
              <p className="tnum mt-4 text-base leading-relaxed">
                {p.finance.revenueLabel || 'CA prévu'} : {c.years.map((y, i) => `${kilo(y)} en année ${i + 1}`).join(', ')}, soit {kilo(c.revenue)} cumulés.
              </p>
              <p className="tnum mt-2 text-base leading-relaxed">
                ROI brut = ({eur(c.revenue)} − {eur(c.total)}) / {eur(c.total)} = {dec(c.roi)}, soit {Math.round(c.roi * 100)} %.
              </p>
              {(c.breakeven || c.payback) && (
                <p className="tnum mt-2 text-base leading-relaxed" style={{ color: highlight }}>
                  {c.breakeven && `Point mort : ${Math.ceil(c.breakeven)} clients actifs pendant un an. `}
                  {c.payback ? `Le MVP est remboursé au cours de l’année ${c.payback}.` : 'Le MVP n’est pas remboursé sur la période.'}
                </p>
              )}
              <p className="mt-3 text-xs text-white/60">ROI brut, avant charges d’exploitation : le ROI net sera plus faible.</p>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
