# 🤝 Guide de contribution

Bienvenue ! Ce guide explique comment installer le projet et y contribuer
**sans jamais modifier directement la version de référence (`main`)**.

---

## 1. Installer le projet

### Prérequis
- [Node.js LTS](https://nodejs.org) (≥ 18)
- [Git](https://git-scm.com)
- *(optionnel, pour le pipeline d'automatisation)* Python 3.10+

### Cloner et lancer l'application web

```bash
git clone https://github.com/waelf5088-gif/Africa-offshore-map.git
cd Africa-offshore-map
npm install
npm run dev          # ouvre http://localhost:5173
```

> ✅ **L'application web ne nécessite aucune clé ni aucun secret.** Toutes les
> données sont dans `src/data/`. Tu peux développer immédiatement.

### (Optionnel) Pipeline d'automatisation Python
Seulement si tu travailles sur le dossier `automation/` :

```bash
# Windows
Copy-Item .env.example .env      # puis renseigne tes propres clés
pip install -r requirements.txt
```

---

## 2. La règle d'or : ne jamais travailler sur `main`

`main` est la version de référence. **On n'y pousse jamais directement.**
Chaque amélioration se fait sur sa propre branche, puis est proposée via une
**Pull Request (PR)** que le mainteneur du dépôt relit et fusionne.

```bash
# 1. Toujours partir d'un main à jour
git checkout main
git pull origin main

# 2. Créer une branche dédiée à ta modification
git checkout -b feature/ma-nouvelle-fonction

# 3. Coder, puis committer
git add -A
git commit -m "feat: description courte de la modif"

# 4. Publier TA branche (pas main)
git push -u origin feature/ma-nouvelle-fonction
```

Ensuite, sur GitHub : un bandeau **« Compare & pull request »** apparaît →
clique dessus, décris ta modification, et crée la PR. Le mainteneur reçoit une
notification, relit, commente si besoin, puis fusionne. **Tant que la PR n'est
pas fusionnée, `main` — la version de référence — ne bouge pas.**

---

## 3. Garder ta branche à jour

Si `main` a évolué pendant que tu travaillais :

```bash
git checkout main
git pull origin main
git checkout feature/ma-nouvelle-fonction
git merge main          # (ou : git rebase main)
```

---

## 4. Convention de nommage des branches

| Préfixe      | Usage                              |
|--------------|------------------------------------|
| `feature/`   | nouvelle fonctionnalité            |
| `fix/`       | correction de bug                  |
| `data/`      | mise à jour de données `src/data/` |
| `docs/`      | documentation                      |

---

## 5. Convention de commits (recommandée)

`type: description` — ex. `feat: ajout du filtre par pays`,
`fix: correction du zoom carte`, `data: MAJ positions flotte`.

Types courants : `feat`, `fix`, `docs`, `refactor`, `data`, `chore`.
