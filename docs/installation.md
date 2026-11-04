# Installation et vérification

## Concepts

- **Monorepo** : un seul dépôt, deux applications dans `apps/`.
- **Workspace pnpm** : la racine lance les commandes de l'application JavaScript.
- **App Router / Server Components** : Next.js prépare le HTML de la page sur le
  serveur. La page initiale n'a pas besoin d'un composant client.
- **ASGI** : interface Python utilisée par FastAPI et servie localement par Uvicorn.
- **CORS** : autorise certains navigateurs à lire une réponse depuis une autre
  origine. Ce n'est pas une authentification ni une protection contre les robots.
- **Lockfile** : enregistre les versions résolues pour reproduire l'installation.

## Windows

Suivre les commandes du README avec Node 24, pnpm 11.25.0 et Python 3.12.
Si pnpm n'est pas installé, une installation classique de Node fournit npm :

```powershell
npm install --global pnpm@11.25.0
```

Il n'est pas nécessaire d'activer l'environnement Python avec un script
PowerShell : appeler directement `.venv\Scripts\python.exe` suffit.

Le store pnpm reste dans `.pnpm-store/`, ignoré par Git. Le mode `hoisted`
facilite l'installation sur les machines où les liens symboliques sont limités.

## Linux / macOS

Depuis la racine :

```bash
pnpm install --frozen-lockfile
python3.12 -m venv .venv
.venv/bin/python -m pip install -r apps/api/requirements.lock.txt
.venv/bin/python -m pip install --no-deps -e apps/api
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```

Terminal backend :

```bash
cd apps/api
../../.venv/bin/python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Terminal frontend, depuis la racine : `pnpm dev:web`.

## Variables d'environnement

| Variable | Application | Rôle |
| --- | --- | --- |
| `API_BASE_URL` | web | Origine du backend, utilisée par le proxy serveur Next.js. |
| `APP_ENV` | api | `development`, `test` ou `production`. |
| `CORS_ORIGINS` | api | Liste JSON d'origines exactes autorisées. |

FastAPI charge `apps/api/.env` indépendamment du répertoire courant. Next.js
charge `apps/web/.env.local`. Le `.env.example` à la racine sert d'orientation.

En production, `CORS_ORIGINS` doit utiliser les véritables origines HTTPS.
L'application refuse de démarrer en mode production avec les valeurs locales.
Les endpoints `/docs` et `/openapi.json` sont alors désactivés.

Aucun secret n'est nécessaire pour vérifier la phase 1. Quand des fournisseurs
seront intégrés, leurs clés resteront dans la configuration du backend, jamais
dans le dépôt ni dans une variable `NEXT_PUBLIC_*`.

## Contrôles

1. `pnpm typecheck` : génère les types de routes puis vérifie TypeScript.
2. `pnpm build` : produit une compilation de production.
3. `python -m pytest apps/api` dans l'environnement virtuel : vérifie le contrat
   de santé, les réponses CORS et la configuration de production.
4. Ouvrir `/api/health` sur le port 3000 avec l'API sur le port 8000 : vérifie
   aussi la liaison Next.js → FastAPI.

`/api/health` indique uniquement que le processus répond. Il ne prétend pas
vérifier une connexion IA, une base vectorielle ou une API sportive.

## Dépannage

- **502 / erreur sur `/api/health` via le frontend** : vérifier que le backend
  est lancé, puis comparer `API_BASE_URL` à son adresse. Redémarrer Next.js après
  une modification de sa configuration.
- **Port occupé** : arrêter l'ancien serveur ou choisir un autre port et adapter
  `API_BASE_URL` / `CORS_ORIGINS` en conséquence.
- **Erreur CORS** : vérifier le protocole, le nom d'hôte et le port exacts.
  `localhost` et `127.0.0.1` sont deux origines différentes.

## Mise à jour des dépendances

Mettre à jour volontairement les versions, régénérer les lockfiles, puis relancer
les contrôles. Ne pas éditer les fichiers de lock à la main. Le lock Python inclut
les outils de test ; le package local est installé séparément en mode éditable.
