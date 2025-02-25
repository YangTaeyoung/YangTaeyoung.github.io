---
title: Unterschied zwischen log.Fatal() und panic() in Golang verstehen
type: blog
date: 2025-02-11
comments: true
translated: true
---

## "In diesem Fall scheint es besser zu sein, `panic()` statt `log.Fatal()` zu verwenden"
Kürzlich erhielt ich das oben genannte Feedback, als ich `log.Fatal()` verwendete.

Hm? Ich dachte, `log.Fatal()` gibt einfach nur die Logs besser aus, oder? 

Offen gesagt, habe ich erst kürzlich den Unterschied zwischen `log.Fatal()` und `panic()` in Golang verstanden, und ich möchte dies nun zusammenfassen.

## Unterschiede zwischen log.Fatal() und panic()
`log.Fatal()` und `panic()` sind beides Funktionen, die das Programm beenden. Schauen wir uns den Code an:

```go
package main

import (
    "log"
	"log/slog"
)

func RunWithFatal() {
	log.Fatal("This is a fatal error")
}

func main() {
	RunWithFatal()

	slog.Info("This is not executed")
}
```

Wenn Sie den oben genannten Code ausführen, sehen Sie folgendes Ergebnis:

```shell
2025/02/11 20:02:31 This is a fatal error
```

Schauen wir uns nun den Code mit `panic()` an.

```go
package main

import (
    "log/slog"
)

func RunWithPanic() {
    panic("This is a panic error")
}

func main() {
    RunWithPanic()

    slog.Info("This is not executed")
}
```

Beim Ausführen des obigen Codes sehen Sie folgendes Ergebnis:

```shell
panic: This is a panic error

goroutine 1 [running]:
main.RunWithPanic(...)
	/Users/code_kirin/dev/personal/awesomeProject6/main.go:8
main.main()
	/Users/code_kirin/dev/personal/awesomeProject6/main.go:12 +0x30
```

Wie Sie sehen, gibt `log.Fatal()` den Fehler aus und beendet das Programm. `panic()` macht dasselbe, gibt jedoch auch einen Stack-Trace aus.

### Wiederherstellung mit recover()
Während `panic()` das Programm beendet, kann es mit `recover()` wiederhergestellt werden, ohne das Programm zu beenden.

Auch wenn es ideal wäre, wenn es keinen Grund für Panik geben würde, machen Entwickler natürlich Fehler. Deshalb wird häufig Middleware implementiert, die Panik mit `recover()` abfängt, um unerwartete Server-Abstürze, insbesondere bei API-Servern, zu verhindern.

Um den Unterschied klar zu machen, versuchen wir `log.Fatal()` mit `recover()` wiederherzustellen.
```go
package main

import (
    "log"
    "log/slog"
)

func RunWithFatal() {
    log.Fatal("This is a fatal error")
}

func main() {
    defer func() {
        if r := recover(); r != nil {
            slog.Info("Recovered from", "error", r)
        }
    }()

    RunWithFatal()

    slog.Info("This is not executed")
}
```

Beim Ausführen dieses Codes sehen Sie folgendes Ergebnis:

```shell
2025/02/11 20:07:49 This is a fatal error
```

Die Wiederherstellung war nicht erfolgreich. Versuchen wir nun dasselbe mit `panic()` und `recover()`:

```go
package main

import (
	"log/slog"
	"runtime/debug"
)

func RunWithPanic() {
	panic("This is a panic error")
}

func main() {
	defer func() {
		if r := recover(); r != nil {
			slog.Info("Recovered from", "error", r)
			debug.PrintStack()
		}
	}()

	RunWithPanic()
}
```

Beim Ausführen dieses Codes sehen Sie folgendes Ergebnis:

```shell
2025/02/11 20:09:51 INFO Recovered from error="This is a panic error"
goroutine 1 [running]:
runtime/debug.Stack()
	/opt/homebrew/opt/go/libexec/src/runtime/debug/stack.go:26 +0x64
runtime/debug.PrintStack()
	/opt/homebrew/opt/go/libexec/src/runtime/debug/stack.go:18 +0x1c
main.main.func1()
	/Users/code_kirin/dev/personal/awesomeProject6/main.go:16 +0x8c
panic({0x1004d6560?, 0x1004f4190?})
	/opt/homebrew/opt/go/libexec/src/runtime/panic.go:785 +0x124
main.RunWithPanic(...)
	/Users/code_kirin/dev/personal/awesomeProject6/main.go:9
main.main()
	/Users/code_kirin/dev/personal/awesomeProject6/main.go:20 +0x4c
```

Um den Stack-Trace erneut zu sehen, haben wir `debug.PrintStack()` verwendet, was allerdings nicht notwendig ist.
> In Middleware werden oft solche Stack-Traces dokumentiert, damit Entwickler bei ernsthaften Vorfällen schneller benachrichtigt werden.

Mit der `debug.Stack()` Methode kann der Stack-Trace bearbeitet werden, ohne ihn über Stderr auszugeben.

## Zweck
`log.Fatal()` ruft intern `os.Exit(1)` auf.

Es wurde entwickelt, um das Programm sofort mit einem Fehlercode zu beenden, und daher kann es nicht mit `recover()` wiederhergestellt werden.

Auf der anderen Seite kann `panic()` mit `recover()` wiederhergestellt werden.

Sollte eine unvorhergesehene Situation auftreten, in der Sie wiederherstellen können, ist es besser `panic()` zu verwenden.

Generell ist es in Bibliotheksfunktionen oder spezifischen Paketfunktionen besser, `panic()` zu verwenden. (Wenn ein Server wegen einer Bibliothek abstürzt und nicht wiederhergestellt werden kann, sind die Folgen verheerend.)

`log.Fatal()` wird am besten in `main()` Funktionen verwendet, wo der `error` letztendlich behandelt wird.

Ein Beispiel ist das Auslösen einer Fehlermeldung während der Initialisierungsphase von Abhängigkeiten. Das Modul sollte den Fehler zurückgeben und die `main()` Funktion ruft dann `log.Fatal()` auf.

Die Struktur wäre wie folgt:
> Dies ist nur ein einfaches Schema. Nur als Referenz.
```go
package main

type Dependencies struct {
	DB *sql.DB
	redis *redis.Client
	...
}

func NewDependencies() (*Dependencies, error) {
    db, err := sql.Open("mysql", "user:password@/dbname")
    if err != nil {
        return nil, err
    }

    redis := redis.NewClient(&redis.Options{
        Addr: "localhost:6379",
    })
	
    if err = redis.Ping().Err(); err != nil {
        return nil, err
    }

    return &Dependencies{
        DB: db,
        redis: redis,
    }, nil
    
}


func main() {
    deps, err := NewDependencies()
    if err != nil {
        log.Fatal(err)
    }
	
	// ...
}
```

## + `log.Panic()`
Das `log` Paket hat auch eine Funktion namens `log.Panic()`.

Diese Funktion kombiniert das Protokollierungsfeature mit `panic()`. Wird der folgende Code ausgeführt:

```go
package main

import (
	"log"
	"log/slog"
	"runtime/debug"
)

func RunWithPanic() {
	log.Panic("This is a panic error")
}

func main() {
	defer func() {
		if r := recover(); r != nil {
			slog.Info("Recovered from", "error", r)
			debug.PrintStack()
		}
	}()

	RunWithPanic()
}

```

sehen Sie diese Ausgabe:
```shell
2025/02/11 20:23:17 This is a panic error
2025/02/11 20:23:17 INFO Recovered from error="This is a panic error"
goroutine 1 [running]:
runtime/debug.Stack()
	/opt/homebrew/opt/go/libexec/src/runtime/debug/stack.go:26 +0x64
runtime/debug.PrintStack()
	/opt/homebrew/opt/go/libexec/src/runtime/debug/stack.go:18 +0x1c
main.main.func1()
	/Users/code_kirin/dev/personal/awesomeProject6/main.go:17 +0x8c
panic({0x100ad24e0?, 0x140000100a0?})
	/opt/homebrew/opt/go/libexec/src/runtime/panic.go:785 +0x124
log.Panic({0x1400010af20?, 0x0?, 0x68?})
	/opt/homebrew/opt/go/libexec/src/log/log.go:432 +0x60
main.RunWithPanic(...)
	/Users/code_kirin/dev/personal/awesomeProject6/main.go:10
main.main()
	/Users/code_kirin/dev/personal/awesomeProject6/main.go:21 +0x60
```

Im Vergleich zu `panic()` fügt `log.Panic()` eine Protokollfunktion hinzu. Es löst `panic()` aus, zeichnet jedoch auch die Protokolle auf.

## Referenz
- https://pkg.go.dev/log#Fatal
- Dank an den Chef für die Code-Review
