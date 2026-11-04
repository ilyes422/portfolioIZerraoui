# Préparation du déploiement

Le déploiement public complet est prévu en phase 8. La phase 1 ne crée pas de
projet Vercel et n'active aucun service externe. Les préversions restent en
`noindex` pendant la construction du contenu.

## Cible Vercel

Deux projets liés au dépôt `ilyes422/portfolioIZerraoui` :

| Projet | Répertoire racine | Framework |
| --- | --- | --- |
| Portfolio public | `apps/web` | Next.js |
| API | `apps/api` | FastAPI |

Le frontend importe `content/profile.json`, situé hors de son répertoire racine.
Lors de la configuration Vercel, autoriser l'inclusion des fichiers situés hors
de la racine pour le build du monorepo. Vérifier le build distant avant de
considérer cette configuration comme opérationnelle.

## Configuration à effectuer avant production

1. Vérifier l'URL réelle attribuée au frontend et au backend.
2. Définir `API_BASE_URL` sur le frontend avec l'origine HTTPS de l'API.
3. Définir `APP_ENV=production` et `CORS_ORIGINS` avec l'origine HTTPS exacte du
   portfolio sur le backend. Ne pas autoriser tous les domaines de préversion.
4. Vérifier les mécanismes de protection des déploiements et le passage du proxy.
5. Définir l'URL canonique réelle et activer l'indexation après la vérification SEO.
6. Tester `/api/health` à travers le domaine public, puis les fonctionnalités finales.

L'adresse visée est `ilyes-zerraoui-portfolio.vercel.app`, sous réserve de
disponibilité. Le nom de projet demandé est `ilyes.zerraoui-portfolio`.

## Gratuité et persistance

Vercel Hobby est destiné à un usage personnel non commercial et applique des
quotas. Les niveaux gratuits des fournisseurs ont leurs propres limites. Aucune
activation payante ne doit être effectuée sans accord explicite.

Le système de fichiers des fonctions n'est pas un stockage durable. Le futur
index vectoriel et les compteurs partagés seront hébergés dans des services
adaptés. L'indexation se fera par script contrôlé, jamais par un endpoint public
permettant aux visiteurs d'envoyer des documents.

Références :

- https://vercel.com/docs/plans/hobby
- https://vercel.com/docs/frameworks/backend/fastapi
- https://vercel.com/docs/monorepos
- https://upstash.com/pricing/vector
- https://upstash.com/pricing/redis
