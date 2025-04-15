---
title: Untersuchung von Methoden um Dateien in Go mit embed zu laden
type: blog
date: 2025-04-16
comments: true
translated: true
---

Es gibt verschiedene Möglichkeiten, Dateien in Go zu laden.

Man kann Dateien mittels `os.ReadFile()` lesen oder das `embed`-Paket verwenden, um sie einzubinden.

Obwohl die Verwendungszwecke leicht unterschiedlich sind, ist das `embed`-Paket besonders nützlich, da es ermöglicht, Dateien bereits beim Build einzubinden – was vor allem bei der Distribution von Vorteil ist.

Betrachten wir ein einfaches Beispiel: Erstellen wir eine txt-Datei wie folgt

```txt{filename="hello.txt"}
Hello, World!
```

Nun holen wir uns diese Datei mittels des `embed`-Pakets:

```go{filename="main.go"}
package main

import (
    "fmt"
    _ "embed"
)

//go:embed hello.txt
var content string

func main() {
    fmt.Println(content)
}
```

Wird der obige Code ausgeführt, erhält man folgendes Ergebnis:

```shell
Hello, World!
```

Es können nicht nur `txt`-Dateien eingebunden werden, sondern praktisch alle Dateitypen wie `html`, `css`, `js`, `yaml` usw.

Allerdings sollte man beachten, dass das Einbinden sehr großer Dateien zu einem erheblichen Speicherverbrauch führen kann.