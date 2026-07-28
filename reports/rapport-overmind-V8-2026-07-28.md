# 🧠 FABLE TOWAGE OVERMIND V8 - CYCLE #4
**28 juillet 2026 · Cycle automatique : tous les 2 jours à 10h**

> Note opérationnelle : les agents de données locaux (FX-RATE, METOCEAN, TENDER-HAWK) ont tourné avec succès à 10h00 avant ce cycle ; leurs sorties (`fx-rate.json`, `metocean.json`, `tenders.json`) sont intégrées ci-dessous. `prospects.json` reste absent (PROSPECT-ENRICHER inactif, `APOLLO_API_KEY` non configurée). Note additionnelle : `vessels.json` portait des modifications non commitées sur le Nomasa (datées "vérifié 26/07"), signe d'un cycle antérieur interrompu avant commit/déploiement — intégrées et resynchronisées ci-dessous avec les données fraîches de ce cycle.

---

## 1. 🔍 SENTINEL - Rapport de veille

Fenêtre : 23 → 28 juillet 2026 (5 jours).

| Projet | Changement détecté | Impact towage |
|---|---|---|
| **Baleine Phase 3** (Côte d'Ivoire) | 🟢 **Nouveau contrat marine/installation** : Saipem a été attribué le 27/07 un contrat par Eni Côte d'Ivoire (~800 M€) portant sur l'ingénierie, la fabrication, le transport et l'**installation d'environ 50 km de pipelines rigides** et structures subsea associées. S'ajoute aux contrats TechnipFMC (06/07) et SLB OneSubsea (13/07, 13 puits). | **Signal fort** : la mobilisation EPC bascule en phase d'exécution — Saipem va devoir sous-traiter un spread marine (AHTS/tow) pour l'installation. Fenêtre de prospection à ouvrir immédiatement (voir §10-11). |
| **Mozambique LNG / Afungi** | Aucun développement contractuel nouveau. Chantier à ~45 % d'avancement (déclaration TotalEnergies), >4 000 travailleurs mobilisés. Premier gaz désormais visé 2029. | Statu quo, mais le calendrier 2029 confirme une fenêtre de mobilisation marine encore longue. |
| **Coral Norte FLNG** | Aucun changement dans la fenêtre (hull launch 16/01 et contrat Technip Energies ~1,15 Md$ restent les derniers jalons, antérieurs à cette fenêtre). | Statu quo. |
| **Kaminho** (Angola) | 🟡 **Calendrier accéléré** : premier oil désormais visé **T4 2027** (au lieu de T1 2028 précédemment retenu) ; FPSO à 50 % d'avancement (avril 2026) ; pic de production revu à la hausse (70 000 → 75 000 bopd). Fabrication subsea toujours en cours au chantier Saipem Ambriz. | Fenêtre d'installation resserrée d'un trimestre — accélérer la qualification des AHTS (voir §5, §10). |
| **GTA Phase 2** | Aucun changement — concept GBS 2,5-3 Mtpa toujours au stade pré-FEED. | Statu quo. |
| **Venus** (Namibie) | Aucun changement calendaire (FID toujours "fin 2026"). Voir §2/§3 pour des signaux météo et navire, tous deux légèrement positifs ce cycle. | Statu quo texte, léger mieux opérationnel. |
| **Bonga North / Ubeta / IMA** (Nigeria) | Aucune nouvelle déclaration cette fenêtre. First oil/gaz toujours visé 2027 pour Bonga North et Ubeta ; FID IMA toujours attendue en 2026. | Statu quo. |

**Bilan Sentinel** : première semaine avec un développement matériel réel depuis plusieurs cycles — l'attribution du contrat Saipem (Baleine P3, 27/07) est le signal le plus actionnable de tout le cycle, complété par une accélération calendaire notable sur Kaminho.

Sources : [Saipem (Baleine P3, 27/07)](https://www.saipem.com/en/media/press-releases/2026-07-27/saipem-awarded-new-contracts-ivory-coast-and-italy-eni-worth) · [TechnipFMC](https://www.technipfmc.com/en/investors/financial-news-releases/press-release/technipfmc-awarded-subsea-contract-for-eni-s-baleine-phase-3-development-offshore-cote-d-ivoire/) · [SLB](https://www.slb.com/newsroom/press-release/2026/pr-2026-0713-slb-oss-eni-baleine) · [TotalEnergies (restart Afungi, 45%)](https://lngprime.com/africa/totalenergies-ceo-mozambique-lng-project-45-percent-complete/193104/) · [WorldOil (Kaminho, calendrier T4 2027)](https://africaoilgasreport.com/2026/07/in-the-news/timeline-for-first-oil-from-kaminho-is-closer-than-originally-announced/) · [WorldOil (Kaminho FPSO 50%)](https://www.indexbox.io/blog/totalenergies-strengthens-offshore-operations-in-angola-with-new-projects-and-exploration/) · [bp.com (GTA Phase 2 GBS)](https://www.bp.com/en/global/corporate/news-and-insights/press-releases/bp-and-partners-progress-concept-for-greater-tortue-ahmeyim-phase-2-to-next-phase-of-evaluation.html) · [IntelliNews (Venus FID fin 2026)](https://www.intellinews.com/namibia-expects-fid-by-totalenergies-on-venus-discovery-by-late-2026-says-petroleum-commissioner-381459/) · [MarketScreener (Bonga North/Ubeta)](https://www.marketscreener.com/quote/stock/SHELL-PLC-130945922/news/Shell-TotalEnergies-target-2027-for-oil-and-gas-output-from-5bn-Bonga-North-and-550mn-Ubeta-proje-50468263/).

---

## 2. 🔮 PROPHET - Prédictions & fenêtres météo

Données Open-Meteo Marine (`metocean.json`, fetch 10h00) — seuil de blocage 2,5 m de houle max, 5 prochains jours (28 juil.-1 août) :

| Zone | Houle max (28 juil.-1 août) | Fenêtre |
|---|---|---|
| Baleine P3 (Côte d'Ivoire) | 1,34-1,76 m | 🟢 5/5 jours favorables |
| Afungi / Mozambique LNG | 0,64-0,94 m | 🟢 5/5 jours favorables (mer très calme) |
| Kaminho / Angola | 0,98-1,32 m | 🟢 5/5 jours favorables |
| **Venus / Namibie** | **1,50-2,94 m** | 🟡 **3/5 jours favorables** — houle >2,5 m les 28 et 29/07 seulement, repasse sous le seuil dès le 30/07 |
| GTA (Sénégal/Mauritanie) | 1,10-1,74 m | 🟢 5/5 jours favorables |
| Bonga / Nigeria | 1,52-1,92 m | 🟢 5/5 jours favorables |

**Changement notable** : la zone Venus/Namibie **s'améliore** — de 2/5 (cycle #3) à **3/5 jours favorables**, la fenêtre bloquante se réduisant à 2 jours consécutifs (28-29/07) au lieu de 3. Premier signal positif sur ce dossier depuis plusieurs cycles, à mettre en perspective avec la résolution du dossier Nomasa (§3) qui, elle, retire ce navire du pool Venus.

Qualitatif (reconduit sans signal contraire) : Cabo Delgado/Rovuma demande tugs ×3 d'ici mi-2027 ; Abidjan hub d'installation 2027-28 (renforcé par l'attribution Saipem, §1) ; Luanda/Ambriz saturation AHTS attendue S2 2026, resserrée d'un trimestre par l'accélération Kaminho ; Walvis Bay explosion différée post-FID Venus.

---

## 3. 🛰️ AIS AUTO-TRACKING - Carte FABLE

**Vérification VesselFinder des 7 navires prioritaires — 28 juillet.**

| Navire | Signal | Lecture |
|---|---|---|
| **Leo** (IMO 9652143) | AIS toujours figé : dernier signal reçu il y a **11 jours** (~17/07), soit **18 jours** depuis le départ du mouillage de Maputo (10/07). Toujours "East Africa", 5,7 kn (valeur figée), destination non renseignée. | 🔴 **Dossier le plus critique du cycle** : aucune amélioration, la relance du 23/07 reste sans réponse visible 5 jours après. Deuxième relance nécessaire (voir §11). |
| **Nomasa** (IMO 9366316) | 🟢 **Conflit résolu** : signal AIS frais (23h) confirme la destination **AFUNGI**, ETA 01/08 08h00 — la destination Seychelles affichée aux cycles précédents (et le conflit Durban/Mossel Bay non résolu du cycle intermédiaire) n'apparaissent plus. Dernier port connu : Pemba (mouillage), 18/07. | 🟢 Ce navire redevient un candidat concret pour la zone Afungi/Mozambique LNG (pas Venus). À vérifier auprès d'Amsol avant toute action commerciale, mais le signal directionnel est net. |
| **Santangelo** (IMO 9343948) | ✅ **Trajectoire bouclée** : l'identité active "Santangelo Uno" (MMSI 249549000, Malte) est arrivée à **Porto Empedocle, Italie/Sicile** le 25/07 13h07 UTC, AIS très frais (~7 min). MMSI de référence toujours silencieux depuis le 14/01/2026. | 🟢 Dossier définitivement clos : navire confirmé hors zone Afrique. Dataset `vessels.json` mis à jour (position portuaire Porto Empedocle). |
| **Topaz Dignity** (IMO 9654983) | Position inchangée : toujours à l'ancre en **mer de Marmara** (Istanbul), signal AIS très frais. | 🟢 Statu quo — 3e cycle consécutif de confirmation. Hors zone Afrique, non mobilisable court terme. |
| **Red Fox** (IMO 9319193) | Toujours aucun nouveau signal depuis le ping isolé du ~17/07 (**11 jours** d'écart désormais). Dernier port connu Punta Europa (Guinée Éq.), 10/07. | 🟠 Reprise ponctuelle du cycle #2 toujours non confirmée — traiter comme AIS globalement silencieux. |
| **Monty J** (IMO 9423877) | Toujours silencieux : dernier AIS il y a **74 jours** (contre 69 au cycle précédent). | 🟠 Aucune amélioration — statut réel toujours inconnu. |
| **Lydia D** (IMO 9582764) | 🟢 **Rotation confirmée** : AIS très frais (1 min) montre le navire **amarré à Dakar depuis le 27/07 18h47 UTC**, après avoir quitté ce même quai le 18/07 — cycle complet cohérent avec une opération réalisée au champ de Sangomar (Woodside) entre le 19 et le 27/07. | 🟢 Première confirmation d'une mobilisation active et bouclée pour le cluster Dakar (le cycle précédent n'avait que le départ, pas le retour). Pertinent pour OPP-005. |

### À renseigner (aucune donnée inventée)
Inchangé : IMO/MMSI manquants pour Jascon 66, Lagertha, Delta Sky, Ned Stark, Akali Akbal, Santa Luisa, Santa Rita, Britoil Conqueror. Identité Rachel J (IMO 7411105) incertaine. Lien Leo↔AES Monaco toujours à confirmer contractuellement.

*(`vessels.json` mis à jour pour Nomasa, Lydia D, Santangelo, Leo, Red Fox et Monty J ; le reste de la flotte — 92 navires — n'a pas été revérifié ce cycle.)*

---

## 4. 🚢 FLEET INTELLIGENCE - Analyse comportementale

1. **Nomasa referme un dossier ouvert depuis deux cycles** : le conflit de position/destination (Pemba → Seychelles → Durban non confirmé) se résout en faveur d'une destination simple et cohérente — Afungi, ETA 01/08. Le comportement observé (destination affichée fluctuante puis stabilisée) est cohérent avec un navire qui ajuste sa charte en cours de transit plutôt qu'avec une erreur de source. Fleet intelligence : **ce navire revient dans le périmètre suivi**, contrairement à la lecture du cycle #3.
2. **Lydia D complète sa première rotation observée** : après plusieurs cycles "à quai Dakar" puis un simple signal de départ (cycle #3), c'est la première fois que la boucle est bouclée (départ 18/07 → retour 27/07). Ce comportement — rotation courte, retour au même quai — est typique d'un support ponctuel plutôt que d'une mobilisation longue durée, mais confirme que le cluster Dakar génère une activité réelle et récurrente.
3. **Santangelo/Topaz Dignity : dossiers clos, pas de nouvelle information** — troisième cycle de confirmation pour les deux navires, aucun retournement. Le cluster ivoirien/guinéen du dataset CSO reste corrigé sur ces deux navires.
4. **Red Fox et Monty J : silence AIS qui s'installe** — aucun des deux navires n'a montré de reprise depuis le pic isolé de mi-juillet (Red Fox) ou depuis plus de deux mois (Monty J). À moins d'une source payante, ces deux dossiers doivent être traités comme "disponibilité théorique non vérifiable" plutôt que suivis activement chaque cycle.
5. **Leo reste l'anomalie la plus préoccupante de la flotte suivie** : 18 jours sans destination visible et 11 jours sans même une mise à jour de position, alors que la relance commerciale du 23/07 est restée sans réponse. Le contraste avec la résolution rapide du dossier Nomasa (destination clarifiée en quelques jours) souligne que le silence de Leo est structurel, pas un simple délai de source AIS gratuite.

---

## 5. 🧠 TENDER WHISPERER - Prédictions d'appels d'offres

> Probabilités = estimations modèle (signaux faibles), sauf mention contraire. Flux RSS Google News (`tenders.json`, 17 items scannés) : **2 items marqués "nouveaux"** — vérification faite, ce sont un article de 2023 (PACC Offshore, towage FPSO Mauritanie-Sénégal, déjà exécuté) et un article de janvier 2026 sur l'investissement flotte/digitalisation d'Emar, aucun n'étant un tender réel actuellement ouvert. Le vrai signal du cycle vient de Sentinel (§1), pas du flux RSS.

| Tender prédit | Donneur d'ordre | Probabilité / statut | Fenêtre estimée | Signal déclencheur |
|---|---|---|---|---|
| **Marine spread installation Baleine P3** | Eni / Saipem (EPC) | **~90 % — en cours de matérialisation** ↑ | immédiat-3 mois | Saipem vient d'être attribué le contrat d'installation (27/07) : va devoir sous-traiter un spread marine. Fenêtre de contact la plus chaude du cycle |
| Marine logistics long terme Afungi (EOI 7 navires) | TotalEnergies/ExxonMobil JV | **~70 % sous 90 jours** | été-automne 2026 | Inchangé |
| AHTS support Kaminho 2027 | Saipem / TotalEnergies AGO | **~70 % sous 120 jours** ↑ | T3-T4 2027 (avancé) | Calendrier accéléré (T4 2027 au lieu de T1 2028) - fenêtre resserrée, qualification à avancer |
| Tow & hook-up Coral Norte | Eni / MRV | **~55 % à 6-9 mois** | T1 2027 | Inchangé |
| Harbour/terminal towage Walvis Bay | TotalEnergies / port NA | **~35 % à 9-12 mois** ↑ | post-FID Venus | Léger mieux : fenêtre météo Venus passée à 3/5 jours, dossier moins dégradé qu'au cycle précédent |

---

## 6. 🕵️ COMPETITOR WATCHDOG

- **P&O Maritime (DP World)** : aucun nouveau signal Afrique cette fenêtre.
- **Smit Lamnalco (Boskalis)** : aucun nouveau signal Afrique cette fenêtre. Contrat terminal Mozambique et pipeline des 4 tugs FiFi (Guyane) inchangés.
- **MINDUS PRIME** : toujours **non identifié** en veille libre — grille de prix conservée par prudence (11 000 €/j), statut inchangé.
- **AES Monaco** (opérateur du Leo) : toujours **8 000 $/j** — prix plancher du panel, position d'arbitrage inchangée.

---

## 7. 🚨 BLACK SWAN DETECTOR

| Risque | Niveau | Impact towage | Action |
|---|---|---|---|
| **US-Iran / Détroit d'Hormuz** | 🟡 **Désescalade confirmée** ↓↓ | Après une nouvelle escalade fin juillet (Brent au-dessus de 100 $/bbl, un plus haut depuis le 26 mai), un cessez-le-feu annoncé par Washington (Iran ayant suspendu ses opérations de représailles, discussions engagées avec Oman/via Genève) a fait chuter Brent à **~85,9-89,7 $/bbl** — repli net vs les 94,13 $/bbl du cycle précédent, malgré un pic intermédiaire >100 $. Situation qualifiée de fragile plutôt que résolue. | Maintenir l'indexation BAF sur les devis en cours mais cesser de la relever mécaniquement — premier signal de détente depuis plusieurs cycles, à confirmer avant d'ajuster les grilles à la baisse |
| **Cabo Delgado** | 🔴 **Élevé, aggravation confirmée** ↑ | Au moins **34 000 nouveaux déplacés** entre le 20 et le 25/07 (districts Chiúre, Ancuabe, Muidumbe) ; l'ISMP a envoyé des colonnes de combattants vers le sud depuis Macomia ; 6 civils décapités à Natócua (21/07, déjà signalé) ; attaque repoussée à Chiúre (24/07). | Renforcer (pas seulement maintenir) la clause force majeure + démobilisation payée sur toute offre Afungi — la tendance est à la dégradation, pas à la stabilisation |
| **Piraterie Somalie / Golfe de Guinée** | 🟡 Mixte, inchangé | Confirmation de la résurgence Somalie/Golfe d'Aden (17 incidents depuis janvier 2026, dont 3 hijackings de navires + 5 boutres). Aucun nouveau signal Golfe de Guinée cette fenêtre (recul précédemment confirmé reconduit). | Vigilance côte est-africaine maintenue ; pas de changement de posture Golfe de Guinée |
| **EUR/USD** | 🟡 Modéré | Spot 1,1389 (27/07, BCE) vs 1,1408 au cycle précédent — dollar très légèrement plus ferme, tendance qui se poursuit malgré la désescalade Hormuz | Leo (8 000 $/j) vaut désormais **7 024 €/j** au lieu de 7 014 €/j |
| **Météo Venus/Namibie** | 🟢 Amélioration, ponctuel | Fenêtre bloquante réduite à 2 jours (28-29/07) au lieu de 3 — voir §2 | Aucune action immédiate, à surveiller |
| **Saison cyclonique canal du Mozambique** | 🟢 Hors saison | Inchangé — saison 2025-26 (nov.-avril) déjà classée "moyenne à supérieure à la moyenne" par le RSMC La Réunion (10-14 tempêtes nommées), prochaine prévision saisonnière attendue août-sept. 2026 | Aucune action immédiate |

---

## 8. 📡 TOWAGE OPPORTUNITY SCANNER

| ID | Opportunité | Navire(s) | Fenêtre | Statut |
|---|---|---|---|---|
| OPP-001 | Afungi marine support | **Leo** (18 j depuis départ Maputo, AIS figé 11 j) | Immédiate | 🔴 Course contre la montre — 2e relance nécessaire |
| OPP-002 | Kaminho installation | Topaz Master 87t + Akali Akbal 66t (Angola) | T3-T4 2027 (avancé) | 🔴 Ouverte, fenêtre resserrée d'un trimestre |
| OPP-003 | Baleine P3 subsea/hook-up/installation | Mobiliser 2-3 AHTS vers Abidjan pour appuyer le spread Saipem | immédiat-2027 | 🟢 **Nouveau catalyseur** — contrat Saipem attribué 27/07, fenêtre de contact la plus chaude |
| OPP-004 | Bonga North support | Delta Sky, Jascon 66, Ned Stark, Monty J (Nigeria) | 2026-27 | 🟠 Active, inchangé |
| OPP-005 | GTA1 ops / cluster Dakar | Ringhio, **Lydia D (rotation Sangomar confirmée et bouclée)**, Santa Rita | Continue | 🟢 **Renforcée** — première rotation complète observée |
| OPP-006 | Coral Norte hook-up | Leo (si libre) + 2 AHTS à mobiliser | S2 2027 | 🟡 Préparation |
| OPP-007 | Venus staging | Navire à réidentifier (Nomasa définitivement hors pool Venus) | post-T4 2026 | 🟡 Légèrement amélioré — fenêtre météo 3/5, mais toujours sans candidat navire |
| OPP-008 | Support mobilisation Nomasa | **Nomasa (destination Afungi confirmée, ETA 01/08)** | Immédiate | 🟢 **Requalifiée positivement** — candidat concret pour Afungi, à vérifier auprès d'Amsol |

---

## 9. 📈 ORACLE - Scoring

| Rang | Opportunité | Score /100 | Δ vs cycle #3 |
|---|---|---|---|
| 1 | Afungi marine support | **93** | **+1** (Leo continue de se dégrader seul, mais la confirmation Nomasa→Afungi apporte un second candidat concret sur la même zone) |
| 2 | Baleine P3 | **92** | **+4** (contrat d'installation Saipem attribué 27/07 — catalyseur le plus concret du cycle) |
| 3 | Kaminho installation | **90** | **+1** (calendrier accéléré T4 2027, FPSO 50 %) |
| 4 | Coral Norte tow/hook-up | **78** | = |
| 5 | Bonga North/Ubeta/IMA | **74** | = |
| 6 | GTA1/GTA2 | **73** | **+3** (rotation Lydia D confirmée et bouclée) |
| 7 | Agogo/Ndungu | **58** | = (non recherché ce cycle, reconduit) |
| 8 | Venus staging | **55** | **+3** (météo 2/5→3/5 ; Nomasa clarifié, même si hors pool Venus) |

**Deux opportunités dépassent désormais le seuil de 90** → CLOSER activé sur les deux dossiers (§11) : Afungi (Leo, relance) et Baleine P3 (nouveau contact Saipem).

---

## 10. 📊 BUILDER - Pipeline

| Stage | Lead | Valeur est. | Action | Échéance |
|---|---|---|---|---|
| **Négociation urgente** | Afungi (Leo @ 8 k$/j AES Monaco) | ~4,0 M€/an, marge ~1,5 M€ | 2e relance AES Monaco/All Energies — 1re relance du 23/07 restée sans réponse 5 jours | **30 juil.** (2e relance) |
| **Prospection prioritaire (nouveau)** | Baleine P3 — spread marine installation Saipem | ~9-10 M€ (estim., 2-3 AHTS sur 12-18 mois) | Contacter Saipem Côte d'Ivoire (chantier Ambriz-CI/Abidjan) suite à l'attribution du 27/07 | **7 août** |
| **Qualification urgente** | Repositionnement Nomasa → Afungi | À déterminer | Contacter Amsol : confirmer statut contractuel à l'arrivée (ETA 01/08) et disponibilité éventuelle | **1er août** |
| Proposition | Kaminho (2 AHTS Angola) | ~5,4 M€ | Contact Saipem/TTE Angola — accélérer vu calendrier resserré | **1er août** (avancée) |
| Qualification | Baleine P3 (dossier hook-up initial) | ~8,5 M€ | Pré-qual Eni/EPC (SLB, TechnipFMC, Saipem) + plan mobilisation Abidjan | 31 août |
| Qualification | Bonga North/Ubeta/IMA | ~3,6 M€ | Qualifier besoin Shell/TotalEnergies | 15 sept. |
| **Prospection renforcée** | GTA1/Dakar cluster | ~2-4 M€ | Sonder BP/Kosmos ; Lydia D confirme un cluster actif avec rotations réelles | sept. |
| Préparation | Coral Norte | ~4,4 M€ | Dossier Eni/MRV | T4 2026 |
| Veille | Venus (staging) | - | Identifier un navire de remplacement — fenêtre météo légèrement meilleure (3/5) | continu |

**Pipeline : ≈ 37-38 M€ brut / ≈ 17,5 M€ pondéré** (hausse du brut et du pondéré — nouveau lead Baleine P3/Saipem + amélioration générale des scores Oracle).

---

## 11. ✉️ CLOSER - Actions immédiates cycle #4

### Dossier 1 — Leo (2e relance)
**Le Leo reste sans fixture confirmée 18 jours après son départ de Maputo, et la relance du 23/07 est restée sans réponse 5 jours.**

> Objet : Leo (IMO 9652143) — deuxième relance, position AIS figée, demande de statut sous 48h
>
> Madame, Monsieur,
> Notre message du 23 juillet concernant le Leo est resté sans réponse. Le signal AIS du navire est désormais figé depuis 11 jours (dernière position connue : zone Afrique de l'Est, aucune destination renseignée), et le navire a quitté le mouillage de Maputo il y a 18 jours sans fixture visible. Nous maintenons notre intérêt pour un affrètement time-charter de 12 mois (+ options) à 8 000 $/jour dès sa disponibilité. À défaut de retour sous 48h, nous devrons envisager des alternatives pour ce dossier. — Boluda Towage

`mailto:?subject=Leo%20(IMO%209652143)%20%E2%80%94%20deuxi%C3%A8me%20relance%2C%20position%20AIS%20fig%C3%A9e&body=Madame%2C%20Monsieur%2C%0A%0ANotre%20message%20du%2023%20juillet%20concernant%20le%20Leo%20est%20rest%C3%A9%20sans%20r%C3%A9ponse.%20Le%20signal%20AIS%20du%20navire%20est%20d%C3%A9sormais%20fig%C3%A9%20depuis%2011%20jours%2C%20et%20le%20navire%20a%20quitt%C3%A9%20le%20mouillage%20de%20Maputo%20il%20y%20a%2018%20jours%20sans%20fixture%20visible.%20Nous%20maintenons%20notre%20int%C3%A9r%C3%AAt%20pour%20un%20affr%C3%A8tement%20time-charter%20de%2012%20mois%20(%2B%20options)%20%C3%A0%208%20000%20%24%2Fjour.%20%C3%80%20d%C3%A9faut%20de%20retour%20sous%2048h%2C%20nous%20devrons%20envisager%20des%20alternatives.%0A%0A%E2%80%94%20Boluda%20Towage`

### Dossier 2 — Baleine P3 / Saipem (nouveau)
**Saipem vient d'être attribué le contrat d'installation Baleine Phase 3 (27/07) — fenêtre idéale pour proposer un appui marine avant que le spread ne soit bouclé avec un concurrent.**

> Objet : Support marine (AHTS/tow) — mobilisation installation Baleine Phase 3
>
> Madame, Monsieur,
> Nous avons noté l'attribution récente du contrat d'installation (pipelines rigides et structures subsea, Baleine Phase 3) à Saipem. Boluda Towage dispose de capacités AHTS/remorquage mobilisables vers Abidjan pour appuyer cette campagne d'installation. Serait-il possible d'échanger sur vos besoins de spread marine pour cette mobilisation ? — Boluda Towage

`mailto:?subject=Support%20marine%20(AHTS%2Ftow)%20%E2%80%94%20mobilisation%20installation%20Baleine%20Phase%203&body=Madame%2C%20Monsieur%2C%0A%0ANous%20avons%20not%C3%A9%20l%27attribution%20r%C3%A9cente%20du%20contrat%20d%27installation%20(Baleine%20Phase%203)%20%C3%A0%20Saipem.%20Boluda%20Towage%20dispose%20de%20capacit%C3%A9s%20AHTS%2Fremorquage%20mobilisables%20vers%20Abidjan.%20Serait-il%20possible%20d%27%C3%A9changer%20sur%20vos%20besoins%20de%20spread%20marine%20%3F%0A%0A%E2%80%94%20Boluda%20Towage`

**Troisième dossier recommandé (pas d'email, qualification d'abord)** : contact armateur Amsol au sujet du Nomasa — destination désormais confirmée Afungi (ETA 01/08), à qualifier avant toute proposition commerciale formelle.

Les dossiers Kaminho / Bonga North complets : voir cycle #3 §11 pour trame, à réactualiser une fois les contacts décideurs enrichis (PROSPECT-ENRICHER toujours inactif).

---

## 12. 💰 PRICING ENGINE - Grille intégrée à la carte

Taux du jour (`fx-rate.json`, BCE via Frankfurter, 27/07) : **1 EUR = 1,1389 USD** (0,8780 EUR/USD).

| Armateur | Prix | Note |
|---|---|---|
| MINDUS PRIME | 11 000 €/j | Premium flat — inchangé |
| P&O Maritime (Red Fox + 70-80 TBP AGO/NGA) | 10 000 €/j | Grille volume — inchangé |
| Smit Lamnalco | 11 000 €/j | SL Kiwi surcoté segment 38t — inchangé |
| **AES Monaco - Leo** | **8 000 $/j ≈ 7 024 €/j** (EUR/USD 1,1389 du 27/07) | Prix plancher du panel — montant révisé (+10 €/j vs cycle précédent) |
| Sans armateur confirmé | Référence zone 10-11 k€/j | BP >85t → 11 k€/j |

---

## 13. 🎯 SYNTHÈSE EXÉCUTIVE

1. **Premier vrai développement de fond depuis plusieurs cycles** : Saipem a été attribué le 27/07 le contrat d'installation Baleine Phase 3 (~800 M€, 50 km de pipelines) — score Oracle du dossier +4, nouvelle action de prospection prioritaire.
2. **Deux dossiers dépassent désormais le seuil CLOSER (90)** : Afungi (Leo, 93) et Baleine P3 (92) — deux emails générés ce cycle (§11).
3. **Le conflit Nomasa se résout enfin** : destination confirmée Afungi (ETA 01/08), le navire redevient un candidat concret pour cette zone après deux cycles d'incertitude Seychelles/Durban.
4. **Lydia D boucle sa première rotation observée** (Dakar → Sangomar → Dakar, 18-27/07) — confirme un cluster Dakar réellement actif, pas seulement un signal de départ isolé.
5. **Leo reste le dossier le plus critique** : 18 jours sans fixture, AIS figé depuis 11 jours, relance du 23/07 sans réponse → deuxième relance envoyée ce cycle.
6. **Désescalade Hormuz/Iran, à confirmer** : après un pic >100 $/bbl fin juillet, un cessez-le-feu a fait retomber le Brent à ~86-90 $/bbl — premier repli depuis plusieurs cycles, situation qualifiée de fragile.
7. **Cabo Delgado s'aggrave** : 34 000 nouveaux déplacés (20-25/07), colonnes ISMP en mouvement vers le sud — renforcer la clause force majeure sur toute offre Afungi.
8. **Kaminho accélère** : premier oil désormais T4 2027 (au lieu de T1 2028), fenêtre AHTS resserrée d'un trimestre.

### Changements détectés depuis le cycle précédent (23 → 28 juillet)
- Baleine P3 : contrat d'installation attribué à Saipem (27/07, ~800 M€) — nouveau catalyseur marine
- Kaminho : calendrier accéléré à T4 2027 (vs T1 2028), FPSO 50 % avancement, pic production 70k→75k bopd
- Nomasa : conflit de position/destination résolu — destination confirmée Afungi, ETA 01/08 (n'est plus Seychelles)
- Lydia D : rotation Dakar→Sangomar→Dakar confirmée et bouclée (retour 27/07)
- Santangelo : arrivée confirmée à Porto Empedocle (25/07) — dossier définitivement clos
- Red Fox : silence AIS prolongé à 11 jours (pas de reprise confirmée)
- Monty J : silence AIS étendu à 74 jours (vs 69)
- Météo Venus/Namibie : amélioration, fenêtre bloquante réduite à 2j/5 (vs 3j/5)
- Hormuz/Iran : pic >100 $/bbl fin juillet puis cessez-le-feu, Brent retombé à ~86-90 $/bbl (vs 94,13 $/bbl au cycle précédent)
- Cabo Delgado : aggravation, 34 000 nouveaux déplacés (20-25/07)
- EUR/USD : 1,1408 → 1,1389 (dollar très légèrement plus ferme)
- Oracle : Afungi 92→93, Baleine P3 88→92, Kaminho 89→90, GTA1/2 70→73, Venus 52→55 ; deux dossiers (Afungi, Baleine P3) dépassent le seuil CLOSER de 90

*Prochain cycle automatique : dans 2 jours à 10h.*
