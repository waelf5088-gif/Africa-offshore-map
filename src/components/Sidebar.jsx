import { useState, useMemo, useCallback } from 'react'
import { rigFor } from '../intel'
import oiosData from '../data/oios_data.json'
import vesselsData from '../data/vessels.json'
import bargeFlotelIntel from '../data/barge_flotel_intel.json'
import dailyQueue from '../data/daily_queue.json'
import linkedinHistory from '../data/linkedin_history.json'
import projectsData from '../data/projects.json'


const oiosGhostTargets = [
  {
    id: 'ghost_angola',
    name: 'Cible Fantôme G-1 (Angola)',
    coords: [-5.4, 11.2],
    signature: 'AHTS ~180t BP (Bourbon/Maersk?)',
    speed: '14.2 nds',
    heading: '210° (SO)',
    status: 'Activité suspecte',
    inference: '⚠️ Suspicion d\'assistance logistique et de ravitaillement opérationnel pour le Rig Benguela Belize. Probabilité d\'activité non déclarée : 87%.'
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

const STATUS_COLORS = {
  Production: '#84cc16',
  Construction: '#22c55e',
  Development: '#3b82f6',
  'Pre-FID': '#06b6d4',
  Appraisal: '#f97316',
  Exploration: '#a855f7',
  Navire: '#cbd5e1',
}

const ALL_STATUSES = ['Production', 'Construction', 'Development', 'Pre-FID', 'Appraisal', 'Exploration', 'Navire']
const ALL_TYPES = ['Oil', 'Gas', 'LNG', 'Mining', 'Wind']
const TYPE_COLORS = { Oil: '#f0a500', Gas: '#22c55e', LNG: '#06b6d4', Mining: '#f97316', Wind: '#e879f9' }

const KEY_ASSET_TYPES = new Set(['FPSO', 'FLNG', 'Jack-up', 'Drillship'])
const ASSET_ICONS = { FPSO: '▣', FLNG: '◈', 'Jack-up': '◧', Drillship: '◉' }
const getKeyAssets = (p) => {
  const assets = p.marine_assets || p.map_popup_interface?.tabs_content?.assets || []
  return assets.filter((a) => KEY_ASSET_TYPES.has(a.type)).slice(0, 2)
}

const URGENCY_TAGS = [
  { tag: 'has_tenders', label: "Appels d'offres actifs" },
  { tag: 'enriched', label: 'Données enrichies' },
]

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

function SearchIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
      <path d="M1 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronLeft() {
  return (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
      <path d="M7 1L1 7l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function OffshoreIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" />
      <line x1="12" y1="3" x2="12" y2="7" /><line x1="12" y1="17" x2="12" y2="21" />
      <line x1="3" y1="12" x2="7" y2="12" /><line x1="17" y1="12" x2="21" y2="12" />
    </svg>
  )
}

function WindIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
    </svg>
  )
}

function MiningIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="2" y1="8.5" x2="22" y2="8.5" />
    </svg>
  )
}

function PortIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 21h18M6 21V7l5-4 5 4v14M9 9h6M9 13h6M9 17h6" />
    </svg>
  )
}

const SUGGESTION_TYPES = {
  project: { color: '#3b82f6', label: 'P' },
  mining: { color: '#f97316', label: 'M' },
  wind: { color: '#e879f9', label: 'W' },
  port: { color: '#00f0ff', label: 'Pt' },
  country: { color: '#06b6d4', label: 'C' },
  operator: { color: '#f0a500', label: 'O' },
}

export default function Sidebar({
  projects,
  filteredProjects,
  miningTerminals,
  windProjects,
  ports,
  selectedProject,
  onProjectSelect,
  search,
  onSearch,
  filters,
  onFilter,
  isOpen,
  onToggle,
  viewMode,
  setViewMode,
  selectedPrediction,
  setSelectedPrediction,
  sarModeActive,
  setSarModeActive,
  selectedBargeHypothesis,
  onBargeHypothesisSelect,
}) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(380)
  const [isResizing, setIsResizing] = useState(false)
  
  // OIOS states
  const [prospectingOpen, setProspectingOpen] = useState(true)
  const [activeVesselCategory, setActiveVesselCategory] = useState('all')
  const [fleetExpanded, setFleetExpanded] = useState(false)
  const [valueChainExpanded, setValueChainExpanded] = useState(false)
  const [portalMonitorExpanded, setPortalMonitorExpanded] = useState(false)
  const [selectedOiosOpportunity, setSelectedOiosOpportunity] = useState(null)
  const [activeCrawlerSim, setActiveCrawlerSim] = useState(false)
  const [crawlerSimLog, setCrawlerSimLog] = useState([])
  const [autoRfqExpanded, setAutoRfqExpanded] = useState(false)
  const [flareRadarExpanded, setFlareRadarExpanded] = useState(false)
  const [socialExpanded, setSocialExpanded] = useState(false)
  const [cabotageExpanded, setCabotageExpanded] = useState(false)
  const [shadowBidExpanded, setShadowBidExpanded] = useState(false)
  const [rfqSlider, setRfqSlider] = useState(50)
  const [shadowBidDone, setShadowBidDone] = useState(false)
  const [shadowBidSimulating, setShadowBidSimulating] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(null)

  // OSINT Correlation States
  const [isCorrelating, setIsCorrelating] = useState(false)
  const [correlationStep, setCorrelationStep] = useState(0)
  const [correlationDone, setCorrelationDone] = useState(false)

  // Barge & Flotel sorting state
  const [selectedOiosCountry, setSelectedOiosCountry] = useState('all')

  // Interactive AI Bar states
  const [aiQuery, setAiQuery] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState(null)
  const [aiActivePrompt, setAiActivePrompt] = useState('')

  const handleAiQuerySubmit = useCallback((query) => {
    if (!query || !query.trim()) return
    setAiLoading(true)
    setAiResponse(null)
    setAiActivePrompt(query)
    
    // Simulate AI response delay (1.2 seconds)
    setTimeout(() => {
      setAiLoading(false)
      const q = query.toLowerCase()
      if (q.includes('dispo') || q.includes('flot') || q.includes('navire') || q.includes('vessel')) {
        setAiResponse({
          title: "Analyse Disponibilité Flotte",
          text: "Actuellement, 17 navires sur 86 sont affrétés (MSI à 19%). Il y a une forte disponibilité d'AHTS lourds (>150t BP) en Angola (GH Atlantis, Greatship Vimla), mais les tensions augmentent sur les remorqueurs de port au Nigeria. Le marché de Walvis Bay se contracte rapidement."
        })
      } else if (q.includes('barge') || q.includes('flotel') || q.includes('transit') || q.includes('remorque')) {
        setAiResponse({
          title: "Surveillance Transits & Barges",
          text: "Détection de 6 transits de barges/flotels en cours. L'inférence SAR montre 3 mouvements suspects non déclarés (cibles fantômes G-1, G-2, G-3) naviguant sans AIS en Angola, au Nigeria et en Namibie. Action recommandée : positionner en priorité nos remorqueurs d'escorte."
        })
      } else if (q.includes('météo') || q.includes('tempête') || q.includes('risque') || q.includes('collision')) {
        setAiResponse({
          title: "Évaluation des Risques Maritimes",
          text: "Alerte météo : conditions de houle difficile en cours dans l'Orange Basin (Namibie). Les calculs hydrodynamiques de tension de ligne prévoient des pics à 380 kN pour les barges d'assistance sur le projet Venus. Risque de collision estimé à 14%."
        })
      } else {
        setAiResponse({
          title: "Renseignement Logistique IA",
          text: "Le projet deepwater Venus (TotalEnergies, Namibie) progresse vers sa FID mi-2026. Les forages d'appréciation du rig Deepsea Mira indiquent un volume accru. Nous conseillons d'approcher l'opérateur avec le Topaz Master (87T BP, Angola) pour son transit SPS."
        })
      }
    }, 1200)
  }, [])


  const startCorrelation = () => {
    setIsCorrelating(true)
    setCorrelationStep(0)
    setCorrelationDone(false)
    
    // Step 1: NLP Entity extraction
    setTimeout(() => {
      setCorrelationStep(1)
      
      // Step 2: Bayesian Probability network calculation
      setTimeout(() => {
        setCorrelationStep(2)
        
        // Step 3: Done and reveal
        setTimeout(() => {
          setCorrelationStep(3)
          setIsCorrelating(false)
          setCorrelationDone(true)
          
          // Auto-select the Valaris DS-12 prediction to trigger the map path drawing
          const ds12Pred = oiosData.oios_predictions.find(p => p.name === 'Valaris DS-12')
          if (ds12Pred) {
            handlePredictionClick(ds12Pred)
          }
        }, 800)
      }, 800)
    }, 800)
  }
  
  const resetCorrelation = () => {
    setIsCorrelating(false)
    setCorrelationStep(0)
    setCorrelationDone(false)
    setSelectedPrediction(null)
  }

  const queueProjectName = useMemo(() => {
    const projId = dailyQueue.project_id
    if (!projId) return ''
    const proj = projectsData.find(p => p.id === projId)
    return proj ? proj.name : projId
  }, [])

  const queueLeads = useMemo(() => {
    return dailyQueue.leads || []
  }, [])

  const contactedLeads = useMemo(() => {
    return Array.isArray(linkedinHistory) ? linkedinHistory : []
  }, [])

  const filteredTenders = useMemo(() => {
    const list = oiosData.oios_briefing.tenders || []
    if (selectedOiosCountry === 'all') return list
    if (selectedOiosCountry === 'Gabon') {
      return list.filter(t => t.location.toLowerCase().includes('gabon') || t.location.toLowerCase().includes('congo'))
    }
    return list.filter(t => t.location.toLowerCase().includes(selectedOiosCountry.toLowerCase()))
  }, [selectedOiosCountry])

  const filteredPredictions = useMemo(() => {
    const list = oiosData.oios_predictions || []
    if (selectedOiosCountry === 'all') return list
    if (selectedOiosCountry === 'Gabon') {
      return list.filter(p => p.destination.toLowerCase().includes('gabon') || p.destination.toLowerCase().includes('congo') || p.reason.toLowerCase().includes('gabon') || p.reason.toLowerCase().includes('congo'))
    }
    return list.filter(p => p.destination.toLowerCase().includes(selectedOiosCountry.toLowerCase()) || p.reason.toLowerCase().includes(selectedOiosCountry.toLowerCase()))
  }, [selectedOiosCountry])

  const filteredBargeHypotheses = useMemo(() => {
    const list = bargeFlotelIntel.hypotheses || []
    if (selectedOiosCountry === 'all') return list
    if (selectedOiosCountry === 'Gabon') {
      return list.filter(h => h.country.toLowerCase() === 'gabon' || h.country.toLowerCase() === 'congo')
    }
    return list.filter(h => h.country.toLowerCase() === selectedOiosCountry.toLowerCase())
  }, [selectedOiosCountry])


  const startResize = useCallback((e) => {
    e.preventDefault()
    setIsResizing(true)
    const onMove = (mv) => setSidebarWidth(Math.max(260, Math.min(600, mv.clientX)))
    const onUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [])

  const countries = useMemo(
    () => [...new Set(projects.map((p) => p.country))].sort(),
    [projects]
  )

  const operators = useMemo(
    () => [...new Set(projects.map((p) => p.operator))].sort(),
    [projects]
  )

  const suggestions = useMemo(() => {
    if (!search || search.length < 2) return []
    const q = search.toLowerCase()

    const matchedProjects = projects
      .filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.block_location && p.block_location.toLowerCase().includes(q)) ||
        (p.marine_assets && p.marine_assets.some(
          (a) => a.name.toLowerCase().includes(q) || a.type.toLowerCase().includes(q)
        ))
      ).slice(0, 4)
      .map((p) => ({ kind: 'project', label: p.name, sub: `${p.country} · ${p.operator}`, item: p }))

    const matchedMining = (miningTerminals || [])
      .filter((t) =>
        t.terminal_name.toLowerCase().includes(q) ||
        t.commodity.toLowerCase().includes(q) ||
        t.country.toLowerCase().includes(q) ||
        t.operator.toLowerCase().includes(q)
      ).slice(0, 3)
      .map((t) => ({ kind: 'mining', label: t.terminal_name, sub: `${t.country} · ${t.commodity}`, item: t }))

    const matchedWind = (windProjects || [])
      .filter((w) =>
        w.name.toLowerCase().includes(q) ||
        w.country.toLowerCase().includes(q) ||
        w.operator.toLowerCase().includes(q)
      ).slice(0, 3)
      .map((w) => ({ kind: 'wind', label: w.name, sub: `${w.country} · ${w.capacity_mw} MW`, item: w }))

    const matchedPorts = (ports || [])
      .filter((po) =>
        po.name.toLowerCase().includes(q) ||
        po.country.toLowerCase().includes(q) ||
        po.operator.toLowerCase().includes(q)
      ).slice(0, 3)
      .map((po) => ({ kind: 'port', label: po.name, sub: `${po.country} · ${po.operator}`, item: po }))

    const seenCountries = new Set()
    const matchedCountries = projects
      .filter((p) => {
        if (p.country.toLowerCase().includes(q) && !seenCountries.has(p.country)) {
          seenCountries.add(p.country)
          return true
        }
        return false
      }).slice(0, 3)
      .map((p) => ({ kind: 'country', label: p.country, sub: 'Filtrer par pays', item: null }))

    const seenOps = new Set()
    const matchedOperators = projects
      .filter((p) => {
        if (p.operator.toLowerCase().includes(q) && !seenOps.has(p.operator)) {
          seenOps.add(p.operator)
          return true
        }
        return false
      }).slice(0, 2)
      .map((p) => ({ kind: 'operator', label: p.operator, sub: 'Filtrer par opérateur', item: null }))

    return [...matchedProjects, ...matchedMining, ...matchedWind, ...matchedPorts, ...matchedCountries, ...matchedOperators]
  }, [search, projects, miningTerminals, windProjects, ports])

  const hasActiveFilters =
    filters.statuses.length > 0 ||
    filters.types.length > 0 ||
    filters.countries.length > 0 ||
    filters.operators.length > 0 ||
    (filters.urgencyTags?.length ?? 0) > 0 ||
    search.length > 0

  const toggleChip = (key, value) => {
    onFilter((prev) => {
      const arr = prev[key] || []
      return { ...prev, [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] }
    })
  }

  const resetFilters = () => {
    onSearch('')
    onFilter({ statuses: [], types: [], countries: [], operators: [], urgencyTags: [] })
  }

  const handleCountryChange = (e) => {
    const selected = [...e.target.selectedOptions].map((o) => o.value)
    onFilter((prev) => ({ ...prev, countries: selected }))
  }

  const handleOperatorChange = (e) => {
    const selected = [...e.target.selectedOptions].map((o) => o.value)
    onFilter((prev) => ({ ...prev, operators: selected }))
  }

  const handleSuggestionClick = (s) => {
    setShowSuggestions(false)
    onSearch('')
    if (s.kind === 'project' || s.kind === 'mining' || s.kind === 'wind' || s.kind === 'port') {
      onProjectSelect(s.item)
    } else if (s.kind === 'country') {
      onFilter((prev) => ({
        ...prev,
        countries: prev.countries.includes(s.label) ? prev.countries : [...prev.countries, s.label],
      }))
    } else if (s.kind === 'operator') {
      onFilter((prev) => ({
        ...prev,
        operators: prev.operators.includes(s.label) ? prev.operators : [...prev.operators, s.label],
      }))
    }
  }

  const triggerCrawlerSim = useCallback(() => {
    setActiveCrawlerSim(true)
    setCrawlerSimLog([])
    
    const logs = [
      { time: '09:45:00', portal: 'System', msg: 'Démarrage du swarm d\'extraction visuel sur 4 portails...' },
      { time: '09:45:02', portal: 'NipeX', msg: 'NipeX: Changement de structure HTML détecté. Sélecteur de bouton login manquant.' },
      { time: '09:45:04', portal: 'NipeX', msg: 'Gemini Vision: Analyse de capture d\'écran... Bouton LOGIN repéré visuellement à [x: 412, y: 720].' },
      { time: '09:45:06', portal: 'NipeX', msg: 'NipeX: Connexion réussie via clic coordonné. Session cookies rafraîchis.' },
      { time: '09:45:08', portal: 'ANPG', msg: 'ANPG: Connexion établie. Session authentifiée.' },
      { time: '09:45:10', portal: 'System', msg: 'Mise à jour de la base de données terminée.' }
    ]
    
    logs.forEach((log, index) => {
      setTimeout(() => {
        setCrawlerSimLog(prev => [...prev, log])
        if (index === logs.length - 1) {
          setActiveCrawlerSim(false)
        }
      }, (index + 1) * 800)
    })
  }, [])

  const triggerShadowBidSim = useCallback(() => {
    setShadowBidSimulating(true)
    setShadowBidDone(false)
    setTimeout(() => {
      setShadowBidSimulating(false)
      setShadowBidDone(true)
    }, 1500)
  }, [])

  // OIOS functions
  const filteredVessels = useMemo(() => {
    const list = vesselsData.vessels || []
    if (activeVesselCategory === 'all') return list
    const catMap = {
      ahts: 'ahts',
      tugs: 'tug',
      psvs: 'psv',
      mpsvs: 'mpsv',
      multicats: 'multicat'
    }
    const targetType = catMap[activeVesselCategory] || activeVesselCategory
    return list.filter(v => v.type.toLowerCase() === targetType.toLowerCase())
  }, [activeVesselCategory])

  const handleVesselClick = (v) => {
    onProjectSelect({
      id: v.name,
      name: v.name,
      lat: v.lat,
      lng: v.lon,
      country: v.location,
      operator: v.owner,
      description: `${v.type} - Bollard Pull : ${v.bp}T. Année : ${v.built || 'N/A'}. Statut : ${translateAvailability(v.availability)}.`,
      status: 'Navire',
      kind: 'vessel'
    })
  }

  const handleOpportunityClick = (t) => {
    setSelectedOiosOpportunity(t)
    onProjectSelect({
      id: t.id,
      name: t.title,
      lat: t.coords[0],
      lng: t.coords[1],
      country: t.location,
      operator: t.client,
      description: t.scout_findings,
      status: 'Development',
      kind: 'tender'
    })
  }

  const handlePredictionClick = (p) => {
    const isSel = selectedPrediction?.name === p.name
    setSelectedPrediction(isSel ? null : p)
    if (!isSel) {
      onProjectSelect({
        id: p.name,
        name: p.name,
        lat: p.origin_coords[0],
        lng: p.origin_coords[1],
        country: p.destination,
        operator: p.type,
        description: p.reason,
        status: 'Appraisal',
        kind: 'prediction'
      })
    } else {
      onProjectSelect(null)
    }
  }

  const handleCopyCode = (codeText, idx) => {
    navigator.clipboard.writeText(codeText)
    setCopiedIndex(idx)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const mockBlenderScript = (t) => {
    const vesselName = t.matched_assets && t.matched_assets.length > 0 ? t.matched_assets[0].name : "Remorqueur_Matched"
    const targetName = t.title.split("-")[0].trim ? t.title.split("-")[0].trim() : t.title
    const bp = t.matched_assets && t.matched_assets.length > 0 ? t.matched_assets[0].bp : 80
    return `# Blender Python Script for Towing Simulation
# Generated automatically by OIOS Digital Twin Engine
import bpy
import math

def setup_towing_scene():
    # Clear and setup water surface
    bpy.ops.object.select_all(action='DESELECT')
    bpy.ops.object.select_by_type(type='MESH')
    bpy.ops.object.delete()
    
    # Ocean Plane
    bpy.ops.mesh.primitive_grid_add(size=100, x_subdivisions=40)
    ocean = bpy.context.active_object
    ocean.name = "OceanSurface"
    
    # Matched Tug: ${vesselName} (${bp}T BP)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 15, 0.8), scale=(2.5, 6.0, 1.5))
    tug = bpy.context.active_object
    tug.name = "Tug_${vesselName.replace(" ", "_")}"
    
    # Tow Target: ${targetName}
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -15, 1.2), scale=(4.0, 12.0, 2.5))
    target = bpy.context.active_object
    target.name = "TowedTarget"
    
    # Bezier Towline Cable
    bpy.ops.curve.primitive_bezier_curve_add(location=(0, 0, 0))
    print("Digital Twin simulation successfully initialized.")

setup_towing_scene()`
  }

  return (
    <aside
      className={`sidebar${isOpen ? '' : ' collapsed'}`}
      style={isOpen ? { width: sidebarWidth, minWidth: sidebarWidth, transition: isResizing ? 'none' : undefined } : {}}
    >
      {/* View Selector Tab */}
      <div className="view-selector-tabs">
        <button
          className={`selector-tab-btn ${viewMode === 'standard' ? 'active' : ''}`}
          onClick={() => {
            setViewMode('standard')
            onProjectSelect(null)
            setSelectedPrediction(null)
            setSelectedOiosOpportunity(null)
          }}
        >
          Business development
        </button>
        <button
          className={`selector-tab-btn ${viewMode === 'oios' ? 'active' : ''}`}
          onClick={() => {
            setViewMode('oios')
            onProjectSelect(null)
            setSelectedPrediction(null)
          }}
        >
          Market intelligence
        </button>
      </div>

      {viewMode === 'oios' ? (
        // ----------------- OIOS VIEW -----------------
        <div className="oios-sidebar-container" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
          
          {selectedOiosOpportunity ? (
            // Detail Panel for active opportunity
            <div className="sidebar-content" style={{ flexGrow: 1, padding: '20px 24px', overflowY: 'auto' }}>
              <button className="back-btn" onClick={() => setSelectedOiosOpportunity(null)}>
                ← Retour au briefing
              </button>
              
              <div className="detail-title-section" style={{ marginTop: '15px' }}>
                <h2 className="project-title" style={{ fontSize: '1.25rem' }}>{selectedOiosOpportunity.title}</h2>
                <div className="project-country">{selectedOiosOpportunity.location} &bull; {selectedOiosOpportunity.client}</div>
              </div>

              <div className="section-title">Findings du Scout Agent</div>
              <div className="scout-findings-box" style={{ background: 'rgba(168, 85, 247, 0.03)', border: '1px solid rgba(168, 85, 247, 0.15)', padding: '12px', borderRadius: '6px', fontSize: '0.82rem', lineHeight: '1.4', color: '#e2e8f0' }}>
                {selectedOiosOpportunity.scout_findings}
              </div>

              <div className="section-title">Simulation Twin Numérique</div>
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">Navire associé</div>
                  <div className="info-value" style={{ color: '#60a5fa' }}>
                    {selectedOiosOpportunity.matched_assets && selectedOiosOpportunity.matched_assets.length > 0 
                      ? selectedOiosOpportunity.matched_assets[0].name 
                      : 'Aucun'}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">Score de proximité</div>
                  <div className="info-value" style={{ color: '#10b981' }}>
                    {selectedOiosOpportunity.matched_assets && selectedOiosOpportunity.matched_assets.length > 0 
                      ? `${selectedOiosOpportunity.matched_assets[0].proximity_score}%` 
                      : 'N/A'}
                  </div>
                </div>
                <div className="info-item" style={{ gridColumn: 'span 2' }}>
                  <div className="info-label">Risque de collision (Sim. tempête)</div>
                  <div className="info-value" style={{ color: selectedOiosOpportunity.simulation.collision_risk_pct > 15 ? '#ef4444' : '#10b981' }}>
                    {selectedOiosOpportunity.simulation.collision_risk_pct}% de Risque
                  </div>
                </div>
              </div>

              <div className="section-title">Calculs Hydrodynamiques</div>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Tension Normale :</span>
                  <strong>{selectedOiosOpportunity.simulation.towline_tension_normal_kn} kN</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Tension Tempête :</span>
                  <strong style={{ color: '#f59e0b' }}>{selectedOiosOpportunity.simulation.towline_tension_storm_kn} kN</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Bollard Pull Requis :</span>
                  <strong>{selectedOiosOpportunity.matched_assets && selectedOiosOpportunity.matched_assets.length > 0 ? selectedOiosOpportunity.matched_assets[0].bp_req : 70} T</strong>
                </div>
              </div>

              <div className="section-title">Script Python Digital Twin (Blender)</div>
              <div className="code-container" style={{ position: 'relative' }}>
                <button className="copy-code-btn" onClick={() => handleCopyCode(mockBlenderScript(selectedOiosOpportunity), 1)}>
                  {copiedIndex === 1 ? 'Copié !' : 'Copier'}
                </button>
                <pre style={{ margin: 0, overflowX: 'auto', fontSize: '0.7rem' }}>
                  <code>{mockBlenderScript(selectedOiosOpportunity)}</code>
                </pre>
              </div>

              <div className="section-title">Draft Email Commercial</div>
              <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '15px' }}>
                <p><strong>Destinataire :</strong> {selectedOiosOpportunity.draft_email.recipient}</p>
                <p><strong>Sujet :</strong> {selectedOiosOpportunity.draft_email.subject}</p>
                <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', color: '#94a3b8', fontSize: '0.75rem', maxHeight: '100px', overflowY: 'auto' }}>
                  {selectedOiosOpportunity.draft_email.body}
                </div>
              </div>

              <a className="outlook-btn" href={`mailto:${selectedOiosOpportunity.draft_email.recipient}?subject=${encodeURIComponent(selectedOiosOpportunity.draft_email.subject)}&body=${encodeURIComponent(selectedOiosOpportunity.draft_email.body)}`} style={{ textDecoration: 'none' }}>
                📧 Préparer dans Outlook
              </a>
            </div>
          ) : (
            // Briefing / Opportunities Overview
            <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
              
              {/* OIOS Stats Panel */}
              <div className="oios-stats-panel">
                <div className="msi-gauge-container">
                  <div className="msi-header">
                    <span>Index de Rareté du Marché (MSI)</span>
                    <span style={{ fontWeight: 700, color: '#a855f7' }}>{oiosData.oios_briefing.msi}%</span>
                  </div>
                  <div className="msi-progress-bg">
                    <div className="msi-progress-fill" style={{ width: `${oiosData.oios_briefing.msi}%` }}></div>
                  </div>
                </div>
                <div className="oios-strategy-card">
                  <div className="strategy-label">Agressivité de la cotation</div>
                  <div className="strategy-value">{oiosData.oios_briefing.aggressiveness}</div>
                </div>
              </div>

              {/* Copilote IA Logistique */}
              <div className="oios-ai-copilot-container">
                <div className="ai-input-wrapper">
                  <input
                    type="text"
                    className="ai-input"
                    placeholder="Poser une question sur la flotte, transits..."
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAiQuerySubmit(aiQuery)
                    }}
                  />
                  <button className="ai-send-btn" onClick={() => handleAiQuerySubmit(aiQuery)}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
                <div className="ai-chips">
                  {[
                    { text: 'Disponibilité flotte', query: 'disponibilité flotte' },
                    { text: 'Barges suspectes', query: 'transit barges' },
                    { text: 'Risques météo', query: 'risques météo' }
                  ].map((chip, i) => (
                    <button
                      key={i}
                      className={`ai-chip${aiActivePrompt === chip.query ? ' active' : ''}`}
                      onClick={() => {
                        setAiQuery(chip.query)
                        handleAiQuerySubmit(chip.query)
                      }}
                    >
                      {chip.text}
                    </button>
                  ))}
                </div>
                {aiLoading && (
                  <div className="ai-loading-box">
                    <div className="spinner"></div>
                    <span>L'IA analyse les signaux logistiques...</span>
                  </div>
                )}
                {aiResponse && (
                  <div className="ai-response-box">
                    <div className="ai-response-title">{aiResponse.title}</div>
                    <div className="ai-response-text">{aiResponse.text}</div>
                  </div>
                )}
              </div>

              {/* Country Filter Sorter */}
              <div style={{ padding: '10px 24px', background: 'rgba(0, 0, 0, 0.2)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📍 Tri par Pays :</span>
                <select 
                  value={selectedOiosCountry} 
                  onChange={(e) => setSelectedOiosCountry(e.target.value)}
                  style={{
                    background: '#0f172a',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    fontSize: '0.7rem',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="all">Tous les pays</option>
                  <option value="Angola">Angola</option>
                  <option value="Namibie">Namibie</option>
                  <option value="Nigeria">Nigeria</option>
                  <option value="Gabon">Gabon / Congo</option>
                  <option value="Guinée Équatoriale">Guinée Équatoriale</option>
                </select>
              </div>

              {/* Main Content Area */}
              <div className="sidebar-content" style={{ flexGrow: 1, overflowY: 'auto', padding: '15px 24px' }}>
                
                {/* Collapsible OIOS Prospecting Campaign Section */}
                <div className="oios-prospecting-section" style={{
                  background: 'rgba(168, 85, 247, 0.05)',
                  border: '1px solid rgba(168, 85, 247, 0.25)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  position: 'relative'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }} onClick={() => setProspectingOpen(!prospectingOpen)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.1rem' }}>🤖</span>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#c084fc' }}>
                          Campagnes OIOS (Prospection Active)
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                          Projet ciblé : {queueProjectName || 'Aucun'}
                        </div>
                      </div>
                    </div>
                    <button style={{
                      background: 'none',
                      border: 'none',
                      color: '#c084fc',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      padding: '4px'
                    }}>
                      {prospectingOpen ? '▼ Replier' : '▶ Déplier'}
                    </button>
                  </div>

                  {prospectingOpen && (
                    <div style={{ marginTop: '12px', borderTop: '1px solid rgba(168, 85, 247, 0.15)', paddingTop: '12px' }}>
                      
                      {/* Active Queue / Leads to contact */}
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#a855f7', textTransform: 'uppercase', marginBottom: '6px' }}>
                          ⏳ File d'attente (Prochains contacts - 09h/10h)
                        </div>
                        {queueLeads.length === 0 ? (
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic' }}>
                            Aucun contact dans la file d'attente.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {queueLeads.map((lead, idx) => (
                              <div key={idx} style={{
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: '4px',
                                padding: '6px 8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <div>
                                  <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#e2e8f0' }}>
                                    {lead.first_name || lead.firstName} {lead.last_name || lead.lastName}
                                  </div>
                                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                                    {lead.title} @ {lead.company_raw || lead.company} ({lead.country})
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  {lead.linkedin && (
                                    <a href={lead.linkedin} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem', textDecoration: 'none' }} title="Profil LinkedIn">
                                      🔗
                                    </a>
                                  )}
                                  <span style={{ fontSize: '0.65rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 6px', borderRadius: '3px' }}>
                                    Prévu
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Contacted History */}
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#10b981', textTransform: 'uppercase', marginBottom: '6px' }}>
                          ✅ Contacts Récents (Historique)
                        </div>
                        {contactedLeads.length === 0 ? (
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic' }}>
                            Aucun historique disponible.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
                            {contactedLeads.map((lead, idx) => (
                              <div key={idx} style={{
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: '4px',
                                padding: '6px 8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <div>
                                  <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#e2e8f0' }}>
                                    {lead.name}
                                  </div>
                                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                                    {lead.company} &bull; {lead.project}
                                  </div>
                                  <div style={{ fontSize: '0.6rem', color: '#64748b' }}>
                                    Contacté le {lead.date_sent}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  {lead.linkedin_url && (
                                    <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem', textDecoration: 'none' }} title="Profil LinkedIn">
                                      🔗
                                    </a>
                                  )}
                                  {lead.status === 'Replied' ? (
                                    <span style={{ fontSize: '0.65rem', color: '#f97316', background: 'rgba(249, 115, 22, 0.15)', border: '1px solid rgba(249, 115, 22, 0.3)', padding: '2px 6px', borderRadius: '3px', fontWeight: 'bold' }}>
                                      💬 Répondu
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: '0.65rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 6px', borderRadius: '3px' }}>
                                      Fait
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>

                <div className="oios-briefing-title" style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a855f7', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Opportunités du Marché (Appels d'offres matchés)
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {filteredTenders.length === 0 ? (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', padding: '5px 0' }}>Aucun appel d'offres trouvé pour cette zone.</div>
                  ) : (
                    filteredTenders.map((t, idx) => (
                      <div key={idx} className="project-card" style={{ cursor: 'pointer', borderLeft: '3px solid #a855f7' }} onClick={() => handleOpportunityClick(t)}>
                        <div className="card-top">
                          <div className="card-name" style={{ fontSize: '0.85rem' }}>{t.title}</div>
                          <div className="badge badge-priority" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>Match</div>
                        </div>
                        <div className="card-meta">
                          <span>{t.client}</span> &bull; <span>{t.location}</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>
                          Requis : <strong>{t.requirement}</strong> &bull; Match : <strong>{t.matched_assets[0].name}</strong> ({t.matched_assets[0].proximity_score}%)
                        </div>
                      </div>
                    ))
                  )}
                </div>


                {/* Balayage Satellite SAR */}
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                  Surveillance Spatiale Radar (SAR)
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.03)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.15)', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>Balayage Satellite Actif</span>
                    <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Détecter les transpondeurs éteints</span>
                  </div>
                  <button 
                    onClick={() => setSarModeActive(!sarModeActive)}
                    style={{
                      padding: '5px 12px',
                      background: sarModeActive ? '#10b981' : 'rgba(255,255,255,0.03)',
                      border: '1px solid ' + (sarModeActive ? '#10b981' : 'rgba(255,255,255,0.1)'),
                      color: '#fff',
                      borderRadius: '4px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: sarModeActive ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    {sarModeActive ? 'ACTIF' : 'ACTIVER'}
                  </button>
                </div>

                {sarModeActive && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                      Anomalies Radar Détectées ({oiosGhostTargets.length})
                    </div>
                    {oiosGhostTargets.map((g) => {
                      const isSel = selectedProject?.id === g.id
                      return (
                        <div 
                          key={g.id} 
                          className={`project-card${isSel ? ' selected' : ''}`}
                          style={{ 
                            borderLeft: '3px solid #10b981', 
                            cursor: 'pointer',
                            background: isSel ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.02)',
                            borderColor: isSel ? '#10b981' : undefined
                          }} 
                          onClick={() => onProjectSelect({
                            id: g.id,
                            name: g.name,
                            lat: g.coords[0],
                            lng: g.coords[1],
                            signature: g.signature,
                            speed: g.speed,
                            heading: g.heading,
                            status: g.status,
                            inference: g.inference,
                            kind: 'ghost'
                          })}
                        >
                          <div className="card-top">
                            <div className="card-name" style={{ fontSize: '0.8rem', fontWeight: 600 }}>{g.name}</div>
                            <div className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: '0.65rem' }}>AIS Éteint</div>
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '3px' }}>
                            Sign. : <strong>{g.signature}</strong> &bull; Vitesse : <strong>{g.speed}</strong>
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#f59e0b', marginTop: '5px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '4px', fontStyle: 'italic' }}>
                            {g.inference}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Moteur de Signaux Faibles OSINT */}
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#3b82f6', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                  Détecteur de Signaux Faibles (OSINT)
                </div>
                
                <div className="osint-engine-box" style={{ background: 'rgba(59, 130, 246, 0.03)', border: '1px solid rgba(59, 130, 246, 0.15)', padding: '12px', borderRadius: '6px', marginBottom: '20px' }}>
                  <style>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                  {!isCorrelating && !correlationDone && (
                    <>
                      <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0 0 10px 0', lineHeight: '1.3' }}>
                        Indices bruts non structurés détectés sur le web profond (forums, offres d'emploi) :
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.68rem' }}>
                          <span style={{ color: '#f59e0b', fontWeight: 700 }}>Indeed WAF (J-45)</span> : Recrutement de 12 soudeurs de classe marine à Walvis Bay.
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.68rem' }}>
                          <span style={{ color: '#10b981', fontWeight: 700 }}>Forum gCaptain (J-40)</span> : Le contrat de Valaris DS-12 en Angola prend fin en juillet sans extension.
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.68rem' }}>
                          <span style={{ color: '#3b82f6', fontWeight: 700 }}>Douanes Luanda (J-38)</span> : Demande d'exportation temporaire de chaînes d'ancrage lourdes vers la Namibie.
                        </div>
                      </div>
                      <button 
                        onClick={startCorrelation}
                        style={{
                          width: '100%',
                          padding: '8px',
                          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                          border: 'none',
                          color: '#fff',
                          fontWeight: 700,
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          boxShadow: '0 0 10px rgba(59, 130, 246, 0.4)',
                          transition: 'all 0.2s'
                        }}
                      >
                        Lancer la fusion
                      </button>
                    </>
                  )}

                  {isCorrelating && (
                    <div style={{ padding: '5px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div className="osint-loader" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                        <div className="spinner" style={{ width: '12px', height: '12px', border: '2px solid rgba(59, 130, 246, 0.3)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        <span style={{ fontSize: '0.7rem', color: '#60a5fa', fontWeight: 700 }}>Analyse d'images satellites...</span>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                        <div style={{ opacity: correlationStep >= 0 ? 1 : 0.3, transition: 'opacity 0.2s' }}>
                          {correlationStep >= 1 ? '[OK] ' : '[..] '} Extraction des entités NLP (Valaris DS-12, Walvis Bay)...
                        </div>
                        <div style={{ opacity: correlationStep >= 1 ? 1 : 0.3, transition: 'opacity 0.2s', marginTop: '4px' }}>
                          {correlationStep >= 2 ? '[OK] ' : '[..] '} Fusion géospatiale &amp; probabilité bayésienne...
                        </div>
                        <div style={{ opacity: correlationStep >= 2 ? 1 : 0.3, transition: 'opacity 0.2s', marginTop: '4px' }}>
                          {correlationStep >= 3 ? '[OK] ' : '[..] '} Génération de la recommandation commerciale...
                        </div>
                      </div>
                    </div>
                  )}

                  {correlationDone && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>Fusion Réussie</span>
                        <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>P = 90.4%</span>
                      </div>
                      <p style={{ fontSize: '0.7rem', color: '#e2e8f0', margin: '0 0 8px 0', lineHeight: '1.3' }}>
                        <strong>Alerte Transit :</strong> Valaris DS-12 (Drillship) quittera l'Angola le <strong>1er Août 2026</strong> pour effectuer son SPS (maintenance réglementaire) à Walvis Bay.
                      </p>
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.68rem', marginBottom: '10px', color: '#94a3b8' }}>
                        <strong>Action Boluda :</strong> Proposer le remorqueur local <strong>Topaz Master</strong> (87T BP, basé en Angola) pour escorte. Tarif recommandé : <strong>$18,500/jour</strong> (+15% de marge en raison de la rareté locale).
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => {
                            const ds12Pred = oiosData.oios_predictions.find(p => p.name === 'Valaris DS-12')
                            if (ds12Pred) handlePredictionClick(ds12Pred)
                          }}
                          style={{
                            flex: 1,
                            padding: '6px',
                            background: 'rgba(59, 130, 246, 0.15)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            color: '#60a5fa',
                            fontWeight: 600,
                            borderRadius: '4px',
                            fontSize: '0.68rem',
                            cursor: 'pointer'
                          }}
                        >
                          📍 Tracer sur la carte
                        </button>
                        <button 
                          onClick={resetCorrelation}
                          style={{
                            padding: '6px 10px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#94a3b8',
                            fontWeight: 600,
                            borderRadius: '4px',
                            fontSize: '0.68rem',
                            cursor: 'pointer'
                          }}
                        >
                          Réinitialiser
                        </button>
                      </div>
                    </>
                  )}

                  {/* Intercepted Whispers Feed */}
                  <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
                    <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                      📻 Flux de Rumeurs Interceptées (VHF & Forums) :
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {(oiosData.oios_port_whispers || []).map((w) => (
                        <div 
                          key={w.id} 
                          onClick={() => {
                            const proj = projects.find(p => p.id === w.project_id)
                            if (proj) {
                              onProjectSelect(proj)
                            }
                          }}
                          style={{
                            background: 'rgba(255,255,255,0.01)',
                            border: '1px solid rgba(255,255,255,0.04)',
                            borderRadius: '4px',
                            padding: '6px 8px',
                            cursor: 'pointer',
                            transition: 'all 0.12s',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '3px'
                          }}
                          className="whisper-item-hover"
                          title="Cliquez pour localiser sur la carte"
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#60a5fa' }}>{w.source}</span>
                            <span style={{ fontSize: '0.6rem', color: w.correlation_score > 90 ? '#ef4444' : '#f59e0b', fontWeight: 700 }}>
                              Corrélation: {w.correlation_score}%
                            </span>
                          </div>
                          <p style={{ fontSize: '0.65rem', color: '#cbd5e1', margin: 0, fontStyle: 'italic', lineHeight: '1.2' }}>
                            "{w.msg}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Predictions Section */}
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f97316', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                  Mouvements Prédictifs (Rigs &amp; FPSO)
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  {filteredPredictions.length === 0 ? (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', padding: '5px 0' }}>Aucun rig en mouvement détecté dans cette zone.</div>
                  ) : (
                    filteredPredictions.map((p, idx) => {
                      const isSel = selectedPrediction?.name === p.name
                      return (
                        <div key={idx} className={`prediction-card${isSel ? ' active' : ''}`} onClick={() => handlePredictionClick(p)} style={{ border: isSel ? '1px solid #f97316' : '1px solid rgba(249, 115, 22, 0.15)', background: isSel ? 'rgba(249, 115, 22, 0.1)' : 'rgba(249, 115, 22, 0.03)', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div className="prediction-title" style={{ fontSize: '0.78rem', fontWeight: 600, color: '#ffedd5' }}>{p.name} ({p.type})</div>
                            <div className="prediction-desc" style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Destination : {p.destination} (Départ {p.departure})</div>
                          </div>
                          <div className="prediction-badge-prob" style={{ background: 'rgba(249, 115, 22, 0.15)', color: '#f97316', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>
                            {p.probability}%
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Moteur de Remorquage Barges & Flotels */}
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#e879f9', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                  Radar Barges &amp; Flotels EPCI
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  {filteredBargeHypotheses.length === 0 ? (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', padding: '5px 0' }}>Aucune barge en transit détectée pour cette zone.</div>
                  ) : (
                    filteredBargeHypotheses.map((h) => {
                      const isSel = selectedBargeHypothesis?.id === h.id
                      return (
                        <div 
                          key={h.id} 
                          className={`prediction-card${isSel ? ' active' : ''}`} 
                          onClick={() => {
                            const isCurrentlySelected = selectedBargeHypothesis?.id === h.id
                            onBargeHypothesisSelect(isCurrentlySelected ? null : h)
                          }} 
                          style={{ 
                            border: isSel ? '1px solid #e879f9' : '1px solid rgba(232, 121, 249, 0.15)', 
                            background: isSel ? 'rgba(232, 121, 249, 0.1)' : 'rgba(232, 121, 249, 0.03)', 
                            padding: '10px 12px', 
                            borderRadius: '6px', 
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fdf4ff' }}>{h.title}</span>
                            <span style={{ fontSize: '0.65rem', background: 'rgba(232, 121, 249, 0.15)', color: '#e879f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{h.probability}%</span>
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>
                            Origine : <strong>{h.origin}</strong> &bull; Client : <strong>{h.client}</strong>
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#94a3b8', lineHeight: '1.3', marginTop: '2px' }}>
                            {h.description}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: '#e879f9', fontWeight: 600, marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '4px' }}>
                            Tug Boluda : {h.matched_vessels} ({h.bp_required})
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

              </div>

              {/* Collapsible Value Chain Diagram */}
              <div className="value-chain-section" style={{ display: 'flex', flexDirection: 'column' }}>
                <div 
                  className="fleet-registry-header" 
                  onClick={() => setValueChainExpanded(!valueChainExpanded)} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    background: 'rgba(168, 85, 247, 0.05)', 
                    borderTop: '1px solid var(--border-color)', 
                    padding: '12px 24px', 
                    fontSize: '0.7rem', 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    color: '#a855f7', 
                    cursor: 'pointer' 
                  }}
                >
                  <span>🔍 Relations Acteurs &amp; Tugs (Value Chain)</span>
                  <span>{valueChainExpanded ? '▼' : '▶'}</span>
                </div>
                
                {valueChainExpanded && (
                  <div style={{ padding: '15px 24px', background: 'rgba(0, 0, 0, 0.25)', borderTop: '1px solid var(--border-color)' }}>
                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0 0 12px 0', lineHeight: '1.4' }}>
                      Cartographie de la chaîne logistique : identifiez le donneur d'ordre (affréteur direct) pour le positionnement commercial.
                    </p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      
                      {/* Acteur 1: IOC */}
                      <div style={{ background: 'rgba(59, 130, 246, 0.03)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '10px', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#60a5fa' }}>1. Majors / IOCs</span>
                          <span style={{ fontSize: '0.6rem', color: '#3b82f6', background: 'rgba(59,130,246,0.15)', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>Client Final</span>
                        </div>
                        <p style={{ fontSize: '0.68rem', color: '#cbd5e1', margin: '0 0 6px 0', lineHeight: '1.3' }}>
                          TotalEnergies, Shell, bp, Eni, Chevron, Azule.
                        </p>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', borderTop: '1px dashed rgba(255,255,255,0.05)', paddingTop: '4px' }}>
                          <strong>Affrète direct pour :</strong> Production &amp; Terminaux (ASD Tugs, 10-15 ans) / Rig Moves (Spot AHTS).
                        </div>
                      </div>

                      {/* Acteur 2: EPCI */}
                      <div style={{ background: 'rgba(168, 85, 247, 0.03)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '10px', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c084fc' }}>2. Entrepreneurs EPCI</span>
                          <span style={{ fontSize: '0.6rem', color: '#a855f7', background: 'rgba(168,85,247,0.15)', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>Tier-1 Contractor</span>
                        </div>
                        <p style={{ fontSize: '0.68rem', color: '#cbd5e1', margin: '0 0 6px 0', lineHeight: '1.3' }}>
                          Saipem, Subsea 7, TechnipFMC, McDermott, Boskalis.
                        </p>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', borderTop: '1px dashed rgba(255,255,255,0.05)', paddingTop: '4px' }}>
                          <strong>Affrète direct pour :</strong> Construction, Mooring FPSO/FLNG, Escorte de barges de fret lourd (AHTS lourds, Tugs).
                        </div>
                      </div>

                      {/* Acteur 3: Rig Owners */}
                      <div style={{ background: 'rgba(249, 115, 22, 0.03)', border: '1px solid rgba(249, 115, 22, 0.2)', padding: '10px', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f97316' }}>3. Propriétaires de Rigs</span>
                          <span style={{ fontSize: '0.6rem', color: '#f97316', background: 'rgba(249,115,22,0.15)', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>Forages</span>
                        </div>
                        <p style={{ fontSize: '0.68rem', color: '#cbd5e1', margin: '0 0 6px 0', lineHeight: '1.3' }}>
                          Valaris, Noble, Borr Drilling.
                        </p>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', borderTop: '1px dashed rgba(255,255,255,0.05)', paddingTop: '4px' }}>
                          <strong>Affrète direct pour :</strong> Ravitaillement continu et support d'ancrage secondaire (Supply/AHTS).
                        </div>
                      </div>

                    </div>

                    {/* Représentation visuelle de la chaîne */}
                    <div style={{ marginTop: '15px', background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.68rem', color: '#cbd5e1' }}>
                      <div style={{ fontWeight: 700, color: '#fff', marginBottom: '8px', textTransform: 'uppercase', fontSize: '0.62rem', letterSpacing: '0.5px' }}>🔗 Flux Contractuel de Remorquage</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: 'monospace', fontSize: '0.62rem' }}>
                        <div>[IOC / Major]</div>
                        <div style={{ color: '#3b82f6' }}>  │ (Délègue la Construction)</div>
                        <div>  ├──➔ [Entrepreneurs EPCI]</div>
                        <div style={{ color: '#a855f7' }}>  │      │ (Affrètement T&amp;I)</div>
                        <div style={{ color: '#a855f7' }}>  │      └───★ [TUGS BOLUDA (AHTS / Barges)]</div>
                        <div style={{ color: '#3b82f6' }}>  │</div>
                        <div style={{ color: '#3b82f6' }}>  ├── (Affrètement Terminal Direct)</div>
                        <div style={{ color: '#3b82f6' }}>  │      └───★ [TUGS BOLUDA (ASD Escort / O&amp;M)]</div>
                        <div style={{ color: '#3b82f6' }}>  │</div>
                        <div style={{ color: '#3b82f6' }}>  └── (Contrats Forage)</div>
                        <div>         └──➔ [Rig Owners] ──★ [AHTS (Rig Moves)]</div>
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* Collapsible Portal Monitor */}
              <div className="portal-monitor-section" style={{ display: 'flex', flexDirection: 'column' }}>
                <div 
                  className="fleet-registry-header" 
                  onClick={() => setPortalMonitorExpanded(!portalMonitorExpanded)} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    background: 'rgba(16, 185, 129, 0.05)', 
                    borderTop: '1px solid var(--border-color)', 
                    padding: '12px 24px', 
                    fontSize: '0.7rem', 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    color: '#10b981', 
                    cursor: 'pointer' 
                  }}
                >
                  <span>📡 Traqueur de Portails Tenders (Live Crawler)</span>
                  <span>{portalMonitorExpanded ? '▼' : '▶'}</span>
                </div>
                
                {portalMonitorExpanded && (
                  <div style={{ padding: '15px 24px', background: 'rgba(0, 0, 0, 0.25)', borderTop: '1px solid var(--border-color)' }}>
                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0 0 12px 0', lineHeight: '1.4' }}>
                      Essaim de crawlers doté d'une IA visuelle Gemini pour passer les changements de design et s'auto-authentifier :
                    </p>
                    
                    {/* Live Portal Status */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                      {(oiosData.oios_vision_crawler?.portals || [
                        { name: 'NipeX (Nigeria)', status: '🟢 Session Active', auto_healed: true },
                        { name: 'Petrosen (Sénégal)', status: '🟢 Crawling', auto_healed: false },
                        { name: 'Sonangol ANPG (Angola)', status: '🟢 Authentifié', auto_healed: true },
                        { name: 'Saipem Supplier Portal', status: '🟢 Nominal', auto_healed: false }
                      ]).map((portal, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '5px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.04)' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#e2e8f0' }}>
                            {portal.name} {portal.auto_healed && <span style={{ fontSize: '0.58rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '1px 4px', borderRadius: '3px', marginLeft: '5px' }}>Auto-Guéri 👁️</span>}
                          </span>
                          <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#10b981' }}>{portal.status}</span>
                        </div>
                      ))}
                    </div>

                    {/* Simulation Panel */}
                    <button
                      onClick={triggerCrawlerSim}
                      disabled={activeCrawlerSim}
                      style={{
                        width: '100%',
                        padding: '8px',
                        background: activeCrawlerSim ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                        border: 'none',
                        color: activeCrawlerSim ? '#64748b' : '#fff',
                        fontWeight: 700,
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        cursor: activeCrawlerSim ? 'not-allowed' : 'pointer',
                        boxShadow: activeCrawlerSim ? 'none' : '0 0 10px rgba(16, 185, 129, 0.3)',
                        marginBottom: '12px',
                        transition: 'all 0.2s'
                      }}
                    >
                      {activeCrawlerSim ? 'CRAWLER VISUEL EN COURS...' : 'RE-LANCER LE CRAWLER VISUEL'}
                    </button>

                    {/* Visual Target Mock */}
                    {activeCrawlerSim && (
                      <div style={{ background: '#090e1d', border: '1px solid #10b981', borderRadius: '6px', padding: '10px', marginBottom: '12px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.6rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px', letterSpacing: '0.5px' }}>
                          👁️ Analyse Visuelle : NipeX Login Page
                        </div>
                        <div style={{ height: '70px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                          <div style={{ width: '60px', height: '20px', background: '#3b82f6', borderRadius: '3px', fontSize: '0.6rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                            LOGIN
                          </div>
                          <div style={{ position: 'absolute', top: '15px', left: '130px', width: '80px', height: '40px', border: '2.5px solid #10b981', borderRadius: '2px', pointerEvents: 'none', boxShadow: '0 0 8px #10b981' }}>
                            <div style={{ position: 'absolute', top: '-15px', left: '0', background: '#10b981', color: '#000', fontSize: '0.5rem', fontWeight: 800, padding: '1px 3px', whiteSpace: 'nowrap' }}>
                              TARGET [412, 720]
                            </div>
                            <div style={{ position: 'absolute', bottom: '-15px', left: '0', color: '#10b981', fontSize: '0.5rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                              CONFIDENCE 99.4%
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AI Vision logs */}
                    <div style={{ background: '#090d16', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 12px', maxHeight: '130px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.62rem', color: '#94a3b8' }}>
                      <div style={{ color: '#10b981', fontWeight: 700, fontSize: '0.58rem', textTransform: 'uppercase', marginBottom: '5px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '3px' }}>
                        📜 LOGS D'INSPECTEUR VISUEL GEMINI :
                      </div>
                      {(crawlerSimLog.length > 0 ? crawlerSimLog : (oiosData.oios_vision_crawler?.logs || [])).map((l, i) => (
                        <div key={i} style={{ marginBottom: '4px', lineHeight: '1.2' }}>
                          <span style={{ color: '#64748b' }}>[{l.time}]</span> <span style={{ color: '#38bdf8' }}>[{l.portal}]</span> {l.msg}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Collapsible Auto-RFQ Negotiator */}
              <div className="auto-rfq-section" style={{ display: 'flex', flexDirection: 'column' }}>
                <div 
                  className="fleet-registry-header" 
                  onClick={() => setAutoRfqExpanded(!autoRfqExpanded)} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    background: 'rgba(168, 85, 247, 0.05)', 
                    borderTop: '1px solid var(--border-color)', 
                    padding: '12px 24px', 
                    fontSize: '0.7rem', 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    color: '#a855f7', 
                    cursor: 'pointer' 
                  }}
                >
                  <span>🤖 Négociateur Auto-RFQ (Instant Bid)</span>
                  <span>{autoRfqExpanded ? '▼' : '▶'}</span>
                </div>
                
                {autoRfqExpanded && (
                  <div style={{ padding: '15px 24px', background: 'rgba(0, 0, 0, 0.25)', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0 0 4px 0', lineHeight: '1.4' }}>
                      Négociation autonome de tarifs en direct avec les portails EPCI (Saipem, Technip) :
                    </p>
                    
                    {(oiosData.oios_auto_rfq || []).map((rfq) => (
                      <div key={rfq.id} style={{ background: 'rgba(168, 85, 247, 0.02)', border: '1px solid rgba(168, 85, 247, 0.15)', borderRadius: '6px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f5f3ff' }}>{rfq.portal}</span>
                          <span style={{ fontSize: '0.62rem', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                            {rfq.tender_ref}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>
                          Projet : <strong>{rfq.project_name}</strong> &bull; Requis : <strong>{rfq.requirement}</strong>
                        </div>
                        
                        <div style={{ background: '#090d16', borderRadius: '4px', padding: '6px 8px', fontFamily: 'monospace', fontSize: '0.58rem', color: '#a78bfa', margin: '4px 0', maxHeight: '90px', overflowY: 'auto' }}>
                          {rfq.auto_draft.negotiation_log.map((log, i) => (
                            <div key={i} style={{ marginBottom: '2px' }}>{log}</div>
                          ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px', borderTop: '1px dashed rgba(255,255,255,0.05)', paddingTop: '4px' }}>
                          <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Statut : <strong style={{ color: '#c084fc' }}>{rfq.auto_draft.status}</strong></span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981' }}>{rfq.auto_draft.bid_rate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Collapsible Flare Radar */}
              <div className="flare-radar-section" style={{ display: 'flex', flexDirection: 'column' }}>
                <div 
                  className="fleet-registry-header" 
                  onClick={() => setFlareRadarExpanded(!flareRadarExpanded)} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    background: 'rgba(249, 115, 22, 0.05)', 
                    borderTop: '1px solid var(--border-color)', 
                    padding: '12px 24px', 
                    fontSize: '0.7rem', 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    color: '#f97316', 
                    cursor: 'pointer' 
                  }}
                >
                  <span>🛰️ Flare &amp; Testing Radar (Anomalies)</span>
                  <span>{flareRadarExpanded ? '▼' : '▶'}</span>
                </div>
                
                {flareRadarExpanded && (
                  <div style={{ padding: '15px 24px', background: 'rgba(0, 0, 0, 0.25)', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0 0 4px 0', lineHeight: '1.4' }}>
                      Détection thermique de tests de puits pétroliers par satellite NOAA / Sentinel-1 :
                    </p>
                    
                    {(oiosData.oios_flare_radar || []).map((fl) => (
                      <div 
                        key={fl.id} 
                        style={{ background: 'rgba(249, 115, 22, 0.02)', border: '1px solid rgba(249, 115, 22, 0.15)', borderRadius: '6px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer' }}
                        onClick={() => {
                          onProjectSelect({
                            id: fl.id,
                            name: fl.rig_name,
                            lat: fl.coords[0],
                            lng: fl.coords[1],
                            country: fl.field,
                            status: 'Active Flaring',
                            description: fl.inferred_need,
                            kind: 'flare'
                          })
                        }}
                        title="Localiser l'anomalie sur la carte"
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffedd5' }}>{fl.rig_name}</span>
                          <span style={{ fontSize: '0.62rem', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                            🔥 +{fl.thermal_increase_pct}% Flare
                          </span>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>
                          Champ : <strong>{fl.field}</strong> &bull; Intensité : <strong style={{ color: '#f97316' }}>{fl.flaring_level}</strong>
                        </div>
                        <p style={{ fontSize: '0.65rem', color: '#94a3b8', margin: '2px 0 0 0', lineHeight: '1.2', borderTop: '1px dashed rgba(255,255,255,0.05)', paddingTop: '4px' }}>
                          💡 <strong>Besoin inféré :</strong> {fl.inferred_need}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Collapsible LinkedIn Stakeholder Tracker */}
              <div className="social-tracker-section" style={{ display: 'flex', flexDirection: 'column' }}>
                <div 
                  className="fleet-registry-header" 
                  onClick={() => setSocialExpanded(!socialExpanded)} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    background: 'rgba(59, 130, 246, 0.05)', 
                    borderTop: '1px solid var(--border-color)', 
                    padding: '12px 24px', 
                    fontSize: '0.7rem', 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    color: '#3b82f6', 
                    cursor: 'pointer' 
                  }}
                >
                  <span>🏢 LinkedIn Stakeholder Tracker</span>
                  <span>{socialExpanded ? '▼' : '▶'}</span>
                </div>
                
                {socialExpanded && (
                  <div style={{ padding: '15px 24px', background: 'rgba(0, 0, 0, 0.25)', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0 0 4px 0', lineHeight: '1.4' }}>
                      Suivi des nominations et des déplacements du personnel d'achat des Majors / EPCIs :
                    </p>
                    
                    {(oiosData.oios_social_org_chart || []).map((s) => (
                      <div key={s.id} style={{ background: 'rgba(59, 130, 246, 0.02)', border: '1px solid rgba(59, 130, 246, 0.15)', borderRadius: '6px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#eff6ff' }}>{s.name}</span>
                          <span style={{ fontSize: '0.55rem', background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa', padding: '2px 5px', borderRadius: '4px' }}>
                            LinkedIn Target
                          </span>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#cbd5e1', lineHeight: '1.3' }}>
                          Précédent : <span style={{ color: '#94a3b8' }}>{s.previous_role}</span><br />
                          Nouveau : <strong style={{ color: '#3b82f6' }}>{s.new_role}</strong>
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', borderTop: '1px dashed rgba(255,255,255,0.05)', paddingTop: '4px' }}>
                          🎯 <strong>Impact commercial :</strong> {s.project_impact}
                        </div>
                        <button
                          onClick={() => {
                            const subject = `Boluda Towage Offshore Division: Hello from Wael Fachate`
                            const body = `Dear ${s.name},\n\nI noticed your new assignment as ${s.new_role}. Congratulations on the role!\n\nAs you manage offshore logistics in the region, I wanted to let you know that Boluda Towage operates high-performance escort tugs and AHTS in West Africa. We would love to discuss how we can support your upcoming campaigns.\n\nBest regards,\nWael FACHATE`
                            const mailto = `mailto:${s.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
                            window.open(mailto, '_blank')
                          }}
                          style={{
                            marginTop: '6px',
                            width: '100%',
                            padding: '4px',
                            background: 'rgba(59, 130, 246, 0.15)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            color: '#fff',
                            borderRadius: '4px',
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                          className="osint-social-btn"
                        >
                          📧 ENVOYER MAIL DE PRISE DE CONTACT
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Collapsible Cabotage Auditor */}
              <div className="cabotage-section" style={{ display: 'flex', flexDirection: 'column' }}>
                <div 
                  className="fleet-registry-header" 
                  onClick={() => setCabotageExpanded(!cabotageExpanded)} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    background: 'rgba(20, 184, 166, 0.05)', 
                    borderTop: '1px solid var(--border-color)', 
                    padding: '12px 24px', 
                    fontSize: '0.7rem', 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    color: '#14b8a6', 
                    cursor: 'pointer' 
                  }}
                >
                  <span>🛏️ Validateur de Cabotage (Local Content)</span>
                  <span>{cabotageExpanded ? '▼' : '▶'}</span>
                </div>
                
                {cabotageExpanded && (
                  <div style={{ padding: '15px 24px', background: 'rgba(0, 0, 0, 0.25)', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0 0 4px 0', lineHeight: '1.4' }}>
                      Audit de conformité des équipages par rapport aux règles de cabotage nationales :
                    </p>
                    
                    {(oiosData.oios_cabotage_auditor || []).map((c, i) => (
                      <div key={i} style={{ background: 'rgba(20, 184, 166, 0.02)', border: '1px solid rgba(20, 184, 166, 0.15)', borderRadius: '6px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f0fdfa' }}>{c.vessel} ({c.flag})</span>
                          <span style={{ fontSize: '0.62rem', background: 'rgba(20, 184, 166, 0.15)', color: '#14b8a6', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                            {c.compliance_pct}% Local
                          </span>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>
                          Équipage : <strong>{c.crew_locals} Locaux / {c.crew_expats} Expats</strong> &bull; Statut : <strong style={{ color: c.cabotage_status.includes('Conforme') ? '#10b981' : '#f59e0b' }}>{c.cabotage_status}</strong>
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', borderTop: '1px dashed rgba(255,255,255,0.05)', paddingTop: '4px', marginTop: '2px' }}>
                          🛠️ <strong>Actions correctives :</strong> {c.actions}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Collapsible Shadow Bidding Simulator */}
              <div className="shadow-bid-section" style={{ display: 'flex', flexDirection: 'column' }}>
                <div 
                  className="fleet-registry-header" 
                  onClick={() => setShadowBidExpanded(!shadowBidExpanded)} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    background: 'rgba(234, 179, 8, 0.05)', 
                    borderTop: '1px solid var(--border-color)', 
                    padding: '12px 24px', 
                    fontSize: '0.7rem', 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    color: '#eab308', 
                    cursor: 'pointer' 
                  }}
                >
                  <span>🔮 Estimateur Shadow Bidding (Monte Carlo)</span>
                  <span>{shadowBidExpanded ? '▼' : '▶'}</span>
                </div>
                
                {shadowBidExpanded && (
                  <div style={{ padding: '15px 24px', background: 'rgba(0, 0, 0, 0.25)', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0 0 4px 0', lineHeight: '1.4' }}>
                      Simulation de tarification concurrentielle pour maximiser la probabilité de gain :
                    </p>
                    
                    {(oiosData.oios_shadow_bidder || []).map((t, idx) => (
                      <div key={idx} style={{ background: 'rgba(234, 179, 8, 0.02)', border: '1px solid rgba(234, 179, 8, 0.15)', borderRadius: '6px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fef9c3' }}>{t.title}</div>
                        <div style={{ fontSize: '0.68rem', color: '#cbd5e1', marginBottom: '4px' }}>
                          Estimations Offres Concurrentes :
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                          {t.rivals.map((r, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '5px 8px', borderRadius: '4px', fontSize: '0.62rem', border: '1px solid rgba(255,255,255,0.04)' }}>
                              <strong style={{ color: '#f59e0b' }}>{r.name}</strong> : <span style={{ color: '#fff', fontWeight: 700 }}>{r.est_bid}</span> ({r.vessel})<br />
                              <span style={{ color: '#94a3b8', fontSize: '0.58rem' }}>{r.reason}</span>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={triggerShadowBidSim}
                          disabled={shadowBidSimulating}
                          style={{
                            width: '100%',
                            padding: '6px',
                            background: shadowBidSimulating ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                            border: 'none',
                            color: shadowBidSimulating ? '#64748b' : '#000',
                            fontWeight: 700,
                            borderRadius: '4px',
                            fontSize: '0.68rem',
                            cursor: shadowBidSimulating ? 'not-allowed' : 'pointer',
                            marginBottom: '6px',
                            transition: 'all 0.2s'
                          }}
                        >
                          {shadowBidSimulating ? 'SIMULATION EN COURS...' : 'LANCER MONTE CARLO'}
                        </button>

                        {shadowBidDone && (
                          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '4px', padding: '8px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700 }}>Prix Recommandé :</span>
                              <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 800 }}>{t.recommended_bid}</span>
                            </div>
                            <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>
                              Probabilité estimée de gain : <strong style={{ color: '#10b981' }}>{t.win_probability_pct}%</strong>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Collapsible Fleet Registry */}
              <div className="fleet-registry-section" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="fleet-registry-header" onClick={() => setFleetExpanded(!fleetExpanded)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0, 0, 0, 0.2)', borderTop: '1px solid var(--border-color)', padding: '12px 24px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <span>Disponibilité des navires ({vesselsData.vessels.length} navires)</span>
                  <span>{fleetExpanded ? '▼' : '▶'}</span>
                </div>
                
                {fleetExpanded && (
                  <div className="fleet-registry-list" style={{ maxHeight: '220px', overflowY: 'auto', borderTop: '1px solid var(--border-color)', background: 'rgba(0, 0, 0, 0.15)' }}>
                    <div className="registry-filters" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '10px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      {['all', 'ahts', 'tugs', 'psvs', 'mpsvs', 'multicats'].map((cat) => (
                        <button
                          key={cat}
                          className={`filter-chip${activeVesselCategory === cat ? ' active' : ''}`}
                          onClick={() => setActiveVesselCategory(cat)}
                          style={{
                            background: activeVesselCategory === cat ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                            borderColor: activeVesselCategory === cat ? '#3b82f6' : 'var(--border-color)',
                            color: activeVesselCategory === cat ? '#fff' : 'var(--text-secondary)',
                            padding: '4px 10px',
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            borderRadius: '20px',
                            border: '1px solid var(--border-color)',
                            cursor: 'pointer'
                          }}
                        >
                          {cat === 'all' ? 'Tous' : cat === 'tugs' ? 'Remorqueurs' : cat.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    <div className="fleet-vessels-list">
                      {filteredVessels.map((v, i) => {
                        const isAvail = v.availability.toLowerCase().includes('avail') || v.availability.toLowerCase().includes('disp')
                        return (
                          <div key={i} className="fleet-vessel-row" onClick={() => handleVesselClick(v)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.03)', fontSize: '0.75rem', cursor: 'pointer' }}>
                            <div>
                              <div className="vessel-name-cell" style={{ fontWeight: 600, color: '#fff' }}>{v.name}</div>
                              <div className="vessel-spec-cell" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '1px' }}>{v.bp}T BP &bull; {v.type}</div>
                            </div>
                            <span
                              className="vessel-status-badge"
                              style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                background: isAvail ? 'rgba(16, 185, 129, 0.15)' : 'rgba(156, 163, 175, 0.15)',
                                color: isAvail ? '#10b981' : '#9ca3af'
                              }}
                            >
                              {translateAvailability(v.availability)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      ) : (
        // ----------------- STANDARD COMMERCIAL COCKPIT VIEW -----------------
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
          
          <div className="sidebar-header">
            <div className="search-box">
              <SearchIcon />
              <input
                className="search-input"
                type="text"
                placeholder="Projet, terminal, pays, opérateur…"
                value={search}
                autoComplete="off"
                onChange={(e) => { onSearch(e.target.value); setShowSuggestions(true) }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 160)}
              />
              {search && (
                <button className="search-clear" onClick={() => { onSearch(''); setShowSuggestions(false) }}>×</button>
              )}

              {showSuggestions && suggestions.length > 0 && (
                <div className="search-suggestions">
                  {suggestions.map((s, i) => {
                    const t = SUGGESTION_TYPES[s.kind] || SUGGESTION_TYPES.project
                    return (
                      <div
                        key={i}
                        className="search-suggestion-item"
                        onMouseDown={() => handleSuggestionClick(s)}
                      >
                        <span className="suggestion-tag" style={{ background: t.color + '22', color: t.color, border: `1px solid ${t.color}44` }}>
                          {t.label}
                        </span>
                        <span className="suggestion-body">
                          <span className="suggestion-label">{s.label}</span>
                          <span className="suggestion-sub">{s.sub}</span>
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="filters-section" style={{ overflowY: 'auto' }}>
            <div className="filters-header">
              <span className="filters-label">Filtres</span>
              <button className={`filters-reset${hasActiveFilters ? ' visible' : ''}`} onClick={resetFilters}>
                Réinitialiser
              </button>
            </div>

            <div className="filter-group">
              <div className="filter-group-label">Statut</div>
              <div className="filter-chips">
                {ALL_STATUSES.map((s) => {
                  const active = filters.statuses.includes(s)
                  const color = STATUS_COLORS[s]
                  return (
                    <button
                      key={s}
                      className={`chip${active ? ' active' : ''}`}
                      style={active ? { background: color + '22', borderColor: color + '88', color } : {}}
                      onClick={() => toggleChip('statuses', s)}
                    >
                      <span className="chip-dot" style={{ background: color }} />
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="filter-group">
              <div className="filter-group-label">Secteur</div>
              <div className="filter-chips">
                {ALL_TYPES.map((t) => {
                  const active = filters.types.includes(t)
                  const color = TYPE_COLORS[t]
                  return (
                    <button
                      key={t}
                      className={`chip${active ? ' active' : ''}`}
                      style={active ? { background: color + '22', borderColor: color + '88', color } : {}}
                      onClick={() => toggleChip('types', t)}
                    >
                      <span className="chip-dot" style={{ background: color }} />
                      {t}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="filter-group">
              <div className="filter-group-label">Priorité</div>
              <div className="filter-chips">
                {URGENCY_TAGS.map(({ tag, label }) => {
                  const active = filters.urgencyTags?.includes(tag)
                  return (
                    <button
                      key={tag}
                      className={`chip${active ? ' active' : ''}`}
                      style={active ? { background: 'rgba(240,165,0,0.15)', borderColor: 'rgba(240,165,0,0.5)', color: '#f0a500' } : {}}
                      onClick={() => toggleChip('urgencyTags', tag)}
                    >
                      <span className="chip-dot" style={{ background: active ? '#f0a500' : 'var(--text-muted)' }} />
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="filter-group">
              <div className="filter-group-label">Pays</div>
              <div className="filter-select-wrap">
                <select className="filter-select" multiple size={3} value={filters.countries} onChange={handleCountryChange}>
                  {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {filters.countries.length > 0 && (
                <div className="filter-hint">{filters.countries.length} sélectionné · Ctrl+clic pour multi</div>
              )}
            </div>

            <div className="filter-group" style={{ marginBottom: 0 }}>
              <div className="filter-group-label">Opérateur</div>
              <div className="filter-select-wrap">
                <select className="filter-select" multiple size={3} value={filters.operators} onChange={handleOperatorChange}>
                  {operators.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              {filters.operators.length > 0 && (
                <div className="filter-hint">{filters.operators.length} sélectionné · Ctrl+clic pour multi</div>
              )}
            </div>
          </div>

          <div className="stats-bar">
            <span className="stats-count">
              <strong>{filteredProjects.length}</strong> offshore&nbsp;·&nbsp;
              <strong>{(miningTerminals || []).length}</strong> minier&nbsp;·&nbsp;
              <strong>{(windProjects || []).length}</strong> éolien&nbsp;·&nbsp;
              <strong>{(ports || []).length}</strong> portuaire
            </span>
            {selectedProject && (
              <button className="stats-clear-sel" onClick={() => onProjectSelect(null)}>
                Désélectionner
              </button>
            )}
          </div>

          <div className="project-list" style={{ overflowY: 'auto', flexGrow: 1 }}>
            {(filteredProjects.length > 0 || (miningTerminals || []).length > 0) && (
              <div className="section-header section-header-offshore">
                <span className="section-header-icon"><OffshoreIcon /></span>
                <span className="section-header-label">Offshore Oil &amp; Gas</span>
                <span className="section-header-count">{filteredProjects.length}</span>
              </div>
            )}

            {filteredProjects.length === 0 ? (
              <div className="no-results">
                <SearchIcon size={28} />
                <p>Aucun projet ne correspond aux filtres.</p>
              </div>
            ) : (
              filteredProjects.map((p) => {
                const color = STATUS_COLORS[p.status] || '#fff'
                const isSelected = selectedProject?.id === p.id
                const keyAssets = getKeyAssets(p)
                const isProjContacted = (linkedinHistory || []).some(h => 
                  h.project_id === p.id || (h.project && h.project.toLowerCase().trim() === p.name.toLowerCase().trim())
                )
                return (
                  <div
                    key={p.id}
                    className={`project-card${isSelected ? ' selected' : ''}`}
                    onClick={() => onProjectSelect(isSelected ? null : p)}
                  >
                    <div className="card-top">
                      <div className="card-name">{p.name}</div>
                      <div className="card-badges">
                        {isProjContacted && (
                          <span className="badge badge-contacted" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
                            ✅ Contacté
                          </span>
                        )}
                        <span className="badge badge-status"
                          style={{ background: color + '22', color, borderColor: color + '55' }}>
                          {p.status}
                        </span>
                        <span className="badge badge-type">{p.type}</span>
                        {p.marine_assets && (
                          <span className="badge badge-enriched" title="Données enrichies">ENR</span>
                        )}
                      </div>
                    </div>
                    <div className="card-meta">
                      <span>{p.country}</span>
                      <span className="card-meta-sep">·</span>
                      <span>{p.operator}</span>
                    </div>
                    {p.firstOil && p.firstOil !== 'TBD' && (
                      <div className="card-first-oil">Début prod. : {p.firstOil}</div>
                    )}
                    {rigFor(p) && (
                      <div className="card-rig"><span className="card-rig-label">Rig</span>{rigFor(p)}</div>
                    )}
                    {keyAssets.length > 0 && (
                      <div className="card-assets">
                        {keyAssets.map((a, i) => (
                          <span key={i} className="card-asset-chip">
                            {ASSET_ICONS[a.type] || '◉'} {a.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}

            {(windProjects || []).length > 0 && (
              <>
                <div className="section-header section-header-wind">
                  <span className="section-header-icon"><WindIcon /></span>
                  <span className="section-header-label">Éolien Offshore Europe</span>
                  <span className="section-header-count">{windProjects.length}</span>
                </div>

                {windProjects.map((w) => {
                  const color = w.map_popup_interface.header_color
                  const isSelected = selectedProject?.id === w.id
                  return (
                    <div
                      key={w.id}
                      className={`project-card project-card-mining${isSelected ? ' selected' : ''}`}
                      style={isSelected ? { borderColor: color } : {}}
                      onClick={() => onProjectSelect(isSelected ? null : w)}
                    >
                      <div className="card-top">
                        <div className="card-name">{w.name}</div>
                        <div className="card-badges">
                          <span className="badge" style={{ background: color + '22', color, borderColor: color + '55' }}>
                            {w.capacity_mw} MW
                          </span>
                        </div>
                      </div>
                      <div className="card-meta">
                        <span>{w.country}</span>
                        <span className="card-meta-sep">·</span>
                        <span style={{ fontSize: 10 }}>
                          {w.operator.length > 32 ? w.operator.slice(0, 32) + '…' : w.operator}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </>
            )}

            {(miningTerminals || []).length > 0 && (
              <>
                <div className="section-header section-header-mining">
                  <span className="section-header-icon"><MiningIcon /></span>
                  <span className="section-header-label">Terminaux Miniers</span>
                  <span className="section-header-count">{miningTerminals.length}</span>
                </div>

                {miningTerminals.map((t) => {
                  const color = t.map_popup_interface.header_color
                  const isSelected = selectedProject?.id === t.id
                  return (
                    <div
                      key={t.id}
                      className={`project-card project-card-mining${isSelected ? ' selected' : ''}`}
                      style={isSelected ? { borderColor: color } : {}}
                      onClick={() => onProjectSelect(isSelected ? null : t)}
                    >
                      <div className="card-top">
                        <div className="card-name">{t.terminal_name}</div>
                        <div className="card-badges">
                          <span className="badge" style={{ background: color + '22', color, borderColor: color + '55' }}>
                            {t.commodity}
                          </span>
                        </div>
                      </div>
                      <div className="card-meta">
                        <span>{t.country}</span>
                        <span className="card-meta-sep">·</span>
                        <span style={{ fontSize: 10 }}>
                          {t.operator.length > 32 ? t.operator.slice(0, 32) + '…' : t.operator}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </>
            )}

            {(ports || []).length > 0 && (
              <>
                <div className="section-header section-header-port" style={{ borderLeftColor: '#00f0ff' }}>
                  <span className="section-header-icon" style={{ color: '#00f0ff' }}><PortIcon /></span>
                  <span className="section-header-label">Construction Portuaire</span>
                  <span className="section-header-count">{ports.length}</span>
                </div>

                {ports.map((po) => {
                  const color = po.map_popup_interface.header_color
                  const isSelected = selectedProject?.id === po.id
                  return (
                    <div
                      key={po.id}
                      className={`project-card project-card-mining${isSelected ? ' selected' : ''}`}
                      style={isSelected ? { borderColor: color } : {}}
                      onClick={() => onProjectSelect(isSelected ? null : po)}
                    >
                      <div className="card-top">
                        <div className="card-name">{po.name}</div>
                        <div className="card-badges">
                          <span className="badge" style={{ background: color + '22', color, borderColor: color + '55' }}>
                            {po.status}
                          </span>
                        </div>
                      </div>
                      <div className="card-meta">
                        <span>{po.country}</span>
                        <span className="card-meta-sep">·</span>
                        <span style={{ fontSize: 10 }}>
                          {po.operator.length > 32 ? po.operator.slice(0, 32) + '…' : po.operator}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </div>

        </div>
      )}

      <div className="sidebar-resize-handle" onMouseDown={startResize} />
      <button className="sidebar-toggle" onClick={onToggle} title={isOpen ? 'Réduire' : 'Ouvrir'}>
        {isOpen ? <ChevronLeft /> : <ChevronRight />}
      </button>
    </aside>
  )
}
