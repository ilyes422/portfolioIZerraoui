"""Prépare le corpus public et, sur demande, l'index vectoriel hébergé."""

import argparse
import json
import os
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
DESTINATION = ROOT / "apps/api/app/data/knowledge.json"


def read_json(name: str):
    return json.loads((ROOT / "content" / name).read_text(encoding="utf-8"))


def documents():
    resume = read_json("resume.json")
    profile = read_json("profile.json")
    projects = read_json("projects.json")
    yield {
        "id": "cv", "title": "Profil", "label": "CV et compétences", "href": "/cv",
        "text": resume["summary"], "keywords": "cv curriculum profil candidature developpeur",
    }
    yield {
        "id": "skills", "title": "Compétences", "label": "CV et compétences", "href": "/cv",
        "text": " ".join(f'{group["category"]} : {", ".join(group["items"])}.' for group in resume["skills"]),
        "keywords": "competence competences technologies stacks langage outils framework",
    }
    yield {
        "id": "languages", "title": "Langues", "label": "CV et compétences", "href": "/cv",
        "text": " ; ".join(resume["languages"]) + ".", "keywords": "langues niveau anglais espagnol francais",
    }
    for index, experience in enumerate(resume["experience"]):
        yield {
            "id": f"experience-{index}", "title": f'{experience["role"]} · {experience["organization"]}',
            "label": "Parcours professionnel", "href": "/parcours",
            "text": f'{experience["period"]}. ' + " ".join(experience["tasks"]),
            "keywords": "parcours experience missions alternance stage",
        }
    for index, entry in enumerate(resume["education"]):
        yield {
            "id": f"education-{index}", "title": entry["title"], "label": "Formations", "href": "/parcours",
            "text": f'{entry["school"]}, {entry["period"]}.', "keywords": "etudes formation diplome scolarite parcours",
        }
    for project in projects:
        yield {
            "id": f'project-{project["id"]}', "title": project["title"], "label": project["title"],
            "href": f'/projets#{project["id"]}',
            "text": f'{project["kind"]}. {project["description"]} Technologies : {", ".join(project["technologies"])}.',
            "keywords": "projet projets realisations developpement technologies",
        }
    yield {
        "id": "contact", "title": "Contact", "label": "Page Contact", "href": "/contact",
        "text": f'Ilyes est basé à {profile["city"]}. Son e-mail et son téléphone publics sont disponibles sur la page Contact.',
        "keywords": "contacter contact joignable email e-mail telephone ville adresse recrutement",
    }
    yield {
        "id": "game", "title": "Devine le joueur", "label": "Jouer", "href": "/jouer",
        "text": "Le jeu propose des indices sourcés, trois tentatives et un score local.",
        "keywords": "jeu devinette joueur foot football jouer",
    }
    yield {
        "id": "football", "title": "Résultats de football", "label": "Résultats", "href": "/resultats",
        "text": "L’espace football présente les matchs du jour lorsque la source sportive est disponible.",
        "keywords": "match matchs resultats scores competition ligue football foot",
    }


def upload(records: list[dict]) -> None:
    url = os.environ["UPSTASH_VECTOR_REST_URL"].rstrip("/")
    token = os.environ["UPSTASH_VECTOR_WRITE_TOKEN"]
    if not url.startswith("https://"):
        raise ValueError("Une URL HTTPS Upstash est requise.")
    batch = [{"id": record["id"], "data": f'{record["title"]}. {record["text"]}', "metadata": {"href": record["href"]}} for record in records]
    request = Request(
        f"{url}/upsert-data/portfolio-v1", method="POST",
        data=json.dumps(batch, ensure_ascii=False).encode(),
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    )
    with urlopen(request, timeout=20) as response:
        result = json.load(response)
        if not result.get("result"):
            raise RuntimeError("L’index vectoriel n’a pas accepté les documents.")
    print(f"{len(records)} extraits transmis à l’index vectoriel.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--check", action="store_true")
    group.add_argument("--upstash", action="store_true")
    args = parser.parse_args()
    records = list(documents())
    snapshot = json.dumps(records, ensure_ascii=False, indent=2) + "\n"
    if args.check:
        if not DESTINATION.is_file() or DESTINATION.read_text(encoding="utf-8") != snapshot:
            raise SystemExit("Le corpus doit être régénéré avec python scripts/index_knowledge.py.")
    else:
        DESTINATION.parent.mkdir(parents=True, exist_ok=True)
        DESTINATION.write_text(snapshot, encoding="utf-8")
        print(f"{len(records)} extraits publics indexés localement.")
        if args.upstash:
            upload(records)
