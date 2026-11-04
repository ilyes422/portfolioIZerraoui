# Portfolio — Ilyes Zerraoui

Portfolio personnel autour du développement, du football et de la technologie.
L'interface cible reprend une ambiance de stade nocturne : bleu nuit, vert menthe,
typographie lisible et interactions accessibles.

## État du projet

**Phase 1 : fondations.** Le dépôt contient une page d'accueil initiale rendue en
HTML, un backend FastAPI, son endpoint de santé, une configuration CORS explicite,
des tests et une procédure de vérification continue.

La vérification des types et le build de production réussissent. Le contrôle HTTP
confirme la page, ses styles, le fichier robots et le proxy vers FastAPI. Les
10 tests backend réussissent également. L'inspection visuelle reste à effectuer,
l'outil navigateur étant indisponible lors de cette phase. Voir le
[relevé de vérification](docs/verification-phase-1.md).

Les pages détaillées, le jeu, les résultats sportifs et le RAG seront construits
dans les phases suivantes. Aucun fournisseur externe n'est nécessaire à cette
phase. Les pages restent en `noindex` jusqu'à la préparation de la production.

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
.\.venv\Scripts\python.exe -m pytest apps/api
```

Avec les deux serveurs lancés, `pnpm verify:local` vérifie le trajet HTTP complet.

La commande de build n'appelle aucun service IA ou sportif. Le frontend relaie
`/api/*` au backend défini par `API_BASE_URL` ; cette variable reste côté serveur.

## Modifier les informations publiques

`content/profile.json` contient les coordonnées publiques approuvées : e-mail,
téléphone et ville. L'adresse postale complète ne doit pas être ajoutée au dépôt,
au PDF public ou aux documents indexés par le futur assistant.

Le CV d'origine n'est pas copié dans ce dépôt : sa version publique sera préparée
pendant la phase CV. Ne pas déposer un document privé dans un dossier `public/`.

## Documentation

- [Installation et concepts](docs/installation.md)
- [Architecture](docs/architecture.md)
- [Plan et critères de validation](docs/roadmap.md)
- [Préparation du déploiement](docs/deployment.md)
- [Référencement](docs/seo.md)
- [Vérification de la phase 1](docs/verification-phase-1.md)
