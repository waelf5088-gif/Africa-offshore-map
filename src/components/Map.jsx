import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import baseLeads from '../data/leads.json'
import windLeads from '../data/wind_leads.json'
import allProjects from '../data/projects.json'
import vesselsData from '../data/vessels.json'
import oiosData from '../data/oios_data.json'
import linkedinHistory from '../data/linkedin_history.json'

const oiosGhostTargets = [
  {
    id: 'ghost_angola',
    name: 'Cible Fantôme G-1 (Angola)',
    coords: [-5.4, 11.2],
    signature: 'AHTS ~180t BP (Bourbon/Maersk?)',
    speed: '14.2 nds',
    heading: '210° (SO)',
    status: 'Activité suspecte',
    inference: '⚠️ Suspicion d\'assistance secrète et de ravitaillement furtif pour le Rig Benguela Belize. Probabilité de concurrence déloyale : 87%.'
  },
  {
    id: 'ghost_nigeria',
    name: 'Cible Fantôme G-2 (Nigeria)',
    coords: [3.8, 6.5],
    signature: 'Cargo lourd non enregistré',
    speed: '8.5 nds',
    heading: '90° (Est)',
    status: 'Transit sombre',
    inference: '📦 Transport clandestin de têtes de puits et d\'ancres lourdes pour le bloc OML 130. Probabilité de sous-traitance non déclarée : 74%.'
  },
  {
    id: 'ghost_namibie',
    name: 'Cible Fantôme G-3 (Namibie)',
    coords: [-29.2, 13.8],
    signature: 'Remorqueur ASD 120t BP',
    speed: '11.0 nds',
    heading: '0° (Nord)',
    status: 'Transit silencieux',
    inference: '🚨 Positionnement d\'escorte non planifié vers le Rig Deepsea Bollsta (Orange Basin). Probabilité de mission furtive : 92%.'
  }
]

const oiosGhostGeoJSON = () => ({
  type: 'FeatureCollection',
  features: oiosGhostTargets.map((g, idx) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [g.coords[1], g.coords[0]] },
    properties: {
      id: g.id,
      idx: idx,
      name: g.name,
      signature: g.signature,
      speed: g.speed,
      heading: g.heading,
      status: g.status,
      inference: g.inference
    }
  }))
})

const worldPolygonGeoJSON = () => ({
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-180, -90],
        [180, -90],
        [180, 90],
        [-180, 90],
        [-180, -90]
      ]]
    }
  }]
})

const bargeTransitGeoJSON = (hypothesis) => {
  if (!hypothesis) return { type: 'FeatureCollection', features: [] }
  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [hypothesis.origin_coords[1], hypothesis.origin_coords[0]],
          [hypothesis.coords[1], hypothesis.coords[0]]
        ]
      },
      properties: {
        id: hypothesis.id,
        name: hypothesis.title
      }
    }]
  }
}



const allLeads = [...baseLeads, ...windLeads]
import {
  REF_TOTAL, monthsFromNow, hasHotTender,
  epciForProject, epciHasHot, epciData, competitorsData,
  nearestCompetitor, makeGeoCircle, BLUE_OCEAN_KM,
  computeOpportunityScore, GRADE_COLORS, rigFor,
} from '../intel'

const STATUS_COLORS = {
  Exploration: '#a855f7',
  Appraisal: '#f97316',
  Development: '#3b82f6',
  'Pre-FID': '#06b6d4',
  Construction: '#22c55e',
  Production: '#84cc16',
  Navire: '#cbd5e1',
}

const TYPE_ICONS = { Oil: '🛢', Gas: '⛽', LNG: '🧊' }

const translateAvailability = (status) => {
  if (!status) return ''
  const s = status.trim()
  if (s.toLowerCase() === 'available') return 'Disponible'
  if (s.toLowerCase() === 'on charter') return 'Affrété'
  if (s.toLowerCase() === 'long term') return 'Long terme'
  if (s.toLowerCase() === 'call for availability') return 'Sur demande'
  if (s.toLowerCase() === 'subject to release') return 'Sous réserve'
  
  return s
    .replace(/January/gi, 'Janvier')
    .replace(/February/gi, 'Février')
    .replace(/March/gi, 'Mars')
    .replace(/April/gi, 'Avril')
    .replace(/May/gi, 'Mai')
    .replace(/June/gi, 'Juin')
    .replace(/July/gi, 'Juillet')
    .replace(/August/gi, 'Août')
    .replace(/September/gi, 'Septembre')
    .replace(/October/gi, 'Octobre')
    .replace(/November/gi, 'Novembre')
    .replace(/December/gi, 'Décembre')
    .replace(/Jan/gi, 'Janv')
    .replace(/Feb/gi, 'Févr')
    .replace(/Mar/gi, 'Mars')
    .replace(/Apr/gi, 'Avr')
    .replace(/Jun/gi, 'Juin')
    .replace(/Jul/gi, 'Juil')
    .replace(/Aug/gi, 'Août')
    .replace(/Sep/gi, 'Sept')
    .replace(/Oct/gi, 'Oct')
    .replace(/Nov/gi, 'Nov')
    .replace(/Dec/gi, 'Déc')
    .replace(/Mid/gi, 'Mi-')
    .replace(/of/gi, 'de')
    .replace(/th/gi, '')
    .replace(/st/gi, '')
    .replace(/nd/gi, '')
    .replace(/rd/gi, '')
}

// ── Countdown badge (HTML) ────────────────────────────────────────────────────

const countdownBadge = (dateStr) => {
  const m = monthsFromNow(dateStr)
  if (m === null || m < 0) return ''
  if (m === 0) return '<span class="tender-countdown tender-urgent">🔥 CE MOIS</span>'
  if (m <= 2) return `<span class="tender-countdown tender-urgent">🔥 J-${m} mois</span>`
  if (m <= 6) return `<span class="tender-countdown tender-warning">⚠️ J-${m} mois</span>`
  return ''
}

// ── EPCI / Concurrence GeoJSON ────────────────────────────────────────────────

const epciHubsGeoJSON = () => ({
  type: 'FeatureCollection',
  features: epciData.flatMap((c) =>
    c.bases.map((b) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [b.lng, b.lat] },
      properties: { id: c.id, name: c.name, color: c.color, city: b.city, role: b.role },
    }))
  ),
})

const epciLinksGeoJSON = (project) => {
  if (!project || project.kind) return { type: 'FeatureCollection', features: [] }
  return {
    type: 'FeatureCollection',
    features: epciForProject(project.id).flatMap(({ contractor }) =>
      contractor.bases.map((b) => ({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: [[project.lng, project.lat], [b.lng, b.lat]] },
        properties: { color: contractor.color },
      }))
    ),
  }
}

const competitorsGeoJSON = () => ({
  type: 'FeatureCollection',
  features: competitorsData.flatMap((c) =>
    c.bases.map((b) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [b.lng, b.lat] },
      properties: { id: c.id, name: c.name, color: c.color, city: b.city, threat_level: c.threat_level },
    }))
  ),
})

// Anneaux "Océan Bleu" : projets chauds sans concurrent à moins de BLUE_OCEAN_KM
const blueOceanGeoJSON = (projects, refTotal) => ({
  type: 'FeatureCollection',
  features: projects
    .filter((p) => hasHotTender(p, refTotal) || epciHasHot(p.id, refTotal))
    .filter((p) => {
      const comp = nearestCompetitor(p.lat, p.lng)
      return comp && comp.km > BLUE_OCEAN_KM
    })
    .map((p) => ({
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [makeGeoCircle(p.lng, p.lat, 220)] },
      properties: { id: p.id, name: p.name },
    })),
})

// ── GeoJSON helpers ───────────────────────────────────────────────────────────

const parseProdYear = (firstOil) => {
  const m = String(firstOil || '').match(/\d{4}/)
  return m ? +m[0] : 9999
}

const toGeoJSON = (projects, filteredIds, refTotal = REF_TOTAL, warRoom = false) => ({
  type: 'FeatureCollection',
  features: projects.map((p) => {
    // En mode War Room, un projet dont le first oil est passé devient "Production"
    const started = warRoom && p.status !== 'Production' && parseProdYear(p.firstOil) <= Math.floor(refTotal / 12)
    return {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      properties: {
        id: p.id,
        name: p.name,
        status: started ? 'Production' : p.status,
        _dimmed: filteredIds && !filteredIds.has(p.id) ? 1 : 0,
        _hot: hasHotTender(p, refTotal) || epciHasHot(p.id, refTotal) ? 1 : 0,
      },
    }
  }),
})

const toMiningGeoJSON = (terminals, filteredMiningIds, refTotal = REF_TOTAL) => ({
  type: 'FeatureCollection',
  features: terminals.map((t) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [t.lng, t.lat] },
    properties: {
      id: t.id,
      name: t.terminal_name,
      header_color: t.map_popup_interface.header_color,
      _hot: hasHotTender(t, refTotal) ? 1 : 0,
      _dimmed: filteredMiningIds && !filteredMiningIds.has(t.id) ? 1 : 0,
    },
  })),
})

const toWindGeoJSON = (windProjects, filteredWindIds, refTotal = REF_TOTAL) => ({
  type: 'FeatureCollection',
  features: windProjects.map((w) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [w.lng, w.lat] },
    properties: {
      id: w.id,
      name: w.name,
      header_color: w.map_popup_interface.header_color,
      _hot: hasHotTender(w, refTotal) ? 1 : 0,
      _dimmed: filteredWindIds && !filteredWindIds.has(w.id) ? 1 : 0,
    },
  })),
})

const toPortsGeoJSON = (ports, filteredPortsIds, refTotal = REF_TOTAL) => ({
  type: 'FeatureCollection',
  features: (ports || []).map((p) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
    properties: {
      id: p.id,
      name: p.name,
      header_color: p.map_popup_interface.header_color,
      _hot: hasHotTender(p, refTotal) ? 1 : 0,
      _dimmed: filteredPortsIds && !filteredPortsIds.has(p.id) ? 1 : 0,
    },
  })),
})

// ── HTML helpers ──────────────────────────────────────────────────────────────

const escHtml = (s) =>
  String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const tabClick = (panel, disp = 'flex') =>
  `(function(b){var c=b.closest('.popup-container');[].forEach.call(c.querySelectorAll('.popup-tab'),function(t){t.classList.remove('active')});[].forEach.call(c.querySelectorAll('.popup-tab-panel'),function(t){t.style.display='none'});b.classList.add('active');c.querySelector('.popup-panel-${panel}').style.display='${disp}'})(this)`

// ── Lead matching ─────────────────────────────────────────────────────────────

const normalizeCountry = (c) => {
  if (!c) return ''
  const s = c.toLowerCase().trim()
  if (s === "cote d'ivoire" || s === "côte d'ivoire" || s === "ivory coast") return "cote d'ivoire"
  if (s === "congo" || s === "republic of the congo" || s === "republic of congo" || s === "congo-brazzaville") return "congo"
  if (s === "dr congo" || s === "drc" || s === "democratic republic of the congo" || s === "democratic republic of congo" || s === "congo-kinshasa") return "dr congo"
  return s
}

const matchLeads = (p) => {
  const companies = [p.operator, ...(p.partners ? p.partners.split(/[,/]/) : [])]
    .map((c) => c.trim().toLowerCase())
  const pCountry = normalizeCountry(p.country)
  return allLeads.filter((lead) => {
    const lCountry = normalizeCountry(lead.country)
    if (pCountry && lCountry && pCountry !== lCountry) return false
    const lc = lead.company.toLowerCase()
    return companies.some((c) => lc.includes(c) || c.includes(lc))
  })
}

const matchLeadsEnriched = (p) => {
  const targets =
    p.map_popup_interface?.tabs_content?.leads?.target_companies ||
    p.contacts_pipeline?.target_companies
  if (targets) {
    const tgts = targets.map((c) => c.toLowerCase())
    const pCountry = normalizeCountry(p.country)
    return allLeads.filter((l) => {
      const lCountry = normalizeCountry(l.country)
      if (pCountry && lCountry && pCountry !== lCountry) return false
      const lc = l.company.toLowerCase()
      return tgts.some((t) => lc.includes(t) || t.includes(lc))
    })
  }
  return matchLeads(p)
}

const matchLeadsMining = (t) => {
  const targets = (t.map_popup_interface?.tabs_content?.leads?.target_companies || [])
    .map((c) => c.toLowerCase())
  if (!targets.length) return []
  const tCountry = normalizeCountry(t.country)
  return allLeads.filter((l) => {
    const lCountry = normalizeCountry(l.country)
    if (tCountry && lCountry && tCountry !== lCountry) return false
    const lc = l.company.toLowerCase()
    return targets.some((target) => lc.includes(target) || target.includes(lc))
  })
}

// ── Shared panel renderers ────────────────────────────────────────────────────

const getProspectingEmail = (p) => {
  if (p && p.prospecting_email) return p.prospecting_email
  
  const name = p ? (p.name || p.terminal_name || 'Project') : 'Project'
  const operator = p ? (p.operator || 'Operator') : 'Operator'
  const country = p ? (p.country || 'Africa') : 'Africa'
  const status = p ? (p.status || p.current_status || 'Development') : 'Development'
  const ptype = p && p.kind === 'wind' ? 'Offshore Wind' : p && p.kind === 'mining' ? 'Mining Terminal' : p && p.kind === 'port' ? 'Port Construction' : 'Offshore'
  
  const subject = `Offshore Towage & Marine Support / ${name} - ${operator}`
  const scope = p && p.kind === 'wind' 
    ? 'offshore wind turbine installation, barge assist, and harbor towage' 
    : p && p.kind === 'mining'
      ? 'ore carrier harbor escort, berthing towage, and terminal support'
      : p && p.kind === 'port'
        ? 'port construction support, heavy lift transport, harbor towage, and barge assistance'
        : 'rig moves, FPSO positioning, and offshore supply support'

  const body = `Dear Procurement Team,\n\nI am reaching out from Boluda Towage's Offshore Division regarding the ${name} ${ptype} project in ${country}.\n\nWe understand that this project is currently in the ${status} stage. Given Boluda's active fleet of high-bollard-pull AHTS and escort tugs on-site, we are positioned to support your upcoming operations, specifically for ${scope}.\n\nWe would welcome the opportunity to discuss how Boluda can support your marine operations.\n\nBest regards,\n\nWael FACHATE | International Commercial Manager\nBOLUDA TOWAGE FRANCE`

  return { subject, body }
}

const genericEmailBoxHTML = (p) => {
  const emailInfo = getProspectingEmail(p)
  if (!emailInfo) return ''
  return `
    <div class="popup-generic-email-box">
      <div class="popup-email-box-header">E-mail type (Prospection Boluda)</div>
      <div class="popup-email-box-subject"><strong>Sujet :</strong> ${escHtml(emailInfo.subject)}</div>
      <div class="popup-email-box-body">${escHtml(emailInfo.body).replace(/\n/g, '<br />')}</div>
      <a class="popup-lead-prospect-btn-generic" href="mailto:?subject=${encodeURIComponent(emailInfo.subject)}&body=${encodeURIComponent(emailInfo.body)}">
        📧 Envoyer l'e-mail type
      </a>
    </div>`
}

const leadsHTML = (leads, p) => {
  if (!leads.length) return `<div class="popup-no-leads">Aucun contact trouvé.</div>`
  const emailInfo = getProspectingEmail(p)
  const sorted = [...leads].sort((a, b) => {
    const cc = (a.country || '').localeCompare(b.country || '')
    if (cc !== 0) return cc
    const co = (a.company || '').localeCompare(b.company || '')
    if (co !== 0) return co
    return (a.lastName || '').localeCompare(b.lastName || '')
  })
  let lastCountry = null
  return sorted.map((l) => {
    const countryHeader = l.country && l.country !== lastCountry
      ? (() => { lastCountry = l.country; return `<div class="popup-leads-country-header">${escHtml(l.country)}</div>` })()
      : ''
      
    const mailtoBtn = l.email && emailInfo
      ? `<a class="popup-lead-prospect-btn" href="mailto:${escHtml(l.email)}?subject=${encodeURIComponent(emailInfo.subject)}&body=${encodeURIComponent(emailInfo.body)}">
           📧 Envoyer e-mail de prospection
         </a>`
      : ''

    const matchedRecord = (linkedinHistory || []).find(h => 
      (l.email && h.email && h.email.toLowerCase().trim() === l.email.toLowerCase().trim()) ||
      (l.linkedin && h.linkedin_url && h.linkedin_url.toLowerCase().trim() === l.linkedin.toLowerCase().trim())
    )
    const isContacted = !!matchedRecord
    const hasReplied = matchedRecord && matchedRecord.status === 'Replied'
    
    let contactedBadge = ''
    if (hasReplied) {
      contactedBadge = `<span class="popup-lead-contacted-badge" style="background: rgba(249, 115, 22, 0.15); color: #f97316; border: 1px solid rgba(249, 115, 22, 0.3); padding: 1px 5px; border-radius: 3px; font-size: 0.65rem; font-weight: bold; margin-left: 6px; display: inline-block;">💬 Répondu</span>`
    } else if (isContacted) {
      contactedBadge = `<span class="popup-lead-contacted-badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); padding: 1px 5px; border-radius: 3px; font-size: 0.65rem; font-weight: bold; margin-left: 6px; display: inline-block;">✅ Contacté</span>`
    }

    return `${countryHeader}
    <div class="popup-lead-card">
      <div class="popup-lead-name">
        ${escHtml(l.firstName)} ${escHtml(l.lastName)}
        ${contactedBadge}
      </div>
      <div class="popup-lead-title">${escHtml(l.title)}</div>
      <div class="popup-lead-meta">
        ${l.email ? `<a class="popup-lead-email" href="mailto:${escHtml(l.email)}">${escHtml(l.email)}</a>` : '<span class="popup-lead-no-email">Pas d\'e-mail</span>'}
        ${l.emailStatus === 'Verified' ? '<span class="popup-lead-verified">✓ Vérifié</span>' : ''}
      </div>
      <div class="popup-lead-country">${escHtml(l.country)}</div>
      ${l.linkedin && l.linkedin !== 'nan' ? `<a class="popup-lead-linkedin" href="${escHtml(l.linkedin)}" target="_blank" rel="noopener">LinkedIn ↗</a>` : ''}
      ${mailtoBtn}
    </div>`
  }).join('')
}

const marineAssetsHTML = (assets) =>
  assets.map((a) => `
    <div class="popup-asset-card">
      <div class="popup-asset-header">
        <span class="popup-asset-type">${escHtml(a.type)}</span>
        <span class="popup-asset-name">${escHtml(a.name)}</span>
      </div>
      <div class="popup-asset-spec">${escHtml(a.spec)}</div>
    </div>`).join('')

const tenderTrackerHTML = (tracker) => {
  const future = (tracker.future_tenders || []).map((t) => `
    <div class="popup-tender-card popup-tender-future">
      <div class="popup-tender-title">${escHtml(t.title)} ${countdownBadge(t.date_estimated)}</div>
      <div class="popup-tender-row">
        <span class="popup-tender-date">📅 ${escHtml(t.date_estimated)}</span>
        <span class="popup-tender-dur">⏱ ${escHtml(t.duration)}</span>
      </div>
      <div class="popup-tender-platform">
        ${escHtml(t.platform)}
        ${t.source_url ? `<a href="${escHtml(t.source_url)}" target="_blank" rel="noopener" class="popup-tender-source-link" style="margin-left:8px;color:#60a5fa;text-decoration:underline;font-size:10px">🔗 Source</a>` : ''}
      </div>
    </div>`).join('')
  const past = (tracker.past_tenders || []).map((t) => `
    <div class="popup-tender-card popup-tender-past">
      <div class="popup-tender-title">${escHtml(t.title)}</div>
      <div class="popup-tender-row">
        <span class="popup-tender-date">📅 ${escHtml(t.date)}</span>
        <span class="popup-tender-dur">⏱ ${escHtml(t.duration)}</span>
      </div>
    </div>`).join('')
  return `
    <div class="popup-tender-status">${tracker.status_indicator || ''}</div>
    ${future ? `<div class="popup-tender-section">À VENIR</div>${future}` : ''}
    ${past ? `<div class="popup-tender-section">HISTORIQUE</div>${past}` : ''}`
}

// ── EPCI panel + hub popup ────────────────────────────────────────────────────

const epciPanelHTML = (pid) => {
  const items = epciForProject(pid)
  return items.map(({ contractor, link }) => `
    <div class="popup-epci-card" style="border-left-color:${contractor.color}">
      <div class="popup-epci-name" style="color:${contractor.color}">◆ ${escHtml(contractor.name)}
        <span class="popup-epci-cat">${escHtml(contractor.category)}</span>
      </div>
      <div class="popup-epci-scope">${escHtml(link.scope)}</div>
      ${link.marine_needs ? `<div class="popup-epci-marine">⚓ ${escHtml(link.marine_needs)}</div>` : ''}
      ${link.tender ? `
        <div class="popup-epci-tender">
          📋 ${escHtml(link.tender.title)} · <strong>${escHtml(link.tender.date_estimated)}</strong>
          ${countdownBadge(link.tender.date_estimated)}
          <div class="popup-epci-platform">
            ${escHtml(link.tender.platform || '')}
            ${link.tender.source_url ? `<a href="${escHtml(link.tender.source_url)}" target="_blank" rel="noopener" class="popup-tender-source-link" style="margin-left:8px;color:#60a5fa;text-decoration:underline;font-size:10px">🔗 Source</a>` : ''}
          </div>
        </div>` : ''}
    </div>`).join('')
}

const matchLeadsEpci = (c) =>
  allLeads.filter((l) => {
    const lc = l.company.toLowerCase()
    return (c.lead_companies || []).some((n) => lc.includes(n.toLowerCase()) || n.toLowerCase().includes(lc))
  })

const epciPopupHTML = (c) => {
  const leads = matchLeadsEpci(c)
  const projectRows = c.projects.map((pr) => {
    const proj = allProjects.find((p) => p.id === pr.project_id)
    return `
      <div class="popup-epci-card" style="border-left-color:${c.color}">
        <div class="popup-epci-projname">${escHtml(proj ? `${proj.name} · ${proj.country}` : pr.project_id)}</div>
        <div class="popup-epci-scope">${escHtml(pr.scope)}</div>
        ${pr.tender ? `<div class="popup-epci-tender">📋 ${escHtml(pr.tender.title)} · <strong>${escHtml(pr.tender.date_estimated)}</strong> ${countdownBadge(pr.tender.date_estimated)}</div>` : ''}
      </div>`
  }).join('')

  return `
    <div class="popup-container" style="border-top:3px solid ${c.color}">
      <div class="popup-header">
        <span class="popup-type-icon" style="color:${c.color}">◆</span>
        <div>
          <div class="popup-title">${escHtml(c.name)}</div>
          <div class="popup-country">${escHtml(c.category)} · Siège : ${escHtml(c.hq)}</div>
        </div>
      </div>
      <div class="popup-badges">
        ${c.bases.map((b) => `<span class="popup-badge" style="background:${c.color}18;color:${c.color};border:1px solid ${c.color}45">📍 ${escHtml(b.city)}</span>`).join('')}
      </div>
      ${c.merger_note ? `<div class="popup-epci-merger">⚡ ${escHtml(c.merger_note)}</div>` : ''}
      <div class="popup-tabs">
        <button class="popup-tab active" onclick="${tabClick('projects')}">Projets <span class="popup-leads-count">${c.projects.length}</span></button>
        <button class="popup-tab" onclick="${tabClick('fleet')}">Flotte</button>
        <button class="popup-tab" onclick="${tabClick('leads')}">Contacts <span class="popup-leads-count">${leads.length}</span></button>
      </div>
      <div class="popup-tab-panel popup-panel-projects popup-scroll-panel" style="display:flex">
        ${projectRows}
      </div>
      <div class="popup-tab-panel popup-panel-fleet popup-scroll-panel" style="display:none">
        ${(c.fleet || []).map((f) => `
          <div class="popup-asset-card">
            <div class="popup-asset-header"><span class="popup-asset-type" style="background:${c.color}22;color:${c.color}">Navire</span>
            <span class="popup-asset-name">${escHtml(f)}</span></div>
          </div>`).join('')}
      </div>
      <div class="popup-tab-panel popup-panel-leads popup-scroll-panel" style="display:none">
        <div class="popup-action-callout">
          <div class="popup-action-label">Angle Boluda</div>
          <div class="popup-action-text">${escHtml(c.boluda_angle)}</div>
        </div>
        ${leads.length ? leadsHTML(leads) : leadsHTML([])}
      </div>
    </div>`
}

// ── POPUP RENDERERS ───────────────────────────────────────────────────────────

const scoreBadge = (item) => {
  const { score, grade } = computeOpportunityScore(item)
  if (score < 35) return ''
  const c = GRADE_COLORS[grade]
  return `<span class="popup-badge" style="background:${c}1f;color:${c};border:1px solid ${c}55" title="Score d'opportunité Boluda">🎯 ${score} · ${grade}</span>`
}

const popupHeader = (p, color) => `
  <div class="popup-header">
    <span class="popup-type-icon">${TYPE_ICONS[p.type] || '⚡'}</span>
    <div>
      <div class="popup-title">${escHtml(p.name)}</div>
      <div class="popup-country">${escHtml(p.country)}</div>
    </div>
  </div>
  <div class="popup-badges">
    <span class="popup-badge popup-badge-status" style="background:${color}22;color:${color};border:1px solid ${color}55">${escHtml(p.status)}</span>
    <span class="popup-badge popup-badge-type">${escHtml(p.type)}</span>
    ${p.water_depth_meters ? `<span class="popup-badge popup-badge-depth">${p.water_depth_meters}m</span>` : ''}
    ${scoreBadge(p)}
  </div>`

// ── Popup concurrent (radar) ──────────────────────────────────────────────────

const competitorPopupHTML = (c) => `
  <div class="popup-container" style="border-top:3px solid ${c.color}">
    <div class="popup-header">
      <span class="popup-type-icon" style="color:${c.color}">▲</span>
      <div>
        <div class="popup-title">${escHtml(c.name)}</div>
        <div class="popup-country">${escHtml(c.parent)} · Menace : ${escHtml(c.threat_level)}</div>
      </div>
    </div>
    <div class="popup-scroll-panel" style="display:flex">
      ${c.bases.map((b) => `
        <div class="popup-epci-card" style="border-left-color:${c.color}">
          <div class="popup-epci-projname">📍 ${escHtml(b.city)} · ${escHtml(b.country)}</div>
          <div class="popup-epci-scope">${escHtml(b.contract)}</div>
          <div class="popup-epci-marine">⚔ ${escHtml(b.threat)}</div>
        </div>`).join('')}
      <div class="popup-action-callout" style="border-left-color:${c.color}">
        <div class="popup-action-label" style="color:${c.color}">Riposte Boluda</div>
        <div class="popup-action-text">${escHtml(c.boluda_positioning)}</div>
      </div>
    </div>
  </div>`

// Unified Boluda popup - handles both offshore and mining via map_popup_interface
const boluadPopupHTML = (item) => {
  const isMining = item.kind === 'mining'
  const isWind = item.kind === 'wind'
  const isPort = item.kind === 'port'
  const color = item.map_popup_interface.header_color
  const { roadmap, assets, tenders, leads: leadsContent } = item.map_popup_interface.tabs_content
  const leads = isMining ? matchLeadsMining(item) : matchLeadsEnriched(item)

  const headerHTML = isMining ? `
    <div class="popup-header">
      <span class="popup-type-icon">⛏</span>
      <div>
        <div class="popup-title">${escHtml(item.terminal_name)}</div>
        <div class="popup-country">${escHtml(item.country)}</div>
      </div>
    </div>
    <div class="popup-badges">
      <span class="popup-badge" style="background:${color}22;color:${color};border:1px solid ${color}55">${escHtml(item.commodity)}</span>
      <span class="popup-badge popup-badge-type">Terminal Minier</span>
      ${scoreBadge(item)}
    </div>` : isWind ? `
    <div class="popup-header">
      <span class="popup-type-icon">🌀</span>
      <div>
        <div class="popup-title">${escHtml(item.name)}</div>
        <div class="popup-country">${escHtml(item.country)} · ${escHtml(item.operator)}</div>
      </div>
    </div>
    <div class="popup-badges">
      <span class="popup-badge" style="background:${color}22;color:${color};border:1px solid ${color}55">${item.capacity_mw} MW</span>
      <span class="popup-badge popup-badge-type">Éolien Offshore</span>
      <span class="popup-badge popup-badge-status">${escHtml(item.status)}</span>
      ${scoreBadge(item)}
    </div>` : isPort ? `
    <div class="popup-header">
      <span class="popup-type-icon">🏗️</span>
      <div>
        <div class="popup-title">${escHtml(item.name)}</div>
        <div class="popup-country">${escHtml(item.country)} · ${escHtml(item.operator)}</div>
      </div>
    </div>
    <div class="popup-badges">
      <span class="popup-badge" style="background:${color}22;color:${color};border:1px solid ${color}55">Projet Portuaire</span>
      <span class="popup-badge popup-badge-status">${escHtml(item.status)}</span>
      ${scoreBadge(item)}
    </div>` : popupHeader(item, color)

  const statusLine = isMining
    ? item.current_status
    : isWind
      ? `${item.status} · Première prod. : ${item.first_power}`
      : isPort
        ? `${item.status} · Achèvement prévu : ${item.completion}`
        : (item.status_detail || item.status)

  const roadmapPanel = `
    <div class="popup-tab-panel popup-panel-roadmap popup-details" style="display:flex">
      <div class="popup-mining-status-line">${escHtml(statusLine)}</div>
      <hr class="legend-divider" style="margin:6px 0" />
      <div class="popup-description" style="border-top:none;margin-top:0;padding-top:0">${escHtml(roadmap.summary)}</div>
      <div class="mining-metrics">
        ${(roadmap.key_metrics || []).map((m) => `
          <div class="mining-metric-row">
            <span class="mining-metric-bullet" style="color:${color}">▸</span>
            <span class="mining-metric-text">${escHtml(m)}</span>
          </div>`).join('')}
      </div>
    </div>`

  const assetsPanel = `
    <div class="popup-tab-panel popup-panel-assets popup-scroll-panel" style="display:none">
      ${marineAssetsHTML(assets || [])}
    </div>`

  const tendersPanel = `
    <div class="popup-tab-panel popup-panel-tenders popup-scroll-panel" style="display:none">
      ${tenderTrackerHTML(tenders || {})}
    </div>`

  const leadsPanel = `
    <div class="popup-tab-panel popup-panel-leads popup-scroll-panel" style="display:none">
      <div class="popup-targets">
        ${(leadsContent.target_companies || []).map((c) => `<span class="popup-target-chip">${escHtml(c)}</span>`).join('')}
      </div>
      <div class="popup-action-callout">
        <div class="popup-action-label">Action Boluda</div>
        <div class="popup-action-text">${escHtml(leadsContent.action)}</div>
      </div>
      ${leads.length ? `<hr class="legend-divider" />${leadsHTML(leads, item)}` : ''}
      ${genericEmailBoxHTML(item)}
    </div>`

  const epciItems = isMining ? [] : epciForProject(item.id)
  const epciTab = epciItems.length
    ? `<button class="popup-tab" onclick="${tabClick('epci')}">EPCI <span class="popup-leads-count">${epciItems.length}</span></button>` : ''
  const epciPanel = epciItems.length
    ? `<div class="popup-tab-panel popup-panel-epci popup-scroll-panel" style="display:none">${epciPanelHTML(item.id)}</div>` : ''

  // Embedded subcontractors (wind farms & any item carrying its own list)
  const subs = item.subcontractors || []
  const subsTab = subs.length
    ? `<button class="popup-tab" onclick="${tabClick('subs')}">Sous-traitants <span class="popup-leads-count">${subs.length}</span></button>` : ''
  const subsPanel = subs.length
    ? `<div class="popup-tab-panel popup-panel-subs popup-scroll-panel" style="display:none">
        ${subs.map((s) => `
          <div class="popup-epci-card" style="border-left-color:${color}">
            <div class="popup-epci-name" style="color:${color}">${escHtml(s.name)}
              <span class="popup-epci-cat">${escHtml(s.role)}</span>
            </div>
            <div class="popup-epci-scope">${escHtml(s.scope)}</div>
          </div>`).join('')}
      </div>` : ''

  return `
    <div class="popup-container popup-container-mining" style="border-top:3px solid ${color}">
      ${headerHTML}
      <div class="popup-tabs">
        <button class="popup-tab active" onclick="${tabClick('roadmap')}">Feuille de route</button>
        <button class="popup-tab" onclick="${tabClick('assets')}">Actifs <span class="popup-leads-count">${(assets || []).length}</span></button>
        <button class="popup-tab" onclick="${tabClick('tenders')}">Appels d'offres</button>
        ${subsTab}
        ${epciTab}
        <button class="popup-tab" onclick="${tabClick('leads')}">Contacts <span class="popup-leads-count">${leads.length}</span></button>
      </div>
      ${roadmapPanel}${assetsPanel}${tendersPanel}${subsPanel}${epciPanel}${leadsPanel}
    </div>`
}

const enrichedPopupHTML = (p) => {
  const color = STATUS_COLORS[p.status] || '#fff'
  const leads = matchLeadsEnriched(p)

  const infoPanel = `
    <div class="popup-tab-panel popup-panel-info popup-details" style="display:flex">
      ${p.block_location ? `<div class="popup-row"><span class="popup-label">Bloc</span><span class="popup-value">${escHtml(p.block_location)}</span></div>` : ''}
      <div class="popup-row"><span class="popup-label">Opérateur</span><span class="popup-value">${escHtml(p.operator)}</span></div>
      ${rigFor(p) ? `<div class="popup-row"><span class="popup-label">Rig</span><span class="popup-value" style="color:#58a6ff">${escHtml(rigFor(p))}</span></div>` : ''}
      ${p.partners ? `<div class="popup-row"><span class="popup-label">Partenaires</span><span class="popup-value" style="font-size:11px">${escHtml(p.partners)}</span></div>` : ''}
      ${p.firstOil && p.firstOil !== 'TBD' ? `<div class="popup-row"><span class="popup-label">Début Prod.</span><span class="popup-value">${escHtml(p.firstOil)}</span></div>` : ''}
      ${p.status_detail ? `<div class="popup-description">${escHtml(p.status_detail)}</div>` : ''}
      ${p.description ? `<div class="popup-description" style="margin-top:4px;font-style:italic">${escHtml(p.description)}</div>` : ''}
    </div>`

  const assetsPanel = `
    <div class="popup-tab-panel popup-panel-assets popup-scroll-panel" style="display:none">
      ${marineAssetsHTML(p.marine_assets || [])}
    </div>`

  const tendersPanel = `
    <div class="popup-tab-panel popup-panel-tenders popup-scroll-panel" style="display:none">
      ${tenderTrackerHTML(p.tender_tracker || {})}
    </div>`

  const contactsPanel = `
    <div class="popup-tab-panel popup-panel-contacts popup-scroll-panel" style="display:none">
      ${p.contacts_pipeline ? `
        <div class="popup-targets">
          ${p.contacts_pipeline.target_companies.map((c) => `<span class="popup-target-chip">${escHtml(c)}</span>`).join('')}
        </div>
        <div class="popup-contacts-action">${escHtml(p.contacts_pipeline.action)}</div>
        <hr class="legend-divider" />` : ''}
      ${leadsHTML(leads, p)}
      ${genericEmailBoxHTML(p)}
    </div>`

  const epciItems = epciForProject(p.id)
  const epciTab = epciItems.length
    ? `<button class="popup-tab" onclick="${tabClick('epci')}">EPCI <span class="popup-leads-count">${epciItems.length}</span></button>` : ''
  const epciPanel = epciItems.length
    ? `<div class="popup-tab-panel popup-panel-epci popup-scroll-panel" style="display:none">${epciPanelHTML(p.id)}</div>` : ''

  return `
    <div class="popup-container">
      ${popupHeader(p, color)}
      <div class="popup-tabs">
        <button class="popup-tab active" onclick="${tabClick('info')}">Info</button>
        <button class="popup-tab" onclick="${tabClick('assets')}">Actifs <span class="popup-leads-count">${(p.marine_assets || []).length}</span></button>
        <button class="popup-tab" onclick="${tabClick('tenders')}">Appels d'offres</button>
        ${epciTab}
        <button class="popup-tab" onclick="${tabClick('contacts')}">Contacts <span class="popup-leads-count">${leads.length}</span></button>
      </div>
      ${infoPanel}${assetsPanel}${tendersPanel}${epciPanel}${contactsPanel}
    </div>`
}

const simplePopupHTML = (p) => {
  const color = STATUS_COLORS[p.status] || '#fff'
  const leads = matchLeads(p)
  const epciItems = epciForProject(p.id)
  const epciTab = epciItems.length
    ? `<button class="popup-tab" onclick="${tabClick('epci')}">EPCI <span class="popup-leads-count">${epciItems.length}</span></button>` : ''
  const epciPanel = epciItems.length
    ? `<div class="popup-tab-panel popup-panel-epci popup-scroll-panel" style="display:none">${epciPanelHTML(p.id)}</div>` : ''
  return `
    <div class="popup-container">
      ${popupHeader(p, color)}
      <div class="popup-tabs">
        <button class="popup-tab active" onclick="${tabClick('details')}">Détails</button>
        ${epciTab}
        <button class="popup-tab" onclick="${tabClick('leads')}">Contacts <span class="popup-leads-count">${leads.length}</span></button>
      </div>
      <div class="popup-tab-panel popup-panel-details popup-details" style="display:flex">
        <div class="popup-row"><span class="popup-label">Opérateur</span><span class="popup-value">${escHtml(p.operator)}</span></div>
        ${rigFor(p) ? `<div class="popup-row"><span class="popup-label">Rig</span><span class="popup-value" style="color:#58a6ff">${escHtml(rigFor(p))}</span></div>` : ''}
        ${p.partners ? `<div class="popup-row"><span class="popup-label">Partenaires</span><span class="popup-value" style="font-size:11px">${escHtml(p.partners)}</span></div>` : ''}
        ${p.firstOil && p.firstOil !== 'TBD' ? `<div class="popup-row"><span class="popup-label">Début Prod.</span><span class="popup-value">${escHtml(p.firstOil)}</span></div>` : ''}
        ${p.description ? `<div class="popup-description">${escHtml(p.description)}</div>` : ''}
      </div>
      ${epciPanel}
      <div class="popup-tab-panel popup-panel-leads popup-scroll-panel" style="display:none">
        ${leadsHTML(leads, p)}
        ${genericEmailBoxHTML(p)}
      </div>
    </div>`
}

const ghostPopupHTML = (g) => `
  <div class="popup-container" style="border-top: 3px solid #10b981">
    <div class="popup-header">
      <span class="popup-type-icon" style="color:#10b981">📡</span>
      <div>
        <div class="popup-title">${escHtml(g.name)}</div>
        <div class="popup-subtitle" style="color:#10b981; font-weight:700; font-size: 0.65rem;">SURVEILLANCE SATELLITE (SAR)</div>
      </div>
    </div>
    <div class="popup-tab-panel" style="display:flex; flex-direction:column; padding: 12px; font-size: 0.75rem; color:#cbd5e1; gap: 4px;">
      <div><strong>Signature Radar :</strong> ${escHtml(g.signature)}</div>
      <div><strong>Vitesse estimée :</strong> ${escHtml(g.speed)} | <strong>Cap :</strong> ${escHtml(g.heading)}</div>
      <div><strong>Statut de signal :</strong> <span style="color:#ef4444; font-weight:700;">AIS ÉTEINT (Clandestin)</span></div>
      <div style="margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px; color: #f59e0b; line-height: 1.3;">
        <strong>🔮 Inférence IA :</strong> ${escHtml(g.inference)}
      </div>
    </div>
  </div>
`

const popupHTML = (p) => {
  if (p.kind === 'ghost') return ghostPopupHTML(p)
  if (p.map_popup_interface) return boluadPopupHTML(p)
  if (p.marine_assets) return enrichedPopupHTML(p)
  return simplePopupHTML(p)
}


const oiosAssetsGeoJSON = () => ({
  type: 'FeatureCollection',
  features: oiosData.oios_offshore_assets.map((a, i) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [a.coords[1], a.coords[0]] },
    properties: { id: a.id, name: a.name, type: a.type },
  })),
})

const oiosTransitsGeoJSON = () => ({
  type: 'FeatureCollection',
  features: oiosData.oios_predictions.map((p, i) => ({
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [
        [p.origin_coords[1], p.origin_coords[0]],
        [p.dest_coords[1], p.dest_coords[0]]
      ]
    },
    properties: { name: p.name },
  })),
})

const oiosAssetPopupHTML = (a) => {
  const color = a.type === 'FPSO' ? '#f59e0b' : '#a855f7'
  return `
    <div class="popup-container">
      <div class="popup-header" style="border-left: 3px solid ${color}">
        <div class="popup-title">${escHtml(a.name)}</div>
        <div class="popup-country">${escHtml(a.location || 'Offshore')} &bull; ${escHtml(a.type)}</div>
      </div>
      <div class="popup-tab-panel popup-panel-details popup-details" style="display:flex; flex-direction:column; gap:4px; font-size:12px; color:#cbd5e1">
        <div class="popup-row"><span class="popup-label">Opérateur</span><span class="popup-value">${escHtml(a.operator)}</span></div>
        <div class="popup-row"><span class="popup-label">Pays</span><span class="popup-value">${escHtml(a.country)}</span></div>
        <div class="popup-row"><span class="popup-label">Statut</span><span class="popup-value" style="font-weight:bold">${escHtml(a.status)}</span></div>
        ${a.specifications ? `<div class="popup-row"><span class="popup-label">Spécifications</span><span class="popup-value" style="font-size:11px">${escHtml(a.specifications)}</span></div>` : ''}
      </div>
    </div>
  `
}

// ── VESSELS (FABLE AIS LAYER) ─────────────────────────────────────────────────

const vesselsGeoJSON = () => ({
  type: 'FeatureCollection',
  features: vesselsData.vessels.map((v, i) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [v.lon, v.lat] },
    properties: { idx: i, name: v.name, alert: v.alert ? 1 : 0 },
  })),
})

const vesselShipSVG = (color) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
    <path d="M2.5 15.5h19l-2.5 5h-14z" fill="${color}" stroke="#0b1220" stroke-width="1.2"/>
    <rect x="8.5" y="10.5" width="7" height="5" fill="${color}" stroke="#0b1220" stroke-width="1.2"/>
    <rect x="11" y="7" width="2.4" height="3.5" fill="${color}" stroke="#0b1220" stroke-width="1"/>
  </svg>`

const loadVesselIcon = (map, id, color) => {
  if (map.hasImage(id)) return
  const img = new Image(22, 22)
  img.onload = () => { if (!map.hasImage(id)) map.addImage(id, img) }
  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(vesselShipSVG(color))))
}

const posSourceLabel = {
  ais_live: '🟢 AIS récent',
  ais_stale: '🟠 AIS ancien',
  approx: '⚪ Position approximative',
}

const vesselPopupHTML = (v) => {
  const accent = v.alert ? '#f59e0b' : '#94a3b8'
  const price = v.priceEur
    ? `${v.priceEur.toLocaleString('fr-FR')} €/j`
    : 'Non renseigné'
  return `
  <div class="popup-container" style="border-top:3px solid ${accent}">
    <div class="popup-header">
      <span class="popup-type-icon" style="color:${accent}">⚓</span>
      <div>
        <div class="popup-title">${escHtml(v.name)}</div>
        <div class="popup-country">${escHtml(v.type)} · ${v.bp}t BP${v.built ? ` · ${v.built}` : ''}${v.flag ? ` · ${escHtml(v.flag)}` : ''}</div>
      </div>
    </div>
    <div class="popup-scroll-panel" style="display:flex">
      <div class="popup-epci-card" style="border-left-color:${accent}">
        <div class="popup-epci-projname">📍 ${escHtml(v.location)}</div>
        <div class="popup-epci-scope">${posSourceLabel[v.posSource] || ''} - ${escHtml(v.posNote)}</div>
        ${v.imo ? `<div class="popup-epci-marine">IMO ${v.imo}${v.mmsi ? ` · MMSI ${v.mmsi}` : ''}</div>` : '<div class="popup-epci-marine">IMO/MMSI à renseigner</div>'}
      </div>
      <div class="popup-epci-card" style="border-left-color:${accent}">
        <div class="popup-epci-projname">Disponibilité : ${escHtml(translateAvailability(v.availability))}</div>
        ${v.owner ? `<div class="popup-epci-scope">Armateur : ${escHtml(v.owner)}</div>` : ''}
      </div>
      <div class="popup-action-callout" style="border-left-color:#22c55e">
        <div class="popup-action-label" style="color:#22c55e">💰 Prix marché : ${price}</div>
        <div class="popup-action-text">${escHtml(v.priceNote || '')}</div>
      </div>
      ${v.aisUrl ? `<a href="${v.aisUrl}" target="_blank" rel="noopener" style="font-size:11px;color:#60a5fa;padding:4px 2px">→ Suivre sur VesselFinder</a>` : ''}
    </div>
  </div>`
}

// ── MAP COMPONENT ─────────────────────────────────────────────────────────────

export default function Map({ projects, filteredIds, miningTerminals, filteredMiningTerminals, windProjects, filteredWindProjects, ports, filteredPorts, selectedProject, onProjectSelect, timelineOffset, viewMode, selectedPrediction, onPredictionSelect, sarModeActive, onSarToggle, selectedBargeHypothesis, onBargeHypothesisSelect }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const popupRef = useRef(null)
  const projectsRef = useRef(projects)
  const filteredIdsRef = useRef(filteredIds)
  const miningTerminalsRef = useRef(miningTerminals)
  const filteredMiningTerminalsRef = useRef(filteredMiningTerminals)
  const windProjectsRef = useRef(windProjects)
  const filteredWindProjectsRef = useRef(filteredWindProjects)
  const portsRef = useRef(ports)
  const filteredPortsRef = useRef(filteredPorts)
  const onSelectRef = useRef(onProjectSelect)
  const loadedRef = useRef(false)

  useEffect(() => { projectsRef.current = projects }, [projects])
  useEffect(() => { filteredIdsRef.current = filteredIds }, [filteredIds])
  useEffect(() => { miningTerminalsRef.current = miningTerminals }, [miningTerminals])
  useEffect(() => { filteredMiningTerminalsRef.current = filteredMiningTerminals }, [filteredMiningTerminals])
  useEffect(() => { windProjectsRef.current = windProjects }, [windProjects])
  useEffect(() => { filteredWindProjectsRef.current = filteredWindProjects }, [filteredWindProjects])
  useEffect(() => { portsRef.current = ports }, [ports])
  useEffect(() => { filteredPortsRef.current = filteredPorts }, [filteredPorts])
  useEffect(() => { onSelectRef.current = onProjectSelect }, [onProjectSelect])

  // Init map once
  useEffect(() => {
    let raf = null

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [10, 18],
      zoom: 2.7,
      minZoom: 2,
      maxZoom: 18,
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-right')

    const popup = new maplibregl.Popup({ closeButton: true, closeOnClick: false, maxWidth: '440px' })
    popupRef.current = popup

    map.on('load', () => {
      loadedRef.current = true

      // ── BLUE OCEAN RINGS (bottom-most) ─────────────────────────────────────

      map.addSource('blue-ocean', {
        type: 'geojson',
        data: blueOceanGeoJSON(projectsRef.current, REF_TOTAL),
      })

      map.addLayer({ id: 'blue-ocean-fill', type: 'fill', source: 'blue-ocean', paint: {
        'fill-color': '#3b82f6', 'fill-opacity': 0.05,
      }})

      map.addLayer({ id: 'blue-ocean-line', type: 'line', source: 'blue-ocean', paint: {
        'line-color': '#60a5fa', 'line-width': 1.4, 'line-opacity': 0.55, 'line-dasharray': [3, 3],
      }})

      // ── COMPETITOR RADAR ───────────────────────────────────────────────────

      map.addSource('competitors', { type: 'geojson', data: competitorsGeoJSON() })

      map.addLayer({ id: 'competitor-glow', type: 'circle', source: 'competitors', paint: {
        'circle-color': ['get', 'color'],
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 11, 6, 17, 10, 24],
        'circle-blur': 1.3, 'circle-opacity': 0.2,
      }})

      map.addLayer({ id: 'competitors-symbol', type: 'symbol', source: 'competitors', layout: {
        'text-field': '▲', 'text-size': ['interpolate', ['linear'], ['zoom'], 2, 11, 6, 15, 10, 19],
        'text-allow-overlap': true, 'text-ignore-placement': true,
        'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
      }, paint: {
        'text-color': ['get', 'color'],
        'text-halo-color': '#070b16', 'text-halo-width': 1.4,
      }})

      map.addLayer({ id: 'competitor-labels', type: 'symbol', source: 'competitors', minzoom: 5, layout: {
        'text-field': ['format', ['get', 'name'], {}, '\n', {}, ['get', 'city'], { 'font-scale': 0.82 }],
        'text-size': 10, 'text-offset': [0, 1.3], 'text-anchor': 'top', 'text-optional': true,
        'text-font': ['DIN Offc Pro Regular', 'Arial Unicode MS Regular'],
      }, paint: {
        'text-color': ['get', 'color'],
        'text-halo-color': '#070b16', 'text-halo-width': 1.4,
      }})

      // ── EPCI LAYERS (rendered below everything else) ───────────────────────

      map.addSource('epci-links', { type: 'geojson', data: epciLinksGeoJSON(null) })

      map.addLayer({ id: 'epci-links-casing', type: 'line', source: 'epci-links',
        layout: { 'line-cap': 'round' },
        paint: { 'line-color': ['get', 'color'], 'line-width': 5, 'line-opacity': 0.12 },
      })

      map.addLayer({ id: 'epci-links', type: 'line', source: 'epci-links',
        layout: { 'line-cap': 'round' },
        paint: { 'line-color': ['get', 'color'], 'line-width': 1.7, 'line-opacity': 0.9, 'line-dasharray': [0, 4, 3] },
      })

      map.addSource('epci-hubs', { type: 'geojson', data: epciHubsGeoJSON() })

      map.addLayer({ id: 'epci-hub-glow', type: 'circle', source: 'epci-hubs', paint: {
        'circle-color': ['get', 'color'],
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 9, 6, 14, 10, 20],
        'circle-blur': 1.2, 'circle-opacity': 0.22,
      }})

      map.addLayer({ id: 'epci-hubs-symbol', type: 'symbol', source: 'epci-hubs', layout: {
        'text-field': '◆', 'text-size': ['interpolate', ['linear'], ['zoom'], 2, 11, 6, 15, 10, 19],
        'text-allow-overlap': true, 'text-ignore-placement': true,
        'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
      }, paint: {
        'text-color': ['get', 'color'],
        'text-halo-color': '#070b16', 'text-halo-width': 1.4,
      }})

      map.addLayer({ id: 'epci-hub-labels', type: 'symbol', source: 'epci-hubs', minzoom: 5, layout: {
        'text-field': ['format', ['get', 'name'], {}, '\n', {}, ['get', 'city'], { 'font-scale': 0.82 }],
        'text-size': 10, 'text-offset': [0, 1.3], 'text-anchor': 'top', 'text-optional': true,
        'text-font': ['DIN Offc Pro Regular', 'Arial Unicode MS Regular'],
      }, paint: {
        'text-color': ['get', 'color'],
        'text-halo-color': '#070b16', 'text-halo-width': 1.4,
      }})

      // ── OFFSHORE LAYERS ────────────────────────────────────────────────────

      map.addSource('projects', {
        type: 'geojson',
        data: toGeoJSON(projectsRef.current, filteredIdsRef.current),
      })

      const statusColor = [
        'match', ['get', 'status'],
        'Exploration', '#a855f7', 'Appraisal', '#f97316', 'Development', '#3b82f6',
        'Pre-FID', '#06b6d4', 'Construction', '#22c55e', 'Production', '#84cc16',
        '#ffffff',
      ]

      const statusColorAlpha = (a) => [
        'match', ['get', 'status'],
        'Exploration', `rgba(168,85,247,${a})`, 'Appraisal', `rgba(249,115,22,${a})`,
        'Development', `rgba(59,130,246,${a})`, 'Pre-FID', `rgba(6,182,212,${a})`,
        'Construction', `rgba(34,197,94,${a})`, 'Production', `rgba(132,204,22,${a})`,
        `rgba(255,255,255,${a})`,
      ]

      const dimExpr = (nv, dv) => ['case', ['==', ['get', '_dimmed'], 1], dv, nv]

      // Hot-pulse ring - outermost layer, animated via rAF
      map.addLayer({ id: 'hot-pulse-offshore', type: 'circle', source: 'projects',
        filter: ['all', ['==', ['get', '_hot'], 1], ['==', ['get', '_dimmed'], 0]],
        paint: {
          'circle-color': '#FF4500',
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 24, 6, 38, 10, 54],
          'circle-blur': 1.1, 'circle-stroke-width': 0, 'circle-opacity': 0.35,
        },
      })

      map.addLayer({ id: 'glow-outer', type: 'circle', source: 'projects', paint: {
        'circle-color': statusColorAlpha(0.08),
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 18, 6, 28, 10, 40],
        'circle-blur': 1, 'circle-stroke-width': 0, 'circle-opacity': dimExpr(1, 0.06),
      }})

      map.addLayer({ id: 'glow-mid', type: 'circle', source: 'projects', paint: {
        'circle-color': statusColorAlpha(0.18),
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 10, 6, 16, 10, 24],
        'circle-blur': 0.6, 'circle-stroke-width': 0, 'circle-opacity': dimExpr(1, 0.06),
      }})

      map.addLayer({ id: 'glow-inner', type: 'circle', source: 'projects', paint: {
        'circle-color': statusColorAlpha(0.35),
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 6, 6, 10, 10, 14],
        'circle-blur': 0.3, 'circle-stroke-width': 0, 'circle-opacity': dimExpr(1, 0.07),
      }})

      map.addLayer({ id: 'points', type: 'circle', source: 'projects', paint: {
        'circle-color': statusColor,
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 4, 6, 6, 10, 9],
        'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 2, 1, 6, 2],
        'circle-stroke-color': 'rgba(255,255,255,0.7)',
        'circle-opacity': dimExpr(1, 0.13),
        'circle-stroke-opacity': dimExpr(0.7, 0.04),
      }})

      map.addLayer({ id: 'point-labels', type: 'symbol', source: 'projects', minzoom: 5, layout: {
        'text-field': ['get', 'name'], 'text-size': 10,
        'text-offset': [0, 1.5], 'text-anchor': 'top', 'text-optional': true, 'text-max-width': 10,
        'text-font': ['DIN Offc Pro Regular', 'Arial Unicode MS Regular'],
      }, paint: {
        'text-color': '#e6edf3', 'text-halo-color': '#0a0e1a', 'text-halo-width': 1.5,
        'text-opacity': dimExpr(1, 0),
      }})

      // ── MINING LAYERS ──────────────────────────────────────────────────────

      const filteredMiningIds = new Set((filteredMiningTerminalsRef.current || []).map(t => t.id))

      map.addSource('mining-terminals', {
        type: 'geojson',
        data: toMiningGeoJSON(miningTerminalsRef.current, filteredMiningIds),
      })

      const mDim = (nv, dv) => ['case', ['==', ['get', '_dimmed'], 1], dv, nv]

      // Marqueur minier : émoticône pioche ⛏ rendue en canvas (les serveurs de
      // glyphes carto n'embarquent pas les emoji - l'image garantit le rendu)
      const emojiImage = (emoji, size = 56) => {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        ctx.font = `${size - 12}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowColor = 'rgba(0,0,0,0.85)'
        ctx.shadowBlur = 6
        ctx.fillText(emoji, size / 2, size / 2 + 2)
        return ctx.getImageData(0, 0, size, size)
      }

      if (!map.hasImage('pickaxe-icon')) {
        map.addImage('pickaxe-icon', emojiImage('⛏️'), { pixelRatio: 2 })
      }

      map.addLayer({ id: 'mining-points', type: 'symbol', source: 'mining-terminals', layout: {
        'icon-image': 'pickaxe-icon',
        'icon-size': ['interpolate', ['linear'], ['zoom'], 2, 0.55, 6, 0.8, 10, 1.05],
        'icon-allow-overlap': true, 'icon-ignore-placement': true,
      }, paint: { 'icon-opacity': mDim(1, 0.15) }})

      map.addLayer({ id: 'mining-labels', type: 'symbol', source: 'mining-terminals', minzoom: 4, layout: {
        'text-field': ['get', 'name'], 'text-size': 10,
        'text-offset': [0, 1.6], 'text-anchor': 'top', 'text-optional': true, 'text-max-width': 14,
        'text-font': ['DIN Offc Pro Regular', 'Arial Unicode MS Regular'],
      }, paint: {
        'text-color': ['get', 'header_color'],
        'text-halo-color': '#0a0e1a', 'text-halo-width': 1.5,
        'text-opacity': mDim(1, 0),
      }})

      // ── WIND LAYERS (Europe offshore wind) ─────────────────────────────────

      const filteredWindIds = new Set((filteredWindProjectsRef.current || []).map(w => w.id))

      map.addSource('wind-projects', {
        type: 'geojson',
        data: toWindGeoJSON(windProjectsRef.current || [], filteredWindIds),
      })

      const wDim = (nv, dv) => ['case', ['==', ['get', '_dimmed'], 1], dv, nv]

      map.addLayer({ id: 'hot-pulse-wind', type: 'circle', source: 'wind-projects',
        filter: ['all', ['==', ['get', '_hot'], 1], ['==', ['get', '_dimmed'], 0]],
        paint: {
          'circle-color': '#FF4500',
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 26, 6, 42, 10, 58],
          'circle-blur': 1.1, 'circle-stroke-width': 0, 'circle-opacity': 0.35,
        },
      })

      // Couleur signature éolien : fuchsia électrique (#e879f9) - inutilisée ailleurs.
      // Mêmes tailles et intensités de glow que les projets Oil & Gas.
      const WIND_COLOR = '#e879f9'
      const windAlpha = (a) => `rgba(232,121,249,${a})`

      map.addLayer({ id: 'wind-glow-outer', type: 'circle', source: 'wind-projects', paint: {
        'circle-color': windAlpha(0.08),
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 18, 6, 28, 10, 40],
        'circle-blur': 1, 'circle-stroke-width': 0, 'circle-opacity': wDim(1, 0.06),
      }})

      map.addLayer({ id: 'wind-glow-mid', type: 'circle', source: 'wind-projects', paint: {
        'circle-color': windAlpha(0.18),
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 10, 6, 16, 10, 24],
        'circle-blur': 0.6, 'circle-stroke-width': 0, 'circle-opacity': wDim(1, 0.06),
      }})

      map.addLayer({ id: 'wind-glow-inner', type: 'circle', source: 'wind-projects', paint: {
        'circle-color': windAlpha(0.35),
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 6, 6, 10, 10, 14],
        'circle-blur': 0.3, 'circle-stroke-width': 0, 'circle-opacity': wDim(1, 0.07),
      }})

      map.addLayer({ id: 'wind-points', type: 'circle', source: 'wind-projects', paint: {
        'circle-color': WIND_COLOR,
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 4, 6, 6, 10, 9],
        'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 2, 1, 6, 2],
        'circle-stroke-color': 'rgba(255,255,255,0.7)',
        'circle-opacity': wDim(1, 0.13), 'circle-stroke-opacity': wDim(0.7, 0.04),
      }})

      map.addLayer({ id: 'wind-labels', type: 'symbol', source: 'wind-projects', minzoom: 4, layout: {
        'text-field': ['get', 'name'], 'text-size': 10,
        'text-offset': [0, 1.6], 'text-anchor': 'top', 'text-optional': true, 'text-max-width': 14,
        'text-font': ['DIN Offc Pro Regular', 'Arial Unicode MS Regular'],
      }, paint: {
        'text-color': '#e879f9',
        'text-halo-color': '#070b16', 'text-halo-width': 1.5,
        'text-opacity': wDim(1, 0),
      }})

      // ── PORT LAYERS (Europe & Africa port construction) ────────────────────

      const filteredPortsIds = new Set((filteredPortsRef.current || []).map(po => po.id))

      map.addSource('ports-projects', {
        type: 'geojson',
        data: toPortsGeoJSON(portsRef.current || [], filteredPortsIds),
      })

      const pDim = (nv, dv) => ['case', ['==', ['get', '_dimmed'], 1], dv, nv]

      if (!map.hasImage('crane-icon')) {
        map.addImage('crane-icon', emojiImage('🏗️'), { pixelRatio: 2 })
      }

      map.addLayer({ id: 'ports-points', type: 'symbol', source: 'ports-projects', layout: {
        'icon-image': 'crane-icon',
        'icon-size': ['interpolate', ['linear'], ['zoom'], 2, 0.55, 6, 0.8, 10, 1.05],
        'icon-allow-overlap': true, 'icon-ignore-placement': true,
      }, paint: { 'icon-opacity': pDim(1, 0.15) }})

      map.addLayer({ id: 'ports-labels', type: 'symbol', source: 'ports-projects', minzoom: 4, layout: {
        'text-field': ['get', 'name'], 'text-size': 10,
        'text-offset': [0, 1.6], 'text-anchor': 'top', 'text-optional': true, 'text-max-width': 14,
        'text-font': ['DIN Offc Pro Regular', 'Arial Unicode MS Regular'],
      }, paint: {
        'text-color': ['get', 'header_color'],
        'text-halo-color': '#0a0e1a', 'text-halo-width': 1.5,
        'text-opacity': pDim(1, 0),
      }})

      // ── VESSELS LAYER (FABLE AIS) - petite icône simple, sans luminescence ─

      loadVesselIcon(map, 'ship-icon', '#cbd5e1')
      loadVesselIcon(map, 'ship-icon-alert', '#f59e0b')

      map.addSource('vessels', { type: 'geojson', data: vesselsGeoJSON() })

      map.addLayer({ id: 'vessel-icons', type: 'symbol', source: 'vessels', layout: {
        'icon-image': ['case', ['==', ['get', 'alert'], 1], 'ship-icon-alert', 'ship-icon'],
        'icon-size': ['interpolate', ['linear'], ['zoom'], 2, 0.55, 6, 0.8, 10, 1],
        'icon-allow-overlap': true, 'icon-ignore-placement': true,
      }})

      map.addLayer({ id: 'vessel-labels', type: 'symbol', source: 'vessels', minzoom: 4.5, layout: {
        'text-field': ['get', 'name'], 'text-size': 9.5,
        'text-offset': [0, 1.1], 'text-anchor': 'top', 'text-optional': true,
        'text-font': ['DIN Offc Pro Regular', 'Arial Unicode MS Regular'],
      }, paint: {
        'text-color': '#cbd5e1',
        'text-halo-color': '#070b16', 'text-halo-width': 1.3,
      }})

      // ── OIOS OFFSHORE ASSETS LAYERS ──
      map.addSource('oios-assets', { type: 'geojson', data: oiosAssetsGeoJSON() })
      
      map.addLayer({
        id: 'oios-asset-symbols',
        type: 'symbol',
        source: 'oios-assets',
        layout: {
          'text-field': ['case', ['==', ['get', 'type'], 'FPSO'], '▰', '▲'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 2, 12, 6, 16, 10, 20],
          'text-allow-overlap': true,
          'text-ignore-placement': true,
          'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
          'visibility': viewMode === 'oios' ? 'visible' : 'none'
        },
        paint: {
          'text-color': ['case', ['==', ['get', 'type'], 'FPSO'], '#f59e0b', '#a855f7'],
          'text-halo-color': '#070b16',
          'text-halo-width': 1.5
        }
      })

      map.addLayer({
        id: 'oios-asset-labels',
        type: 'symbol',
        source: 'oios-assets',
        minzoom: 4.5,
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 9.5,
          'text-offset': [0, 1.2],
          'text-anchor': 'top',
          'text-optional': true,
          'text-font': ['DIN Offc Pro Regular', 'Arial Unicode MS Regular'],
          'visibility': viewMode === 'oios' ? 'visible' : 'none'
        },
        paint: {
          'text-color': '#e2e8f0',
          'text-halo-color': '#070b16',
          'text-halo-width': 1.3
        }
      })

      // ── OIOS TRANSIT LINES LAYERS ──
      map.addSource('oios-transits', { type: 'geojson', data: oiosTransitsGeoJSON() })

      map.addLayer({
        id: 'oios-transit-lines-casing',
        type: 'line',
        source: 'oios-transits',
        layout: {
          'visibility': viewMode === 'oios' ? 'visible' : 'none'
        },
        paint: {
          'line-color': '#f97316',
          'line-width': 6,
          'line-opacity': 0.1
        }
      })

      map.addLayer({
        id: 'oios-transit-lines',
        type: 'line',
        source: 'oios-transits',
        layout: {
          'visibility': viewMode === 'oios' ? 'visible' : 'none'
        },
        paint: {
          'line-color': '#f97316',
          'line-width': 2,
          'line-dasharray': [3, 3],
          'line-opacity': 0.8
        }
      })

      // ── OIOS DARK AIS (GHOST TARGETS) ──
      map.addSource('sar-overlay', { type: 'geojson', data: worldPolygonGeoJSON() })
      map.addLayer({
        id: 'sar-overlay-layer',
        type: 'fill',
        source: 'sar-overlay',
        layout: {
          'visibility': sarModeActive ? 'visible' : 'none'
        },
        paint: {
          'fill-color': '#03120b',
          'fill-opacity': 0.55
        }
      }, 'points')

      map.addSource('oios-ghosts', { type: 'geojson', data: oiosGhostGeoJSON() })
      map.addLayer({
        id: 'oios-ghost-pulses',
        type: 'circle',
        source: 'oios-ghosts',
        layout: {
          'visibility': sarModeActive ? 'visible' : 'none'
        },
        paint: {
          'circle-radius': 15,
          'circle-color': '#10b981',
          'circle-opacity': 0.25,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#10b981'
        }
      })

      map.addLayer({
        id: 'oios-ghost-symbols',
        type: 'circle',
        source: 'oios-ghosts',
        layout: {
          'visibility': sarModeActive ? 'visible' : 'none'
        },
        paint: {
          'circle-radius': 6,
          'circle-color': '#10b981',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      })

      // ── OIOS BARGE TRANSIT LAYERS ──
      map.addSource('barge-transits', { type: 'geojson', data: bargeTransitGeoJSON(null) })
      map.addLayer({
        id: 'barge-transit-lines-casing',
        type: 'line',
        source: 'barge-transits',
        layout: {
          'visibility': viewMode === 'oios' ? 'visible' : 'none'
        },
        paint: {
          'line-color': '#e879f9',
          'line-width': 6,
          'line-opacity': 0.12
        }
      })
      map.addLayer({
        id: 'barge-transit-lines',
        type: 'line',
        source: 'barge-transits',
        layout: {
          'visibility': viewMode === 'oios' ? 'visible' : 'none'
        },
        paint: {
          'line-color': '#e879f9',
          'line-width': 3,
          'line-dasharray': [4, 4],
          'line-opacity': 0.85
        }
      })

      // ── HOT PULSE ANIMATION ────────────────────────────────────────────────

      const dashSeq = [
        [0, 4, 3], [0.5, 4, 2.5], [1, 4, 2], [1.5, 4, 1.5], [2, 4, 1], [2.5, 4, 0.5], [3, 4, 0],
        [0, 0.5, 3, 3.5], [0, 1, 3, 3], [0, 1.5, 3, 2.5], [0, 2, 3, 2], [0, 2.5, 3, 1.5], [0, 3, 3, 1], [0, 3.5, 3, 0.5],
      ]
      let lastDashStep = -1

      const pulse = () => {
        const now = Date.now()
        const opacity = 0.12 + 0.28 * (0.5 + 0.5 * Math.sin(now / 700))
        const dashStep = Math.floor(now / 80) % dashSeq.length
        const ghostPulseRadius = 10 + 15 * (0.5 + 0.5 * Math.sin(now / 500))
        const ghostPulseOpacity = 0.6 * (1.0 - (ghostPulseRadius - 10) / 15)
        try {
          if (map.getLayer('hot-pulse-offshore')) map.setPaintProperty('hot-pulse-offshore', 'circle-opacity', opacity)
          if (map.getLayer('hot-pulse-wind')) map.setPaintProperty('hot-pulse-wind', 'circle-opacity', opacity)
          if (map.getLayer('oios-ghost-pulses')) {
            map.setPaintProperty('oios-ghost-pulses', 'circle-radius', ghostPulseRadius)
            map.setPaintProperty('oios-ghost-pulses', 'circle-opacity', ghostPulseOpacity)
          }
          if (dashStep !== lastDashStep && map.getLayer('epci-links')) {
            map.setPaintProperty('epci-links', 'line-dasharray', dashSeq[dashStep])
            lastDashStep = dashStep
          }
        } catch (_) {}
        raf = requestAnimationFrame(pulse)
      }
      pulse()

      // ── OFFSHORE EVENTS ────────────────────────────────────────────────────

      map.on('click', 'points', (e) => {
        const id = e.features[0].properties.id
        const project = projectsRef.current.find((p) => p.id === id)
        if (!project) return
        popupRef.current
          .setLngLat(e.features[0].geometry.coordinates.slice())
          .setHTML(popupHTML(project))
          .addTo(map)
        onSelectRef.current(project)
      })

      map.on('mouseenter', 'points', (e) => {
        map.getCanvas().style.cursor = 'pointer'
        map.setPaintProperty('points', 'circle-stroke-width', [
          'interpolate', ['linear'], ['zoom'],
          2, ['case', ['==', ['get', 'id'], e.features[0].properties.id], 2, 1],
          6, ['case', ['==', ['get', 'id'], e.features[0].properties.id], 3, 2],
        ])
      })
      map.on('mouseleave', 'points', () => {
        map.getCanvas().style.cursor = ''
        map.setPaintProperty('points', 'circle-stroke-width',
          ['interpolate', ['linear'], ['zoom'], 2, 1, 6, 2])
      })

      // ── MINING EVENTS ──────────────────────────────────────────────────────

      map.on('click', 'mining-points', (e) => {
        const id = e.features[0].properties.id
        const terminal = miningTerminalsRef.current.find((t) => t.id === id)
        if (!terminal) return
        popupRef.current
          .setLngLat(e.features[0].geometry.coordinates.slice())
          .setHTML(boluadPopupHTML(terminal))
          .addTo(map)
        onSelectRef.current(terminal)
      })

      map.on('mouseenter', 'mining-points', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'mining-points', () => { map.getCanvas().style.cursor = '' })

      // ── EPCI HUB EVENTS ────────────────────────────────────────────────────

      map.on('click', 'epci-hubs-symbol', (e) => {
        const cid = e.features[0].properties.id
        const contractor = epciData.find((c) => c.id === cid)
        if (!contractor) return
        popupRef.current
          .setLngLat(e.features[0].geometry.coordinates.slice())
          .setHTML(epciPopupHTML(contractor))
          .addTo(map)
      })

      map.on('mouseenter', 'epci-hubs-symbol', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'epci-hubs-symbol', () => { map.getCanvas().style.cursor = '' })

      // ── WIND EVENTS ────────────────────────────────────────────────────────

      map.on('click', 'wind-points', (e) => {
        const id = e.features[0].properties.id
        const wind = (windProjectsRef.current || []).find((w) => w.id === id)
        if (!wind) return
        popupRef.current
          .setLngLat(e.features[0].geometry.coordinates.slice())
          .setHTML(boluadPopupHTML(wind))
          .addTo(map)
        onSelectRef.current(wind)
      })

      map.on('mouseenter', 'wind-points', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'wind-points', () => { map.getCanvas().style.cursor = '' })

      // ── PORT EVENTS ────────────────────────────────────────────────────────

      map.on('click', 'ports-points', (e) => {
        const id = e.features[0].properties.id
        const port = (portsRef.current || []).find((p) => p.id === id)
        if (!port) return
        popupRef.current
          .setLngLat(e.features[0].geometry.coordinates.slice())
          .setHTML(boluadPopupHTML(port))
          .addTo(map)
        onSelectRef.current(port)
      })

      map.on('mouseenter', 'ports-points', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'ports-points', () => { map.getCanvas().style.cursor = '' })

      // ── COMPETITOR EVENTS ──────────────────────────────────────────────────

      map.on('click', 'competitors-symbol', (e) => {
        const cid = e.features[0].properties.id
        const competitor = competitorsData.find((c) => c.id === cid)
        if (!competitor) return
        popupRef.current
          .setLngLat(e.features[0].geometry.coordinates.slice())
          .setHTML(competitorPopupHTML(competitor))
          .addTo(map)
      })

      map.on('mouseenter', 'competitors-symbol', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'competitors-symbol', () => { map.getCanvas().style.cursor = '' })

      // ── VESSEL EVENTS ──────────────────────────────────────────────────────

      map.on('click', 'vessel-icons', (e) => {
        const idx = e.features[0].properties.idx
        const vessel = vesselsData.vessels[idx]
        if (!vessel) return
        popupRef.current
          .setLngLat(e.features[0].geometry.coordinates.slice())
          .setHTML(vesselPopupHTML(vessel))
          .addTo(map)
      })

      map.on('mouseenter', 'vessel-icons', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'vessel-icons', () => { map.getCanvas().style.cursor = '' })

      // ── OIOS EVENTS ────────────────────────────────────────────────────────

      map.on('click', 'oios-asset-symbols', (e) => {
        const id = e.features[0].properties.id
        const asset = oiosData.oios_offshore_assets.find(a => a.id === id)
        if (!asset) return
        popupRef.current
          .setLngLat(e.features[0].geometry.coordinates.slice())
          .setHTML(oiosAssetPopupHTML(asset))
          .addTo(map)
      })

      map.on('mouseenter', 'oios-asset-symbols', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'oios-asset-symbols', () => { map.getCanvas().style.cursor = '' })

      // ── OIOS GHOST EVENTS ──
      map.on('click', 'oios-ghost-symbols', (e) => {
        const idx = e.features[0].properties.idx
        const target = oiosGhostTargets[idx]
        if (!target) return
        popupRef.current
          .setLngLat(e.features[0].geometry.coordinates.slice())
          .setHTML(ghostPopupHTML(target))
          .addTo(map)
        
        onSelectRef.current({
          id: target.id,
          name: target.name,
          lat: target.coords[0],
          lng: target.coords[1],
          signature: target.signature,
          speed: target.speed,
          heading: target.heading,
          status: target.status,
          inference: target.inference,
          kind: 'ghost'
        })
      })

      map.on('mouseenter', 'oios-ghost-symbols', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'oios-ghost-symbols', () => { map.getCanvas().style.cursor = '' })

      map.on('click', 'oios-transit-lines', (e) => {
        const name = e.features[0].properties.name
        const prediction = oiosData.oios_predictions.find(p => p.name === name)
        if (!prediction) return
        popupRef.current
          .setLngLat(e.lngLat)
          .setHTML(`
            <div class="popup-container">
              <div class="popup-header" style="border-left: 3px solid #f97316">
                <div class="popup-title">Transit Prédictif : ${escHtml(prediction.name)}</div>
                <div class="popup-country">Probabilité : ${prediction.probability}%</div>
              </div>
              <div class="popup-tab-panel popup-panel-details popup-details" style="display:flex; flex-direction:column; gap:4px; font-size:12px; color:#cbd5e1">
                <div class="popup-row"><span class="popup-label">Destination</span><span class="popup-value">${escHtml(prediction.destination)}</span></div>
                <div class="popup-row"><span class="popup-label">Départ Estimé</span><span class="popup-value">${escHtml(prediction.departure)}</span></div>
                <div class="popup-row"><span class="popup-label">Raison</span><span class="popup-value" style="font-size:11px">${escHtml(prediction.reason)}</span></div>
                <div class="popup-row"><span class="popup-label">Impact Commercial</span><span class="popup-value" style="font-size:11px;color:#f97316">${escHtml(prediction.impact)}</span></div>
              </div>
            </div>
          `)
          .addTo(map)
      })

      map.on('mouseenter', 'oios-transit-lines', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'oios-transit-lines', () => { map.getCanvas().style.cursor = '' })

      // ── EMPTY MAP CLICK ────────────────────────────────────────────────────

      map.on('click', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['points', 'mining-points', 'wind-points', 'ports-points', 'epci-hubs-symbol', 'competitors-symbol', 'vessel-icons', 'oios-asset-symbols', 'oios-transit-lines', 'oios-ghost-symbols'] })
        if (!features.length) {
          popup.remove()
          onSelectRef.current(null)
        }
      })
    })

    mapRef.current = map
    return () => {
      if (raf) cancelAnimationFrame(raf)
      map.remove()
      mapRef.current = null
      loadedRef.current = false
    }
  }, [])

  // Update offshore + blue-ocean sources when filters or War Room timeline change
  useEffect(() => {
    if (!loadedRef.current || !mapRef.current) return
    const warRoom = timelineOffset !== null && timelineOffset !== undefined
    const refTotal = REF_TOTAL + (warRoom ? timelineOffset : 0)
    const source = mapRef.current.getSource('projects')
    if (source) source.setData(toGeoJSON(projects, filteredIds, refTotal, warRoom))
    const oceanSource = mapRef.current.getSource('blue-ocean')
    if (oceanSource) oceanSource.setData(blueOceanGeoJSON(projects, refTotal))
  }, [projects, filteredIds, timelineOffset])

  // Update mining source when filter or timeline changes
  useEffect(() => {
    if (!loadedRef.current || !mapRef.current) return
    const source = mapRef.current.getSource('mining-terminals')
    if (!source) return
    const refTotal = REF_TOTAL + (timelineOffset ?? 0)
    const ids = new Set((filteredMiningTerminals || miningTerminals).map(t => t.id))
    source.setData(toMiningGeoJSON(miningTerminals, ids, refTotal))
  }, [miningTerminals, filteredMiningTerminals, timelineOffset])

  // Update wind source when filter or timeline changes
  useEffect(() => {
    if (!loadedRef.current || !mapRef.current) return
    const source = mapRef.current.getSource('wind-projects')
    if (!source) return
    const refTotal = REF_TOTAL + (timelineOffset ?? 0)
    const ids = new Set((filteredWindProjects || windProjects || []).map(w => w.id))
    source.setData(toWindGeoJSON(windProjects || [], ids, refTotal))
  }, [windProjects, filteredWindProjects, timelineOffset])

  // Update ports source when filter or timeline changes
  useEffect(() => {
    if (!loadedRef.current || !mapRef.current) return
    const source = mapRef.current.getSource('ports-projects')
    if (!source) return
    const refTotal = REF_TOTAL + (timelineOffset ?? 0)
    const ids = new Set((filteredPorts || ports || []).map(po => po.id))
    source.setData(toPortsGeoJSON(ports || [], ids, refTotal))
  }, [ports, filteredPorts, timelineOffset])

  // EPCI connection lines follow the selected project
  useEffect(() => {
    if (!loadedRef.current || !mapRef.current) return
    const source = mapRef.current.getSource('epci-links')
    if (source) source.setData(epciLinksGeoJSON(selectedProject))
  }, [selectedProject])

  // Fly to & open popup for selected feature
  useEffect(() => {
    if (!selectedProject || !loadedRef.current || !mapRef.current) return
    const map = mapRef.current
    const { lng, lat } = selectedProject

    map.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 7), duration: 900, essential: true })

    setTimeout(() => {
      if (!mapRef.current) return
      const html = selectedProject.map_popup_interface
        ? boluadPopupHTML(selectedProject)
        : popupHTML(selectedProject)
      popupRef.current.setLngLat([lng, lat]).setHTML(html).addTo(mapRef.current)
    }, 100)
  }, [selectedProject])

  // Toggle visibility of OIOS layers
  useEffect(() => {
    if (!loadedRef.current || !mapRef.current) return
    const map = mapRef.current
    const visibility = viewMode === 'oios' ? 'visible' : 'none'
    const oiosLayers = ['oios-asset-symbols', 'oios-asset-labels', 'oios-transit-lines', 'oios-transit-lines-casing', 'barge-transit-lines', 'barge-transit-lines-casing']
    oiosLayers.forEach(l => {
      if (map.getLayer(l)) map.setLayoutProperty(l, 'visibility', visibility)
    })

    // Auto-disable SAR when leaving OIOS view mode
    if (viewMode !== 'oios' && sarModeActive) {
      onSarToggle(false)
    }
  }, [viewMode])

  // Toggle visibility of SAR layers
  useEffect(() => {
    if (!loadedRef.current || !mapRef.current) return
    const map = mapRef.current
    const visibility = sarModeActive ? 'visible' : 'none'
    
    if (map.getLayer('sar-overlay-layer')) map.setLayoutProperty('sar-overlay-layer', 'visibility', visibility)
    if (map.getLayer('oios-ghost-pulses')) map.setLayoutProperty('oios-ghost-pulses', 'visibility', visibility)
    if (map.getLayer('oios-ghost-symbols')) map.setLayoutProperty('oios-ghost-symbols', 'visibility', visibility)
  }, [sarModeActive])

  // Highlight selected prediction path
  useEffect(() => {
    if (!loadedRef.current || !mapRef.current) return
    const map = mapRef.current
    if (map.getLayer('oios-transit-lines')) {
      if (selectedPrediction) {
        map.setPaintProperty('oios-transit-lines', 'line-width', [
          'case',
          ['==', ['get', 'name'], selectedPrediction.name],
          4,
          2
        ])
        map.setPaintProperty('oios-transit-lines', 'line-opacity', [
          'case',
          ['==', ['get', 'name'], selectedPrediction.name],
          1.0,
          0.2
        ])
      } else {
        map.setPaintProperty('oios-transit-lines', 'line-width', 2)
        map.setPaintProperty('oios-transit-lines', 'line-opacity', 0.8)
      }
    }
  }, [selectedPrediction])

  // Update and draw selected barge transit line
  useEffect(() => {
    if (!loadedRef.current || !mapRef.current) return
    const map = mapRef.current
    const source = map.getSource('barge-transits')
    if (source) {
      source.setData(bargeTransitGeoJSON(selectedBargeHypothesis))
    }

    if (selectedBargeHypothesis) {
      const { origin_coords, coords } = selectedBargeHypothesis
      const bounds = new maplibregl.LngLatBounds()
      bounds.extend([origin_coords[1], origin_coords[0]])
      bounds.extend([coords[1], coords[0]])
      
      map.fitBounds(bounds, {
        padding: 80,
        maxZoom: 5,
        duration: 1200
      })
      
      setTimeout(() => {
        if (!mapRef.current) return
        const html = `
          <div class="popup-container" style="border-top: 3px solid #e879f9">
            <div class="popup-header">
              <span class="popup-type-icon" style="color:#e879f9">🏗️</span>
              <div>
                <div class="popup-title">${escHtml(selectedBargeHypothesis.title)}</div>
                <div class="popup-subtitle" style="color:#e879f9; font-weight:700; font-size: 0.65rem;">HYPOTHÈSE DE MOBILISATION</div>
              </div>
            </div>
            <div class="popup-tab-panel" style="display:flex; flex-direction:column; padding: 12px; font-size: 0.75rem; color:#cbd5e1; gap: 4px;">
              <div><strong>Barge / Asset :</strong> ${escHtml(selectedBargeHypothesis.barge_type)}</div>
              <div><strong>Capacité :</strong> ${escHtml(selectedBargeHypothesis.capacity)}</div>
              <div><strong>Origine :</strong> ${escHtml(selectedBargeHypothesis.origin)} ➔ <strong>Destination :</strong> ${escHtml(selectedBargeHypothesis.country)}</div>
              <div><strong>Bollard Pull :</strong> ${escHtml(selectedBargeHypothesis.bp_required)}</div>
              <div style="margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px; color: #e879f9; line-height: 1.3;">
                <strong>💡 Recommandation Boluda :</strong> Assister le positionnement avec <strong>${escHtml(selectedBargeHypothesis.matched_vessels)}</strong>. Probabilité d'activation commerciale : <strong>${selectedBargeHypothesis.probability}%</strong>.
              </div>
            </div>
          </div>
        `
        popupRef.current.setLngLat([coords[1], coords[0]]).setHTML(html).addTo(mapRef.current)
      }, 300)
    }
  }, [selectedBargeHypothesis])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} className="map-container" />
      {viewMode === 'oios' && (
        <button
          onClick={() => onSarToggle(!sarModeActive)}
          className={`sar-toggle-btn${sarModeActive ? ' active' : ''}`}
          style={{
            position: 'absolute',
            top: '80px',
            left: '12px',
            zIndex: 10,
            padding: '8px 12px',
            background: sarModeActive ? '#10b981' : '#070b16',
            border: '1px solid ' + (sarModeActive ? '#10b981' : '#3b82f6'),
            color: '#fff',
            borderRadius: '6px',
            fontSize: '0.7rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: sarModeActive ? '0 0 15px rgba(16, 185, 129, 0.6)' : '0 0 10px rgba(59, 130, 246, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
        >
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#fff', animation: sarModeActive ? 'spin 1.5s infinite linear' : 'none' }}>⚡</span>
          {sarModeActive ? '📡 MODE RADAR (SAR) : ACTIF' : '📡 BALAYAGE RADAR SATELLITE (SAR)'}
        </button>
      )}
    </div>
  )
}
