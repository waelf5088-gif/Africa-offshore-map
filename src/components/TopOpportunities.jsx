import { useMemo, useState } from 'react'
import { computeOpportunityScore, GRADE_COLORS } from '../intel'

export default function TopOpportunities({ projects, miningTerminals, onProjectSelect, selectedProject }) {
  const [open, setOpen] = useState(true)

  const top = useMemo(() => {
    const all = [
      ...projects.map((p) => ({ item: p, name: p.name, country: p.country, ...computeOpportunityScore(p) })),
      ...(miningTerminals || []).map((t) => ({ item: t, name: t.terminal_name, country: t.country, ...computeOpportunityScore(t) })),
    ]
    return all.sort((a, b) => b.score - a.score).slice(0, 5)
  }, [projects, miningTerminals])

  return (
    <div className={`top-opps${open ? '' : ' closed'}`}>
      <button className="top-opps-head" onClick={() => setOpen((v) => !v)}>
        <span>Top Opportunités Boluda</span>
        <span className="top-opps-chevron">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="top-opps-list">
          {top.map((o, i) => {
            const c = GRADE_COLORS[o.grade]
            const isSel = selectedProject?.id === o.item.id
            return (
              <button
                key={o.item.id}
                className={`top-opps-item${isSel ? ' selected' : ''}`}
                onClick={() => onProjectSelect(isSel ? null : o.item)}
                title={o.reasons.join(' · ')}
              >
                <span className="top-opps-rank">#{i + 1}</span>
                <span className="top-opps-body">
                  <span className="top-opps-name">
                    <span className="top-opps-name-text">{o.name}</span>
                    {o.hasTugTender && <span className="top-opps-tug-badge" title="Tender remorquage détecté !">⛴️ Tug</span>}
                  </span>
                  <span className="top-opps-country">{o.country}</span>
                </span>
                <span className="top-opps-score" style={{ color: c, borderColor: c + '66', background: c + '14' }}>
                  {o.score} {o.grade}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
