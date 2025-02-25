---
title: Testen ohne Cache in Golang
type: blog
date: 2025-02-14
comments: true
translated: true
---
![image](/images/go/go-test-without-cache-1739518633592.png)

Beim Testen in Golang wird der Test ab dem zweiten Durchlauf sehr schnell.

**1. Durchlauf**
```shell
ok      github.com/my/package/test    126.752s
```
**2. Durchlauf**
```shell
ok      github.com/my/package/test    (cached)
```
Im ersten Durchlauf dauerte es über 2 Minuten, aber beim zweiten Durchlauf war der Test blitzschnell abgeschlossen, ohne dass man die Zeit messen konnte.

Tatsächlich hat sich leistungstechnisch nichts geändert, sondern **weil das Testergebnis bei unverändertem Code erneut aus dem Cache verwendet wird**.

## Integrationstests
Integrationstests bedeuten, dass mehrere Komponenten zusammengefasst und getestet werden.

Im Gegensatz zum hauptsächlich Mocking-basierten Unit-Test werden bei Integrationstests reale Komponenten getestet, was zu einer langsameren Ausführungsgeschwindigkeit führt.

In einem API-Server werden solche Integrationstests jedoch häufig verwendet, da sie das Verhalten der Benutzer am realistischen abbilden können.

Bei Integrationstests gibt es Zeiten, in denen cacherelevante Teile ausgeschlossen werden müssen.

### Warum ohne Cache bei Integrationstests testen?
Das trifft nicht auf alle Integrationstests zu. Tatsächlich kann bei Tests, die Idempotenz garantieren, der Cache bedenkenlos verwendet werden.

Wenn keine externen Dienste verwendet werden und solche Elemente aus den Tests ausgeschlossen sind, kann der Cache ebenfalls genutzt werden. (In solchen Fällen sollte er sogar verwendet werden, um die Testzeit zu verkürzen.)

Aber wenn viele externe Dienste verwendet werden, die Tests keine Idempotenz garantieren (wenn sich die Ergebnisse jedes Mal ändern) und viele Anpassungen aufgrund von Änderungen externer Dienste erforderlich sind, ist es besser, Tests jedes Mal auszuführen, anstatt sich auf gecachte Ergebnisse zu verlassen.

## Testen ohne Cache
Der Grund war lang, aber die Methode, den Cache nicht zu verwenden, ist sehr einfach. Verwenden Sie die `-count 1` Flagge bei go test.
```shell
go test -count 1 -v ./...
```

Auf diese Weise kann der Test ohne Verwendung des Caches jedes Mal ausgeführt werden.

### Warum `-count 1`?
`-count 1` ist tatsächlich kein Befehl, der sagt, dass der Cache verwendet oder nicht verwendet werden soll. Es gibt einfach an, wie oft der Test ausgeführt werden soll.

Laut [offizieller Dokumentation](https://pkg.go.dev/cmd/go#hdr-Testing_flags) ist der Standardwert ebenfalls 1, daher sollte diese Option dasselbe Verhalten haben, selbst wenn sie weggelassen wird.
```
-count n
    Führen Sie jeden Test, Benchmark und Fuzz-Seed n Mal aus (Standard 1).
    Wenn -cpu eingestellt ist, führen Sie n-mal für jeden GOMAXPROCS-Wert aus.
    Beispiele werden immer einmal ausgeführt. -count gilt nicht für
    Fuzz-Tests, die mit -fuzz übereinstimmen.
```

Doch diese Option hat nicht dasselbe Verhalten.

Ob beabsichtigt oder nicht, die offizielle Dokumentation weist darauf hin, dass `-count 1` als herkömmliche Methode zur Deaktivierung des Cachings verwendet werden sollte.
> _"The idiomatic way to disable test caching explicitly is to use -count=1."_

## Schlusswort
Tatsächlich halte ich die Entscheidung des Caching-Status mit einer Option wie `-count 1` für einen Design-Fehler.
> Im Allgemeinen denken die Leute, dass es nicht nötig ist, denselben Wert wie die Standardoption anzugeben.

Es könnte fast als Bug angesehen werden, und ich verstehe nicht, warum Go diesen Ansatz beibehält. Wäre es nicht klarer, ein Flag wie `-no-cache` zu implementieren?