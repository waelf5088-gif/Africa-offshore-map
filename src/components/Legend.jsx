const STATUS_COLORS = {
  Production: '#84cc16',
  Construction: '#22c55e',
  Development: '#3b82f6',
  'Pre-FID': '#06b6d4',
  Appraisal: '#f97316',
  Exploration: '#a855f7',
  Navire: '#cbd5e1',
}

export default function Legend({ className = '' }) {
  return (
    <div className={`legend ${className}`}>
      <div className="legend-title">Statut</div>
      {Object.entries(STATUS_COLORS).map(([status, color]) => (
        <div key={status} className="legend-item">
          <div className="legend-dot" style={{ background: color }} />
          {status}
        </div>
      ))}
      <hr className="legend-divider" />
      <div className="legend-title">Type</div>
      {[['Pétrole (Oil)', '🛢'], ['Gaz (Gas)', '⛽'], ['GNL (LNG)', '🧊'], ['Minier (Mining)', '⛏'], ['Éolien (Wind)', '🌀'], ['Port (Port)', '🏗️']].map(([type, icon]) => (
        <div key={type} className="legend-item">
          <span style={{ fontSize: 12 }}>{icon}</span>
          {type}
        </div>
      ))}
      <hr className="legend-divider" />
      <div className="legend-item">
        <div className="legend-dot" style={{ background: '#e879f9', boxShadow: '0 0 8px #e879f9' }} />
        Parc éolien (lumineux)
      </div>
      <div className="legend-item">
        <span style={{ fontSize: 12 }}>⛏</span>
        Terminal minier
      </div>
      <div className="legend-item">
        <span style={{ fontSize: 12 }}>🏗️</span>
        Construction portuaire
      </div>
      <div className="legend-item">
        <span style={{ color: '#22d3ee', fontSize: 12, fontWeight: 700 }}>◆</span>
        Hub EPCI / Contractor
      </div>
      <div className="legend-item">
        <span style={{ color: '#ef4444', fontSize: 11, fontWeight: 700 }}>▲</span>
        Concurrent Direct (Towage)
      </div>
      <div className="legend-item">
        <span style={{ color: '#10b981', fontSize: 11, fontWeight: 700 }}>▲</span>
        Partenaire Local (Alcom, Deparentis...)
      </div>
      <div className="legend-item">
        <span style={{ color: '#3b82f6', fontSize: 11, fontWeight: 700 }}>▲</span>
        Rival Support / Acteur Similaire
      </div>


      <div className="legend-item">
        <span style={{ color: '#FF4500', fontSize: 12 }}>◉</span>
        Tender ≤ 6 mois (pulse)
      </div>
    </div>
  )
}
