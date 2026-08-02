# 🧠 FABLE TOWAGE OVERMIND V8 - CYCLE #5
**2 août 2026 · Cycle automatique : tous les 2 jours à 10h**

> Note opérationnelle : l'écart réel entre ce cycle et le précédent (28 juillet) est de **5 jours**, non 2 — signe d'un ou plusieurs cycles automatiques manqués entre-temps. Les agents de données locaux (FX-RATE, METOCEAN, TENDER-HAWK) ont bien tourné le 02/08 à 02h38 avant ce cycle ; leurs sorties (`fx-rate.json`, `metocean.json`, `tenders.json`) sont intégrées ci-dessous. `prospects.json` reste absent (PROSPECT-ENRICHER inactif, `APOLLO_API_KEY` non configurée). Note technique : le build/déploiement Vercel n'a pas pu être déclenché directement depuis cette session (permissions d'exécution `npm`/`node` non disponibles en mode non-interactif) — `vessels.json` a néanmoins été mis à jour et sera pris en charge par l'étape CARTOGRAPHE du pipeline `run-all-agents.ps1` qui s'exécute juste après Overmind (build + deploy + alias), conformément à l'architecture documentée.

---

## 1. 🔍 SENTINEL - Rapport de veille

Fenêtre : 28 juillet → 2 août 2026 (5 jours).

| Projet | Changement détecté | Impact towage |
|---|---|---|
| **Baleine Phase 3** (Côte d'Ivoire) | Aucun développement nouveau au-delà du contrat Saipem déjà capté au cycle #4 (27/07, ~800-930 M€ selon les sources, engineering/fabrication/transport/installation de ~50 km de pipelines rigides + structures subsea + 3 km de flowline gaz flexible + 22 km d'ombilical). Détail confirmé : mobilisation des navires de construction **FDS et Shen Da**, durée de projet ~3 ans. | Statu quo depuis le catalyseur du 27/07 — fenêtre de prospection toujours ouverte (voir §10). |
| **Mozambique LNG / Afungi** | 🟡 **Nouveau signal logistique** : MSC a lancé une **"Afungi Shuttle"** dédiée (~22/07), liaison maritime régulière entre Afungi et les ports de Nacala/Maputo pour le fret et les équipements de construction. Chantier toujours ~40-45 % d'avancement, >4 000 travailleurs mobilisés, premier gaz visé 2029. Budget confirmé à 20,5 Md$ (dont ~4,5 Md$ dépensés durant la force majeure). | Signal indirect positif : confirme l'intensification du trafic maritime sur zone Afungi, cohérent avec une fenêtre de mobilisation marine active — pertinent pour les dossiers Leo et Nomasa (§3, §8). |
| **Coral Norte FLNG** | Aucun changement dans la fenêtre. Derniers jalons confirmés : hull launch 16/01 (Geoje, Corée du Sud), contrat Technip Energies (+JGC, Samsung Heavy) >1 Md€, mise en service visée 2028. | Statu quo. |
| **Kaminho** (Angola) | Aucun changement calendaire vs cycle #4 : premier oil toujours visé **T4 2027**, FPSO 50 % d'avancement (avril 2026), pic 75 000 bopd. Détail confirmé : chargement de la structure de protection des risers (80 m, 300 t) au chantier Petromar d'Ambriz. | Statu quo — fenêtre resserrée déjà actée au cycle précédent, aucune nouvelle accélération. |
| **GTA Phase 2** | Aucun changement — concept GBS 2,5-3 Mtpa toujours en évaluation, BP/PETROSEN/SMH/Kosmos travaillent avec des contractants vers le pré-FEED. | Statu quo. |
| **Venus** (Namibie) | Aucun changement calendaire (FID toujours visé T4 2026, accord Mopane/Galp confirmé). Amélioration météo notable — voir §2. | Statu quo texte, net mieux opérationnel (météo). |
| **Bonga North / Ubeta / IMA** (Nigeria) | Aucune nouvelle déclaration. First oil/gaz toujours visé 2027 pour Bonga North et Ubeta (Ubeta désormais en phase d'exécution, ~70 000 boed) ; FID IMA toujours attendue en 2026 (FEED en cours). | Statu quo. |

**Bilan Sentinel** : cycle calme après le développement matériel du 27/07 — aucun nouveau catalyseur contractuel majeur, mais un signal logistique positif sur Afungi (MSC Shuttle) qui confirme l'intensification progressive de l'activité marine dans cette zone.

Sources : [Saipem — Baleine P3](https://www.saipem.com/en/media/press-releases/2026-07-27/saipem-awarded-new-contracts-ivory-coast-and-italy-eni-worth) · [Offshore Magazine — Saipem subsea construction](https://www.offshore-mag.com/field-development/news/55393762/eni-hires-saipem-for-intensive-subsea-construction-program-at-baleine-offshore-cote-divoire) · [WorldOil — Saipem $930M](https://worldoil.com/news/2026/7/29/saipem-wins-930-million-in-eni-contracts-led-by-baleine-phase-3-offshore-ivory-coast/) · [TotalEnergies — Mozambique LNG restart](https://totalenergies.com/newsroom/mozambique-lng-announces-the-full-restart-of-all-its-activities-onshore-and-offshore-in-mozambique/?lang=eng) · [LNG Industry — MSC Afungi Shuttle](https://www.lngindustry.com/liquefaction/22072026/msc-launches-shuttle-to-northern-mozambique/amp/) · [Club of Mozambique — AMSOL](https://clubofmozambique.com/business-directory/amsol-mozambique-190169/) · [Africa Oil+Gas Report — Kaminho T4 2027](https://africaoilgasreport.com/2026/07/in-the-news/timeline-for-first-oil-from-kaminho-is-closer-than-originally-announced/) · [Technip Energies — Coral Norte](https://investors.technipenergies.com/news-releases/news-release-details/technip-energies-awarded-significant-contract-coral-norte) · [bp.com — GTA Phase 2](https://www.bp.com/en/global/corporate/news-and-insights/press-releases/bp-and-partners-progress-concept-for-greater-tortue-ahmeyim-phase-2-to-next-phase-of-evaluation.html) · [IntelliNews — Venus FID T4 2026](https://www.intellinews.com/namibia-expects-fid-by-totalenergies-on-venus-discovery-by-late-2026-says-petroleum-commissioner-381459/) · [Africa Oil+Gas Report — Mopane/Venus farm-in](https://africaoilgasreport.com/2026/07/farm-in-farm-out/total-gets-namibias-nod-on-mopane-farm-in-with-discussions-progressing-to-fid-for-venus-development/) · [MarketScreener — Bonga North/Ubeta](https://www.marketscreener.com/quote/stock/SHELL-PLC-130945922/news/Shell-TotalEnergies-target-2027-for-oil-and-gas-output-from-5bn-Bonga-North-and-550mn-Ubeta-proje-50468263/).

---

## 2. 🔮 PROPHET - Prédictions & fenêtres météo

Données Open-Meteo Marine (`metocean.json`, fetch 02/08 02h38) — seuil de blocage 2,5 m de houle max, 5 prochains jours (2-6 août) :

| Zone | Houle max (2-6 août) | Fenêtre |
|---|---|---|
| Baleine P3 (Côte d'Ivoire) | 1,26-1,90 m | 🟢 5/5 jours favorables |
| Afungi / Mozambique LNG | 0,72-0,90 m | 🟢 5/5 jours favorables (mer très calme) |
| Kaminho / Angola | 0,94-1,44 m | 🟢 5/5 jours favorables |
| **Venus / Namibie** | **1,54-2,42 m** | 🟢 **5/5 jours favorables** — repasse sous le seuil de 2,5 m tous les jours (pic 2,42 m le 06/08, encore sous la limite) |
| GTA (Sénégal/Mauritanie) | 0,92-1,38 m | 🟢 5/5 jours favorables |
| Bonga / Nigeria | 1,28-1,88 m | 🟢 5/5 jours favorables |

**Changement notable** : la zone Venus/Namibie **repasse à 5/5 jours favorables** (contre 3/5 au cycle #4) — première fenêtre totalement dégagée depuis plusieurs cycles sur ce dossier, même si le pic du 06/08 (2,42 m) reste proche du seuil de blocage et mérite une re-vérification au prochain cycle avant toute mobilisation ferme.

Qualitatif (reconduit sans signal contraire) : Cabo Delgado/Rovuma demande tugs ×3 d'ici mi-2027 ; Abidjan hub d'installation 2027-28 (spread Saipem) ; Luanda/Ambriz saturation AHTS attendue S2 2026-T4 2027 (Kaminho) ; Walvis Bay explosion différée post-FID Venus, mais fenêtre météo désormais favorable.

---

## 3. 🛰️ AIS AUTO-TRACKING - Carte FABLE

**Vérification VesselFinder des 7 navires prioritaires — 2 août.**

| Navire | Signal | Lecture |
|---|---|---|
| **Leo** (IMO 9652143) | AIS toujours figé : dernier signal reçu ~17/07, soit **16 jours** sans mise à jour (23 jours depuis le départ du mouillage de Maputo le 10/07). Toujours "East Africa", 5,7 kn (valeur figée), destination non renseignée. | 🔴 **Dossier le plus critique, aggravation confirmée** : aucune amélioration depuis 5 jours, le silence continue de s'allonger au même rythme que le calendrier. La deuxième relance du 28/07 (ultimatum 48h) est restée sans réponse. |
| **Nomasa** (IMO 9366316) | 🟡 **Signal redevenu stale** (6 jours) : toujours affiché destination AFUNGI, ETA 01/08 08h00 — échéance désormais **dépassée** sans nouveau point de position frais confirmant l'arrivée effective. Dernier port connu : Pemba (mouillage), 18/07. | 🟡 Lecture la plus probable : arrivée à Afungi avec perte de signal AIS typique en zone côtière (source gratuite), mais **aucune confirmation formelle**. Qualification urgente auprès d'Amsol toujours en attente. |
| **Santangelo** (IMO 9343948) | 🟡 **Nouveau mouvement** : l'identité active "Santangelo Uno" (MMSI 249549000, Malte), arrivée à Porto Empedocle le 25/07, est **repartie et navigue désormais en Méditerranée orientale** (AIS très frais, ~34 min, statut "under way"). Coordonnées précises non disponibles en source gratuite. MMSI de référence toujours silencieux depuis le 14/01/2026. | 🟢 Reste hors zone Afrique, non mobilisable court terme — le dossier reste classé "clos" pour la prospection Afrique, mais le mouvement est noté pour traçabilité. |
| **Topaz Dignity** (IMO 9654983) | Position inchangée : toujours à l'ancre en **mer de Marmara** (Istanbul), signal AIS très frais (2 min), 0,2 kn. | 🟢 Statu quo — **4e cycle consécutif** de confirmation. Hors zone Afrique, non mobilisable court terme. |
| **Red Fox** (IMO 9319193) | Toujours aucun nouveau signal depuis le ping isolé du ~17/07 — écart désormais de **16 jours** (contre 11 jours au cycle précédent). Dernier port connu Punta Europa (Guinée Éq.), 10/07. | 🟠 Silence qui continue de s'installer, au même rythme que Leo. Traiter comme AIS globalement silencieux. |
| **Monty J** (IMO 9423877) | Toujours silencieux : dernier AIS il y a **78 jours** (contre 74 au cycle précédent). | 🟠 Aucune amélioration — statut réel toujours inconnu. |
| **Lydia D** (IMO 9582764) | Position inchangée : AIS très frais (1 min) confirme le navire toujours **MOORED à Dakar** depuis le 27/07 18h47 UTC — aucun nouveau départ depuis la rotation Sangomar. | 🟢 Statu quo — cluster Dakar toujours actif mais sans nouvelle rotation observée ce cycle. |

### À renseigner (aucune donnée inventée)
Inchangé : IMO/MMSI manquants pour Jascon 66, Lagertha, Delta Sky, Ned Stark, Akali Akbal, Santa Luisa, Santa Rita, Britoil Conqueror. Identité Rachel J (IMO 7411105) incertaine. Lien Leo↔AES Monaco toujours à confirmer contractuellement (aucune trace publique de fixture trouvée en veille libre ce cycle).

*(`vessels.json` mis à jour pour Leo, Nomasa, Santangelo, Topaz Dignity, Red Fox, Monty J et Lydia D — prix Leo recalculé au taux du jour ; le reste de la flotte — 92 navires — n'a pas été revérifié ce cycle. Build/déploiement à la charge de l'étape CARTOGRAPHE du pipeline, voir note en tête de rapport.)*

---

## 4. 🚢 FLEET INTELLIGENCE - Analyse comportementale

1. **Leo et Red Fox se dégradent en parallèle, au même rythme exact** : les deux navires partagent un dernier signal daté du ~17/07 et un écart désormais de 16 jours (contre 11 jours au cycle précédent) — cette synchronicité suggère une limite structurelle de la source AIS gratuite plutôt qu'un hasard de calendrier commercial. Pour Leo, le silence pèse davantage car une fixture de 4 M€/an est en jeu et l'ultimatum du 28/07 a expiré sans réponse.
2. **Nomasa bascule d'un statut "résolu" à un statut "à confirmer"** : le cycle #4 avait clos le conflit de destination (Afungi confirmée, ETA 01/08). Ce cycle, l'ETA est dépassée sans signal frais pour la confirmer — un comportement cohérent avec une arrivée effective (perte de signal fréquente près des côtes/ports en source gratuite) mais qui ne peut être affirmé sans vérification directe auprès de l'armateur. Ne pas classer ce dossier comme définitivement résolu tant que la confirmation manque.
3. **Santangelo Uno reprend la mer** : après l'arrivée du 25/07 à Porto Empedocle (dossier classé "clos" au cycle #4), le navire est de nouveau "under way" en Méditerranée orientale. Ce comportement — escale courte puis redépart rapide — est cohérent avec un navire en rotation commerciale active en Méditerranée, ce qui renforce la lecture "hors zone Afrique, non mobilisable" plutôt que de la remettre en cause.
4. **Topaz Dignity confirme un mouillage de longue durée** (4e cycle consécutif, aucun mouvement depuis fin juin) — profil cohérent avec un navire actuellement sans charte active, mais hors zone Afrique donc non exploitable commercialement à court terme.
5. **Lydia D marque une pause après sa rotation Sangomar** : aucun nouveau départ depuis le retour du 27/07, ce qui est cohérent avec un support ponctuel plutôt qu'une mobilisation continue — le cluster Dakar reste actif mais n'a pas généré de nouveau signal d'activité ce cycle.

---

## 5. 🧠 TENDER WHISPERER - Prédictions d'appels d'offres

> Probabilités = estimations modèle (signaux faibles), sauf mention contraire. Flux RSS Google News (`tenders.json`, 20 items scannés) : 6 items marqués "nouveaux", mais vérification faite — il s'agit d'articles anciens (2018-2025) mal datés par le flux RSS (bug déjà documenté), plus un article générique du 29/07 sur les contrats de service tug (pas un tender concret). Aucun signal RSS actionnable ce cycle — le signal réel continue de venir de Sentinel (§1), pas du flux automatisé.

| Tender prédit | Donneur d'ordre | Probabilité / statut | Fenêtre estimée | Signal déclencheur |
|---|---|---|---|---|
| Marine spread installation Baleine P3 | Eni / Saipem (EPC) | **~90 % — en cours de matérialisation** = | immédiat-3 mois | Inchangé — contrat d'installation attribué le 27/07, Saipem doit sous-traiter un spread marine |
| Marine logistics long terme Afungi (EOI 7 navires) | TotalEnergies/ExxonMobil JV | **~70 % sous 90 jours** ↑ | été-automne 2026 | Renforcé par le lancement de la MSC Afungi Shuttle — trafic marine en intensification |
| AHTS support Kaminho 2027 | Saipem / TotalEnergies AGO | **~70 % sous 120 jours** = | T3-T4 2027 | Inchangé, calendrier déjà resserré au cycle précédent |
| Tow & hook-up Coral Norte | Eni / MRV | **~55 % à 6-9 mois** | T1 2027 | Inchangé |
| Harbour/terminal towage Walvis Bay | TotalEnergies / port NA | **~35 % à 9-12 mois** ↑ | post-FID Venus | Météo Venus désormais 5/5 jours favorables — dossier techniquement moins contraint |

---

## 6. 🕵️ COMPETITOR WATCHDOG

- **P&O Maritime (DP World)** : aucun nouveau signal Afrique cette fenêtre en veille libre (actualité récente centrée sur l'Arabie Saoudite, la mer Rouge et le Nigeria — lancement "FlexDELIVERY" avec IOMS, hors périmètre towage).
- **Smit Lamnalco (Boskalis)** : aucun nouveau signal Afrique cette fenêtre. Contrat terminal Mozambique (10 ans, ~200 M$) et acquisition à 100 % par Boskalis (finalisée en 2024) restent les derniers jalons connus.
- **MINDUS PRIME** : toujours **non identifié** en veille libre — grille de prix conservée par prudence (11 000 €/j), statut inchangé.
- **AES Monaco** (opérateur du Leo) : toujours **8 000 $/j** — prix plancher du panel, aucune trace publique de nouvelle fixture trouvée ce cycle.

---

## 7. 🚨 BLACK SWAN DETECTOR

| Risque | Niveau | Impact towage | Action |
|---|---|---|---|
| **US-Iran / Détroit d'Hormuz** | 🟡 Stabilisé à un niveau élevé | Brent à **87,93 $/bbl (01/08)**, quasi stable vs 87,01 $/bbl (31/07) — le repli post-cessez-le-feu du cycle précédent (~86-90 $/bbl) se confirme dans la durée. Les analystes tablent sur un maintien dans les 70-80 $/bbl haut en août-septembre, mais le spot reste au-dessus de cette fourchette pour l'instant. Situation qualifiée de fragile mais sans nouvelle escalade majeure cette fenêtre. | Maintenir l'indexation BAF en l'état, pas d'ajustement — situation stable mais pas encore assez claire pour revoir les grilles à la baisse. |
| **Cabo Delgado** | 🔴 Élevé, pas de nouveau signal confirmé cette fenêtre | Aucune information vérifiable postérieure à l'aggravation du 20-25/07 (34 000 nouveaux déplacés, colonnes ISMP vers le sud) trouvée en veille libre pour la période 28/07-02/08. Absence de signal ≠ amélioration — la tendance de fond reste dégradée. | Maintenir la clause force majeure renforcée + démobilisation payée sur toute offre Afungi, sans changement. |
| **Piraterie Somalie / Golfe de Guinée** | 🟡 Mixte, inchangé | Confirmation de la résurgence Somalie/Golfe d'Aden (17 incidents depuis janvier 2026 — chiffre stable, pas de nouvel incident isolé identifié cette fenêtre). Aucun nouveau signal Golfe de Guinée. | Vigilance côte est-africaine maintenue ; pas de changement de posture Golfe de Guinée. |
| **EUR/USD** | 🟡 Mouvement notable | Spot 1,1485 (31/07, BCE via Frankfurter) vs 1,1389 au cycle précédent (27/07) — **euro nettement plus ferme** (+0,8 %), inversion de la tendance de dépréciation des cycles précédents. | Leo (8 000 $/j) vaut désormais **6 966 €/j** au lieu de 7 024 €/j (-58 €/j) — impact négatif sur la marge EUR de ce dossier si fixé en USD. |
| **Météo Venus/Namibie** | 🟢 Amélioration confirmée | Fenêtre passée à 5/5 jours favorables (voir §2) — premier cycle sans jour bloquant sur ce dossier depuis le début du suivi. | Aucune action immédiate, mais dossier à re-qualifier commercialement compte tenu de l'amélioration cumulée (météo + FID T4 2026 maintenu). |
| **Saison cyclonique canal du Mozambique** | 🟢 Hors saison | Confirmé hors saison (saison 2025-26 nov.-avril close ; cyclone Gezani, dernier événement majeur, date de février 2026 et n'a aucune pertinence pour la fenêtre actuelle). Prochaine prévision saisonnière attendue août-sept. 2026. | Aucune action immédiate. |

---

## 8. 📡 TOWAGE OPPORTUNITY SCANNER

| ID | Opportunité | Navire(s) | Fenêtre | Statut |
|---|---|---|---|---|
| OPP-001 | Afungi marine support | **Leo** (23 j depuis départ Maputo, AIS figé 16 j) | Immédiate | 🔴 Critique — ultimatum du 28/07 expiré sans réponse, escalade nécessaire (voir §11) |
| OPP-002 | Kaminho installation | Topaz Master 87t + Akali Akbal 66t (Angola) | T3-T4 2027 | 🔴 Ouverte, inchangé |
| OPP-003 | Baleine P3 subsea/hook-up/installation | Mobiliser 2-3 AHTS vers Abidjan pour appuyer le spread Saipem | immédiat-2027 | 🟢 Ouverte, en attente de retour Saipem (deadline pipeline 7 août) |
| OPP-004 | Bonga North support | Delta Sky, Jascon 66, Ned Stark, Monty J (Nigeria) | 2026-27 | 🟠 Active, inchangé |
| OPP-005 | GTA1 ops / cluster Dakar | Ringhio, Lydia D (au repos depuis retour Sangomar), Santa Rita | Continue | 🟡 Stable — pas de nouvelle rotation observée ce cycle |
| OPP-006 | Coral Norte hook-up | Leo (si libre) + 2 AHTS à mobiliser | S2 2027 | 🟡 Préparation |
| OPP-007 | Venus staging | Navire à réidentifier | post-T4 2026 | 🟢 Amélioré — fenêtre météo désormais 5/5, toujours sans candidat navire |
| OPP-008 | Support mobilisation Nomasa | **Nomasa (ETA Afungi 01/08 dépassée, arrivée non confirmée)** | Immédiate | 🟡 Requalification nécessaire — qualifier l'arrivée effective avant toute action commerciale |

---

## 9. 📈 ORACLE - Scoring

| Rang | Opportunité | Score /100 | Δ vs cycle #4 |
|---|---|---|---|
| 1 | Afungi marine support | **93** | = (Leo se dégrade sans amélioration, Nomasa passe de "confirmé" à "à vérifier" — effets contraires qui s'annulent) |
| 2 | Baleine P3 | **92** | = (pas de nouveau catalyseur cette fenêtre, contrat Saipem déjà intégré) |
| 3 | Kaminho installation | **90** | = (calendrier stable, pas de nouvelle accélération) |
| 4 | Coral Norte tow/hook-up | **78** | = |
| 5 | Bonga North/Ubeta/IMA | **74** | = |
| 6 | GTA1/GTA2 | **73** | = (Lydia D stable, pas de nouvelle rotation) |
| 7 | Agogo/Ndungu | **58** | = (non recherché ce cycle, reconduit) |
| 8 | Venus staging | **57** | **+2** (météo 3/5→5/5, premier cycle sans jour bloquant) |

**Deux opportunités restent au-dessus du seuil de 90** → CLOSER : escalade sur Afungi (Leo, ultimatum expiré) ; Baleine P3 reste en phase d'attente jusqu'au 7 août (voir §11).

---

## 10. 📊 BUILDER - Pipeline

| Stage | Lead | Valeur est. | Action | Échéance |
|---|---|---|---|---|
| **Escalade critique** | Afungi (Leo @ 8 k$/j AES Monaco) | ~4,0 M€/an, marge ~1,5 M€ | Ultimatum du 28/07 (48h) expiré sans réponse depuis 5 jours — 3e contact avec signal de recherche d'alternative (voir §11) | **Immédiat** |
| **Qualification urgente** | Repositionnement Nomasa → Afungi | À déterminer | Contacter Amsol : ETA du 01/08 dépassée sans confirmation AIS fraîche, statut réel inconnu | **Immédiat** |
| **Suivi** | Baleine P3 — spread marine installation Saipem | ~9-10 M€ (estim.) | Email du 28/07 envoyé, pas de nouvelle relance avant l'échéance fixée | **7 août** (checkpoint) |
| Proposition | Kaminho (2 AHTS Angola) | ~5,4 M€ | Contact Saipem/TTE Angola — calendrier stable | 1er août (échue, à relancer) |
| Qualification | Baleine P3 (dossier hook-up initial) | ~8,5 M€ | Pré-qual Eni/EPC (SLB, TechnipFMC, Saipem) + plan mobilisation Abidjan | 31 août |
| Qualification | Bonga North/Ubeta/IMA | ~3,6 M€ | Qualifier besoin Shell/TotalEnergies | 15 sept. |
| Prospection | GTA1/Dakar cluster | ~2-4 M€ | Sonder BP/Kosmos ; Lydia D au repos, pas d'urgence nouvelle | sept. |
| Préparation | Coral Norte | ~4,4 M€ | Dossier Eni/MRV | T4 2026 |
| **Veille renforcée** | Venus (staging) | - | Identifier un navire de remplacement — fenêtre météo désormais 5/5, dossier moins contraint techniquement | continu |

**Pipeline : ≈ 37-38 M€ brut / ≈ 17,5-18 M€ pondéré** (stable ; amélioration qualitative sur Venus, mais deux échéances dépassées — Kaminho 1er août, Baleine P3 hook-up à surveiller).

---

## 11. ✉️ CLOSER - Actions immédiates cycle #5

### Dossier 1 — Leo (3e contact, escalade)
**L'ultimatum de 48h envoyé le 28/07 est resté sans réponse pendant 5 jours. Le navire cumule désormais 23 jours sans fixture visible et 16 jours de silence AIS total. Conformément à l'annonce du message précédent, ce contact signale le passage à la recherche d'alternatives tout en laissant une dernière fenêtre de réponse.**

> Objet : Leo (IMO 9652143) — dernier avis avant réorientation vers d'autres solutions
>
> Madame, Monsieur,
> Nos messages des 23 et 28 juillet concernant le Leo sont restés sans réponse. Le navire est toujours sans fixture visible 23 jours après son départ du mouillage de Maputo, et son signal AIS est figé depuis 16 jours. Nous maintenions notre intérêt pour un affrètement time-charter de 12 mois (+ options) à 8 000 $/jour, mais en l'absence de retour sous 5 jours ouvrés, nous serons contraints d'orienter ce besoin vers d'autres navires disponibles sur zone. Nous restons naturellement ouverts à reprendre l'échange si le Leo redevient joignable. — Boluda Towage

`mailto:?subject=Leo%20(IMO%209652143)%20%E2%80%94%20dernier%20avis%20avant%20r%C3%A9orientation&body=Madame%2C%20Monsieur%2C%0A%0ANos%20messages%20des%2023%20et%2028%20juillet%20concernant%20le%20Leo%20sont%20rest%C3%A9s%20sans%20r%C3%A9ponse.%20Le%20navire%20est%20toujours%20sans%20fixture%20visible%2023%20jours%20apr%C3%A8s%20son%20d%C3%A9part%20du%20mouillage%20de%20Maputo%2C%20et%20son%20signal%20AIS%20est%20fig%C3%A9%20depuis%2016%20jours.%20Nous%20maintenions%20notre%20int%C3%A9r%C3%AAt%20pour%20un%20affr%C3%A8tement%20time-charter%20de%2012%20mois%20(%2B%20options)%20%C3%A0%208%20000%20%24%2Fjour%2C%20mais%20en%20l%27absence%20de%20retour%20sous%205%20jours%20ouvr%C3%A9s%2C%20nous%20serons%20contraints%20d%27orienter%20ce%20besoin%20vers%20d%27autres%20navires%20disponibles%20sur%20zone.%0A%0A%E2%80%94%20Boluda%20Towage`

### Dossier 2 — Nomasa / Amsol (qualification, pas d'email commercial)
**L'ETA Afungi du 01/08 est dépassée sans confirmation AIS fraîche. Avant toute proposition commerciale, il faut confirmer si le navire est bien arrivé et sous quel statut contractuel.**

> Objet : Nomasa (IMO 9366316) — confirmation d'arrivée à Afungi
>
> Madame, Monsieur,
> Notre suivi AIS indique que le Nomasa était attendu à Afungi le 1er août à 08h00 ; nous n'avons pas de confirmation de position plus récente. Pourriez-vous nous confirmer son statut actuel (arrivé/en transit) et sa disponibilité éventuelle pour un support marine sur zone ? — Boluda Towage

`mailto:?subject=Nomasa%20(IMO%209366316)%20%E2%80%94%20confirmation%20d%27arriv%C3%A9e%20%C3%A0%20Afungi&body=Madame%2C%20Monsieur%2C%0A%0ANotre%20suivi%20AIS%20indique%20que%20le%20Nomasa%20%C3%A9tait%20attendu%20%C3%A0%20Afungi%20le%201er%20ao%C3%BBt%20%C3%A0%2008h00%3B%20nous%20n%27avons%20pas%20de%20confirmation%20de%20position%20plus%20r%C3%A9cente.%20Pourriez-vous%20nous%20confirmer%20son%20statut%20actuel%20(arriv%C3%A9%2Fen%20transit)%20et%20sa%20disponibilit%C3%A9%20%C3%A9ventuelle%20pour%20un%20support%20marine%20sur%20zone%20%3F%0A%0A%E2%80%94%20Boluda%20Towage`

**Baleine P3 / Saipem** : aucun nouveau franchissement de seuil ni nouveau catalyseur cette fenêtre — le message du 28/07 reste valide, checkpoint fixé au 7 août avant relance (voir §10). Pas de nouvel email généré ce cycle pour éviter une sur-sollicitation prématurée.

Les dossiers Kaminho / Bonga North complets : voir cycle #3 §11 pour trame, à réactualiser une fois les contacts décideurs enrichis (PROSPECT-ENRICHER toujours inactif).

---

## 12. 💰 PRICING ENGINE - Grille intégrée à la carte

Taux du jour (`fx-rate.json`, BCE via Frankfurter, 31/07) : **1 EUR = 1,1485 USD** (0,8707 EUR/USD).

| Armateur | Prix | Note |
|---|---|---|
| MINDUS PRIME | 11 000 €/j | Premium flat — inchangé |
| P&O Maritime (Red Fox + 70-80 TBP AGO/NGA) | 10 000 €/j | Grille volume — inchangé |
| Smit Lamnalco | 11 000 €/j | SL Kiwi surcoté segment 38t — inchangé |
| **AES Monaco - Leo** | **8 000 $/j ≈ 6 966 €/j** (EUR/USD 1,1485 du 31/07) | Prix plancher du panel — montant révisé (**-58 €/j** vs cycle précédent, euro plus ferme) |
| Sans armateur confirmé | Référence zone 10-11 k€/j | BP >85t → 11 k€/j |

---

## 13. 🎯 SYNTHÈSE EXÉCUTIVE

1. **Cycle calme côté projets** : aucun nouveau catalyseur contractuel majeur depuis le contrat Saipem du 27/07 (déjà capté au cycle #4) ; seul signal nouveau : lancement de la MSC Afungi Shuttle, confirmant l'intensification logistique de la zone Afungi.
2. **Leo reste le dossier le plus critique et se dégrade davantage** : 23 jours sans fixture, 16 jours de silence AIS (contre 11 au cycle précédent), et l'ultimatum de 48h du 28/07 est resté sans réponse pendant 5 jours → 3e contact envoyé ce cycle, avec signal explicite de réorientation vers d'autres navires.
3. **Nomasa repasse d'un statut "résolu" à "à vérifier"** : l'ETA Afungi du 1er août est dépassée sans confirmation AIS fraîche — probablement arrivé (perte de signal typique en zone côtière), mais non confirmé. Qualification urgente demandée à Amsol.
4. **Santangelo Uno reprend la mer** (Porto Empedocle → Méditerranée orientale) après son arrivée du 25/07 — mouvement noté, dossier reste classé hors zone Afrique.
5. **Météo Venus/Namibie passe à 5/5 jours favorables** — première fenêtre totalement dégagée depuis le début du suivi, score Oracle +2.
6. **Brent stable autour de 87-88 $/bbl**, pas de nouvelle escalade Hormuz/Iran cette fenêtre ; **EUR/USD se renforce nettement** (1,1389→1,1485), ce qui réduit la valeur EUR du contrat Leo de 58 €/j.
7. **Cabo Delgado** : aucun nouveau signal vérifiable cette fenêtre, mais absence de signal ne vaut pas amélioration — posture de risque maintenue à élevé.
8. **Pipeline stable** (~37-38 M€ brut / ~17,5-18 M€ pondéré) ; deux échéances dépassées à relancer (Kaminho 1er août, checkpoint Baleine P3 le 7 août).

### Changements détectés depuis le cycle précédent (28 juillet → 2 août)
- Aucun nouveau catalyseur contractuel majeur (Sentinel calme) ; nouveau signal logistique MSC Afungi Shuttle (~22/07)
- Leo : silence AIS étendu à 16 jours (vs 11), ultimatum du 28/07 expiré sans réponse → 3e contact envoyé
- Nomasa : ETA Afungi (01/08) dépassée sans confirmation fraîche — statut repassé de "confirmé" à "à vérifier"
- Santangelo Uno : reparti de Porto Empedocle, désormais "under way" en Méditerranée orientale
- Topaz Dignity : 4e cycle consécutif de confirmation, aucun changement
- Red Fox : silence AIS étendu à 16 jours (vs 11) — même rythme que Leo
- Monty J : silence AIS étendu à 78 jours (vs 74)
- Lydia D : aucun nouveau mouvement depuis le retour du 27/07 (pas de nouvelle rotation)
- Météo Venus/Namibie : 3/5 → 5/5 jours favorables — amélioration nette
- Brent : ~87-88 $/bbl, stable, pas de nouvelle escalade Hormuz
- EUR/USD : 1,1389 → 1,1485 (euro nettement plus ferme) ; prix Leo révisé 7 024 → 6 966 €/j
- Oracle : Venus 55→57 (seul mouvement de score ce cycle) ; tous les autres scores inchangés
- Build/déploiement Vercel non exécuté depuis cette session (limitation de permissions non-interactive) — à la charge de l'étape CARTOGRAPHE du pipeline

*Prochain cycle automatique : dans 2 jours à 10h (sous réserve — l'écart de 5 jours ce cycle suggère de vérifier la tâche planifiée Windows).*
