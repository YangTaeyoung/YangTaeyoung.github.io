---
title: Ausführung mit GitHub Runner bei Ausfall von Self-Hosted Runner (GitHub Actions)
type: blog
date: 2024-10-21
comments: true
translated: true
---

![Image](/images/github_action/self-hosted-online-checker-1729507848686.png)

Kürzlich hat unser Unternehmen zu GitHub Actions gewechselt und verwendet nun Self-Hosted Runner, nachdem zuvor Jenkins CI/CD genutzt wurde.

## Was ist ein Self-Hosted Runner?
Ein [Self-Hosted Runner](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/adding-self-hosted-runners) bedeutet, wie der Name schon sagt, ein selbst gehosteter Runner. Bei der Verwendung von GitHub Actions wird nicht der von GitHub bereitgestellte Runner genutzt, sondern eine vom Nutzer selbst gehostete Maschine.

Da direkt der eigene Computer verwendet wird, können zwar gelegentlich Probleme aufgrund von Umwelteinschränkungen oder Caching auftreten. Dennoch hat dies den Vorteil, dass es gegenüber dem GitHub Runner schneller ist und (abgesehen von Stromkosten) kostenlos genutzt werden kann.

### Gründe für die Nutzung von Self-Hosted Runnern

Ein Hauptproblem des aktuellen Jenkins war die Zeit, die für Tests benötigt wurde. Obwohl der Code refaktoriert wurde, um die Testlaufzeit von 30 Minuten auf etwa 10 Minuten zu reduzieren, stieg die Ausführungszeit aufgrund zunehmender Testcodes und der Einführung von [Testcontainer](https://testcontainers.com/) auf 19 Minuten.

Da der Testprozess nicht nur beim Hochladen einer PR, sondern auch bei der Bereitstellung integriert ist, verlängert sich die Bereitstellungszeit auf bis zu 30 Minuten.

Um dieses Problem zu lösen, haben wir uns für die Nutzung von Self-Hosted Runnern entschieden.

Es war praktisch, die bereits vorhandene Hardware des Unternehmens zu verwenden, da wir bei Jenkins AWS EC2-Instanzen genutzt hatten, aber die Self-Hosted Runner kostengünstiger (was den Strom betrifft) und deutlich leistungsfähiger als EC2-Instanzen sind. (Auch die Einrichtung ist einfach)
> Wenn es keine verfügbaren Geräte im Unternehmen gibt, wäre dies eine ganz andere Geschichte. Unser Unternehmen hatte Maschinen, die für Build Runner genutzt werden konnten, daher trafen wir diese Entscheidung. In der Praxis sollte man die Kosten für den Kauf eines Computers mit der Nutzung hochspezifizierter Runner von GitHub vergleichen.

Natürlich gibt es auch die Möglichkeit, Self-Hosted Runner bei Jenkins anzubinden, aber aufgrund der Einschränkungen bei der festen Maschinenzahl haben wir uns für die flexibel anpassbaren GitHub Actions entschieden.

### Problemstellung
Das Problem ist, dass Self-Hosted Runner nicht immer einwandfrei funktionieren. Natürlich haben auch GitHub Runner diese Eigenarten, aber bei direkt verwalteten Maschinen im Unternehmen treten durch Alterung von Kabeln etc. gelegentlich Ausfälle auf.

Jedes Mal, wenn man solche Maschinen erneut überprüfen und starten muss, die möglicherweise aus unbekannten Gründen ausgefallen sind, ist das ziemlich mühsam.
> Wenn es sich um einen Organization Runner handelt, kann dies nicht nur das aktuelle Projekt, sondern alle Projekte betreffen, was in Bezug auf Wartezeiten und Zeitverlust größerer Schaden wäre.

Um dieses Problem zu lösen, haben wir nach einer Failover-Methode gesucht, bei der der GitHub Runner ausgeführt wird, wenn der Self-Hosted Runner ausfällt.

## Herausforderung
Das Problem ist, dass GitHub Actions offiziell keine Funktion bietet, die einen GitHub Runner in Aktion setzt, wenn der Self-Hosted Runner aus irgendeinem Grund offline ist.
> Es gibt zwar die Möglichkeit, mehrere Runner-Gruppen gleichzeitig auszuführen. Aber letztlich ist es nur eine gleichzeitige Ausführung, sodass, wenn viele genutzt werden, auch für ungenutzte Runner Kosten anfallen. (Insbesondere bei Standard-Runnern, die länger dauern, werden die Kosten wegen der Zeit hoch sein.)

## Lösung
Wenn es nicht anders geht, müssen wir provisorisch arbeiten. Basierend auf der Idee, den Zustand des Runners direkt zu überprüfen und dann zu routen, haben wir eine Aktion konzipiert.

Die Fließrichtung sieht wie folgt aus:

![image](/images/github_action/self-hosted-online-checker-1729507068273.png)

`ubuntu-latest` steht für den GitHub Runner und `self-hosted` für den Self-Hosted Runner.

Der Status wird basierend auf den von der GitHub API bereitgestellten Runner-Informationen überprüft.

Der dazugehörige Code sieht wie folgt aus:

```yaml
name: Route Runner

on:
  pull_request:
    branches: [ '*' ]

jobs:
  check_self_hosted:
    runs-on: ubuntu-latest
    outputs:
      found: ${{ steps.check.outputs.found }}
    steps:
      - name: Self-Hosted Runner is online?
        id: check
        uses: YangTaeyoung/self-hosted-runner-online-checker@v1.0.5
        with:
          runner-labels: 'self-hosted'
          GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}

  call_self_hosted_runner:
    name: Call self-hosted Runner runner for test
    if: ${{ success() && needs.check_self_hosted.outputs.found == 'success' }}
    needs: check_self_hosted
    uses: ./.github/workflows/test-ci.yml
    with:
      runner: self-hosted
   
  call_github_hosted_runner:
    name: Call Github Runner runner for test
    needs: check_self_hosted
    if: ${{ success() && needs.check_self_hosted.outputs.found == 'failure'}}
    uses: ./.github/workflows/test-ci.yml
    with:
      runner: ubuntu-latest
```

Da sich die Ausführungslogik je nach Self-Hosted oder GitHub Runner nicht wesentlich unterscheidet, haben wir dies als wiederverwendbaren Workflow erstellt.

Beim ersten `job` namens `check_self_hosted` wird überprüft, ob der Self-Hosted Runner online ist, und das Ergebnis wird in `output` `found` dieses `jobs` gespeichert.

Dann, in `call_self_hosted_runner`, wenn der Self-Hosted Runner online ist, wird der Test auf dem Self-Hosted Runner ausgeführt, und wenn nicht, auf dem GitHub Runner.

Auf diese Weise kann stattdessen der GitHub Runner genutzt werden, wenn der Self-Hosted Runner offline ist.

![image](/images/github_action/self-hosted-online-checker-1729507626121.png)

![image](/images/github_action/self-hosted-online-checker-1729507642587.png)

## Fazit
Mit dieser Aktion haben wir eine Methode gefunden, durch die natürliche Katastrophen, Alterung der Kabel oder Stromausfälle, bei denen der Runner ausfällt, die Ausführung auf den GitHub Runner umgeleitet wird.

Obwohl spezifische Runner-Fehler nicht vermieden werden können und diese Aktion nur überprüft, ob der Status online ist, sind eine grundlegende Überwachung, wenn der Runner aktiv ist, sowie eine Vorbereitung auf Ausfälle erforderlich.
> Auch aufgrund der Vorteile von Leistung und Kosten wird Self-Hosted trotz dieser Verwaltungskosten verwendet.