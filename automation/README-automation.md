# FABLE — Automatisation des agents & mise à jour du lien Vercel

Automatisation **100% locale en PowerShell** : lance tous les agents, reconstruit la
carte et met à jour le **lien Vercel de production** `africa-offshore-map.vercel.app`.

Tout est **indépendant de la machine** (plus aucun chemin codé en dur) : détection
automatique du dossier du projet et des outils.

> ⏰ **Tâche planifiée active** : `FABLE-Agents-Vercel` — **tous les 2 jours à 10h00**, en local.

---

## 🚨 BLOCAGE ACTUEL — sources manquantes

Le transfert depuis l'ancienne machine est **incomplet** :

| Élément | État |
|---|---|
| `src/components/` | **VIDE** — il manque `Map`, `Sidebar`, `Legend`, `TopOpportunities`, `VoyageEstimator`, `GanttTimeline` |
| `src/data/` | **VIDE** — il manque `projects.json`, `mining_terminals.json`, `wind_projects.json`, `ports.json` (+ `vessels.json` attendu par Overmind) |
| `dist/assets/` | vide |
| `node_modules` | ✅ réparé (`npm install`) |

Conséquence : `npm run build` échoue (`Could not resolve "./components/Map"`), donc
l'agent **CARTOGRAPHE ne peut pas déployer**.

✅ **Bonne nouvelle** : c'est volontairement sécurisé — build KO ⇒ **aucun déploiement**.
La carte en ligne (déployée depuis l'ancienne machine) **reste intacte et fonctionnelle**.

**Pour débloquer** : restaurer `src/components/` et `src/data/` (dépôt GitHub, sauvegarde,
ou ancienne machine). Dès qu'ils sont là, toute la chaîne fonctionne sans rien changer.

---

## 🤖 Les 10 agents (dans l'ordre d'exécution)

Les agents de données tournent **avant** Overmind et **l'alimentent** — ils complètent
ses 12 sous-modules, ils ne les remplacent pas (voir `overmind-prompt.md`).

| # | Agent | Rôle | État |
|---|---|---|---|
| 1 | **FX-RATE** | EUR/USD du jour (BCE) → Pricing Engine | ✅ testé |
| 2 | **METOCEAN** | Houle 5 j sur 6 zones (Open-Meteo) → PROPHET | ✅ testé |
| 3 | **TENDER-HAWK** | Signaux appels d'offres (RSS) → Tender Whisperer | ✅ testé |
| 4 | **PROSPECT-ENRICHER** | Décideurs via Apollo.io → pipeline | ⏸️ besoin `APOLLO_API_KEY` |
| 5 | **OVERMIND** | Agent Claude, 12 sous-modules | ✅ prêt (CLI installée) |
| 6 | **OIOS** | Prospecteur Python | ⏸️ `daily_prospector.py` absent |
| 7 | **CARTOGRAPHE** | build + deploy + **MAJ du lien Vercel** | ⛔ bloqué (sources) |
| 8 | **WATCHTOWER** | Vérifie que la carte est vraiment en ligne | ✅ testé |
| 9 | **SNAPSHOT-QA** | Capture de la carte live → Telegram | ✅ testé |
| 10 | **GIT-SENTINEL** | Sauvegarde git (commit + push) | ✅ prêt |

**Modèle IA** : `sonnet` par défaut, avec **garde-fou : jamais Fable** (`Resolve-ClaudeModel`).
Override : `-Model opus` ou `$env:FABLE_CLAUDE_MODEL`.

---

## 📁 Fichiers

| Fichier | Rôle |
|---|---|
| `run-all-agents.ps1` | **Orchestrateur** des 10 agents |
| `run-overmind.ps1` | Agent Overmind (Claude) |
| `agents\*.ps1` | Les 7 nouveaux agents |
| `_lib.ps1` | Détection outils/chemins, `.env`, Telegram, modèle |
| `register-scheduler.ps1` | Tâche planifiée (2 j / 10h) |
| `setup-new-machine.ps1` | Prépare une nouvelle machine |
| `logs/` · `data/` | Journaux (20 derniers) · sorties JSON des agents |
| `last-vercel-url.txt` | Dernier lien Vercel déployé |

---

## ▶️ Utilisation

```powershell
.\run-all-agents.ps1                        # TOUT (défaut)
.\run-all-agents.ps1 -Only fx-rate,metocean # agents choisis
.\run-all-agents.ps1 -Skip overmind         # tout sauf...
.\run-all-agents.ps1 -Deploy                # juste MAJ du lien Vercel
.\run-all-agents.ps1 -NoDeploy              # sans déploiement
.\run-all-agents.ps1 -Model opus            # forcer Opus
```

Noms d'agents : `fx-rate metocean tender-hawk prospect overmind oios cartographe watchtower snapshot git`

**Planificateur :**
```powershell
Start-ScheduledTask   -TaskName 'FABLE-Agents-Vercel'    # lancer maintenant
Get-ScheduledTaskInfo -TaskName 'FABLE-Agents-Vercel'    # prochaine exécution
Unregister-ScheduledTask -TaskName 'FABLE-Agents-Vercel' -Confirm:$false
```

---

## 🔑 Reste à configurer

1. **`vercel login`** puis `vercel link` (projet `africa-offshore-map`) — requis pour déployer.
2. **`claude`** : lancer une fois pour authentifier la CLI (agent Overmind).
3. *(optionnel)* `APOLLO_API_KEY=...` dans `.env` → active PROSPECT-ENRICHER.
4. *(optionnel)* `git remote add origin <URL>` → active le push de GIT-SENTINEL.

> ⚠️ `.env` contient des secrets (Telegram, Gemini). GIT-SENTINEL le met
> automatiquement dans `.gitignore` et le dé-suit s'il avait été versionné.

---

## ✨ Agent restant à ajouter

**AIS-LIVE** — suivi AIS temps réel des navires prioritaires (AISStream.io, clé gratuite)
→ maj `vessels.json` → redéploiement auto de la carte. *(mis de côté pour l'instant)*
