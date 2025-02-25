---
title: Erstellen eines robusten Servers mit Singleflight in Golang bei doppelten Anfragen
type: blog
date: 2025-02-10
comments: true
translated: true
---
Kürzlich hat mein Unternehmen geschlossen, und ich arbeite vorübergehend als Freiberufler.

Glücklicherweise habe ich einen hervorragenden Mentor kennengelernt, von dem ich viele Fähigkeiten über Go oder Web gelernt habe. Eine dieser Fähigkeiten war die Optimierung mit dem Singleflight-Paket.

![image](/images/go/singleflight-1739191305077.png)

## Singleflight?
Wörtlich übersetzt bedeutet es „Einzelflug“. Tatsächlich muss man es nicht kompliziert verstehen, denn es garantiert eine einzelne Ausführung.

Ein Beispiel macht es noch einfacher, werfen wir einen Blick auf den folgenden Code:

```go
package main

import (
	"log/slog"
	"time"
	
)


var counter int

func DoSomething() {
	time.Sleep(5 * time.Second)

	counter++

	slog.Info("result", "counter", counter)
}

func main() {
	for i := 0; i < 10; i++ {
		go DoSomething()
	}

	time.Sleep(10 * time.Second)
}
```

```shell
2025/02/10 20:49:22 INFO result counter=3
2025/02/10 20:49:22 INFO result counter=4
2025/02/10 20:49:22 INFO result counter=10
2025/02/10 20:49:22 INFO result counter=5
2025/02/10 20:49:22 INFO result counter=2
2025/02/10 20:49:22 INFO result counter=6
2025/02/10 20:49:22 INFO result counter=7
2025/02/10 20:49:22 INFO result counter=9
2025/02/10 20:49:22 INFO result counter=1
2025/02/10 20:49:22 INFO result counter=8
```
Wie zu erwarten, wird die Reihenfolge bei Goroutinen nicht garantiert, aber der Zähler erreicht 10.

In diesem Beispiel wird die `DoSomething()`-Funktion als eine beschäftigte Funktion (lange Ausführungszeit und hoher Ressourcenverbrauch) angenommen.

Was passiert, wenn es eine solche Funktion auf dem Server gibt und doppelte Anfragen auftreten?
> Es besteht eine sehr hohe Wahrscheinlichkeit, dass der Server abstürzt.

In solchen Fällen kann das `singleflight`-Paket effektiv genutzt werden, um Optimierungen zu erreichen.

Singleflight garantiert, dass nur eine einzige Funktion ausgeführt wird und gibt dasselbe Ergebnis für alle Anfragen, die in diesem Zeitraum eintreffen, zurück.

### Verwendung von Singleflight
Zuerst installieren wir das Singleflight-Paket:
```shell
go get -u golang.org/x/sync/singleflight
```

Dann ändern wir den Code wie folgt:
```go
package main

import (
	"log/slog"
	"time"

	"golang.org/x/sync/singleflight"
)

var counter int

func DoSomething(group *singleflight.Group) {
	res, err, shared := group.Do("key", func() (interface{}, error) {
		time.Sleep(5 * time.Second)

		counter++
		return counter, nil
	})
	if err != nil {
		slog.Error("error", "err", err)
	}

	slog.Info("result", "res", res, "shared", shared)
}

func main() {
	group := singleflight.Group{}
	for i := 0; i < 10; i++ {
		go DoSomething(&group)
	}

	time.Sleep(10 * time.Second)
}
```
```shell
2025/02/10 20:43:25 INFO result res=1 shared=true
2025/02/10 20:43:25 INFO result res=1 shared=true
2025/02/10 20:43:25 INFO result res=1 shared=true
2025/02/10 20:43:25 INFO result res=1 shared=true
2025/02/10 20:43:25 INFO result res=1 shared=true
2025/02/10 20:43:25 INFO result res=1 shared=true
2025/02/10 20:43:25 INFO result res=1 shared=true
2025/02/10 20:43:25 INFO result res=1 shared=true
2025/02/10 20:43:25 INFO result res=1 shared=true
2025/02/10 20:43:25 INFO result res=1 shared=true
```

Obwohl es in einem Goroutine ausgeführt wurde, bleibt das Ergebnis `res=1` und der Zähler wird nur um 1 erhöht.
> Weil es nur einmal ausgeführt wurde.

Der Parameter `"key"` bestimmt das Kriterium für die gleichzeitige Ausführung. Da es ein fester Schlüssel ist, wird immer nur eine Ausführung garantiert.

Möchte man die doppelte Ausführung anhand eines bestimmten Parameters (z.B. User ID) verhindern, kann man `"key"` durch den gewünschten Parameter ersetzen.

## Anwendung auf HTTP-Server
Singleflight kann auch für HTTP-Server verwendet werden.

Wenden wir es einfach mit dem `net/http`-Paket wie folgt an:

```go
package main

import (
	"log"
	"log/slog"
	"net/http"
	"time"

	"golang.org/x/sync/singleflight"
)

func HandleBusyLogic(group *singleflight.Group) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		res, err, _ := group.Do("key", func() (interface{}, error) {
			time.Sleep(5 * time.Second)
			slog.Info("Hello, World!")
			return "Hello, World!", nil
		})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Write([]byte(res.(string)))
	})
}

func main() {

	mux := http.NewServeMux()
	group := singleflight.Group{}
	mux.Handle("GET /", HandleBusyLogic(&group))

	s := &http.Server{
		Addr: "0.0.0.0:8080",
	}

	s.Handler = mux

	slog.Info("Server started", "addr", s.Addr)
	if err := s.ListenAndServe(); err != nil {
		log.Fatalf("ListenAndServe: %v", err)
	}
}
```

Abgesehen vom Handler ist es grundsätzlich das gleiche. Die Gruppenvariable wird als Parameter empfangen, um die `Do`-Funktion auszuführen.

Der Client-Code kann ebenfalls wie folgt erstellt werden:
```go
package main

import (
	"io"
	"log/slog"
	"net/http"
	"sync"
)

func main() {
	var wg sync.WaitGroup
	for i := 0; i < 5; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			response, err := http.Get("http://localhost:8080")
			if err != nil {
				slog.Error("failed to get response", "err", err)
				return
			}

			bodyByte, err := io.ReadAll(response.Body)
			if err != nil {
				slog.Error("failed to read body", "err", err)
				return
			}

			slog.Info("response", "body", string(bodyByte))
		}()
	}

	wg.Wait()
}
```

Wenn der Server läuft und man es ausführt, sieht man bei der Serverseite den Log nur einmal auftreten:
```shell
2025/02/10 21:09:31 INFO Server started addr=0.0.0.0:8080
2025/02/10 21:10:17 INFO Hello, World!
```

Auf der Clientseite erhält man für alle 5 Anfragen die gleiche Antwort:
```shell
2025/02/10 21:10:17 INFO response body="Hello, World!"
2025/02/10 21:10:17 INFO response body="Hello, World!"
2025/02/10 21:10:17 INFO response body="Hello, World!"
2025/02/10 21:10:17 INFO response body="Hello, World!"
2025/02/10 21:10:17 INFO response body="Hello, World!"
```

Mit dem Singleflight-Paket kann so ein Server erstellt werden, der doppelte Anfragen standhält.

Es stellt sich jedoch die Frage:

## Könnte man nicht einfach Cache verwenden?
Richtig. Wie im [vorherigen Beitrag](/blog/spring/spring-redis-cache/) erwähnt, kann man für gleiche Anfragen auch Cache verwenden, um viele Anfragen effektiv zu lösen.

Allerdings gibt es Unterschiede in der Rolle.

### Cache

Cache garantiert keine Einzel-Ausführung und ist anfällig in Situationen vor dem Caching oder wenn ein Cache-Miss nach dem Ablauf auftritt.

Solche Funktionen werden oft für langwierige oder ressourcenintensive Arbeiten eingesetzt, was gleichzeitig eintreffende Anfragen besonders gefährlich macht.

Bei einem Cache-Hit wäre er jedoch schneller als ein Singleflight.

![image](/images/go/singleflight-1739189940786.png)

### Singleflight

Im Gegensatz dazu garantiert Singleflight eine einzige Ausführung, selbst bei einem Cache-Miss, was die Serverbelastung minimiert.

Als nicht-Caching-System muss die Funktion nach Abschluss erneut ausgeführt werden, was insgesamt langsamer als ein Cache sein könnte.

Daher wäre die gleichzeitige Nutzung von Singleflight und Cache die beste Lösung.

## Lock
Es gibt auch Methoden, um externe Sperren außer Singleflight zu verwenden. Diese sind besonders nützlich, wenn nur ein einziger Container in einer Multicontainer-Umgebung laufen soll.

In solchen Fällen könnte es schwierig sein, das Ergebnis zu vervielfältigen (aber nicht unmöglich, es sei denn, es wird gewartet, bis eine Sperre auftritt, und der zwischengespeicherte Antwort ist für andere Container zugänglich).

Allerdings ist es oft nicht zwingend erforderlich, strenge Sperren anzuwenden, und einfachere Werkzeuge wie Singleflight genügen in den meisten alltäglichen Situationen.

## Könnte man Queue verwenden?
Wie in der [EDA](/blog/web/eda/) beschrieben, lassen sich Events mit einer Queue in Reihenfolge verarbeiten, was auch eine effektive Möglichkeit zur Lastbewältigung ist, jedoch mit unterschiedlichem Zweck.

Queue ist effektiver bei der Verarbeitung unterschiedlicher Anfragen, z.B. alle Anfragen an einen externen Dienst in einer Queue zu bündeln.

Dagegen ist Singleflight ideal für die Behandlung identischer Anfragen geeignet. Es wäre gut, es bei fast identischen Anfragen wie Server-Metadaten oder Crawling-Anfragen zu verwenden.


### Abschließend
Obwohl es ein x-Paket ist, wird es von Golang direkt angeboten, was überraschend war. Bei anderen Sprachen gibt es für solche Funktionen keine Standardschnittstelle. Es scheint, als ob Golang auch solche Details berücksichtigt.

Es könnte als Middleware geformt werden, so dass fast jede API mit Cache es nutzen könnte. Es sollte besonders bei langwierigen Aufgaben effektiv sein.

Wenn man nach einer Lösung sucht, um die Komplexität zu reduzieren und die Last auf den Server zu minimieren, sollte man Singleflight ausprobieren!

## Referenzen
- https://pkg.go.dev/golang.org/x/sync/singleflight
- https://velog.io/@divan/singleflight%EB%A5%BC-%ED%99%9C%EC%9A%A9%ED%95%9C-%EC%B5%9C%EC%A0%81%ED%99%94
- https://www.codingexplorations.com/blog/understanding-singleflight-in-golang-a-solution-for-eliminating-redundant-work