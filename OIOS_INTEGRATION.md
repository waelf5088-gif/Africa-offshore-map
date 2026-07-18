# 🔮 Intégration OIOS dans Africa Offshore Map (Vite + React + Maplibre-GL)

Nous avons migré et amélioré le système **OIOS (Offshore Intelligence Operating System)** dans cette application React moderne.

## 🚀 Fonctionnalités Intégrées

1. **Onglet OIOS Swarm Intel** : 
   * Ajout d'un sélecteur de vue en haut du volet latéral pour basculer facilement entre le **Cockpit Commercial BD** classique et la vue d'intelligence prédictive **OIOS Swarm Intel**.
2. **Base de Données Élargie (86 navires)** :
   * La flotte de 86 navires de soutien (AHTS, Tugs, PSVs, MPSVs, Multicats) est intégrée dans le fichier `src/data/vessels.json`.
   * Un panneau d'inventaire pliable avec filtres par catégorie est disponible dans la vue OIOS.
3. **Actifs Offshore Stratégiques (21 actifs)** :
   * Les **6 rigs de forage** (drillships/jackups) et **15 navires/plateformes de production de pétrole (FPSO/FLNG)** sont intégrés et s'affichent sous forme de marqueurs géométriques sur la carte Maplibre GL :
     * **Triangles (▲) violets** pour les Rigs.
     * **Rectangles (▰) orange** pour les FPSO.
4. **Tracés de Mouvements Prédictifs (Lignes Orange)** :
   * La carte dessine des tracés pointillés orange reliant les rigs/FPSO à leurs destinations futures projetées (SPS shipyards, swaps de blocs, etc.).
   * Le clic sur une carte de prédiction dans le volet latéral met en surbrillance l'itinéraire avec une augmentation de l'épaisseur et du contraste de la ligne de transit.
5. **Calculs Hydrodynamiques & Code Blender** :
   * Dans la fiche d'opportunité, vous pouvez visualiser les tensions de câble de remorquage estimées (normal/tempête) et copier en un clic le script Python généré pour importer la scène de remorquage 3D dans Blender.

---

## 🛠️ Comment Exécuter le Projet

### Étape 1 : Compiler les Données d'Intelligence
Exécutez le script d'automatisation pour lancer l'agent d'intelligence, scraper les actualités et mettre à jour les prédictions :
```bash
./automation/oios/run_oios.bat
```
*(Cela va mettre à jour la base de données dans `src/data/oios_data.json`)*.

### Étape 2 : Lancer le Cockpit Web React
Dans un terminal ouvert dans ce dossier (`C:\Users\HP\Documents\africa-offshore-map`) :
```bash
# Installer les dépendances Node.js
npm install

# Lancer le serveur de développement local
npm run dev
```
Ouvrez le lien local (ex: `http://localhost:5173/`) dans votre navigateur !
