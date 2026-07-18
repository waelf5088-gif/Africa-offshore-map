# 🧠 FABLE TOWAGE OVERMIND V8 - CYCLE #2
**18 juillet 2026 · Cycle automatique : tous les 2 jours à 10h (cycle #1 déclenché à 10h48, complété manuellement suite à un blocage du run headless)**

> ⚠️ Note opérationnelle : le cycle automatique programmé (Task Scheduler, `run-overmind.ps1`) s'est arrêté juste après son lancement à 10h48 (log à 2 lignes, aucun rapport produit). Les agents de données (FX-RATE, METOCEAN, TENDER-HAWK) avaient déjà tourné avec succès à 10h48 ; leurs sorties sont intégrées ci-dessous. Ce rapport complète le cycle #2 manuellement.

---

## 1. 🔍 SENTINEL - Rapport de veille

Fenêtre : 12 juin → 18 juillet 2026 (36 jours).

| Projet | Changement détecté | Date | Impact towage |
|---|---|---|---|
| **Baleine Phase 3** (Côte d'Ivoire) | 🔴 **Activité majeure** : 3 contrats EPC attribués en 10 jours — SLB OneSubsea (systèmes de production subsea, 13 puits, 13 juil.), TechnipFMC (flowlines/risers flexibles ~1200m, 6 juil.), Altera Infrastructure (accord fourniture FPSO, ~3 juil.) | 3-13 juil. 2026 | Mobilisation EPC en cours = **précurseur direct** d'un appel d'offres marine spread/AHTS. Aucun tender towage publié pour l'instant. |
| **Mozambique LNG / Afungi** | Pas de nouveau contrat marine support. Russie (Lavrov) a proposé un soutien sécuritaire pour Cabo Delgado (9 juil., visite Maputo). EOI TotalEnergies/ExxonMobil pour 7 navires (5 tugs + pilote + 2 workboats, 400 expéditions LNG/an) toujours ouvert (publié ~23-24 fév., antérieur à la fenêtre mais toujours pertinent) | 9 juil. (sécurité) | Le redémarrage complet reste conditionné à la sécurité ; l'EOI 7-navires est la porte d'entrée commerciale la plus concrète actuellement disponible. |
| **Coral Norte FLNG** | Aucun changement détecté dans la fenêtre. Contrat EPCIC Technip Energies/JGC/SHI du 8 juin est antérieur de 4 jours au dernier cycle. | 8 juin (hors fenêtre) | Statu quo — pas de signal tow/hook-up. |
| **Kaminho** (Angola) | Aucun changement détecté. ⚠️ **Correction dataset** : le contrat T&I Saipem ~1 Md$ (22 juin) concerne un **autre** projet angolais, « Greater PAJ » (blocs 31/31R, Azule Energy) — **pas Kaminho** (bloc 20/11, TotalEnergies/Sonangol/Petronas). Ne pas confondre dans le pipeline. | 22 juin (Greater PAJ, hors sujet) | Statu quo Kaminho — fenêtre AHTS 2026-27 toujours d'actualité mais sans nouveau signal. |
| **GTA Phase 2** | Aucun changement. Le concept GBS 2,5-3 mtpa référencé date en réalité de fév. 2023 (pas de décision structurelle 2026 confirmée). | - | Statu quo. |
| **Venus** (Namibie) | Aucun changement. FID toujours visé « fin 2026 » selon le commissaire pétrolier namibien. Appel d'offres FPSO (SBM Offshore parmi les candidats) toujours en cours, dernier point concret antérieur à la fenêtre. | - | Statu quo — mais voir §3/§4 : le navire pressenti pour le staging (Nomasa) vient de quitter Durban. |
| **Bonga North / Ubeta / IMA** (Nigeria) | Pas de FID/contrat nouveau. Déclaration TotalEnergies (Matthieu Bouyer, NOG Energy Week Abuja) : Ubeta + IMA fourniront ~30 % de la capacité NLNG Train 7. IMA reste en FEED, FID « attendue en 2026 » non confirmée. | 10 juil. | Confirmation qualitative de l'importance du projet, sans accélération calendaire. |

**Bilan Sentinel** : Baleine Phase 3 est de loin le projet le plus actif du cycle (3 attributions EPC en 10 jours) — à surveiller en priorité pour un tender marine spread. Tout le reste est globalement stable ou antérieur à la fenêtre.

Sources : SLB (slb.com/newsroom, 13/07) · TechnipFMC (technipfmc.com, 06/07) · WorldOil (03/07, Altera/Eni FPSO) · Capmad (09/07, Lavrov Cabo Delgado) · ClubOfMozambique (EOI 7 navires) · Technip Energies (08/06, Coral Norte EPCIC) · Saipem (22/06, Greater PAJ — hors Kaminho) · IntelliNews (FID Venus fin 2026) · CED Magazine (10/07, Ubeta/IMA Train 7).

---

## 2. 🔮 PROPHET - Prédictions & fenêtres météo

Données Open-Meteo Marine (`metocean.json`, fetch 10h48) — seuil de blocage 2,5 m de houle max, 5 prochains jours (18-22 juillet) :

| Zone | Houle max (18-22 juil.) | Fenêtre |
|---|---|---|
| Baleine P3 (Côte d'Ivoire) | 1,28-1,50 m | 🟢 5/5 jours favorables |
| Afungi / Mozambique LNG | 0,36-0,78 m | 🟢 5/5 jours favorables (mer très calme) |
| Kaminho / Angola | 0,94-1,74 m | 🟢 5/5 jours favorables |
| Venus / Namibie | 1,46-1,84 m | 🟢 5/5 jours favorables |
| GTA (Sénégal/Mauritanie) | 1,00-1,32 m | 🟢 5/5 jours favorables |
| Bonga / Nigeria | 1,38-1,82 m | 🟢 5/5 jours favorables |

**Aucune contrainte météo cette semaine sur les 6 zones** — fenêtre ouverte pour toute mobilisation planifiée (pertinent pour Leo si sa destination se confirme, et pour tout pré-positionnement Baleine P3 vu l'accélération EPC).

Qualitatif (reconduit du cycle précédent, sans signal contraire) : Cabo Delgado/Rovuma demande tugs ×3 d'ici mi-2027 ; Abidjan devient hub d'installation 2027-28 (renforcé par les attributions EPC de juillet) ; Luanda/Ambriz saturation AHTS attendue S2 2026 ; Walvis Bay explosion différée post-FID Venus (T4 2026, cf. Nomasa §3-4 pour un bémol).

---

## 3. 🛰️ AIS AUTO-TRACKING - Carte FABLE

**Vérification VesselFinder + recoupement (myshiptracking, shipinfo.net, MarineTraffic) des 7 navires prioritaires — 18 juillet.**

| Navire | Signal | Lecture |
|---|---|---|
| **Leo** (IMO 9652143) | AIS -24h. A quitté le mouillage de **Maputo le 10 juillet** (donc y est resté ~1 mois depuis Cape Town), actuellement en zone « East Africa », 5,7 kn. Destination toujours non renseignée. | 🔴 **Trajectoire cohérente avec Afungi** (Cape Town→Maputo→plus au nord), mais **aucune fixture confirmée**. Aucune actualité contrat AES Monaco/All Energies trouvée. **Statut inchangé : à vérifier d'urgence.** |
| **Nomasa** (IMO 9366316) | A quitté **Durban le 11 juillet**, en route vers **Pemba, Mozambique**, ETA **18 juillet (aujourd'hui)**, 8,2 kn. | 🔴 **Changement majeur** : le navire jugé « parfaitement placé pour Venus » quitte l'Afrique du Sud et se dirige droit vers la zone Afungi/Cabo Delgado. Soit un concurrent l'a mobilisé pour Mozambique LNG, soit c'est une opportunité à qualifier immédiatement. **Le pool de staging Venus perd son meilleur candidat.** |
| **Santangelo** (IMO 9343948) | ⚠️ **Conflit d'identité AIS non résolu, pire qu'estimé.** Le MMSI de référence (247185800, pavillon Italie) est **silencieux depuis le 14 janvier 2026** (6 mois). Un second identifiant sous le même IMO (MMSI 249549000, « Santangelo Uno », pavillon Malte) est actif : Dakar→Gibraltar, ETA 19 juil. — **pas** Kamsar→GAC comme rapporté précédemment. | 🔴 **Alerte qualité dataset** : soit le navire a été re-flagué/rebaptisé, soit deux navires distincts partagent un IMO mal enregistré. La destination Guinée (GAC) précédemment annoncée n'est **pas confirmée** par l'AIS actif. À faire vérifier par l'armateur Cafimar. |
| **Topaz Dignity** (IMO 9654983) | Le MMSI le plus cohérent chez les trackers (538011726, pavillon Îles Marshall) place le navire **à l'ancre en mer de Marmara (Turquie), destination Istanbul**, AIS quasi temps réel. Le MMSI de référence (423378100) reste injoignable en direct (accès bloqués/cache périmé) mais des recoupements indirects penchent aussi vers la zone Caspienne/Turquie. | 🔴 **Conflit confirmé, affiné** : la position réelle est très probablement Marmara/Turquie (pas Caspienne au sens strict, mais dans la même zone hors Afrique). **Côte d'Ivoire est infirmé par toutes les sources consultées** — dataset CSO à corriger. |
| **Red Fox** (IMO 9319193) | 🟢 **AIS a repris** : dernier signal il y a **36 h** (contre 73+ jours de silence). Zone Afrique de l'Ouest, dernier port Punta Europa (Guinée Éq.), 10 juillet. | 🟢 Le navire est de nouveau traçable — sa disponibilité juil.-26 redevient crédible. Destination affichée « Malabo, ETA 7 octobre » manifestement erronée/obsolète, à ignorer. |
| **Monty J** (IMO 9423877) | Toujours silencieux : dernier AIS il y a **64 jours**, zone Afrique de l'Ouest (dernière position connue uniquement). | 🟠 Aucune amélioration — statut réel toujours inconnu. |
| **Lydia D** (IMO 9582764) | Confirmé **à quai, Dakar**, arrivé le 16 juillet 21h21 UTC, AIS live (~3 min). | 🟢 Inchangé — disponibilité Sep-26 reconfirmée. |

### À renseigner (aucune donnée inventée)
Inchangé du cycle précédent : IMO/MMSI manquants pour Jascon 66, Lagertha, Delta Sky, Ned Stark, Akali Akbal, Santa Luisa, Santa Rita, Britoil Conqueror. Identité Rachel J (IMO 7411105) incertaine. Lien Leo↔AES Monaco toujours à confirmer contractuellement.

*(`vessels.json` mis à jour pour ces 7 navires avec les nouvelles positions/notes vérifiées ci-dessus ; le reste de la flotte — 92 navires — n'a pas été revérifié ce cycle.)*

---

## 4. 🚢 FLEET INTELLIGENCE - Analyse comportementale

1. **Nomasa quitte Durban pour Pemba (Mozambique)** : c'est le signal comportemental le plus fort du cycle. Un navire jusqu'ici « en attente, parfaitement placé pour Venus » se mobilise vers la zone Afungi/Cabo Delgado — soit un concurrent l'a fixé pour Mozambique LNG, soit c'est une piste commerciale immédiate côté armateur Amsol. **Action : contacter Amsol pour connaître le statut contractuel du Nomasa avant qu'il ne soit trop tard pour l'un ou l'autre dossier.**
2. **Intégrité du dataset CSO sérieusement dégradée sur 2 navires** : Santangelo (MMSI de référence mort depuis 6 mois, destination Guinée non confirmée) et Topaz Dignity (position réelle probablement Marmara/Turquie, pas Côte d'Ivoire). **Le cluster ivoirien annoncé par le dataset perd un deuxième pilier** — après Topaz Dignity au cycle précédent, c'est maintenant Santangelo dont la fiabilité est mise en doute (même si Santangelo était déclaré Sénégal, pas Côte d'Ivoire — la vigilance doit s'étendre à toute la base CSO).
3. **Red Fox redevient traçable** après 73+ jours de silence AIS — sa disponibilité déclarée (juil.-26) redevient un signal exploitable plutôt qu'un risque pur.
4. **Leo confirme sa trajectoire nord** (Cape Town → Maputo → au-delà) sans qu'aucun contrat ne soit encore visible publiquement — la fenêtre pour le fixer à 8 000 $/j reste ouverte mais se réduit à mesure qu'il progresse vers Afungi.
5. **Monty J reste une inconnue totale** — 64 jours de silence AIS, aucune indication de statut réel.

---

## 5. 🧠 TENDER WHISPERER - Prédictions d'appels d'offres

> Probabilités = estimations modèle (signaux faibles), pas des données confirmées. Flux RSS Google News (`tenders.json`, 19 items scannés) : **aucun nouveau tender towage détecté explicitement** (`new_count: 0`) — les probabilités ci-dessous restent donc fondées sur les signaux Sentinel qualitatifs.

| Tender prédit | Donneur d'ordre | Probabilité | Fenêtre estimée | Signal déclencheur |
|---|---|---|---|---|
| Marine spread installation Baleine P3 | Eni / EPC subsea (SLB, TechnipFMC) | **~85 % sous 90 jours** ↑ | oct.-déc. 2026 | 3 contrats EPC attribués en 10 jours (13, 6, 3 juil.) = mobilisation active, tender marine généralement 2-4 mois après attribution subsea |
| Marine logistics long terme Afungi (EOI 7 navires) | TotalEnergies/ExxonMobil JV | **~70 % sous 90 jours** ↓ | été-automne 2026 | EOI toujours ouvert mais aucune attribution en 5 mois ; sécurité Cabo Delgado toujours instable (attaques fin juin) |
| AHTS support Kaminho 2027 | Saipem / TotalEnergies AGO | **~65 % sous 120 jours** | T4 2026 | Inchangé — pas de nouveau signal ce cycle |
| Tow & hook-up Coral Norte | Eni / MRV | **~55 % à 6-9 mois** | T1 2027 | Inchangé — EPCIC attribué en juin, sail-away 12-18 mois après |
| Harbour/terminal towage Walvis Bay | TotalEnergies / port NA | **~35 % à 9-12 mois** ↓ | post-FID Venus | Nomasa (navire pressenti) a quitté la zone — réduit la lecture de préparation locale |

---

## 6. 🕵️ COMPETITOR WATCHDOG

- **P&O Maritime (DP World)** : aucun nouveau signal Afrique. Continuité : towage/port Maputo, tie-up logistique offshore Nigeria (FlexDELIVERY/IOMS), déploiement IoT flotte tugs (Mozambique en premier, programme lancé déc. 2025).
- **Smit Lamnalco (Boskalis)** : aucun nouveau signal Afrique. Contrat marine services Coral FLNG Mozambique (~200 M$, 10 ans) inchangé. 4 nouveaux tugs FiFi commandés (chantier Uzmar/Berg Propulsion) mais destinés à la **Guyane française**, pas à l'Afrique — capacité mobilisée ailleurs.
- **MINDUS PRIME** : **non identifié** dans la recherche — aucun opérateur de remorquage/offshore sous ce nom exact trouvé (le plus proche, « Mindus Marine », est un ship-chandler, pas un armateur towage). À vérifier : orthographe exacte ou société mère réelle. Traité comme « aucun signal » ce cycle, grille de prix conservée par prudence (11 000 €/j).
- **AES Monaco** (opérateur du Leo) : toujours **8 000 $/j** — le prix plancher du panel, position d'arbitrage inchangée (~4 k€/j de marge potentielle sur repositionnement Afungi/zone Est-Afrique).

---

## 7. 🚨 BLACK SWAN DETECTOR

| Risque | Niveau | Impact towage | Action |
|---|---|---|---|
| **US-Iran / Détroit d'Hormuz — escalade majeure** | 🔴 **Critique** (aggravation depuis cycle préc.) | Cessez-le-feu rompu, frappes US ~13-15 juil., blocus naval, transits Hormuz -50%+ semaine/semaine. Brent ~85,9 $/bbl (+19 % depuis fév.), WTI ~79,6 $/bbl | **Indexer BAF immédiatement sur tout devis en cours** ; anticiper des surcoûts soutes significatifs et des délais de mobilisation Est-Afrique via Le Cap |
| **Cabo Delgado — toujours actif** | 🟠 Élevé (inchangé, précisé) | Attaque Namabo fin juin (5 soldats rwandais tués selon EI-Mozambique), embuscade convoi N380. Restart complet Afungi désormais évalué **~2030** par sources sécurité (vs 2029 dans le rapport précédent) | Clause force majeure + démobilisation payée maintenue dans toute offre Afungi ; ne pas sur-vendre l'urgence du calendrier |
| **Piraterie Golfe de Guinée — désescalade** | 🟢 Faible ↓ | Seulement 2 incidents S1 2026 (IMB), Nigeria 4 ans sans incident en eaux territoriales, task-force navale ECOWAS activée mai 2026. **Nouveau point de vigilance : résurgence piraterie Somalie** (alerte IMB ~10 juil.) | Réduire la prime sécurité Golfe de Guinée dans les devis ; surveiller la Somalie/Afrique de l'Est si expansion vers nos zones AHTS |
| **EUR/USD** | 🟡 Modéré | Spot ~1,1435 (18/07) vs ~1,1568 au cycle précédent (-1,1 %) — dollar légèrement plus ferme, cohérent avec la tension pétrolière Hormuz | Coter en USD sur les contrats internationaux ; le Leo (8 000 $/j) vaut désormais **6 996 €/j** au lieu de 6 915 €/j |
| **Saison cyclonique canal du Mozambique** | 🟡 Hors saison | Saison 2025/26 close (au-dessus de la moyenne : 10-14 tempêtes nommées, Cyclone Gezani en fév.). Prochaine prévision saisonnière attendue août-sept. 2026 | Aucune action immédiate — revoir la planification hook-up Coral Norte quand la prévision 2026/27 sortira |

---

## 8. 📡 TOWAGE OPPORTUNITY SCANNER

| ID | Opportunité | Navire(s) | Fenêtre | Statut |
|---|---|---|---|---|
| OPP-001 | Afungi marine support | **Leo** (parti de Maputo 10 juil., destination toujours non confirmée) | Immédiate | 🔴 Course contre la montre, inchangé |
| OPP-002 | Kaminho installation | Topaz Master 87t + Akali Akbal 66t (Angola) | S2 2026-2027 | 🔴 Ouverte, inchangé |
| OPP-003 | Baleine P3 subsea/hook-up | Mobiliser 2-3 AHTS vers Abidjan | 2027-28 | 🟠 **Pré-AO renforcé** — 3 contrats EPC attribués en juillet, tender marine à anticiper dès T4 2026 |
| OPP-004 | Bonga North support | Delta Sky, Jascon 66, Ned Stark, Monty J (Nigeria) | 2026-27 | 🟠 Active, confirmée par déclaration TotalEnergies (Ubeta/IMA = 30% Train 7) |
| OPP-005 | GTA1 ops / cluster Dakar | Ringhio, Lydia D (JIFMAR, confirmée à quai), Santa Rita | Continue | 🟠 Active |
| OPP-006 | Coral Norte hook-up | Leo (si libre) + 2 AHTS à mobiliser | S2 2027 | 🟡 Préparation |
| OPP-007 | Venus staging | ~~Nomasa~~ **navire à réidentifier** | post-T4 2026 | 🔴 **Dégradée** — Nomasa a quitté Durban pour Pemba (Mozambique) le 11 juillet |
| OPP-008 *(nouveau)* | Support mobilisation Nomasa → Pemba | Nomasa (à qualifier : contrat concurrent ou disponible ?) | Immédiate | 🟡 **À qualifier d'urgence** — contacter Amsol |

---

## 9. 📈 ORACLE - Scoring

| Rang | Opportunité | Score /100 | Δ vs cycle préc. |
|---|---|---|---|
| 1 | Afungi marine support | **93** | −2 (restart évalué ~2030 par sources sécurité ; fixture Leo toujours non confirmée) |
| 2 | Kaminho installation | **89** | = (aucun nouveau signal) |
| 3 | **Baleine P3** | **88** | **+4** (3 contrats EPC attribués en 10 jours = momentum fort) |
| 4 | Coral Norte tow/hook-up | **78** | = |
| 5 | Bonga North/Ubeta/IMA | **74** | +2 (réaffirmation TotalEnergies Train 7) |
| 6 | GTA1/GTA2 | **70** | = |
| 7 | **Venus staging** | **60** | **−6** (Nomasa, navire pressenti, a quitté Durban) |
| 8 | Agogo/Ndungu | **58** | = (aucun signal recherché ce cycle) |

Seule **Afungi (93)** dépasse le seuil de 90 → déclenchement CLOSER (§11).

---

## 10. 📊 BUILDER - Pipeline

| Stage | Lead | Valeur est. | Action | Échéance |
|---|---|---|---|---|
| **Négociation urgente** | Afungi (Leo @ 8 k$/j AES Monaco) | ~4,0 M€/an, marge ~1,5 M€ | Confirmer destination/statut Leo — parti de Maputo, cap encore incertain | **23 juil.** (révisée) |
| **Qualification urgente** *(nouveau)* | Repositionnement Nomasa | À déterminer | Contacter Amsol : Nomasa fixé ou disponible pour Pemba ? | **25 juil.** |
| Proposition | Kaminho (2 AHTS Angola) | ~5,4 M€ | Contact Saipem/TTE Angola | 15 août (révisée) |
| **Qualification renforcée** | Baleine P3 | ~8,5 M€ ↑ | Pré-qual Eni/EPC (SLB, TechnipFMC, Altera) + plan mobilisation Abidjan — momentum EPC confirmé | **31 août** |
| Qualification | Bonga North/Ubeta/IMA | ~3,6 M€ | Qualifier besoin Shell/TotalEnergies (30% Train 7 confirmé) | 15 sept. |
| Prospection | GTA1/Dakar cluster | ~2-4 M€ | Sonder BP/Kosmos ; Lydia D confirmée disponible Sep-26 | sept. |
| Préparation | Coral Norte | ~4,4 M€ | Dossier Eni/MRV | T4 2026 |
| **Veille dégradée** | Venus (staging) | - | Identifier un navire de remplacement (Nomasa parti) | continu |

**Pipeline : ≈ 28 M€ brut / ≈ 15,5 M€ pondéré** (Baleine P3 relevé sur momentum EPC ; Venus dégradé faute de navire de staging identifié).

---

## 11. ✉️ CLOSER - Action immédiate cycle #2

**Priorité maintenue : sécuriser le Leo, dont la trajectoire (Maputo → nord) renforce l'hypothèse Afungi sans la confirmer.**

Email armateur/opérateur (AES Monaco / All Energies — contact à compléter du CRM) :
> Objet : Leo (IMO 9652143) — suivi de position et demande de fixture ferme
>
> Madame, Monsieur,
> Nous suivons le Leo, qui a quitté le mouillage de Maputo le 10 juillet en direction du nord (dernier signal AIS : zone Afrique de l'Est, 5,7 nœuds). Nous souhaitons discuter d'un affrètement time-charter de 12 mois (+ options) à compter de sa disponibilité, base 8 000 $/jour conformément à vos conditions de marché. Pouvez-vous confirmer sa destination actuelle et son statut d'engagement ? Une réponse sous 48 h nous permettrait de sécuriser une position avant tout engagement concurrent.
> Dans l'attente de votre retour. — Boluda Towage

`mailto:?subject=Leo%20(IMO%209652143)%20%E2%80%94%20suivi%20de%20position%20et%20demande%20de%20fixture%20ferme&body=Madame%2C%20Monsieur%2C%0A%0ANous%20suivons%20le%20Leo%2C%20qui%20a%20quitt%C3%A9%20le%20mouillage%20de%20Maputo%20le%2010%20juillet%20en%20direction%20du%20nord%20(dernier%20signal%20AIS%20%3A%20zone%20Afrique%20de%20l%27Est%2C%205%2C7%20noeuds).%20Nous%20souhaitons%20discuter%20d%27un%20affr%C3%A8tement%20time-charter%20de%2012%20mois%20(%2B%20options)%20%C3%A0%208%20000%20%24%2Fjour.%20Pouvez-vous%20confirmer%20sa%20destination%20actuelle%20et%20son%20statut%20d%27engagement%20%3F%0A%0A%E2%80%94%20Boluda%20Towage`

**Second dossier recommandé (hors seuil Oracle mais urgent en Fleet Intelligence)** : contact armateur Amsol au sujet du Nomasa (départ Durban → Pemba, 11 juillet) — à qualifier avant rédaction d'un email formel, le statut contractuel n'étant pas connu.

Les dossiers Kaminho / Baleine P3 / Bonga North complets : voir cycle précédent §11 pour trame, à réactualiser une fois les contacts décideurs enrichis (PROSPECT-ENRICHER inactif — `APOLLO_API_KEY` non configurée, `prospects.json` absent).

---

## 12. 💰 PRICING ENGINE - Grille intégrée à la carte

Taux du jour (`fx-rate.json`, BCE via Frankfurter, 18/07) : **1 EUR = 1,1435 USD** (0,8745 EUR/USD).

| Armateur | Prix | Note |
|---|---|---|
| MINDUS PRIME | 11 000 €/j | Premium flat — inchangé (opérateur non retrouvé en veille, prudence sur la donnée) |
| P&O Maritime (Red Fox + 70-80 TBP AGO/NGA) | 10 000 €/j | Grille volume — inchangé. Red Fox de nouveau traçable AIS (36 h) |
| Smit Lamnalco | 11 000 €/j | SL Kiwi surcoté segment 38t — inchangé |
| **AES Monaco - Leo** | **8 000 $/j ≈ 6 996 €/j** (EUR/USD 1,1435 du 18/07) | Prix plancher du panel — marge d'arbitrage ~4 k€/j inchangée en logique, montant légèrement révisé (+81 €/j vs cycle préc.) |
| Sans armateur confirmé | Référence zone 10-11 k€/j | BP >85t → 11 k€/j |

---

## 13. 🎯 SYNTHÈSE EXÉCUTIVE

1. **Baleine Phase 3 s'accélère fort** : 3 contrats EPC attribués en 10 jours (SLB, TechnipFMC, Altera) — c'est le signal le plus net du cycle. Un tender marine spread est probable sous 90 jours (~85 %). **Lancer la pré-qualification Eni maintenant.**
2. **Leo a quitté Maputo le 10 juillet**, confirmant une trajectoire nord cohérente avec Afungi, mais **toujours aucune fixture confirmée**. Contact AES Monaco reste l'action n°1, échéance resserrée à 5 jours.
3. **Signal comportemental fort et inattendu : le Nomasa a quitté Durban pour Pemba (Mozambique)** le 11 juillet — le navire jugé le mieux placé pour Venus/Namibie se dirige vers la zone Afungi. À qualifier d'urgence auprès d'Amsol : opportunité ou perte concurrentielle ?
4. **Qualité du dataset CSO dégradée sur 2 navires supplémentaires** : Santangelo (AIS de référence mort depuis 6 mois, destination Guinée non confirmée) et Topaz Dignity (position réelle probable Marmara/Turquie, pas Côte d'Ivoire ni Caspienne au sens strict). Le pool réellement disponible reste plus incertain que le dataset ne le suggère.
5. **Black Swan critique : l'escalade USA-Iran a fermé une bonne partie du trafic à Hormuz et fait bondir le Brent (+19 % depuis février)** — indexer le BAF sans délai sur toute offre en cours.
6. **Red Fox redevient traçable** après 73+ jours de silence — sa disponibilité redevient un signal exploitable.
7. **Aucune contrainte météo** sur les 6 zones suivies pour les 5 prochains jours — fenêtre ouverte pour toute mobilisation planifiée.
8. **Cabo Delgado reste actif** (attaque fin juin) et le redémarrage complet d'Afungi est désormais évalué ~2030 par les sources sécurité — modeste glissement calendaire à intégrer sans dramatiser.

### Changements détectés depuis le cycle précédent (12 juin → 18 juillet)
- Baleine P3 : 3 contrats EPC attribués (SLB, TechnipFMC, Altera) → score Oracle +4
- Afungi : restart désormais estimé ~2030 (vs 2029) ; Leo a quitté Maputo le 10/07 sans fixture confirmée → score Oracle −2
- Venus : Nomasa a quitté Durban pour Pemba (Mozambique) le 11/07, perd son statut de navire de staging idéal → score Oracle −6
- Santangelo : AIS de référence mort depuis le 14/01/2026 ; identité active concurrente en route Dakar→Gibraltar → alerte dataset
- Topaz Dignity : position affinée vers Marmara/Turquie (pas Caspienne au sens strict, toujours pas Côte d'Ivoire) → alerte dataset maintenue
- Red Fox : AIS a repris après 73+ jours de silence (dernier signal 36h)
- Bonga North/Ubeta/IMA : réaffirmation TotalEnergies (30 % Train 7 NLNG) → score Oracle +2
- Piraterie Golfe de Guinée : désescalade confirmée (2 incidents S1 2026) ; nouveau point de vigilance Somalie
- USA-Iran/Hormuz : escalade critique nouvelle (frappes, blocus, Brent +19 %) → risque Black Swan relevé de Élevé à Critique
- EUR/USD : 1,1568 → 1,1435 (dollar légèrement plus ferme)

*Prochain cycle automatique : dans 2 jours à 10h.*
