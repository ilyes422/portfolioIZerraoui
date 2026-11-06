# Référencement naturel

Objectif : améliorer la visibilité sur la recherche exacte « Ilyes Zerraoui »,
sans garantir une position dans les résultats.

## Pendant la construction

La phase 1 définit le nom, la langue française et une description fidèle.
Les pages restent en `noindex` et le fichier robots bloque l'exploration tant que
le contenu final et l'URL publique ne sont pas prêts.

## Avant la production

- Pages distinctes et utiles : CV, Parcours et Projets.
- Titres et descriptions uniques, H1 explicite et HTML sémantique.
- Métadonnées Open Graph, images optimisées et URL canoniques réelles.
- Sitemap XML avec les pages publiables ; robots et métadonnées autorisant
  l'indexation sur la production uniquement.
- Données structurées Person utilisant uniquement les informations publiques
  vérifiées. Aucun diplôme, lien professionnel ou niveau de maîtrise inventé.
- Contrôle du HTML servi, de l'accessibilité et des performances sur mobile.

## Après la production

1. Dans [Google Search Console](https://search.google.com/search-console), ajouter
   une propriété de type **Préfixe de l’URL** avec
   `https://ilyes-zerraoui-portfolio.vercel.app/`.
2. Choisir la validation par fichier HTML. Copier le fichier fourni dans
   `apps/web/public/` avec son nom d’origine, puis redéployer le frontend. Vérifier
   que le fichier est accessible à la racine du site avant de cliquer sur
   **Valider**. Conserver le fichier après validation.
   [Guide Google de validation](https://support.google.com/webmasters/answer/9008080)
3. Dans le rapport **Sitemaps**, envoyer `sitemap.xml` et vérifier son statut.
   [Guide Google des sitemaps](https://support.google.com/webmasters/answer/7451001)
4. Dans **Inspection de l’URL**, tester l’accueil, le CV, le parcours et les
   projets, puis demander l’indexation des pages importantes.
   [Guide Google de l’inspection](https://support.google.com/webmasters/answer/9012289)
5. Suivre les erreurs d’indexation et les impressions, clics et requêtes liés au
   nom. Après une mise à jour importante, vérifier le sitemap et inspecter les
   pages concernées.
