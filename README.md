# 🌍 Africa Offshore Map — OIOS

**Offshore Intelligence Operating System** : cockpit web d'intelligence commerciale pour les services maritimes offshore en Afrique (flotte de soutien, rigs de forage, FPSO/FLNG, tenders, prospection).

Application **Vite + React 18 + MapLibre-GL** adossée à une couche d'automatisation **Python / PowerShell** qui alimente quotidiennement les données de la carte.

---

## ✨ Fonctionnalités

- **Carte offshore interactive** (MapLibre-GL) : 86 navires de soutien (AHTS, Tugs, PSV, MPSV, Multicats) et 21 actifs stratégiques (6 rigs, 15 FPSO/FLNG).
- **OIOS Swarm Intel** : vue d'intelligence prédictive commutable avec le cockpit commercial classique.
- **Tracés de mouvements prédictifs** : itinéraires projetés des rigs/FPSO (chantiers SPS, swaps de blocs) mis en surbrillance au clic.
- **Estimateur de voyage & calculs hydrodynamiques** : tensions de câble de remorquage (normal/tempête) et génération d'un script Blender pour la scène de remorquage 3D.
- **Cockpit commercial** : opportunités, tenders, bases de leads et suivi de prospection.

## 🗂️ Structure du dépôt

```
src/                 Application React (composants, data JSON, logique intel)
  components/        Map, Sidebar, Legend, GanttTimeline, VoyageEstimator, TopOpportunities
  data/              Jeux de données (vessels, ports, projects, leads, tenders…)
automation/          Agents d'automatisation (PowerShell + Python)
  agents/            ais, metocean, fx-rate, tender-hawk, prospect-enricher, git-sentinel…
  data/              Sorties des agents (fx, metocean, tenders, uptime…)
reports/             Rapports Overmind générés
.github/workflows/   oios_daily.yml — pipeline d'intelligence quotidien
```

## 🚀 Démarrage

### 1. Cockpit web

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # build de production dans dist/
```

### 2. Pipeline d'intelligence (optionnel)

```bash
# Dépendances Python
pip install -r requirements.txt

# Lancer les agents
powershell ./automation/run-all-agents.ps1
```

## 🔐 Configuration

Les agents Python nécessitent des clés d'API placées dans un fichier **`.env`** à la racine (non versionné — voir `.gitignore`). Créez-le localement avec vos propres identifiants ; ne le committez jamais.

## 🛠️ Stack

| Couche | Technologies |
|---|---|
| Frontend | Vite 6, React 18, MapLibre-GL 4 |
| Automatisation | Python (google-generativeai, duckduckgo-search, python-dotenv), PowerShell |
| CI / déploiement | GitHub Actions, Vercel |

---

> Dépôt **privé**. Certains jeux de données (`src/data/*.json`) contiennent des informations commerciales sensibles (leads, prospection) : conservez la visibilité privée et ne partagez qu'avec des collaborateurs de confiance.
