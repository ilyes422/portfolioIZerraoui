# Configurer les services du portfolio

Le frontend transmet les appels à FastAPI via `/api/*`. Les clés appartiennent à
l’environnement serveur de l’API. En local, utiliser `apps/api/.env`, ignoré par Git.
Sur Vercel, utiliser **Settings → Environment Variables** du projet API.

## Scores de football

Sans clé, l’API utilise OpenLigaDB, une source communautaire sous licence ODbL.
Elle consulte la Bundesliga, la Premier League, la Liga et la Ligue des champions,
puis affiche les matchs du jour en heure de Paris. Les résultats peuvent être
incomplets. Un score est affiché quand un résultat final a été publié. Le cache
des données OpenLigaDB est conservé 15 minutes entre les actualisations.

Pour inclure la Ligue 1 et la Serie A, créer un compte football-data.org gratuit,
ajouter `FOOTBALL_DATA_TOKEN` au projet API et redéployer. La clé active
football-data.org comme source principale. Le plan gratuit fournit des scores
différés.

- [API OpenLigaDB](https://api.openligadb.de/index.html)
- [Offres football-data.org](https://www.football-data.org/pricing)

## Assistant et recherche

1. Ajouter `LLM_API_KEY` depuis la console Groq. `LLM_MODEL` et `LLM_BASE_URL`
   permettent d’utiliser un fournisseur compatible avec Chat Completions.
2. Créer une base Redis Upstash sur le plan gratuit, puis définir
   `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN`. Redis partage le cache
   football et le plafond de requêtes IA entre instances. En production, le
   serveur exige ce plafond avant un appel à un fournisseur IA.
3. Pour la recherche sémantique hébergée, créer un index Upstash Vector avec
   embeddings intégrés. Vérifier que le modèle choisi est inclus dans le plan
   gratuit. Exécuter `python scripts/index_knowledge.py --upstash` avec
   `UPSTASH_VECTOR_REST_URL` et `UPSTASH_VECTOR_WRITE_TOKEN` dans le terminal.
   Dans l’API, configurer l’URL et `UPSTASH_VECTOR_REST_TOKEN` en lecture seule.

`content/` est la source des informations publiées. Le script d’indexation en
extrait les passages de profil, de parcours et de projets. L’assistant combine
une recherche locale pondérée et, lorsqu’elle est configurée, une recherche
vectorielle hébergée. Seuls les extraits approuvés et les destinations connues
sont acceptés. Sans fournisseur de génération ou quand son quota est atteint,
le visiteur reçoit des extraits identifiés comme sources.

- https://console.groq.com/docs/rate-limits
- https://upstash.com/pricing/redis
- https://upstash.com/pricing/vector

## Vérifier après configuration

- `GET /api/matches` doit répondre `ready`, y compris un jour sans match.
- `POST /api/assistant` avec une question sur XEFI doit inclure une source vers
  `/parcours`. Le mode `generative` confirme un appel réussi au modèle.
- `python scripts/index_knowledge.py --check` vérifie la correspondance entre
  le corpus local et les données publiées.

Les tests utilisent un transport HTTP contrôlé pour les réponses des fournisseurs.
La vérification avec les clés réelles se fait sur le projet configuré.
