---
title: Github PR(Pull Request) Titel, Automatisches Setzen von Labels je nach Thema des Issues
type: blog
date: 2024-05-27
comments: true
translated: true
---

Bei der Durchsicht der Projekte des Unternehmens habe ich eine nützliche Aktion entdeckt, die ich hier vorstellen möchte.

Es handelt sich um eine Aktion, die basierend auf dem PR-Titel automatisch Labels setzt.

Normalerweise werden Labels an Github-Issues oder PRs angebracht, um deren Klassifizierung zu erleichtern. Dies dient der Nachverfolgung der Historie oder der einfachen Filterung, um festzustellen, welche Art von Issues oder PRs existierten.
~~(Manchmal sehen die Issues oder PRs dadurch auch einfach hübscher aus.)~~

Innerhalb des Unternehmens kann es vorkommen, dass durch manuelles Anbringen von Labels welche fehlen oder falsch angebracht werden. Im Folgenden stelle ich eine Aktion vor, die basierend auf dem PR- und Issue-Titel automatisch Labels zuweist.

![image](/images/github_action/pr-labeler-action-1716800204381.png)

## PR Labeler Action
![image](/images/github_action/pr-labeler-action-1716800340299.png)

Zum automatischen Anbringen von Labels werden wir die Aktion [Auto Labeler](https://github.com/jimschubert/labeler-action) verwenden.

Diese Aktion ist im Github Marketplace registriert und bietet die Möglichkeit, basierend auf PR- und Issue-Titeln automatisch Labels zuzuweisen.

Die Nutzung ist sehr einfach:

Zunächst erstellt man `.github/workflow/labeler.yml` und schreibt folgendes hinein. Die Dateinamen und Namen können nach Belieben festgelegt werden.
```yaml{filename=".github/workflows/labeler.yml"}
name: Community
on:
  issues:
    types: [opened, edited, milestoned]
  pull_request_target:
    types: [opened]

jobs:

  labeler:
    runs-on: ubuntu-latest

    steps:
      - name: Check Labels
        id: labeler
        uses: jimschubert/labeler-action@v2
        with:
          GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
```

Da es sich um eine Workflow-Datei handelt, wird beim Push der von Ihnen festgelegte Aktionsname `Community` erstellt.

Nun erstellen Sie die detaillierte Konfigurationsdatei `.github/labeler.yml` und schreiben folgende Einstellungen hinein.
```yaml{filename=".github/labeler.yml"}
enable:
  issues: false
  prs: true

labels:
  'bug':
    include:
      - '\bfix\b'
  'enhancement':
    include:
      - '\bfeat\b'
  'documentation':
    include:
      - '\bdocs\b'
  'release':
    include:
      - '\brelease\b'
  'refactoring':
    include:
      - '\brefactor\b'
  'test':
    include:
      - '\btest\b'
```

Ich habe das `issues` bei `enable` auf `false` gesetzt, um nur PRs zu labeln.

In `labels` definiert man den Namen des Labels und die Bedingungen, unter welchen es angebracht wird.

In der obigen Konfigurationsdatei habe ich die Labels `bug`, `enhancement`, `documentation`, `release`, `refactoring` und `test` definiert.

Da beim Erstellen eines PRs der Standardtitel aus der Commit-Nachricht generiert wird, habe ich die Github Commit Message Convention direkt für die Labels übernommen.

Sobald ein PR oder ein Issue erstellt wird, können Sie sehen, dass die Labels automatisch zugewiesen werden.