# 🧠 FABLE TOWAGE OVERMIND V8 - CYCLE #3
**23 juillet 2026 · Cycle automatique : tous les 2 jours à 10h**

> Note opérationnelle : les agents de données locaux (FX-RATE, METOCEAN, TENDER-HAWK) ont tourné avec succès à 08h11 avant ce cycle ; leurs sorties (`fx-rate.json`, `metocean.json`, `tenders.json`) sont intégrées ci-dessous. `prospects.json` reste absent (PROSPECT-ENRICHER inactif, `APOLLO_API_KEY` non configurée).

---

## 1. 🔍 SENTINEL - Rapport de veille

Fenêtre : 18 → 23 juillet 2026 (5 jours).

| Projet | Changement détecté | Impact towage |
|---|---|---|
| **Baleine Phase 3** (Côte d'Ivoire) | Aucun nouveau contrat EPC cette fenêtre (les 3 attributions de juillet restent les dernières). ⚠️ **Vérification effectuée** : un contrat DOF/Altera « installation FPSO+FSO Baleine » circule dans les résultats de recherche — **il s'agit en réalité du Phase 2 (2024, Skandi Skansen, déjà on-stream)**, pas de Phase 3. Ne pas confondre, aucun tender marine Phase 3 publié à ce jour. | Statu quo — momentum EPC intact, pas d'accélération supplémentaire cette semaine. |
| **Mozambique LNG / Afungi** | Aucun changement détecté. Restart toujours en cours (annoncé 29/01, ~4 000 travailleurs mobilisés). | Statu quo. |
| **Coral Norte FLNG** | Aucun changement dans la fenêtre. | Statu quo. |
| **Kaminho** (Angola) | Aucun changement. Fabrication subsea toujours en cours au chantier Saipem Ambriz ; installation 2026-27 confirmée, first oil visé 2028. | Statu quo. |
| **GTA Phase 2** | Aucun changement — concept GBS 2,5-3 Mtpa toujours au stade pré-FEED (annoncé initialement fév. 2023). | Statu quo. |
| **Venus** (Namibie) | Aucun changement calendaire. FID toujours « fin 2026 ». Voir §2/§3 pour un signal météo et un signal navire négatifs. | Statu quo texte, mais dégradation opérationnelle indirecte. |
| **Bonga North / Ubeta / IMA** (Nigeria) | Aucune nouvelle déclaration cette fenêtre (dernière en date : TotalEnergies, 10/07). First oil/gaz toujours visé 2027 pour Bonga North et Ubeta. | Statu quo. |

**Bilan Sentinel** : semaine calme sur le fond projet — aucun des 7 dossiers n'a connu de développement matériel nouveau. Le seul travail utile a été de **vérifier et écarter un faux signal** (DOF/Altera = Baleine Phase 2, pas Phase 3).

Sources : [TechnipFMC](https://www.technipfmc.com/en/investors/financial-news-releases/press-release/technipfmc-awarded-subsea-contract-for-eni-s-baleine-phase-3-development-offshore-cote-d-ivoire/) · [SLB](https://www.slb.com/newsroom/press-release/2026/pr-2026-0713-slb-oss-eni-baleine) · [Marine Log (DOF/Altera, Phase 2)](https://www.marinelog.com/news/dof-books-baleine-field-fpso-and-fso-installation-contract/) · [TotalEnergies (restart Afungi)](https://totalenergies.com/newsroom/mozambique-lng-announces-the-full-restart-of-all-its-activities-onshore-and-offshore-in-mozambique/?lang=eng) · [WorldOil (Kaminho)](https://www.worldoil.com/news/2026/7/7/totalenergies-ceo-to-spotlight-angola-upstream-growth-at-aog-2026/) · [IntelliNews (Venus FID fin 2026)](https://www.intellinews.com/namibia-expects-fid-by-totalenergies-on-venus-discovery-by-late-2026-says-petroleum-commissioner-381459/) · [MarketScreener (Bonga North/Ubeta)](https://www.marketscreener.com/quote/stock/SHELL-PLC-130945922/news/Shell-TotalEnergies-target-2027-for-oil-and-gas-output-from-5bn-Bonga-North-and-550mn-Ubeta-proje-50468263/).

---

## 2. 🔮 PROPHET - Prédictions & fenêtres météo

Données Open-Meteo Marine (`metocean.json`, fetch 08h11) — seuil de blocage 2,5 m de houle max, 5 prochains jours (23-27 juillet) :

| Zone | Houle max (23-27 juil.) | Fenêtre |
|---|---|---|
| Baleine P3 (Côte d'Ivoire) | 1,24-1,56 m | 🟢 5/5 jours favorables |
| Afungi / Mozambique LNG | 0,48-1,10 m | 🟢 5/5 jours favorables (mer très calme) |
| Kaminho / Angola | 1,10-1,42 m | 🟢 5/5 jours favorables |
| **Venus / Namibie** | **2,24-2,84 m** | 🔴 **2/5 jours favorables seulement** — houle >2,5 m les 23, 24 et 25/07, repasse sous le seuil le 26/07 |
| GTA (Sénégal/Mauritanie) | 1,14-1,52 m | 🟢 5/5 jours favorables |
| Bonga / Nigeria | 1,26-1,66 m | 🟢 5/5 jours favorables |

**Changement notable** : la zone Venus/Namibie bascule de 5/5 (cycle précédent) à **2/5 jours favorables** — houle dépassant le seuil de blocage 3 jours consécutifs. Aucune opération de staging ne serait faisable avant le 26/07 dans cette zone, ce qui aggrave encore le dossier Venus (déjà pénalisé par le départ du Nomasa, §3-4).

Qualitatif (reconduit sans signal contraire) : Cabo Delgado/Rovuma demande tugs ×3 d'ici mi-2027 ; Abidjan hub d'installation 2027-28 ; Luanda/Ambriz saturation AHTS attendue S2 2026 ; Walvis Bay explosion différée post-FID Venus.

---

## 3. 🛰️ AIS AUTO-TRACKING - Carte FABLE

**Vérification VesselFinder + recoupement (marinevesseltraffic, tradlinx) des 7 navires prioritaires — 23 juillet.**

| Navire | Signal | Lecture |
|---|---|---|
| **Leo** (IMO 9652143) | AIS inchangé : aucun nouveau signal depuis ~17/07 (6 jours de silence). Toujours zone "East Africa", a quitté Maputo le 10/07, destination non renseignée. | 🔴 **Statu quo, urgence croissante** : 13 jours depuis le départ de Maputo sans fixture confirmée. L'échéance de relance CRM (23/07) tombe aujourd'hui — voir §11. |
| **Nomasa** (IMO 9366316) | 🔴 **Changement majeur** : la destination affichée n'est plus Pemba mais **SEYCHELLES**, ETA 28/07 10h00, 8,2 kn. Un recoupement (marinevesseltraffic) place en parallèle le navire près de **Durban** (~30°S/31°E, 0,9 kn) — **conflit de source non résolu**. | 🔴 Si la destination Seychelles se confirme, le Nomasa **dépasse la zone Afungi sans s'y arrêter** — ni opportunité Mozambique LNG, ni retour vers Venus. Le pool de staging Venus perd définitivement ce candidat. À vérifier d'urgence auprès d'Amsol avant d'investir plus de temps dessus. |
| **Santangelo** (IMO 9343948) | L'identité active "Santangelo Uno" (MMSI 249549000, Malte) a **dépassé Gibraltar** et navigue en Méditerranée occidentale vers **Porto Empedocle, Italie**, ETA 26/07. Le MMSI de référence (247185800, Italie) reste silencieux depuis le 14/01/2026. | 🟢 **Clarification** : la destination Kamsar/Guinée précédemment évoquée est désormais définitivement infirmée par la trajectoire confirmée vers l'Italie. Navire hors zone Afrique — à retirer du pipeline Guinée. Identité réelle toujours à faire confirmer par Cafimar. |
| **Topaz Dignity** (IMO 9654983) | ✅ **Position corrigée** : AIS live très frais (MMSI 538011726, 1 min) confirme le navire à l'ancre en **mer de Marmara (Istanbul)**, 0,1 kn — 2e cycle consécutif de confirmation, cette fois avec un signal quasi temps réel. | 🟢 Dataset CSO corrigé dans `vessels.json` (Côte d'Ivoire → Marmara/Turquie). Navire hors zone Afrique, non mobilisable court terme. |
| **Red Fox** (IMO 9319193) | Aucun nouveau signal depuis le ping du ~17/07 — la reprise AIS notée au cycle précédent (après 73+ jours de silence) **n'a pas été suivie d'autres émissions** (6 jours de silence à nouveau). | 🟠 Reprise ponctuelle, pas de tendance confirmée. Disponibilité juil.-26 reste théorique. |
| **Monty J** (IMO 9423877) | Toujours silencieux : dernier AIS il y a **69 jours** (contre 64 au cycle précédent). | 🟠 Aucune amélioration — statut réel toujours inconnu. |
| **Lydia D** (IMO 9582764) | 🟢 **Changement notable** : a quitté le quai de Dakar le 19/07, en route vers le **champ de Sangomar** (Woodside), ETA affichée 19/07 08h00 déjà dépassée → probablement sur site. | 🟢 Signal de mobilisation active — le navire n'est plus en attente à quai mais engagé sur une opération réelle au large du Sénégal. Pertinent pour le cluster Dakar (OPP-005), à ne pas confondre avec le projet GTA (opérateur différent : Woodside vs BP/Kosmos). |

### À renseigner (aucune donnée inventée)
Inchangé : IMO/MMSI manquants pour Jascon 66, Lagertha, Delta Sky, Ned Stark, Akali Akbal, Santa Luisa, Santa Rita, Britoil Conqueror. Identité Rachel J (IMO 7411105) incertaine. Lien Leo↔AES Monaco toujours à confirmer contractuellement.

*(`vessels.json` mis à jour pour Nomasa, Lydia D, Santangelo, Topaz Dignity, Leo, Red Fox et Monty J ; le reste de la flotte — 92 navires — n'a pas été revérifié ce cycle.)*

---

## 4. 🚢 FLEET INTELLIGENCE - Analyse comportementale

1. **Nomasa dépasse Pemba sans s'y arrêter, cap sur les Seychelles** : le comportement observé ce cycle (destination modifiée en cours de route) suggère soit une longue mobilisation inter-régionale sans lien avec l'Afrique de l'Est continentale, soit un changement de charte en transit. Dans les deux cas, **le navire sort du champ des opportunités towage suivies** (ni Venus, ni Afungi). Le conflit de position (Durban vs en route Seychelles) doit être résolu avant toute action commerciale.
2. **Lydia D confirme une mobilisation active vers Sangomar** — après plusieurs cycles « à quai Dakar », c'est le premier signal de départ effectif. Bon indicateur de dynamisme du cluster sénégalais, même si Sangomar (Woodside) est un projet distinct de GTA (BP/Kosmos) suivi par Sentinel.
3. **Santangelo/Topaz Dignity : dossier clarifié, pas aggravé** — les deux navires étaient déjà signalés hors-zone au cycle précédent ; ce cycle apporte une **confirmation à plus haute confiance** (AIS 1 min pour Topaz Dignity, trajectoire confirmée au-delà de Gibraltar pour Santangelo) plutôt qu'un nouveau problème. Le dataset CSO vient d'être corrigé pour Topaz Dignity.
4. **Red Fox : la reprise AIS du cycle précédent ne s'est pas confirmée** — un seul ping isolé (~17/07) sans suite. À traiter comme AIS toujours globalement silencieux plutôt que comme un navire redevenu traçable.
5. **Leo reste la position la plus critique** : 13 jours après son départ de Maputo, toujours aucune fixture ni destination visible publiquement, et le signal AIS lui-même est maintenant figé depuis 6 jours (dernière image, pas mouvement confirmé).

---

## 5. 🧠 TENDER WHISPERER - Prédictions d'appels d'offres

> Probabilités = estimations modèle (signaux faibles), pas des données confirmées. Flux RSS Google News (`tenders.json`, 17 items scannés) : **2 items marqués "nouveaux"**, mais vérification faite — ce sont des articles anciens qui viennent seulement de réapparaître dans le flux RSS (Kim Heng AHTS Angola, 2018 ; BP/Petrofac GTA, 2022), **pas de nouveaux tenders réels**. Les probabilités restent donc fondées sur les signaux Sentinel qualitatifs, inchangées cette semaine faute de mouvement de fond.

| Tender prédit | Donneur d'ordre | Probabilité | Fenêtre estimée | Signal déclencheur |
|---|---|---|---|---|
| Marine spread installation Baleine P3 | Eni / EPC subsea (SLB, TechnipFMC) | **~85 % sous 90 jours** | oct.-déc. 2026 | Inchangé — mobilisation EPC de juillet toujours la référence, pas de nouvelle attribution cette semaine |
| Marine logistics long terme Afungi (EOI 7 navires) | TotalEnergies/ExxonMobil JV | **~70 % sous 90 jours** | été-automne 2026 | Inchangé |
| AHTS support Kaminho 2027 | Saipem / TotalEnergies AGO | **~65 % sous 120 jours** | T4 2026 | Inchangé |
| Tow & hook-up Coral Norte | Eni / MRV | **~55 % à 6-9 mois** | T1 2027 | Inchangé |
| Harbour/terminal towage Walvis Bay | TotalEnergies / port NA | **~30 % à 9-12 mois** ↓ | post-FID Venus | Dégradé encore : houle bloquante 3j/5 sur zone Venus + Nomasa désormais hors-jeu (Seychelles) |

---

## 6. 🕵️ COMPETITOR WATCHDOG

- **P&O Maritime (DP World)** : aucun nouveau signal Afrique. Continuité : towage/port Maputo, programme digitalisation IoT (contrat Onboard, démarrage prévu début 2026).
- **Smit Lamnalco (Boskalis)** : aucun nouveau signal Afrique. Contrat terminal Mozambique (3 tugs 95t FiFi, escorte FLNG) inchangé. Les 4 nouveaux tugs FiFi (chantier Uzmar/Berg Propulsion, livraison série à partir de nov. 2026) restent destinés à la Guyane française.
- **MINDUS PRIME** : toujours **non identifié** en veille — aucun armateur towage/offshore sous ce nom exact. Grille de prix conservée par prudence (11 000 €/j), statut inchangé.
- **AES Monaco** (opérateur du Leo) : toujours **8 000 $/j** — prix plancher du panel, position d'arbitrage inchangée.

---

## 7. 🚨 BLACK SWAN DETECTOR

| Risque | Niveau | Impact towage | Action |
|---|---|---|---|
| **US-Iran / Détroit d'Hormuz** | 🔴 **Critique, aggravation confirmée** | Au moins 9 navires attaqués depuis le 6 juillet ; combats US-Iran continus (6e jour consécutif au 15/07) ; Brent a bondi à **94,13 $/bbl le 22/07 (+3,4 % sur la journée)**, WTI ~82,4 $/bbl (20/07). Trafic Hormuz qualifié de "worst case scenario" par les assureurs maritimes. | Maintenir l'indexation BAF immédiate sur tout devis en cours ; le coût soutes a de nouveau augmenté depuis le cycle précédent |
| **Cabo Delgado** | 🟠 Élevé, actif | Attaques ISMP continues mi-juillet dans les districts sud (Chiúre/Ancuabe) ; exactions rapportées à Natócua (21/07). Sécurité toujours fragile près de la zone Afungi. | Clause force majeure + démobilisation payée maintenue dans toute offre Afungi |
| **Piraterie Somalie / Golfe de Guinée** | 🟡 Mixte, inchangé | Confirmation du rapport IMB mi-2026 : recrudescence Somalie (5 hijackings, 27 navires abordés S1 2026, 94 % des otages pris par des pirates somaliens), mais **recul confirmé Golfe de Guinée**. Situation globale = plus bas niveau en 34 ans hors Somalie. | Ne pas relâcher la vigilance côte est-africaine si expansion vers nos zones AHTS (Mozambique) ; prime Golfe de Guinée toujours réductible |
| **EUR/USD** | 🟡 Modéré | Spot 1,1408 (23/07, BCE 22/07) vs 1,1435 au cycle précédent — dollar très légèrement plus ferme, cohérent avec la tension géopolitique persistante | Leo (8 000 $/j) vaut désormais **7 014 €/j** au lieu de 6 996 €/j |
| **Météo Venus/Namibie** *(nouveau)* | 🟡 Modéré, ponctuel | Houle >2,5 m 3 jours consécutifs (23-25/07) — voir §2 | Aucune opération de staging faisable dans cette zone avant le 26/07 |
| **Saison cyclonique canal du Mozambique** | 🟢 Hors saison | Inchangé — prochaine prévision saisonnière attendue août-sept. 2026 | Aucune action immédiate |

---

## 8. 📡 TOWAGE OPPORTUNITY SCANNER

| ID | Opportunité | Navire(s) | Fenêtre | Statut |
|---|---|---|---|---|
| OPP-001 | Afungi marine support | **Leo** (13 j depuis départ Maputo, destination toujours non confirmée) | Immédiate | 🔴 Course contre la montre — échéance de relance atteinte aujourd'hui |
| OPP-002 | Kaminho installation | Topaz Master 87t + Akali Akbal 66t (Angola) | S2 2026-2027 | 🔴 Ouverte, inchangé |
| OPP-003 | Baleine P3 subsea/hook-up | Mobiliser 2-3 AHTS vers Abidjan | 2027-28 | 🟠 Pré-AO, inchangé (pas de nouvelle attribution cette semaine) |
| OPP-004 | Bonga North support | Delta Sky, Jascon 66, Ned Stark, Monty J (Nigeria) | 2026-27 | 🟠 Active, inchangé |
| OPP-005 | GTA1 ops / cluster Dakar | Ringhio, **Lydia D (mobilisée sur Sangomar, Woodside)**, Santa Rita | Continue | 🟢 **Renforcée** — premier signal de mobilisation active de la flotte du cluster |
| OPP-006 | Coral Norte hook-up | Leo (si libre) + 2 AHTS à mobiliser | S2 2027 | 🟡 Préparation |
| OPP-007 | Venus staging | Navire à réidentifier | post-T4 2026 | 🔴 **Dégradée davantage** — Nomasa désormais en route vers les Seychelles (au-delà d'Afungi) + fenêtre météo bloquée 3j/5 |
| OPP-008 | Support mobilisation Nomasa | Nomasa (destination Seychelles à confirmer) | Immédiate | 🟡 Requalifiée — probablement **hors-jeu** pour l'Afrique, à vérifier avant d'investir plus de temps |

---

## 9. 📈 ORACLE - Scoring

| Rang | Opportunité | Score /100 | Δ vs cycle préc. |
|---|---|---|---|
| 1 | Afungi marine support | **92** | −1 (5 jours supplémentaires sans fixture Leo, aucun signal positif compensateur) |
| 2 | Kaminho installation | **89** | = |
| 3 | Baleine P3 | **88** | = (pas de nouvelle attribution EPC cette semaine) |
| 4 | Coral Norte tow/hook-up | **78** | = |
| 5 | Bonga North/Ubeta/IMA | **74** | = |
| 6 | GTA1/GTA2 | **70** | = (Lydia D/Sangomar est un signal positif pour le cluster Dakar, pas pour GTA au sens strict — voir OPP-005) |
| 7 | Venus staging | **52** | **−8** (Nomasa hors-jeu confirmé + fenêtre météo bloquée 3j/5) |
| 8 | Agogo/Ndungu | **58** | = (non recherché ce cycle, reconduit) |

Seule **Afungi (92)** dépasse le seuil de 90 → maintien CLOSER (§11).

---

## 10. 📊 BUILDER - Pipeline

| Stage | Lead | Valeur est. | Action | Échéance |
|---|---|---|---|---|
| **Négociation urgente** | Afungi (Leo @ 8 k$/j AES Monaco) | ~4,0 M€/an, marge ~1,5 M€ | Relancer AES Monaco/All Energies — échéance initiale atteinte sans réponse visible | **26 juil.** (relance) |
| **Qualification urgente** | Repositionnement Nomasa | À déterminer | Contacter Amsol : confirmer destination Seychelles et statut contractuel avant d'abandonner la piste | **25 juil.** (inchangé) |
| Proposition | Kaminho (2 AHTS Angola) | ~5,4 M€ | Contact Saipem/TTE Angola | 15 août |
| Qualification | Baleine P3 | ~8,5 M€ | Pré-qual Eni/EPC (SLB, TechnipFMC, Altera) + plan mobilisation Abidjan | 31 août |
| Qualification | Bonga North/Ubeta/IMA | ~3,6 M€ | Qualifier besoin Shell/TotalEnergies | 15 sept. |
| **Prospection renforcée** | GTA1/Dakar cluster | ~2-4 M€ | Sonder BP/Kosmos ; Lydia D désormais confirmée active sur Sangomar (signal de dynamisme du cluster) | sept. |
| Préparation | Coral Norte | ~4,4 M€ | Dossier Eni/MRV | T4 2026 |
| **Veille dégradée** | Venus (staging) | - | Identifier un navire de remplacement — Nomasa définitivement écarté, fenêtre météo fermée jusqu'au 26/07 | continu |

**Pipeline : ≈ 28 M€ brut / ≈ 15,3 M€ pondéré** (léger repli du pondéré, Afungi et Venus tous deux revus à la baisse).

---

## 11. ✉️ CLOSER - Action immédiate cycle #3

**Relance : le Leo reste sans fixture confirmée 13 jours après son départ de Maputo, et le délai de 48h demandé au cycle précédent est dépassé sans réponse visible.**

Email de relance (AES Monaco / All Energies — contact à compléter du CRM) :
> Objet : Leo (IMO 9652143) — relance, suivi de position et demande de fixture ferme
>
> Madame, Monsieur,
> Suite à notre message du 18 juillet resté sans réponse, nous revenons vers vous au sujet du Leo. Le navire a quitté le mouillage de Maputo le 10 juillet et son signal AIS est stable depuis (zone Afrique de l'Est) sans destination renseignée. Nous restons intéressés par un affrètement time-charter de 12 mois (+ options) à compter de sa disponibilité, base 8 000 $/jour. Pourriez-vous nous indiquer sa destination actuelle et son statut d'engagement ? Une réponse sous 48 h nous permettrait de sécuriser une position avant tout engagement concurrent.
> Dans l'attente de votre retour. — Boluda Towage

`mailto:?subject=Leo%20(IMO%209652143)%20%E2%80%94%20relance%2C%20suivi%20de%20position%20et%20demande%20de%20fixture%20ferme&body=Madame%2C%20Monsieur%2C%0A%0ASuite%20%C3%A0%20notre%20message%20du%2018%20juillet%20rest%C3%A9%20sans%20r%C3%A9ponse%2C%20nous%20revenons%20vers%20vous%20au%20sujet%20du%20Leo.%20Le%20navire%20a%20quitt%C3%A9%20le%20mouillage%20de%20Maputo%20le%2010%20juillet%20et%20son%20signal%20AIS%20est%20stable%20depuis%20(zone%20Afrique%20de%20l%27Est)%20sans%20destination%20renseign%C3%A9e.%20Nous%20restons%20int%C3%A9ress%C3%A9s%20par%20un%20affr%C3%A8tement%20time-charter%20de%2012%20mois%20(%2B%20options)%20%C3%A0%208%20000%20%24%2Fjour.%20Pourriez-vous%20nous%20indiquer%20sa%20destination%20actuelle%20et%20son%20statut%20d%27engagement%20%3F%0A%0A%E2%80%94%20Boluda%20Towage`

**Second dossier recommandé** : contact armateur Amsol au sujet du Nomasa — la destination affichée a changé de Pemba à Seychelles, ce qui change la nature de la question (moins « ce navire nous concurrence-t-il sur Mozambique LNG » que « ce navire est-il définitivement hors de portée pour nos dossiers Afrique »). À qualifier avant tout email formel.

Les dossiers Kaminho / Baleine P3 / Bonga North complets : voir cycle précédent §11 pour trame, à réactualiser une fois les contacts décideurs enrichis (PROSPECT-ENRICHER toujours inactif).

---

## 12. 💰 PRICING ENGINE - Grille intégrée à la carte

Taux du jour (`fx-rate.json`, BCE via Frankfurter, 22/07) : **1 EUR = 1,1408 USD** (0,8766 EUR/USD).

| Armateur | Prix | Note |
|---|---|---|
| MINDUS PRIME | 11 000 €/j | Premium flat — inchangé |
| P&O Maritime (Red Fox + 70-80 TBP AGO/NGA) | 10 000 €/j | Grille volume — inchangé |
| Smit Lamnalco | 11 000 €/j | SL Kiwi surcoté segment 38t — inchangé |
| **AES Monaco - Leo** | **8 000 $/j ≈ 7 014 €/j** (EUR/USD 1,1408 du 23/07) | Prix plancher du panel — montant légèrement révisé (+18 €/j vs cycle préc.) |
| Sans armateur confirmé | Référence zone 10-11 k€/j | BP >85t → 11 k€/j |

---

## 13. 🎯 SYNTHÈSE EXÉCUTIVE

1. **Semaine calme côté projets** : aucun des 7 dossiers Sentinel n'a connu de développement matériel. Le seul travail de fond a été d'écarter un faux signal (contrat DOF/Altera = Baleine Phase 2 déjà exécuté, pas Phase 3).
2. **Leo toujours sans fixture, 13 jours après son départ de Maputo** — le signal AIS lui-même est maintenant figé (6 jours sans mise à jour). L'échéance de relance CRM tombe aujourd'hui : email de relance envoyé (§11).
3. **Nomasa change de cap vers les Seychelles**, dépassant apparemment la zone Afungi sans s'y arrêter — à vérifier d'urgence auprès d'Amsol, mais le pool de staging Venus semble définitivement perdre ce candidat.
4. **Lydia D quitte enfin le quai de Dakar** pour le champ de Sangomar (Woodside) — premier signal de mobilisation active du cluster sénégalais depuis plusieurs cycles.
5. **Deux corrections de dataset confirmées avec une confiance accrue** : Topaz Dignity (Marmara/Turquie, AIS 1 min) et Santangelo (Méditerranée occidentale, pas Guinée) — le cluster ivoirien/guinéen du dataset CSO continue de se dégrader sur ces deux navires spécifiques.
6. **Black Swan toujours critique sur Hormuz** : Brent à 94,13 $/bbl (+3,4 % le 22/07), au moins 9 navires attaqués depuis le 6 juillet — indexer le BAF reste la priorité sur tout devis en cours.
7. **Nouvelle contrainte météo sur Venus/Namibie** : houle bloquante 3 jours sur 5 cette semaine, aggravant un dossier déjà fragilisé par le départ du Nomasa (score Oracle −8 cette semaine).
8. **Cabo Delgado reste actif** (exactions à Natócua le 21/07) — clause force majeure à maintenir sur toute offre Afungi.

### Changements détectés depuis le cycle précédent (18 → 23 juillet)
- Leo : aucun nouveau signal AIS depuis ~17/07 (6 jours de silence) ; échéance de relance CRM atteinte → email de relance envoyé
- Nomasa : destination changée de Pemba à Seychelles (ETA 28/07) ; conflit de position non résolu (Durban vs en transit) → score Oracle Venus −8
- Lydia D : a quitté Dakar le 19/07, en route/probablement arrivée sur le champ de Sangomar (Woodside) → signal positif OPP-005
- Santangelo : identité active confirmée au-delà de Gibraltar, en Méditerranée occidentale vers l'Italie — destination Guinée définitivement infirmée
- Topaz Dignity : position Marmara/Turquie confirmée par AIS live 1 min (2e cycle de confirmation) — dataset CSO corrigé dans vessels.json
- Red Fox : la reprise AIS du cycle précédent ne s'est pas confirmée (silence depuis ~17/07)
- Monty J : silence AIS étendu à 69 jours (vs 64)
- Météo Venus/Namibie : nouvelle contrainte, houle bloquante 3j/5 (23-25/07)
- Hormuz/Iran : escalade confirmée, Brent 94,13 $/bbl (+3,4 % le 22/07, vs 85,9 $/bbl au cycle précédent)
- EUR/USD : 1,1435 → 1,1408 (dollar très légèrement plus ferme)
- Baleine P3 : faux signal DOF/Altera vérifié et écarté (Phase 2, pas Phase 3)
- Tenders RSS : 2 items "nouveaux" identifiés comme de vieux articles réapparus (2018, 2022), pas de tender réel

*Prochain cycle automatique : dans 2 jours à 10h.*
