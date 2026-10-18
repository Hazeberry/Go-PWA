# Go – 囲碁

Go auf dem 19×19-Brett gegen eine KI, als installierbare Progressive Web App.
Nach dem ersten Aufruf läuft das Spiel komplett offline.
https://hazeberry.github.io/Go-PWA/
## Dateien

| Datei | Zweck |
| --- | --- |
| `index.html` | Das Spiel (Brett, KI, Dashboard) |
| `manifest.webmanifest` | Name, Farben und Icons für die Installation |
| `sw.js` | Service Worker: speichert die App für den Offline-Betrieb |
| `icons/` | App-Icons (SVG-Vorlage plus PNGs) |
| `tests/endzaehlung.js` | Prüft die Totstein-Erkennung am Spielende (`node tests/endzaehlung.js`) |

## Spielende und tote Steine

Wenn beide Seiten nacheinander passen, schlägt die App vor, welche Steine tot sind.
Diese Steine bleiben auf dem Brett liegen und werden **halb durchsichtig mit rotem Kreuz** markiert.
Die Wertung oben rechts rechnet sie bereits heraus.

- **Antippen oder anklicken** einer Kette schaltet sie zwischen „tot“ und „lebt“ um; die Wertung wird sofort neu berechnet.
- Ein Wechsel zwischen *Area* und *Territory* nach Spielende rechnet die Wertung ebenfalls neu.
- Die SGF-Datei übernimmt das korrigierte Ergebnis.
- *Rückgängig* führt aus der Zählphase zurück ins Spiel.

Die automatische Erkennung kennt:

| Augenraum (ein einziger, nur eigene Farbe) | Ergebnis |
| --- | --- |
| 1–3 Punkte | ein Auge (allein tot) |
| 4 Punkte: Quadrat, T-Form | tot |
| 4 Punkte: gerade, gewinkelt | lebt |
| 5 Punkte: Klumpen, Kreuz | tot |
| 5 Punkte: alle anderen Formen | lebt |
| 6 Punkte: „Kaninchen-Sechs“ | tot |
| 6 Punkte: alle anderen Formen (z. B. 2×3) | lebt |
| ab 7 Punkten | lebt |

Außerdem: Zwei getrennte Augen leben. Falsche Augen (Randpunkt zwischen zwei Ketten mit gegnerischem Diagonalstein) zählen nicht.
Einfaches Seki (gemeinsame Freiheiten, die keine Seite füllen kann, ohne sich selbst ins Atari zu setzen) bleibt stehen.
Kleine Gruppen (bis 5 Steine) in einem großen, fast nur vom Gegner begrenzten offenen Gebiet gelten als tot.

Grenzen: Sonderfälle wie die gewinkelte Vier in der Ecke, Seki mit Augen und verwickelte Semeai erkennt die Heuristik nicht sicher.
Dafür gibt es das Antippen.

## Änderungen nach dem Code-Review (Oktober 2026)

**Wertung**
- Lebende Augenformen mit 3–6 Punkten wurden als tot gewertet (Beispiel: eine Partie, in der 194 schwarze Steine verschwanden und das Ergebnis W+304,5 statt B+93,5 lautete). Behoben, siehe Tabelle oben.
- Seki-Gruppen wurden entfernt, falsche Augen zählten als echte Augen. Behoben.
- Tote Steine verschwanden unsichtbar vom Brett. Jetzt sichtbar markiert und korrigierbar.
- Nach Spielende rechnete ein Wechsel des Wertungsmodus nicht neu. Behoben.

**KI**
- Aufgabe nur noch, wenn die KI auch auf der Einflusskarte zurückliegt: Gebiet inklusive offener Rahmen, mit Komi, ohne beweisbar tote Steine (`resignAreaMargin` = 0; −1 = altes Verhalten nur nach Q).
  Grund: Q wird stark von Gefangenen bestimmt. In einer Partie gab die KI bei 23:6 Gefangenen auf (Q −0,98), obwohl sie mit einem großen offenen Rahmen auf der Einflusskarte etwa 250:85 vorn lag. Eine Probe, die nur geschlossene Gebiete zählt, hätte das nicht verhindert.
  Hinweis: Eine niedrigere *Aufgabe-Q* (z. B. 0,90) lässt die KI früher aufgeben; die Flächenprobe bremst das nur, wenn die Einflusskarte nicht klar gegen die KI spricht.
- Der taktische Leser beachtet jetzt Ko (kein sofortiger Rückschlag beim Lesen).
- Pass-Schwellen sind gestuft: Ab Zug 41/81/121/151 gilt jeweils genau eine Schwelle. `passMinMc120` und `passMinMc150` wirken jetzt wirklich (Standard 20, damit das bisherige Verhalten gleich bleibt).
- Die Spielphase richtet sich nach den echten freien Feldern statt nach der Zahl der Kandidatenzüge; KI und Gegner werden in derselben Phase bewertet.
- Schaltet man die KI aus, während sie rechnet, wird ihr Zug verworfen.

**Policy-Netz**
- Trainiert wird erst beim Start eines neuen Spiels (oder beim Schließen der App) mit dem endgültigen, ggf. korrigierten Ergebnis im gewählten Wertungsmodus. Rückgängig nach Spielende verfälscht das Training nicht mehr.

**Dashboard und Darstellung**
- Spielstil-Presets starten jetzt von den Standardwerten und addieren sich nicht mehr.
- Neue Felder: *Aufgabe-Flächenprobe*, *Pass mc>120*, *Pass mc>150*.
- Der Export-Knopf zeigt seine eigene Rückmeldung und meldet auch Fehler (✗).
- Hinweise auf nicht vorhandene `docs/`-Dateien entfernt; Policy-Netz-Hinweis korrigiert.
- Das Brett wird auf hochauflösenden Displays (Handy) scharf gezeichnet.
- Entfernt: ungenutzte Funktion `findEyes`.

Bewusst unverändert: Die MCTS-Suche kennt im Baum keinen Pass und keinen Superko. Für die Zugwahl reicht das; Passen entscheidet die KI vor der Suche.

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

Nach Änderungen an den App-Dateien `CACHE_VERSION` in `sw.js` erhöhen (aktuell `v9`).
Installierte Apps laden die neue Version im Hintergrund und zeigen sie beim nächsten Start.

## Lizenz

[PolyForm Noncommercial 1.0.0](LICENSE.md)

Projektkennung: `hzb-go-7f3a91c2`. Sie steht im Kopfkommentar und in einem Meta-Tag von `index.html`, in `sw.js`,
im Bug-Report (`kennung`) und in exportierten SGF-Dateien (`AP[Go-PWA:hzb-go-7f3a91c2]`).
Kopien und Ableitungen lassen sich damit finden, etwa über die
[GitHub-Codesuche](https://github.com/search?q=%22hzb-go-7f3a91c2%22&type=code).
