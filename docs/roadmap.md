# Phases et validation

## 1 — Fondations

- Applications React/Next.js et Python/FastAPI séparées.
- Configuration locale, dépendances figées, variables documentées.
- Page initiale, contrat de santé, proxy et tests CORS.
- CI : types, compilation et tests backend.
- Validation : compilation réussie, tests réussis et santé accessible via le frontend.

## 2 — Identité visuelle et navigation

Reprendre la maquette de référence : stade nocturne, couleurs sombres et accent
menthe. Construire le menu Accueil, CV, Parcours, Projets, Jouer, Contact et la
structure responsive. Validation : toutes les destinations existent, navigation
clavier et mobile vérifiée, réduction des animations respectée.

## 3 — Contenus professionnels

Parcours et compétences vérifiés à partir du CV, fiches projets réellement
documentées, contact et PDF public sans adresse de rue. Validation : données
approuvées, aucun lien fictif, consultation et téléchargement du PDF réels.

Informations à compléter : situation professionnelle actuelle, projets à mettre
en avant, liens exacts et éventuel profil LinkedIn.

## 4 — Deviner le joueur

Catalogue sourcé, indices progressifs, tentatives, score, solution et nouvelle
partie. Validation : mécanique testée et partie jouable hors dépendance réseau.

## 5 — Résultats sportifs

Compte gratuit football-data.org, clé serveur, cache partagé, filtres et fuseau
Europe/Paris. Validation : appel réel, quota/erreur/absence de match gérés,
horodatage et scores différés indiqués. TheSportsDB sera évalué pour préparer
les fiches joueurs ; API-Football reste une alternative limitée à 100 appels/jour
et à certaines saisons dans son offre gratuite.

## 6 — Assistant et RAG

Provisionner uniquement les ressources gratuites validées, vérifier le coût des
embeddings, indexer les documents publics et intégrer la génération configurable.
Validation : questions sourcées, refus d'inventer une information, navigation
autorisée et fonctionnement des limites de requêtes.

## 7 — Qualité et référencement

Scénarios complets, gestion des abus, accessibilité, performances et SEO.
Validation : vérifications des parcours réels et du HTML servi, sans résultat de
test affirmé sans preuve.

## 8 — Mise en production

Configurer Vercel, secrets serveur, domaines et origines exactes. Vérifier le site
public, activer l'indexation, puis documenter Search Console et la soumission du
sitemap. Validation : accès public réel et fonctionnement de chaque intégration.

Chaque phase donne lieu à une explication des fichiers et concepts, des commandes
reproductibles et d'un relevé des vérifications réellement effectuées.
