#!/usr/bin/env python3
"""
server.py
---------
Startet einen einfachen lokalen Webserver für die PoliKlar-Seite.

Warum ein Server nötig ist:
Moderne Browser blockieren aus Sicherheitsgründen das Nachladen von
Dateien (z. B. data/wahlprogramme.json) per JavaScript, wenn die
index.html direkt per Doppelklick als "Datei" (file://) geöffnet wird.
Über einen lokalen Server (http://localhost:...) funktioniert das
Nachladen dagegen einwandfrei.

Nutzung:
    python3 server.py
    (öffnet danach automatisch http://localhost:8000 im Browser)

Zum Beenden: STRG+C im Terminal.
"""

import http.server
import socketserver
import webbrowser
import os

PORT = 8000


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    """Verhindert, dass der Browser alte Versionen von JS/CSS/JSON
    zwischenspeichert – praktisch während der Entwicklung."""

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()


def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    with socketserver.TCPServer(("", PORT), NoCacheHandler) as httpd:
        url = f"http://localhost:{PORT}"
        print(f"PoliKlar läuft jetzt unter {url}")
        print("Zum Beenden: STRG+C")
        try:
            webbrowser.open(url)
        except Exception:
            pass
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer beendet.")


if __name__ == "__main__":
    main()