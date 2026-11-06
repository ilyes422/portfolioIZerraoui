# Vérification du portfolio

Le socle de phase 1 a été conservé. Les pages, les composants de navigation et
les visuels de la phase 2 ont été complétés à partir du travail déjà présent.

| Contrôle | Résultat local |
| --- | --- |
| `pnpm typecheck` et `pnpm build` | Réussis. Accueil et pages de contenu pré-rendus, recherche à la demande. |
| `python -m pytest apps/api` | 17 tests réussis. Fenêtre de Paris, scores nuls, cache, réponse 429, recherche sourcée et plafond de génération. |
| `node --test scripts/test-game.mjs` | 2 tests réussis. Catalogue et barème. |
| `pnpm verify:local` | Pages, recherche, CV, styles, robot d’indexation et appels API traversent le serveur local. |
| CV public | Une page rendue et inspectée. Les coordonnées affichées se limitent à l’e-mail, au téléphone et à la ville. |
| Visuel en navigateur | Ouverture indisponible dans l’environnement. Vérification manuelle à effectuer. |

Le premier build Windows a rencontré une erreur de création de dossiers de
sortie Next.js. La préparation de ces dossiers générés dans `.next` a permis
le build local. Le code de l’application conserve le pré-rendu statique.

Les réponses des fournisseurs sont couvertes par des tests avec transport HTTP
contrôlé. Les clés réelles restent nécessaires pour vérifier les scores en direct,
la génération Groq et le classement par embeddings hébergés. Le client de test
Starlette émet un avertissement de dépréciation pour HTTPX.

Les deux visuels de stade sont des illustrations produites avec imagegen à partir
de l’ambiance de la maquette. Le fond montre un ballon et des crampons à droite,
avec un fond sombre à gauche. L’illustration du jeu montre un joueur anonyme vu
de dos, éclairé en vert dans un stade. Les versions WebP sont dans
`apps/web/public/images/`.
