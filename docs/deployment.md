# Préparation du déploiement

Les préversions restent en `noindex`. Le site peut être construit avec ses pages,
son CV public, son jeu et les réponses fondées sur les extraits locaux. Les scores
et les appels aux fournisseurs s’activent après configuration serveur.

## Cible Vercel

Deux projets construits à partir du dépôt `ilyes422/portfolioIZerraoui` :

| Projet | Répertoire racine | Framework |
| --- | --- | --- |
| Portfolio public | `apps/web` | Next.js |
| API | `apps/api` | FastAPI |

La production utilise l’équipe `IZerraoui` sur l’offre Hobby. Le projet
`ilyes.zerraoui-portfolio` répond sur `https://ilyes-zerraoui-portfolio.vercel.app`
et le projet `ilyes-zerraoui-portfolio-api` sur
`https://ilyes-zerraoui-portfolio-api.vercel.app`. Le frontend utilise Node.js 24.

Le premier déploiement a été réalisé depuis les fichiers versionnés via l’API
Vercel. Pour activer les déploiements automatiques, installer l’intégration
GitHub pour `ilyes422/portfolioIZerraoui`, puis connecter le dépôt à chacun des
projets existants dans **Settings → Git**. Conserver les répertoires racine
ci-dessus et sélectionner `main` comme branche de production.

Le frontend importe `content/profile.json`, situé hors de son répertoire racine.
Lors de la configuration Vercel, autoriser l'inclusion des fichiers situés hors
de la racine pour le build du monorepo. Vérifier le build distant avant de
considérer cette configuration comme opérationnelle.

## Configuration à effectuer avant production

1. Vérifier l'URL réelle attribuée au frontend et au backend.
2. Définir `API_BASE_URL` sur le frontend avec l'origine HTTPS de l'API.
3. Définir `APP_ENV=production` et `CORS_ORIGINS` avec l’origine HTTPS exacte du
   portfolio sur le backend. `CORS_ORIGINS` attend un tableau JSON.
4. Vérifier les mécanismes de protection des déploiements et le passage du proxy.
5. Définir `SITE_URL` sur l’URL publique et `ALLOW_INDEXING=true` sur le frontend
   de production après vérification. Recompiler pour publier le sitemap.
6. Tester `/api/health` à travers le domaine public, puis les fonctionnalités finales.

L’API déclare `app.main:app` comme point d’entrée Vercel dans son `pyproject.toml`.

## Gratuité et persistance

Vercel Hobby est destiné à un usage personnel non commercial et applique des
quotas. Les niveaux gratuits des fournisseurs ont leurs propres limites. Aucune
activation payante ne doit être effectuée sans accord explicite.

Le corpus local est un fichier en lecture dans l’application. Upstash peut héberger
l’index vectoriel et les compteurs partagés. Le [guide des services](services.md)
donne les variables, les comptes à préparer et les vérifications à exécuter.

Références :

- https://vercel.com/docs/plans/hobby
- https://vercel.com/docs/frameworks/backend/fastapi
- https://vercel.com/docs/monorepos
- https://upstash.com/pricing/vector
- https://upstash.com/pricing/redis
