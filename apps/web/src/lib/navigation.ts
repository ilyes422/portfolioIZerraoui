export const navigation = [
  { href: "/", label: "Accueil", icon: "home" },
  { href: "/cv", label: "CV", icon: "cv" },
  { href: "/parcours", label: "Parcours", icon: "journey" },
  { href: "/projets", label: "Projets", icon: "projects" },
  { href: "/jouer", label: "Jouer", icon: "game" },
  { href: "/contact", label: "Contact", icon: "contact" },
] as const;

export const searchablePages = [
  {
    href: "/cv",
    title: "Mon CV et mes compétences",
    description:
      "Développement web, applications et technologies de mon parcours.",
    keywords:
      "cv curriculum competences php laravel cakephp symfony java spring sql javascript html css python flutter",
  },
  {
    href: "/parcours",
    title: "Mon parcours",
    description:
      "Mes formations et mon expérience en développement d’applications.",
    keywords:
      "parcours formation experience alternance xefi epsi bts sio slam diplome etudes",
  },
  {
    href: "/projets",
    title: "Mes projets",
    description:
      "Le portfolio interactif, les applications métier et l’API Spring Boot.",
    keywords:
      "projet projets realisation code application applications github portfolio laravel cakephp java spring boot",
  },
  {
    href: "/jouer",
    title: "Devine le joueur",
    description:
      "Testez vos connaissances avec des indices footballistiques sourcés.",
    keywords: "jouer jeu joueur deviner devinette football foot ballon",
  },
  {
    href: "/resultats",
    title: "Résultats de football",
    description:
      "L’espace consacré aux matchs et aux compétitions de football.",
    keywords:
      "resultat resultats score scores match matchs ligue championnat competition foot football",
  },
  {
    href: "/contact",
    title: "Me contacter",
    description:
      "Mon e-mail, mon téléphone et mes coordonnées professionnelles publiques.",
    keywords:
      "contact contacter email mail telephone coordonnees recrutement recruteur",
  },
] as const;

export function searchPages(query: string) {
  const tokenize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .split(/\W+/);
  const stopWords = new Set([
    "mon",
    "mes",
    "ton",
    "tes",
    "les",
    "des",
    "est",
    "moi",
    "pour",
    "sur",
    "le",
    "la",
    "ou",
    "et",
    "du",
    "de",
    "un",
    "une",
  ]);
  const words = [...new Set(tokenize(query))].filter(
    (word) => word.length > 1 && !stopWords.has(word),
  );
  if (words.length === 0) return [...searchablePages];
  return searchablePages
    .map((page) => {
      const keywords = new Set(tokenize(`${page.title} ${page.keywords}`));
      return { page, score: words.filter((word) => keywords.has(word)).length };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ page }) => page);
}
