---
title: Testen vor dem Commit in JetBrains IDE
Type: blog
date: 2025-03-24
comments: true
translated: true
---
Wenn man an Server- oder allgemeiner Softwareentwicklung arbeitet, kommt man häufig dazu, Testcodes auszuführen.

In einer Zusammenarbeit kann man Tests eventuell mit CI/CD über Github Actions durchführen, und bei der lokalen Entwicklung kann man die Tests direkt ausführen.

In unser Firma haben wir normalerweise die folgende Reihenfolge für die Entwicklung verwendet:

```mermaid
graph TD
    Development --> Local_Test
    Local_Test --> PR_Test
    PR_Test --> Merge
```

Das Problem ist, dass man oft das lokale Testen vergisst und einen PR erstellt, wodurch die Tests in PR fehlschlagen.

Es ist zwar nicht besonders schlimm, da man einfach den Push erneut durchführen kann, aber ich möchte eine Funktion des JetBrains IDE vorstellen, die solche Fehler im Voraus verhindert.

## Testeinrichtung
Um Tests vor einem Commit zu konfigurieren, müssen Tests in der Ausführungskonfiguration hinzugefügt werden.

Zuerst klickt man neben dem oberen Play-Button auf `Edit Configurations`.

![image](/images/ide/test-before-commit-1742826510666.png)

> Da ich die Programmiersprache Go benutze, füge ich einen Go Test hinzu, aber auch andere IDEs haben Test-bezogene Aktionen, die jederzeit hinzugefügt werden können.

Klickt auf die `+`-Schaltfläche und wählt `Go Test` aus.

![image](/images/ide/test-before-commit-1742826870981.png)

Ich habe in der Standardkonfiguration nichts verändert und einfach auf `Apply` - `OK` geklickt, um die Einstellungen abzuschließen.  
> Wenn es spezielle Konfigurationen oder Einstellungen gibt, die man verwendet, kann man diese hinzufügen und anwenden.

![image](/images/ide/test-before-commit-1742826991884.png)

### +ɑ) Beispiel Java

![image](/images/ide/test-before-commit-1742826813878.png)

## Tests vor dem Commit ausführen

Zuerst setzt man in `Settings` - `Version Control` - `Commit` ein Häkchen bei `Run Tests`.
![image](/images/ide/test-before-commit-1742826358977.png)

Dann wählt man im Dropdown-Menü `Choose configuration` den gerade hinzugefügten Test aus.

![image](/images/ide/test-before-commit-1742827116091.png)

![image](/images/ide/test-before-commit-1742827169853.png)

Damit kann man die Tests vor dem Commit ausführen.

Wenn man einen Commit mit den Tests durchführt, sieht man, dass die Tests wie folgt laufen:

![image](/images/ide/test-before-commit-1742827244925.png)