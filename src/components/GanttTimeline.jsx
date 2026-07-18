import { useState, useMemo } from 'react'
import oiosData from '../data/oios_data.json'

// Date calculation helpers
const START_DATE = new Date('2026-06-01')
const END_DATE = new Date('2027-08-01')
const TOTAL_MS = END_DATE.getTime() - START_DATE.getTime()
const TOTAL_DAYS = TOTAL_MS / (1000 * 60 * 60 * 24)

const parseDate = (dateStr) => {
  if (!dateStr) return null
  return new Date(dateStr)
}

const getPercentOffset = (date) => {
  if (!date) return 0
  const ms = date.getTime() - START_DATE.getTime()
  const days = ms / (1000 * 60 * 60 * 24)
  return Math.max(0, Math.min(100, (days / TOTAL_DAYS) * 100))
}

const addDays = (date, days) => {
  if (!date) return null
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const MONTHS_LABELS = [
  'Juin 26', 'Juil 26', 'Août 26', 'Sept 26', 'Oct 26', 'Nov 26', 'Déc 26',
  'Janv 27', 'Févr 27', 'Mars 27', 'Avril 27', 'Mai 27', 'Juin 27', 'Juil 27'
]

export default function GanttTimeline({ onProjectSelect, selectedProject, isOpen, onToggle }) {
  // We extract all offshore assets that have prediction details from OIOS database
  const rigs = useMemo(() => {
    return (oiosData.oios_offshore_assets || [])
      .filter(a => a.prediction && (a.type === 'Drillship' || a.type === 'Jack-up' || a.type === 'Semi-sub'))
      .map(rig => {
        const contractEnd = parseDate(rig.contract_end)
        const departure = parseDate(rig.prediction.departure)
        
        // Ideal window is calculated as 15 days before contract ends to 15 days after departure
        const idealStart = addDays(contractEnd, -15)
        const idealEnd = addDays(departure, 15)

        // Predicted transit lasts 30 days for mobilization and setup
        const transitEnd = addDays(departure, 30)

        return {
          id: rig.id,
          name: rig.name,
          type: rig.type,
          operator: rig.operator,
          country: rig.country,
          location: rig.location,
          coords: rig.coords,
          contractEndStr: rig.contract_end,
          reason: rig.prediction.reason,
          destination: rig.prediction.destination,
          probability: rig.prediction.probability,
          // Percentages for Gantt render
          contract: {
            left: 0,
            width: getPercentOffset(contractEnd)
          },
          ideal: {
            left: getPercentOffset(idealStart),
            width: getPercentOffset(idealEnd) - getPercentOffset(idealStart)
          },
          transit: {
            left: getPercentOffset(departure),
            width: getPercentOffset(transitEnd) - getPercentOffset(departure)
          }
        }
      })
  }, [])

  const handleRigClick = (rig) => {
    onProjectSelect({
      id: rig.id,
      name: rig.name,
      lat: rig.coords[0],
      lng: rig.coords[1],
      country: rig.country,
      operator: rig.operator,
      description: `${rig.name} (${rig.type}) opéré par ${rig.operator} à ${rig.location}. Fin de contrat : ${rig.contractEndStr}. Transit prévu : ${rig.reason}`,
      status: 'Appraisal',
      kind: 'prediction'
    })
  }

  return (
    <div className={`gantt-panel ${isOpen ? 'open' : 'collapsed'}`}>
      <div className="gantt-header" onClick={onToggle}>
        <div className="gantt-title">
          <span>📅 Timeline Gantt des Contrats &amp; Rigs (Market Intel)</span>
          <span className="gantt-subtitle">Planification des fenêtres de positionnement AHTS / Remorquage</span>
        </div>
        <button className="gantt-toggle-btn">
          {isOpen ? '▼ Réduire' : '▲ Afficher la Timeline'}
        </button>
      </div>

      {isOpen && (
        <div className="gantt-body">
          {/* Timeline Grid Header */}
          <div className="gantt-grid-header">
            <div className="gantt-sidebar-title">Rigs &amp; Contrats</div>
            <div className="gantt-timeline-months">
              {MONTHS_LABELS.map((m, idx) => (
                <div key={idx} className="gantt-month-col">
                  {m}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Rows */}
          <div className="gantt-rows-container">
            {rigs.map((rig) => {
              const isSelected = selectedProject?.id === rig.id
              return (
                <div 
                  key={rig.id} 
                  className={`gantt-row ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleRigClick(rig)}
                >
                  {/* Left Sidebar Label */}
                  <div className="gantt-row-label">
                    <div className="gantt-rig-name">{rig.name}</div>
                    <div className="gantt-rig-meta">{rig.operator} &bull; {rig.type}</div>
                  </div>

                  {/* Right Timeline Bar Area */}
                  <div className="gantt-row-timeline">
                    {/* Month grid lines */}
                    <div className="gantt-grid-lines">
                      {MONTHS_LABELS.map((_, idx) => (
                        <div key={idx} className="gantt-grid-line" />
                      ))}
                    </div>

                    {/* Gantt Bars */}
                    <div className="gantt-bars-wrapper">
                      {/* 1. Current Contract */}
                      {rig.contract.width > 0 && (
                        <div 
                          className="gantt-bar gantt-bar-contract"
                          style={{
                            left: `${rig.contract.left}%`,
                            width: `${rig.contract.width}%`
                          }}
                          title={`Contrat actif (${rig.operator}) jusqu'au ${rig.contractEndStr}`}
                        >
                          <span className="gantt-bar-text">{rig.operator}</span>
                        </div>
                      )}

                      {/* 2. Ideal Support Window */}
                      {rig.ideal.width > 0 && (
                        <div 
                          className="gantt-bar gantt-bar-ideal"
                          style={{
                            left: `${rig.ideal.left}%`,
                            width: `${rig.ideal.width}%`
                          }}
                          title="Fenêtre de positionnement idéale pour navires de support (J-15 à J+15)"
                        >
                          <span className="gantt-bar-text">Fenêtre Idéale</span>
                        </div>
                      )}

                      {/* 3. Predicted Transit */}
                      {rig.transit.width > 0 && (
                        <div 
                          className="gantt-bar gantt-bar-transit"
                          style={{
                            left: `${rig.transit.left}%`,
                            width: `${rig.transit.width}%`
                          }}
                          title={`Mouvement prévu vers ${rig.destination} (${rig.probability}% probabilité)`}
                        >
                          <span className="gantt-bar-text">➔ {rig.destination} ({rig.probability}%)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Gantt Legend */}
          <div className="gantt-footer">
            <div className="gantt-legend-item">
              <span className="gantt-legend-color gantt-legend-contract" />
              <span>Contrat Actif</span>
            </div>
            <div className="gantt-legend-item">
              <span className="gantt-legend-color gantt-legend-ideal" />
              <span>Fenêtre de Rapprochement / Positionnement Idéale</span>
            </div>
            <div className="gantt-legend-item">
              <span className="gantt-legend-color gantt-legend-transit" />
              <span>Transit Prédictif (Destination &amp; Mob)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
