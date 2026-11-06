import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const origin = new URL(process.env.PORTFOLIO_VERIFY_URL ?? "http://127.0.0.1:3000");
const profile = JSON.parse(await readFile(new URL("../content/profile.json", import.meta.url), "utf8"));

async function request(path) {
  const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(15_000) });
  assert.equal(response.status, 200, `HTTP 200 attendu pour ${path}`);
  return response;
}

try {
  const page = await request("/");
  assert.match(page.headers.get("content-type") ?? "", /text\/html/);
  const html = await page.text();
  assert.match(html, /<html[^>]+lang="fr"/);
  assert.match(html, /<h1\b/);
  assert.ok(html.includes(profile.name), "Le profil doit être présent dans le HTML initial.");
  assert.ok(html.includes(profile.email), "L'adresse de contact publique doit être présente.");
  assert.match(html, /<meta[^>]+name="robots"[^>]+content="[^"]*noindex/);
  console.log("OK — page française et contenu public dans le HTML initial");

  const stylesheet = html.match(/href="([^"]+\.css(?:\?[^"]*)?)"/);
  assert.ok(stylesheet, "Une feuille de style doit être liée à la page.");
  const css = await request(stylesheet[1].replaceAll("&amp;", "&"));
  assert.match(css.headers.get("content-type") ?? "", /text\/css/);
  console.log("OK — feuille de style accessible");

  const robots = await request("/robots.txt");
  assert.match(await robots.text(), /Disallow:\s*\/\s*(?:\r?\n|$)/);
  console.log("OK — indexation désactivée pendant la construction");

  const health = await request("/api/health");
  assert.match(health.headers.get("content-type") ?? "", /application\/json/);
  assert.deepEqual(await health.json(), { status: "ok", service: "portfolio-api", version: "0.1.0" });
  console.log("OK — frontend → proxy → FastAPI : contrat de santé vérifié");

  for (const route of ["/cv", "/parcours", "/projets", "/jouer", "/resultats", "/contact", "/assistant"]) {
    assert.match(await (await request(route)).text(), /<h1\b/);
  }
  assert.match(await (await request("/recherche?q=CV")).text(), /Mon CV et mes compétences/);
  const cv = await request("/documents/cv-ilyes-zerraoui.pdf");
  assert.match(cv.headers.get("content-type") ?? "", /application\/pdf/);
  console.log("OK — navigation, recherche et CV public");

  const football = await (await request("/api/matches")).json();
  assert.ok(Array.isArray(football.matches));
  assert.ok(["ready", "stale", "unconfigured", "unavailable"].includes(football.state));
  const chat = await fetch(new URL("/api/assistant", origin), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: "Quelles missions chez XEFI ?" }),
    signal: AbortSignal.timeout(24_000),
  });
  assert.equal(chat.status, 200);
  const answer = await chat.json();
  assert.match(answer.text, /CakePHP|Laravel/);
  assert.ok(answer.sources.some((source) => source.href === "/parcours"));
  console.log("OK — contrats HTTP résultats et assistant sourcé");
} catch (error) {
  console.error(`Échec de la vérification : ${error.message}`);
  process.exitCode = 1;
}
