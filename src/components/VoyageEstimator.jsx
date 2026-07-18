import { useState, useMemo, useEffect } from 'react'
import estimatorData from '../data/estimator_data.json'

const { vessels, ports, distances } = estimatorData

const portNames = [...ports.map(p => p.n)].sort((a, b) => a.localeCompare(b))

function haversineNm(la1, lo1, la2, lo2) {
  const R = 3440.065
  const dLa = (la2 - la1) * Math.PI / 180
  const dLo = (lo2 - lo1) * Math.PI / 180
  const a = Math.sin(dLa / 2) ** 2 +
    Math.cos(la1 * Math.PI / 180) * Math.cos(la2 * Math.PI / 180) * Math.sin(dLo / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(a))
}

function getDistNm(pA, pB) {
  const d = distances[`${pA}|${pB}`] || distances[`${pB}|${pA}`]
  if (d) return d
  const a = ports.find(p => p.n === pA)
  const b = ports.find(p => p.n === pB)
  if (!a || !b || a.la == null || b.la == null) return null
  return Math.round(haversineNm(a.la, a.lo, b.la, b.lo))
}

function PortInput({ id, value, onChange }) {
  const [search, setSearch] = useState(value || '')
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() =>
    portNames.filter(n => n.toLowerCase().includes((search || '').toLowerCase())).slice(0, 14),
    [search]
  )

  const selectPort = (name) => {
    setSearch(name)
    onChange(name)
    setOpen(false)
  }

  return (
    <div className="vest-port-wrap" id={id}>
      <input
        className="vest-input"
        type="text"
        autoComplete="off"
        placeholder="Port…"
        value={search}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 160)}
        onChange={e => { setSearch(e.target.value); onChange('') }}
      />
      {open && filtered.length > 0 && (
        <div className="vest-port-dropdown">
          {filtered.map(n => (
            <div key={n} className="vest-port-item" onMouseDown={() => selectPort(n)}>{n}</div>
          ))}
        </div>
      )}
    </div>
  )
}

function ShipIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 17H6l-2 4h16l-2-4z" />
      <path d="M12 3v10M8 9l4-6 4 6" />
      <path d="M5 13H2l1 4M22 13h-3l1 4" />
    </svg>
  )
}

export default function VoyageEstimator({ className = '' }) {
  const [open, setOpen] = useState(false)
  const [vesselName, setVesselName] = useState(vessels[0]?.name || '')
  const [portA, setPortA] = useState('')
  const [portB, setPortB] = useState('')
  const [distOverride, setDistOverride] = useState('')
  const [speedOverride, setSpeedOverride] = useState('')
  const [consumptionOverride, setConsumptionOverride] = useState('')
  const [fuelPrice, setFuelPrice] = useState(620)
  const [stationDays, setStationDays] = useState(0)
  const [tcRate, setTcRate] = useState(0)

  const vessel = useMemo(() => vessels.find(v => v.name === vesselName), [vesselName])

  useEffect(() => {
    if (vessel) {
      setSpeedOverride(vessel.sf || 12)
      setConsumptionOverride(vessel.cph || 250)
    }
  }, [vesselName])

  useEffect(() => {
    if (portA && portB) {
      const d = getDistNm(portA, portB)
      setDistOverride(d != null ? String(d) : '')
    } else {
      setDistOverride('')
    }
  }, [portA, portB])

  const result = useMemo(() => {
    const dist = Number(distOverride)
    if (!dist || !vessel) return null
    const speed = Number(speedOverride) || vessel.sf || 12
    const cph = Number(consumptionOverride) || vessel.cph || 250
    const transitH = (dist / speed) * 2
    const totalH = transitH + stationDays * 24
    const fuelL = totalH * cph
    const fuelT = fuelL * 0.000845
    const fuelCost = Math.round(fuelT * fuelPrice)
    const tc = Number(tcRate)
    const tcCost = tc > 0 ? Math.round(tc * totalH / 24) : 0
    return {
      dist: Math.round(dist),
      transitDays: Math.round(transitH / 24 * 10) / 10,
      totalDays: Math.round(totalH / 24 * 10) / 10,
      fuelT: Math.round(fuelT),
      fuelCost,
      tcCost,
      totalCost: fuelCost + tcCost,
    }
  }, [distOverride, speedOverride, consumptionOverride, vessel, fuelPrice, stationDays, tcRate])

  return (
    <div className={`voyage-estimator ${className}`}>
      {!open ? (
        <button className="vest-toggle" onClick={() => setOpen(true)}>
          <ShipIcon />
          <span>Estimateur</span>
        </button>
      ) : (
        <div className="vest-panel">
          <div className="vest-header">
            <ShipIcon />
            <span className="vest-title">Estimateur Voyage</span>
            <button className="vest-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="vest-body">
            <div className="vest-section-label">Navire</div>
            <div className="vest-field">
              <label className="vest-label">Sélection</label>
              <select className="vest-select" value={vesselName} onChange={e => setVesselName(e.target.value)}>
                {vessels.map(v => (
                  <option key={v.name} value={v.name}>{v.name}</option>
                ))}
              </select>
            </div>
            {vessel && (
              <div className="vest-vessel-specs">
                <span>{vessel.fuel}</span>
                {vessel.tbp && <><span className="vest-sep">·</span><span>{vessel.tbp}t TBP</span></>}
                {vessel.flag && <><span className="vest-sep">·</span><span>{vessel.flag}</span></>}
              </div>
            )}

            <div className="vest-section-label">Itinéraire</div>
            <div className="vest-field">
              <label className="vest-label">Port de départ</label>
              <PortInput id="port-a" value={portA} onChange={setPortA} />
            </div>
            <div className="vest-field">
              <label className="vest-label">Port de destination</label>
              <PortInput id="port-b" value={portB} onChange={setPortB} />
            </div>

            <div className="vest-section-label">Paramètres</div>
            <div className="vest-row-2">
              <div className="vest-field">
                <label className="vest-label">Distance (NM)</label>
                <input className="vest-input" type="number" value={distOverride}
                  min={0} max={30000} step={10}
                  placeholder="Auto"
                  onChange={e => setDistOverride(e.target.value)} />
              </div>
              <div className="vest-field">
                <label className="vest-label">Vitesse libre (kn)</label>
                <input className="vest-input" type="number" value={speedOverride}
                  min={1} max={30} step={0.5}
                  onChange={e => setSpeedOverride(e.target.value)} />
              </div>
            </div>
            <div className="vest-row-2">
              <div className="vest-field">
                <label className="vest-label">Conso. (L/h)</label>
                <input className="vest-input" type="number" value={consumptionOverride}
                  min={10} max={2000} step={10}
                  onChange={e => setConsumptionOverride(e.target.value)} />
              </div>
              <div className="vest-field">
                <label className="vest-label">TC Rate ($/j)</label>
                <input className="vest-input" type="number" value={tcRate}
                  min={0} max={200000} step={500}
                  onChange={e => setTcRate(e.target.value)} />
              </div>
            </div>
            <div className="vest-row-2">
              <div className="vest-field">
                <label className="vest-label">Carburant ($/t)</label>
                <input className="vest-input" type="number" value={fuelPrice}
                  min={100} max={2000} step={10}
                  onChange={e => setFuelPrice(Number(e.target.value))} />
              </div>
              <div className="vest-field">
                <label className="vest-label">Jours station</label>
                <input className="vest-input" type="number" value={stationDays}
                  min={0} max={90} step={1}
                  onChange={e => setStationDays(Number(e.target.value))} />
              </div>
            </div>

            {result ? (
              <div className="vest-results">
                <div className="vest-result-row">
                  <span>Distance</span>
                  <strong>{result.dist.toLocaleString('fr-FR')} nm</strong>
                </div>
                <div className="vest-result-row">
                  <span>Transit A/R</span>
                  <strong>{result.transitDays} j</strong>
                </div>
                {stationDays > 0 && (
                  <div className="vest-result-row">
                    <span>Total (+ station)</span>
                    <strong>{result.totalDays} j</strong>
                  </div>
                )}
                <div className="vest-result-row">
                  <span>Consommation</span>
                  <strong>{result.fuelT.toLocaleString('fr-FR')} t</strong>
                </div>
                <div className="vest-result-row">
                  <span>Coût carburant</span>
                  <strong>${result.fuelCost.toLocaleString('fr-FR')}</strong>
                </div>
                {result.tcCost > 0 && (
                  <div className="vest-result-row">
                    <span>Coût TC</span>
                    <strong>${result.tcCost.toLocaleString('fr-FR')}</strong>
                  </div>
                )}
                <div className="vest-result-row vest-result-total">
                  <span>Coût total</span>
                  <strong>${result.totalCost.toLocaleString('fr-FR')}</strong>
                </div>
                <div className="vest-result-row vest-result-lumpsum">
                  <span>Forfait (Lumpsum)</span>
                  <strong>${result.totalCost.toLocaleString('fr-FR')}</strong>
                </div>
              </div>
            ) : (
              <div className="vest-no-dist">
                {!distOverride && portA && portB
                  ? 'Distance non disponible : saisir manuellement.'
                  : (!portA || !portB) ? 'Sélectionnez départ et destination.' : ''}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
