#!/usr/bin/env python3
"""
generate_data_template.py
--------------------------
Erzeugt (oder setzt zurück auf) das Grundgerüst für
data/wahlprogramme.json – die Datendatei, aus der die Webseite
ihre Vergleichs-Karten für SPD, CDU, Die Linke, AfD und FDP baut.

WICHTIG:
Dieses Skript füllt NUR Platzhaltertexte ein. Es enthält und
erfindet keine echten politischen Aussagen. Bevor die Webseite
live geht, müssen die Platzhalter durch geprüfte, mit Quelle
belegte Zusammenfassungen aus den offiziellen Wahlprogrammen der
Parteien ersetzt werden (siehe Feld "quelle").

Nutzung:
    python3 generate_data_template.py

Das Skript fragt vor dem Überschreiben einer vorhandenen Datei
nach Bestätigung.
"""

import json
import os

OUTPUT_PATH = os.path.join("data", "wahlprogramme.json")

BUNDESLAENDER = [
    "Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen",
    "Hamburg", "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen",
    "Nordrhein-Westfalen", "Rheinland-Pfalz", "Saarland", "Sachsen",
    "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen",
]

# Alphabetische Reihenfolge – bewusst neutral, ohne Wertung oder Ranking.
PARTEIEN = ["AfD", "CDU", "Die Linke", "FDP", "SPD"]

THEMEN = ["Arbeit", "Bildung", "Digitalisierung", "Klima", "Wohnen"]

PLATZHALTER_TEXT = (
    "Platzhalter: Hier folgt eine in einfacher Sprache zusammengefasste, "
    "geprüfte Position dieser Partei zu diesem Thema in diesem Bundesland."
)


def build_template():
    positionen = {}
    for land in BUNDESLAENDER:
        positionen[land] = {}
        for thema in THEMEN:
            positionen[land][thema] = {
                partei: {"text": PLATZHALTER_TEXT, "quelle": ""}
                for partei in PARTEIEN
            }

    return {
        "bundeslaender": BUNDESLAENDER,
        "parteien": PARTEIEN,
        "themen": THEMEN,
        "positionen": positionen,
    }


def main():
    if os.path.exists(OUTPUT_PATH):
        answer = input(
            f"'{OUTPUT_PATH}' existiert bereits. Überschreiben? [j/N] "
        ).strip().lower()
        if answer != "j":
            print("Abgebrochen. Es wurde nichts verändert.")
            return

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    data = build_template()
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    total = len(BUNDESLAENDER) * len(THEMEN) * len(PARTEIEN)
    print(f"Fertig: {OUTPUT_PATH} wurde erzeugt.")
    print(f"Enthält {len(BUNDESLAENDER)} Bundesländer × {len(THEMEN)} Themen "
          f"× {len(PARTEIEN)} Parteien = {total} Platzhalter-Einträge.")
    print("Bitte ersetze die Platzhaltertexte durch geprüfte Inhalte mit "
          "Quellenangabe, bevor die Seite veröffentlicht wird.")


if __name__ == "__main__":
    main()