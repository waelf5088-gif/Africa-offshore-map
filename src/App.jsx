import { useState, useMemo, useEffect } from 'react'
import Map from './components/Map'
import Sidebar from './components/Sidebar'
import Legend from './components/Legend'
import TopOpportunities from './components/TopOpportunities'
import VoyageEstimator from './components/VoyageEstimator'
import GanttTimeline from './components/GanttTimeline'
import projectsData from './data/projects.json'
import miningTerminalsData from './data/mining_terminals.json'
import windProjectsData from './data/wind_projects.json'
import portsData from './data/ports.json'
import './App.css'

// Deep-link: ?project=ANG-012 opens the map on that project/terminal/wind farm
const findById = (id) =>
  projectsData.find((p) => p.id === id) ||
  miningTerminalsData.find((t) => t.id === id) ||
  windProjectsData.find((w) => w.id === id) ||
  portsData.find((po) => po.id === id) || null

export default function App() {
  const [selectedProject, setSelectedProject] = useState(() =>
    findById(new URLSearchParams(window.location.search).get('project'))
  )
  const [viewMode, setViewMode] = useState('standard')
  const [selectedPrediction, setSelectedPrediction] = useState(null)
  const [sarModeActive, setSarModeActive] = useState(false)
  const [selectedBargeHypothesis, setSelectedBargeHypothesis] = useState(null)


  useEffect(() => {
    const url = new URL(window.location.href)
    if (selectedProject) url.searchParams.set('project', selectedProject.id)
    else url.searchParams.delete('project')
    window.history.replaceState(null, '', url)
  }, [selectedProject])
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    statuses: [],
    types: [],
    countries: [],
    operators: [],
    urgencyTags: [],
  })
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [ganttOpen, setGanttOpen] = useState(false)

  const filteredProjects = useMemo(() => {
    const q = search.toLowerCase()
    return projectsData.filter((p) => {
      if (q) {
        const hit =
          p.name.toLowerCase().includes(q) ||
          p.country.toLowerCase().includes(q) ||
          p.operator.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.block_location && p.block_location.toLowerCase().includes(q)) ||
          (p.marine_assets && p.marine_assets.some(
            (a) => a.name.toLowerCase().includes(q) || a.type.toLowerCase().includes(q)
          ))
        if (!hit) return false
      }
      if (filters.statuses.length && !filters.statuses.includes(p.status)) return false
      // Offshore projects only shown when no type filter, or when an Oil/Gas/LNG type matches
      const offshoreTypes = filters.types.filter((t) => t !== 'Mining' && t !== 'Wind')
      if (filters.types.length > 0 && offshoreTypes.length === 0) return false  // Mining/Wind-only → hide offshore
      if (offshoreTypes.length && !offshoreTypes.includes(p.type)) return false
      if (filters.countries.length && !filters.countries.includes(p.country)) return false
      if (filters.operators.length && !filters.operators.includes(p.operator)) return false
      if (filters.urgencyTags?.includes('has_tenders') &&
          !(p.tender_tracker?.future_tenders?.length > 0) &&
          !(p.map_popup_interface?.tabs_content?.tenders?.future_tenders?.length > 0)) return false
      if (filters.urgencyTags?.includes('enriched') && !p.marine_assets && !p.map_popup_interface) return false
      return true
    })
  }, [search, filters])

  // Mining terminals visible only when no type filter OR Mining type is selected
  const filteredMiningTerminals = useMemo(() => {
    if (!filters.types.length) return miningTerminalsData
    if (filters.types.includes('Mining')) return miningTerminalsData
    return []
  }, [filters.types])

  // Wind farms visible only when no type filter OR Wind type is selected
  const filteredWindProjects = useMemo(() => {
    if (!filters.types.length) return windProjectsData
    if (filters.types.includes('Wind')) return windProjectsData
    return []
  }, [filters.types])

  // Port constructions visible only when no type filter OR Port type is selected
  const filteredPorts = useMemo(() => {
    if (!filters.types.length) return portsData
    if (filters.types.includes('Port')) return portsData
    return []
  }, [filters.types])

  const filteredIds = useMemo(
    () => new Set(filteredProjects.map((p) => p.id)),
    [filteredProjects]
  )

  const handleProjectSelect = (project) => setSelectedProject(project)

  return (
    <div className="app">
      <Sidebar
        projects={projectsData}
        filteredProjects={filteredProjects}
        miningTerminals={filteredMiningTerminals}
        windProjects={filteredWindProjects}
        ports={filteredPorts}
        selectedProject={selectedProject}
        onProjectSelect={handleProjectSelect}
        search={search}
        onSearch={setSearch}
        filters={filters}
        onFilter={setFilters}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedPrediction={selectedPrediction}
        setSelectedPrediction={setSelectedPrediction}
        sarModeActive={sarModeActive}
        setSarModeActive={setSarModeActive}
        selectedBargeHypothesis={selectedBargeHypothesis}
        onBargeHypothesisSelect={setSelectedBargeHypothesis}
      />

      <div className="map-wrapper">
        {!sidebarOpen && (
          <button className="sidebar-open-btn" onClick={() => setSidebarOpen(true)}>
            ☰ Projets
          </button>
        )}
        <Map
          projects={projectsData}
          filteredIds={filteredIds}
          miningTerminals={miningTerminalsData}
          filteredMiningTerminals={filteredMiningTerminals}
          windProjects={windProjectsData}
          filteredWindProjects={filteredWindProjects}
          ports={portsData}
          filteredPorts={filteredPorts}
          selectedProject={selectedProject}
          onProjectSelect={handleProjectSelect}
          viewMode={viewMode}
          selectedPrediction={selectedPrediction}
          onPredictionSelect={setSelectedPrediction}
          sarModeActive={sarModeActive}
          onSarToggle={setSarModeActive}
          selectedBargeHypothesis={selectedBargeHypothesis}
          onBargeHypothesisSelect={setSelectedBargeHypothesis}
        />

        <TopOpportunities
          projects={projectsData}
          miningTerminals={[...miningTerminalsData, ...windProjectsData]}
          onProjectSelect={handleProjectSelect}
          selectedProject={selectedProject}
        />
        <VoyageEstimator className={ganttOpen ? 'gantt-open' : ''} />
        <Legend className={ganttOpen ? 'gantt-open' : ''} />
        <GanttTimeline
          onProjectSelect={handleProjectSelect}
          selectedProject={selectedProject}
          isOpen={ganttOpen}
          onToggle={() => setGanttOpen(!ganttOpen)}
        />
      </div>
    </div>
  )
}
