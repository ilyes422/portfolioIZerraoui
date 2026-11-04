# Architecture retenue

## Responsabilités

- `apps/web` : React, Next.js et TypeScript ; rendu du contenu public, navigation
  et interactions. CSS Modules et variables CSS pour l'identité visuelle.
- `apps/api` : Python et FastAPI ; validation, intégrations sportives et futur RAG.
- `content` : données publiques communes aux pages et à la future indexation.
- `docs` : installation, décisions, validation et exploitation.

La séparation permet de tester et de déployer les applications indépendamment.
Le proxy Next.js `/api/*` donne au navigateur un point d'entrée sur la même
origine. Les règles CORS du backend restent explicites ; elles ne remplacent
pas les futures limites de requêtes et la validation serveur.

## Phase 1 implémentée

La page initiale est un Server Component. Le profil public est importé à la
compilation et vérifié par TypeScript. Le backend expose `GET /api/health`, sans
service externe. Les deux applications démarrent sans clé API.

## Cible des phases suivantes

1. Sources publiques validées : CV nettoyé, JSON et fiches Markdown.
2. Extraction PDF/texte, découpage, identifiants stables et empreinte de contenu.
3. Embeddings et stockage dans Upstash Vector, avec source/page/section.
4. Recherche des passages pertinents, puis génération via un adaptateur de modèle.
5. Réponse avec références et identifiants d'actions autorisées.

Les passages retrouvés sont des données non fiables, jamais des instructions.
Une absence d'information doit produire une réponse explicite. Les actions et
leurs URL proviendront d'une liste applicative, validée côté serveur.

Upstash Redis est prévu pour le cache des résultats et la limitation partagée
des requêtes. Aucune base relationnelle n'est justifiée à ce stade. Le choix du
modèle d'embeddings et son inclusion dans le niveau gratuit doivent être
confirmés avant la phase RAG. Aucun compte ni service payant n'est provisionné
par cette première phase.

Le jeu reposera sur un catalogue local vérifié, avec sources et dates de contrôle.
Les résultats du jour viendront de football-data.org, avec cache et indication
du caractère différé de l'offre gratuite. Aucune simulation ne sera présentée
comme une donnée réelle.

## Documents et confidentialité

Le dépôt étant public, tout fichier suivi peut être lu, même hors de `public/`.
Seuls les contenus destinés à la publication peuvent y être ajoutés. Le profil
public contient e-mail, téléphone et ville, conformément au choix d'Ilyes.
L'adresse de rue du CV d'origine est exclue, y compris du futur index RAG.

## Références

- https://nextjs.org/docs/app/getting-started/metadata-and-og-images
- https://vercel.com/docs/frameworks/backend/fastapi
- https://vercel.com/marketplace/upstash
- https://upstash.com/docs/vector/features/embeddingmodels
- https://console.groq.com/docs/rate-limits
- https://www.football-data.org/pricing
- https://www.thesportsdb.com/documentation
