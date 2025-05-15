---
title: Code Generierung mit Go Generate
type: blog
date: 2025-05-15
comments: true
translated: true
---
![image](/images/go/go-generate-1747269173961.png)

Go hat aus seiner Natur heraus häufig Boilerplate-Code, im Vergleich zu anderen Programmiersprachen. Um beispielsweise einen gewöhnlichen Getter/Setter zu erstellen, kann man in Java Werkzeuge wie [`Lombok`](https://projectlombok.org/) verwenden, oder für das Mocking Werkzeuge wie [`Mockito`](https://site.mockito.org/).

Beide Bibliotheken nutzen den Java Annotation Processor, um Code zu generieren, jedoch erstellt der Entwickler den Code nicht selbst.

Im Gegensatz dazu hat Go, anders als Java, keinen Annotation Processor. In der Regel muss ein CLI-Tool direkt installiert werden, um Code zu generieren, und der Code muss dann über das CLI erzeugt werden. Ich benutze in meinem Fall die [`swaggo`](https://github.com/swaggo/swag) Bibliothek, um Swagger zu verwenden. Diese Bibliothek analysiert auch den internen Code, um die Swagger-Dokumentation `docs.json` zu erzeugen.

Darüber hinaus können verschiedene CLI-Tools verwendet werden, um Code zu generieren, um GRPC zu nutzen, indem protoc verwendet wird, oder um Mock-Interfaces zu generieren, indem mockery verwendet wird.

## Code Generierung mit Makefile

Der Befehl von swag, den ich verwende, sieht folgendermaßen aus:
```bash
swag init -g ./cmd/main.go -o ./docs
```

Da ich mir nicht immer solche Befehle merken kann und meine Finger faul sind, verwende ich normalerweise Alisa oder Tools wie Makefile.

Die Verwendung von Makefile zur Codegenerierung sieht so aus:
```makefile
.PHONY: swag
swag:
    @swag init -g ./cmd/main.go -o ./docs
```
So kann der Code durch den Befehl `make swag` erstellt werden.

## Code Generierung mit Go Generate

Go hat anscheinend auch eine Grenze beim Erzeugen von Code gesehen und bietet ein Werkzeug namens [`go generate`](https://pkg.go.dev/cmd/go#hdr-Generate_Go_files_by_processing_source) an, um Code zu generieren.

Go Generate ist ein Tool, das durch das Schreiben von Kommentaren in Go-Quelldateien Befehle hinzufügt, um Code zu generieren.

Wenn wir swag als Beispiel nehmen, könnte es so geschrieben werden:
```go{filename="somefile.go"}
//go:generate swag init -g ./cmd/main.go -o ./docs
```

Wenn dies geschrieben ist, kann der Code durch den Befehl `go generate ./somefile.go` generiert werden.

Wenn man nicht direkt eine Datei angeben möchte, kann man auch einen Befehl einrichten, der alle Go-Dateien im Projekt durchsucht und das `//go:generate` ausführt, wenn es vorhanden ist.

```bash
go generate ./...
```
> In der Praxis wird diese Methode am häufigsten verwendet.

## Wichtige Hinweise

Die Ausführung von Go Generate geschieht im Verzeichnis der betreffenden Datei. Daher müssen viele CLI-Tools, die relative Pfade verwenden, beim Einsatz von Go Generate auf die Pfade achten.

Angenommen, wir haben die folgende Struktur und es gibt ein `go:generate` in der Datei foo/bar.go:
```go{filename="foo/bar.go"}
//go:generate swag init -g ./cmd/main.go -o ./docs
```

{{< filetree/container >}}
    {{< filetree/folder name="foo">}}
        {{< filetree/file name="bar.go">}}
    {{< /filetree/folder >}}
    {{< filetree/folder name="cmd" >}}
        {{< filetree/file name="main.go" >}}
    {{< /filetree/folder >}}
{{< /filetree/container >}}

In diesem Fall würde die Ausführung des Befehls `go generate ./...` einen Fehler verursachen, da der Pfad `./cmd/main.go` nicht gefunden werden kann.
Außerdem ist der Ausgabepfad `./docs` ebenfalls relativ und wird in `foo/docs` erstellt.

Daher sollte beim Einsatz von Go Generate Vorsicht geboten sein, wenn relative Pfade verwendet werden.
```go
//go:generate swag init -g ../cmd/main.go -o ../docs
```

## Referenzen
- [Go Generate](https://pkg.go.dev/cmd/go#hdr-Generate_Go_files_by_processing_source)