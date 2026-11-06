# Portfolio — Ilyes Zerraoui

Portfolio personnel autour du développement, du football et de la technologie.
L'interface cible reprend une ambiance de stade nocturne : bleu nuit, vert menthe,
typographie lisible et interactions accessibles.

## État du projet

Le portfolio propose un accueil inspiré d’un stade de nuit, un menu responsive,
les pages CV, parcours, projets et contact, une recherche et un jeu de devinettes.
Les questions posées depuis l’accueil ouvrent la conversation sur `/assistant`,
où l’assistant répond à partir des sources publiques. La génération Groq, la recherche
vectorielle Upstash et la couverture de football-data.org s’activent avec leurs
clés serveur. Sans clé football, les scores proviennent d’OpenLigaDB.
Le guide de déploiement décrit les modes disponibles et leur configuration.

## Démarrer sous Windows / PowerShell

Prérequis : **Node.js 24 LTS**, **pnpm 11.25.0**, **Python 3.12** et Git.
Les commandes ci-dessous partent de la racine du dépôt.

```powershell
pnpm install --frozen-lockfile
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r apps/api/requirements.lock.txt
.\.venv\Scripts\python.exe -m pip install --no-deps -e apps/api
Copy-Item apps/web/.env.example apps/web/.env.local
Copy-Item apps/api/.env.example apps/api/.env
```

Terminal 1 — backend :

```powershell
Set-Location apps/api
..\..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Terminal 2 — frontend, depuis la racine :

```powershell
pnpm dev:web
```

- Interface : <http://127.0.0.1:3000>
- Santé à travers le frontend : <http://127.0.0.1:3000/api/health>
- Santé du backend : <http://127.0.0.1:8000/api/health>
- Documentation API locale : <http://127.0.0.1:8000/docs>

## Vérifier

```powershell
pnpm typecheck
pnpm build
node --test scripts/test-game.mjs
.\.venv\Scripts\python.exe -m pytest apps/api
.\.venv\Scripts\python.exe scripts/index_knowledge.py --check
```

Avec les deux serveurs lancés, `pnpm verify:local` vérifie le trajet HTTP complet.

La commande de build n'appelle aucun service IA ou sportif. Le frontend relaie
`/api/*` au backend défini par `API_BASE_URL` ; cette variable reste côté serveur.

## Modifier les informations publiques

`apps/web/public/documents/cv-ilyes-zerraoui.pdf` est le PDF d’origine fourni
pour publication. Le remplacer directement pour mettre à jour le téléchargement.
Les pages et l’assistant utilisent les données structurées de `content/`.
Après une modification de ces données, actualiser le corpus avec
`python scripts/index_knowledge.py`.
Les projets et joueurs se trouvent dans `content/projects.json` et `content/players.json`.

## Documentation

- [Installation et concepts](docs/installation.md)
- [Architecture](docs/architecture.md)
- [Plan et critères de validation](docs/roadmap.md)
- [Préparation du déploiement](docs/deployment.md)
- [Référencement](docs/seo.md)
- [Vérification de la phase 1](docs/verification-phase-1.md)
- [Configuration des services](docs/services.md)
- [Vérification du portfolio](docs/verification-portfolio.md)
