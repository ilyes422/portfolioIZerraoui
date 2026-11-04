# Vérification de la phase 1 — 4 novembre 2026

## Résultats observés

| Contrôle | Résultat |
| --- | --- |
| Tests Python | 10 tests réussis : contrat de santé, CORS et configuration de production. |
| Endpoint direct | `GET http://127.0.0.1:8000/api/health` → HTTP 200 et JSON attendu. |
| Adresse postale | Aucune adresse de rue issue du CV dans les fichiers préparés. |
| Contrôle des espaces Git | `git diff --check` sans erreur. |
| Installation frontend | Bloquée par le délai de publication pnpm de 24 heures. |
| Types / build Next.js | Non vérifiés ; aucune réussite affirmée. |
| Frontend → backend | Non vérifié, car le serveur frontend n'a pas été lancé. |
| Inspection navigateur | Outil indisponible : inventaire interrompu par une erreur de transport. |
| Production Vercel | Non déployée ; prévue dans une phase ultérieure. |

Les tests Python émettent un avertissement de dépréciation de Starlette sur
l'utilisation de `httpx` avec son client de test. Les tests réussissent ; une
migration vers le nouveau client devra être évaluée avec la phase d'intégration.

## Dépendance bloquée

Next.js 16.4.5 a été publié le 3 novembre 2026 et contient des correctifs de
sécurité absents de 16.4.4. Le contrôle `minimumReleaseAge` de pnpm refuse
l'installation pendant les premières 24 heures.

Une proposition d'exception limitée à Next.js 16.4.5 et aux paquets `@next`
correspondants a été refusée par l'examen automatique, car elle assouplirait le
contrôle d'âge sans autorisation spécifique. **Cette exception n'est pas
appliquée.** Le dépôt conserve le délai de 24 heures.

Décision à prendre : attendre que la version atteigne cet âge, ou autoriser
explicitement l'exception pour les dix paquets suivants, uniquement en 16.4.5 :

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

Après déblocage : relancer l'installation, les types, le build puis la vérification
HTTP du frontend et du proxy. La phase 1 n'est pas considérée comme entièrement
validée avant ces contrôles.
