# Roadmap sprints

Micro app pour construire une roadmap agile sprint par sprint : équipe et TJM, fonctionnalités, KPI analytics et communication, coût par sprint, chef de projet en pourcentage, coût total et ROI. L'onglet **Rendu** produit la planche de présentation, imprimable en PDF (A3 paysage).

## Lancer

```bash
npm install
npm run dev
```

## Construire pour la mise en ligne

```bash
npm run build
```

Le dossier `dist/` se déploie tel quel (Vercel, Netlify, o2switch, etc.).

## Structure

- `src/App.jsx` : projets, bascule Édition / Rendu, import et export JSON
- `src/components/Editor.jsx` : saisie (projet, équipe, sprints, finances)
- `src/components/Board.jsx` : rendu de la roadmap
- `src/lib/calc.js` : tous les calculs (coûts, cumul, chef de projet, ROI, point mort)
- `src/lib/presets.js` : métiers et TJM de départ, modifiables
- `src/lib/storage.js` : sauvegarde dans le navigateur (localStorage)

## Passer sur Supabase

Toute la persistance passe par `loadAll()` et `saveAll()` dans `src/lib/storage.js`. Pour enregistrer les projets dans Supabase, il suffit de réécrire ces deux fonctions (par exemple une table `roadmaps` avec une colonne `data jsonb` par projet), sans toucher au reste de l'app.
