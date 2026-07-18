// ── Boluda Intelligence Engine ────────────────────────────────────────────────
// Centralise : parsing dates FR, fenêtres de tenders, liens EPCI, géo-calculs,
// radar concurrence et scoring d'opportunités. Utilisé par Map, Sidebar, App.

import epciData from './data/epci_contractors.json'
import competitorsData from './data/competitors.json'

export const REF_YEAR = 2026
export const REF_MONTH = 5 // Juin = index 5
export const REF_TOTAL = REF_YEAR * 12 + REF_MONTH
export const TIMELINE_MAX = 54 // Juin 2026 → Décembre 2030

const MONTHS_FR = {
  'janvier': 0, 'février': 1, 'fevrier': 1, 'mars': 2, 'avril': 3,
  'mai': 4, 'juin': 5, 'juillet': 6, 'août': 7, 'aout': 7,
  'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11, 'decembre': 11,
}

export const MONTH_LABELS_FR = ['Janv', 'Févr', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc']

export const offsetLabel = (offset) => {
  const total = REF_TOTAL + offset
  return `${MONTH_LABELS_FR[total % 12]} ${Math.floor(total / 12)}`
}

// "Novembre 2026" → total months (year*12+month), null si non parsable
export const parseDateTotal = (dateStr) => {
  if (!dateStr) return null
  const lower = dateStr.toLowerCase()
  let monthIdx = null
  for (const [name, idx] of Object.entries(MONTHS_FR)) {
    if (lower.includes(name)) { monthIdx = idx; break }
  }
  if (monthIdx === null) return null
  const ym = lower.match(/\d{4}/)
  const year = ym ? +ym[0] : REF_YEAR
  return year * 12 + monthIdx
}

export const monthsFromNow = (dateStr, refTotal = REF_TOTAL) => {
  const total = parseDateTotal(dateStr)
  return total === null ? null : total - refTotal
}

// Tous les future_tenders d'un projet/terminal (les 2 formats de données)
export const collectTenders = (item) => [
  ...(item.map_popup_interface?.tabs_content?.tenders?.future_tenders || []),
  ...(item.tender_tracker?.future_tenders || []),
]

export const hasHotTender = (item, refTotal = REF_TOTAL) =>
  collectTenders(item).some((t) => {
    const m = monthsFromNow(t.date_estimated || '', refTotal)
    return m !== null && m >= 0 && m <= 6
  })

// ── EPCI ──────────────────────────────────────────────────────────────────────

export const epciForProject = (pid) =>
  epciData
    .map((c) => {
      const link = c.projects.find((pr) => pr.project_id === pid)
      return link ? { contractor: c, link } : null
    })
    .filter(Boolean)

export const epciHasHot = (pid, refTotal = REF_TOTAL) =>
  epciForProject(pid).some(({ link }) => {
    const m = monthsFromNow(link.tender?.date_estimated || '', refTotal)
    return m !== null && m >= 0 && m <= 6
  })

// ── Géo ───────────────────────────────────────────────────────────────────────

export const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

const allCompetitorBases = competitorsData.flatMap((c) =>
  c.bases.map((b) => ({ ...b, competitor: c.name }))
)

export const nearestCompetitor = (lat, lng) => {
  let best = null
  for (const b of allCompetitorBases) {
    const km = haversineKm(lat, lng, b.lat, b.lng)
    if (!best || km < best.km) best = { km, name: b.competitor, city: b.city }
  }
  return best
}

// Anneau géographique (polygone ~72 points) de rayon km autour d'un point
export const makeGeoCircle = (lng, lat, radiusKm, points = 72) => {
  const coords = []
  const latR = radiusKm / 110.574
  const lngR = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180))
  for (let i = 0; i <= points; i++) {
    const theta = (i / points) * 2 * Math.PI
    coords.push([lng + lngR * Math.cos(theta), lat + latR * Math.sin(theta)])
  }
  return coords
}

export const BLUE_OCEAN_KM = 400 // pas de concurrent dans ce rayon = océan bleu

// ── Scoring d'opportunités Boluda ─────────────────────────────────────────────

export const computeOpportunityScore = (p, refTotal = REF_TOTAL) => {
  let score = 0
  const reasons = []

  // Tenders propres + EPCI liés
  const ownTenders = collectTenders(p)
  const epciLinks = p.kind === 'mining' ? [] : epciForProject(p.id)
  const epciTenders = epciLinks.map(({ link }) => link.tender).filter(Boolean)
  const allDates = [...ownTenders.map((t) => t.date_estimated), ...epciTenders.map((t) => t.date_estimated)]
    .map((d) => monthsFromNow(d, refTotal))
    .filter((m) => m !== null && m >= 0)

  if (allDates.length) {
    const next = Math.min(...allDates)
    if (next <= 2) { score += 40; reasons.push(`Tender imminent (J-${next} mois)`) }
    else if (next <= 6) { score += 30; reasons.push(`Tender à J-${next} mois`) }
    else if (next <= 12) { score += 18; reasons.push(`Tender sous 12 mois`) }
    else { score += 8; reasons.push('Tender identifié à horizon lointain') }
    const extra = Math.min((allDates.length - 1) * 6, 18)
    if (extra > 0) { score += extra; reasons.push(`${allDates.length} tenders au pipeline`) }
  }

  // Détection de tender pour Tugs / Remorquage / AHTS
  const tugKeywords = ['tug', 'tow', 'remorqu', 'ahts', 'escort']
  const allTenderObjects = [...ownTenders, ...epciTenders]
  const tugTenders = allTenderObjects.filter((t) => {
    const title = (t.title || '').toLowerCase()
    return tugKeywords.some((kw) => title.includes(kw))
  })

  const hasTugTender = tugTenders.length > 0
  if (hasTugTender) {
    score += 35
    tugTenders.forEach((t) => {
      reasons.push(`Tender Tugs/Remorquage détecté : "${t.title}"`)
    })
  }

  if (epciLinks.length) {
    const pts = Math.min(epciLinks.length * 6, 18)
    score += pts
    reasons.push(`${epciLinks.length} contractor(s) EPCI actifs`)
  }

  const statusPts = { Construction: 12, Development: 12, 'Pre-FID': 8, Production: 6, Appraisal: 4 }
  if (statusPts[p.status]) score += statusPts[p.status]

  if (p.type === 'LNG') { score += 8; reasons.push('LNG : escorte méthaniers récurrente') }

  const comp = nearestCompetitor(p.lat, p.lng)
  if (comp) {
    if (comp.km > BLUE_OCEAN_KM) { score += 15; reasons.push(`Océan bleu / aucun concurrent à ${Math.round(comp.km)} km`) }
    else if (comp.km < 120) { score -= 8; reasons.push(`⚠ ${comp.name} installé à ${Math.round(comp.km)} km`) }
  }

  score = Math.max(0, Math.min(100, Math.round(score)))
  const grade = score >= 80 ? 'A+' : score >= 65 ? 'A' : score >= 50 ? 'B' : score >= 35 ? 'C' : 'D'
  return { score, grade, reasons, nearestCompetitorKm: comp ? Math.round(comp.km) : null, hasTugTender }
}

export const GRADE_COLORS = { 'A+': '#ff6b35', A: '#f0a500', B: '#3b82f6', C: '#8b949e', D: '#484f58' }

// ── Rigs par projet (drillships / jack-ups / semi-subs) ───────────────────────

export const RIGS = {
  'NAM-001': 'Semi-sub Deepsea Mira (Odfjell)',
  'NAM-002': 'Semi-sub Hercules (Noble)',
  'NAM-003': 'Semi-sub Deepsea Bollsta',
  'NAM-004': 'Semi-sub Deepsea Bollsta',
  'NAM-005': 'Semi-sub Hercules (Noble)',
  'NAM-006': 'Rig à attribuer post-FID',
  'ANG-001': 'Drillship DP3 TotalEnergies / mobilisation fin 2026',
  'ANG-012': 'Drillship Valaris DS-12 / West Gemini',
  'ANG-002': 'Drillship West Gemini',
  'ANG-003': 'Drillship Valaris DS-9 (campagnes Azule)',
  'ANG-004': 'Drillship West Gemini (infill)',
  'ANG-005': 'Drillship West Gemini (CLOV Ph.3)',
  'ANG-006': 'Drillship Libongos (Sonadrill)',
  'ANG-007': 'Drillship Libongos (Sonadrill)',
  'ANG-008': 'Drillship Quenguela (Sonadrill)',
  'ANG-009': 'Flotte Sonadrill / infill Block 15',
  'ANG-010': 'Drillship West Gemini',
  'ANG-011': 'Drillship Libongos (infill)',
  'NGA-001': 'Rig infill / attribution NipeX',
  'NGA-002': 'Drillship deepwater / attribution 2026 (NipeX)',
  'NGA-003': 'Rig post-FID',
  'NGA-004': 'Drillship ExxonMobil / à mobiliser',
  'NGA-005': 'Drillship West Jupiter (infill Usan)',
  'NGA-006': 'Rig infill ExxonMobil',
  'NGA-007': 'Drillship West Jupiter',
  'NGA-008': 'Drillship West Jupiter (hub Egina)',
  'NGA-009': 'Rig post-FID',
  'NGA-010': 'Drillship West Jupiter (tie-back Egina)',
  'NGA-011': 'Rig post-FID',
  'NGA-012': 'Drillship exploration / à mobiliser',
  'SEN-001': 'Drillship Ocean BlackRhino (Ph.1)',
  'SEN-002': 'Drillship Valaris DS-12 (puits GTA)',
  'SEN-003': 'Rig post-FID (Kosmos)',
  'SEN-004': 'Drillship Ocean BlackRhino (retour pressenti)',
  'MAU-001': 'Drillship Valaris DS-12 (puits GTA)',
  'MAU-002': 'Drillship Valaris DS-12 (pressenti Ph.2)',
  'CIV-001': 'Drillship Saipem 12000 (Ph.3)',
  'COG-001': 'Jack-up Norve (Borr Drilling)',
  'COG-002': 'Flotte jack-ups Borr Drilling',
  'COG-003': 'Jack-up Norve (Borr Drilling)',
  'COG-004': 'Jack-up Borr Drilling',
  'MOZ-001': 'Drillship Saipem 12000 (historique)',
  'MOZ-002': 'Drillship Saipem 12000 (campagne 2026-27)',
  'MOZ-003': 'Deepwater rig / remobilisation Area 1',
  'MOZ-004': 'Rig post-FID',
  'MOZ-005': 'Deepwater rig / remobilisation Area 1',
  'GAB-001': 'Jack-up Norve (Borr Drilling)',
  'GAB-002': 'Jack-up Norve (Borr Drilling)',
  'GAB-003': 'Jack-up Norve (Borr) / pressenti',
  'GHA-001': 'Drillship Noble Venturer',
  'GHA-002': 'Drillship Noble Venturer',
  'GHA-003': 'Rig post-FID',
  'GEQ-001': 'Jack-up / hub Punta Europa',
  'GEQ-002': 'Rig d’appréciation à mobiliser',
  'GEQ-003': 'Jack-up (infill Punta Europa)',
  'GEQ-004': 'Jack-up (infill Punta Europa)',
  'CAM-001': 'Jack-up post-FID (shallow water)',
  'TAN-001': 'Rig post-FID',
  'ZAF-001': 'Semi-sub Deepsea Stavanger (11B/12B)',
  'ZAF-002': 'Semi-sub Deepsea Stavanger (11B/12B)',
  'EGY-001': 'Drillship Saipem 10000 (infill Zohr)',
  'EGY-002': 'Drillship Saipem 10000 (appréciation)',
  'LIB-001': 'Jack-up + derrick barge (Bouri rejuvenation)',
  'TUN-001': 'Plateforme fixe / pas de rig actif',
  'KEN-001': 'Rig exploration / à mobiliser',
}

export const rigFor = (p) => RIGS[p.id] || null

// ── Données timeline (War Room) ───────────────────────────────────────────────

// Tous les totaux-mois de tenders (projets + mining + EPCI) pour la sparkline
export const allTenderTotals = (projects, miningTerminals) => {
  const totals = []
  const push = (d) => { const t = parseDateTotal(d); if (t !== null) totals.push(t) }
  projects.forEach((p) => collectTenders(p).forEach((t) => push(t.date_estimated)))
  ;(miningTerminals || []).forEach((m) => collectTenders(m).forEach((t) => push(t.date_estimated)))
  epciData.forEach((c) => c.projects.forEach((pr) => pr.tender && push(pr.tender.date_estimated)))
  return totals
}

// Nombre de tenders dans la fenêtre [offset, offset+6] pour chaque offset 0..TIMELINE_MAX
export const tenderCountsByOffset = (totals) => {
  const counts = []
  for (let o = 0; o <= TIMELINE_MAX; o++) {
    const ref = REF_TOTAL + o
    counts.push(totals.filter((t) => t - ref >= 0 && t - ref <= 6).length)
  }
  return counts
}

export { epciData, competitorsData }
