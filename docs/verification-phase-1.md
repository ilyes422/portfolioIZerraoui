# Vérification de la phase 1 — 4 novembre 2026

## Résultats observés

| Contrôle | Résultat |
| --- | --- |
| Tests Python | 10 tests réussis : contrat de santé, CORS et configuration de production. |
| Endpoint direct | `GET http://127.0.0.1:8000/api/health` → HTTP 200 et JSON attendu. |
| Adresse postale | Aucune adresse de rue issue du CV dans les fichiers préparés. |
| Contrôle des espaces Git | `git diff --check` sans erreur. |
| Installation frontend | Réussie avec le lockfile figé ; les 80 entrées passent les contrôles de dépendances. |
| Types Next.js / TypeScript | `pnpm typecheck` réussi. |
| Build Next.js | `pnpm build` réussi ; accueil et robots pré-rendus statiquement. |
| Frontend → backend | `pnpm verify:local` réussi sur le serveur de production local : page HTML, styles, robots et proxy de santé. |
| Inspection navigateur | Outil indisponible : l'ouverture de l'aperçu expire. Vérification visuelle non effectuée. |
| Production Vercel | Non déployée ; prévue dans une phase ultérieure. |

Les tests Python émettent un avertissement de dépréciation de Starlette sur
l'utilisation de `httpx` avec son client de test. Les tests réussissent ; une
migration vers le nouveau client devra être évaluée avec la phase d'intégration.

## Décision sur les dépendances

Next.js 16.4.5 a été publié le 3 novembre 2026 et contient des correctifs de
sécurité absents de 16.4.4. Le contrôle `minimumReleaseAge` de pnpm refuse
l'installation pendant les premières 24 heures.

Le propriétaire a explicitement autorisé une exception pour les dix paquets
suivants, uniquement en 16.4.5. L'exception est appliquée dans le fichier de
configuration du workspace ; le délai reste de 24 heures pour les autres
versions et paquets. Les contrôles d'intégrité et de politique de pnpm passent.

- `next`
- `@next/env`
- `@next/swc-darwin-arm64`
- `@next/swc-darwin-x64`
- `@next/swc-linux-arm64-gnu`
- `@next/swc-linux-arm64-musl`
- `@next/swc-linux-x64-gnu`
- `@next/swc-linux-x64-musl`
- `@next/swc-win32-arm64-msvc`
- `@next/swc-win32-x64-msvc`

Source officielle vérifiée :
https://github.com/vercel/next.js/releases/tag/v16.4.5

## Portée de la validation

Le socle technique de la phase 1 est vérifié localement. La page d'accueil est
initiale ; la reproduction détaillée de la maquette et les essais visuels sur
ordinateur, tablette et mobile appartiennent à la phase 2. L'indisponibilité de
l'outil navigateur limite cette vérification au code, aux types, à la compilation
et aux réponses HTTP. Aucun résultat de test visuel n'est affirmé.
