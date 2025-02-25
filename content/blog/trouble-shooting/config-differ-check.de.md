---
title: Verhindern, dass Konfigurationswerte in verschiedenen Umgebungen fehlen
type: blog
date: 2025-01-03
comments: true
translated: true
---
## Warum ist das Management von Konfigurationen schwierig?
Eine der chronischen Krankheiten, die wir bei jeder Bereitstellung spüren, ist die Konfiguration.

In unserem Unternehmen verwenden wir Spring Boot, und für die Verwaltung der unterschiedlichen Konfigurationsdateien in den verschiedenen Bereitstellungsumgebungen nutzen wir Spring Cloud Config.

In Spring wird Konfiguration üblicherweise über die Datei application.yml verwaltet, aber das grundlegende Problem ist die Übernahme dieser Konfigurationsdatei.

![image](/images/trouble-shooting/config-differ-check-1735855932407.png)

In unserem Unternehmen erfolgt die Bereitstellung in der folgenden Reihenfolge, und die Umgebungen sind wie oben in dev, qa, stage und production unterteilt, wobei jede Umgebung unterschiedliche Konfigurationsdateien besitzt.

Das Problem liegt darin, dass, wenn auch nur einmal eine Konfiguration fehlt, eine erneute Bereitstellung erforderlich wird oder es dazu führen könnte, dass die Änderungen in der Produktionsumgebung nicht übernommen werden, weil dort die Konfigurationsdatei fehlt.

## 1. Einen Bereitstellungs-Review einführen
![image](/images/trouble-shooting/config-differ-check-1735856331653.png)

Um dieses Problem zu lösen, haben wir zunächst an einen Review-Zeitpunkt vor der Bereitstellung gedacht.

Das Problem ist, dass es eine gewisse Zeit aller Beteiligten in Anspruch nimmt und die Kosten hoch sind, weshalb wir es derzeit so handhaben, dass nur die zusätzlichen Infrastruktur- und Konfigurationsteile vor der Bereitstellung in der Produktion überprüft werden.

Es war eine gute Erfahrung, weil die Überprüfung durch mehrere Personen effektiver ist, um fehlende Konfigurationen zu entdecken. Allerdings zieht sich die Review-Zeit in die Länge, weil jede neue Ergänzung einzeln überprüft werden muss.

## 2. Eine Vergleichsaktion für Konfigurationsdateien erstellen
Die zweite, kürzlich eingeführte Methode ist das Erstellen eines Bots, der die Konfigurationsdateien vergleicht.

Jedoch sind die bestehenden YAML-Vergleichstools auf dem Markt ungeeignet, da sie auch die Werte vollständig vergleichen, was nicht passt, wenn man von unterschiedlichen Werten pro Umgebung ausgeht.

Deshalb haben wir folgende Herangehensweise in Betracht gezogen:

1. Die Konfigurationsdateien pro Umgebung einlesen und nur die Schlüssel extrahieren.
2. Prüfen, ob die Typen unterschiedlich sind, ein Schlüssel in einer der Dateien fehlt oder Indizes in Arrays unterschiedlich sind, etc.
3. Bei Änderungen wird ein Kommentarbericht in der PR zur Zusammenführung der jeweiligen Umgebungsbranches generiert.

So kann zuverlässig nachverfolgt werden, ob Konfigurationen pro Umgebung fehlen.

### Design
![image](/images/trouble-shooting/config-differ-check-1735857073333.png)

Die meisten der Diagrammelemente sind einfach zu verstehen, und die grobe Struktur sieht folgendermaßen aus.
Das Tool [yaml-diff-reporter](https://github.com/YangTaeyoung/yaml-diff-reporter) kann zwei YAML-Konfigurationsdateien analysieren und vergleichen sowie Berichte entweder in der Konsole oder als Datei ausgeben. Dieses Tool wurde kürzlich von uns implementiert.
> Die Bedienungsanleitung wurde beigelegt, nutzen Sie es gerne, wenn Sie ähnliche Überlegungen haben. Es wurde so umgesetzt, dass durch Flags der Modus zur reinen Dateivergleicherstellung festgelegt werden kann.

### Erstellung der Aktion
```yaml
name: Konfigurationsdateivergleich

on:
  pull_request:
    branches: [ qa, stg, prod ]
```

Wie bereits erwähnt, gibt es vier Umgebungen. Während der Entwicklung erfolgt normalerweise der Merge in dev, und nur während der Bereitstellung werden PRs für qa, stg, prod angehoben, weshalb wir dies so eingestellt haben.

```yaml
jobs:
  config-check:
    permissions:
      contents: read
      pull-requests: write
      issues: write
env:
  MERGE_FROM: ${{ github.event.pull_request.base.ref == 'qa' && 'dev' || (github.event.pull_request.base.ref == 'stg' && 'qa' || 'stg') }}
  MERGE_TO: ${{ github.event.pull_request.base.ref }}
```
Da unser Server ein privates Repository nutzt (wie selbstverständlich), haben wir dem Bot die Berechtigung erteilt, PR-Kommentare zu schreiben.
Zudem haben wir die Umgebungen so eingestellt, dass bei qa mit dev und bei stg mit qa verglichen wird, indem wir die MERGE_FROM- und MERGE_TO-Umgebungsvariablen gemäß der zuletzt bereitgestellten Umgebung konfiguriert haben.

```yaml
runs-on: ubuntu-latest
steps:
  - name: Go installieren
    uses: actions/setup-go@v5
    with:
      go-version: '1.23'
  - name: yaml-diff-reporter CLI installieren
    run: go install github.com/YangTaeyoung/yaml-diff-reporter@v1.0.0
```
Wir haben Go installiert und `yaml-diff-reporter` eingerichtet. Nebenbei bemerkt, ist Go für die CLI-Installation dank des einfachen Install-Befehls sehr praktisch.

```yaml
  - name: Konfigurationsdateien herunterladen
    uses: AcmeSoftwareLLC/github-downloader@v1
    with:
      git-pat: ${{ secrets.GH_TOKEN }}
      repo: # Cloud Config Repository
      ref: # Cloud Config Repository Branch
      includes: |
        {application yaml Pfad}/${{ env.MERGE_FROM }}/application.yml:${{ env.MERGE_FROM }}.yml
        {application yaml Pfad}/${{ env.MERGE_TO }}/application.yml:${{ env.MERGE_TO }}.yml
```
Anschließend laden wir die Dateien von den angegebenen Pfaden aus dem GitHub-Repository herunter. Für den Download gibt es viele bereits implementierte Aktionen, sodass wir nach Bedarf eine auswählen können.

```yaml
  - name: Konfigurationsdateien vergleichen
    id: compare
    run: |
      DIFF_RESULT=$(yaml-diff-reporter -l ${{ env.MERGE_FROM }}.yml -r ${{ env.MERGE_TO }}.yml \
      -la ${{ env.MERGE_FROM }} -ra ${{ env.MERGE_TO }} \
      -M type -M key -M index \ # Modus Einstellen (avec Ausnahme von values)
      -I  # Schlüssel zum Ignorieren angeben
      -lang ko # Sprache für den Bericht angeben (aktuell nur Koreanisch und Englisch verfügbar)
      -f markdown) # Berichtsformat (Markdown verfügbar, JSON, klarer Text)

      echo "diff_result<<EOF" >> $GITHUB_OUTPUT
      echo "${DIFF_RESULT}" >> $GITHUB_OUTPUT
      echo "EOF" >> $GITHUB_OUTPUT
```

Jetzt vergleichen wir die heruntergeladenen Dateien mit dem CLI-Tool und speichern das Ergebnis als `diff_result`, das wir dann als Ausgabe des Schritts festlegen.
> Das EOF kommt zuerst, weil der Bericht im Mehrzeilenformat ausgegeben wird. <br>
> Wenn es sich um eine Einzelzeile handelte, hätten wir es mit `echo "diff_result=${DIFF_RESULT}"` gemacht.

```yaml
  - name: Kommentar mit PR-Ergebnis verfassen
    if: always()
    uses: thollander/actions-comment-pull-request@v3
    with:
      message: |
        # Ergebnis des Konfigurationsdateivergleichs
        ${{ steps.compare.outputs.diff_result == 'No differences found' && '![pass-badge](https://img.shields.io/badge/check-passed-green)' || '![fail-badge](https://img.shields.io/badge/check-failed-red)' }}

        ${{ steps.compare.outputs.diff_result }}

        ## Dateireferenz
        - [${{ env.MERGE_FROM }}.yml](Github Dateipfad)
        - [${{ env.MERGE_TO }}.yml](Github Dateipfad)
        

  - name: Handling fehlerhafter Ergebnisse (falls Unterschiede gefunden wurden)
    if: steps.compare.outputs.diff_result != 'No differences found'
    run: exit 1
```

Anschließend verfassen wir das Ergebnis als PR-Kommentar und stellen ein, dass die Aktion fehlschlägt, falls das Ergebnis fehlgeschlagen ist, sodass der PR nicht gemergt wird.
Wenn Sie nur den Bericht ausgeben möchten, reicht auch `${{ steps.compare.outputs.diff_result }}`, doch ich wollte es gerne etwas schöner gestalten, daher habe ich es so umgesetzt.

## Ergebnis
![image](/images/trouble-shooting/config-differ-check-1735858672464.png)

Die sensiblen Informationen wurden unkenntlich gemacht, aber letztendlich wird durch das Schreiben eines PR-Kommentars ersichtlich, bei welchem Schlüssel das Problem liegt, und es wird einfacher nachvollzogen.

## Nachteile
Natürlich hat diese Methode auch klare Nachteile. Da wir nur neu hinzugefügte Schlüssel vergleichen, können **Änderungen oder Modifikationen an bestehenden Werten nicht allein durch den Vergleich von Schlüsseln, Typen usw. erkannt werden.**

Es gibt keine perfekten Lösungen wie eine Silberkugel, und ich habe heute einmal mehr erkannt, dass ein Entwickler kontinuierlich daran arbeiten, verbessern und bessere Methoden finden muss.