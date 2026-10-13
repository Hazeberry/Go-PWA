# Go – 囲碁

Go auf dem 19×19-Brett gegen eine KI, als installierbare Progressive Web App.
Nach dem ersten Aufruf läuft das Spiel komplett offline.
https://hazeberry.github.io/Go-PWA/
## Dateien

| Datei | Zweck |
| --- | --- |
| `index.html` | Das Spiel (Brett, KI, Dashboard) |
| `manifest.webmanifest` | Name, Farben und Icons für die Installation |
| `sw.js` | Service Worker: speichert App und Schriften für den Offline-Betrieb |
| `icons/` | App-Icons (SVG-Vorlage plus PNGs) |

## Veröffentlichen

Service Worker brauchen HTTPS (oder `localhost`). Am einfachsten über GitHub Pages:
*Settings → Pages → Source: Deploy from a branch → `main` / `(root)`*.
Alle Pfade sind relativ, die App funktioniert also auch unter `https://<user>.github.io/Go-PWA/`.

Lokal testen:

```sh
python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

## Updates

Nach Änderungen an den App-Dateien `CACHE_VERSION` in `sw.js` erhöhen.
Installierte Apps laden die neue Version im Hintergrund und zeigen sie beim nächsten Start.

## Lizenz

[PolyForm Noncommercial 1.0.0](LICENSE.md)
