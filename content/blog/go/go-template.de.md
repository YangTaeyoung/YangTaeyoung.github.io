---
title: Verwendung von Templates in Golang (Go Template)
type: blog
date: 2023-09-23
comments: true
translated: true
---
## Go Template

In Golang gibt es eine Funktion namens Go Template, die es ermöglicht, verschiedene Daten gemäß einem festgelegten Format zu binden oder manipulierte Zeichenfolgen auszugeben.

### `text/template` Paket
- Es gibt zwei Standardbibliothekspakete zur Verarbeitung von textbasierten Templates, die häufig verwendet werden, wenn Text nach einem bestimmten Format oder einer bestimmten Logik generiert werden muss.
- Ein Beispiel für die Ausgabe von Text im festgelegten Format mithilfe des Pakets `text/template` ist unten dargestellt.

```go
package main 

import ( 
	"os" 
	"log"
	"text/template" 
) 

type Person struct { 
	Name string 
	Age int 
} 

func main() { 
	t := template.New("hello") 
	t, err = t.Parse("Hello {{.Name}}, you are {{.Age}} years old.\n") 
	if err != nil {
		log.Error(err)
	}
	p := Person{Name: "GiraffeWithCode", Age: 27} 
	t.Execute(os.Stdout, p) 
}
```

Wie im Code sichtbar, ist es leicht zu erkennen, dass in der Struktur `Person` die Felder `Name` und `Age` als Elemente in die Template-Zeichenkette `"Hello {{.Name}}, you are {{.Age}} years old.\n"` gebunden werden.

Führt man den obigen Code aus, erhält man folgendes Ergebnis:

### Ergebnis
```
Hello GiraffeWithCode, you are 27 years old.
```

### Schleifen
Auch Schleifen können mit `range` implementiert werden.

```go
package main

import (
    "os"
    "log"
    "text/template"
)

type Person struct {
    Name string
    Age  int
    Cars []string
}

const (
	tmpl = `Hello {{.Name}}, you are {{.Age}} years old. You have {{range .Cars}}{{.}}, {{end}}`
)

func main() {
    t := template.New("hello")
    t, err := t.Parse("Hello {{.Name}}, you are {{.Age}} years old.\n")
    if err != nil {
        log.Fatal(err)
    }

    t, err = t.Parse("")
    if err != nil {
        log.Fatal(err)
    }

    p := Person{Name: "GiraffeWithCode", Age: 27, Cars: []string{"BMW", "Audi", "Benz"}}
    t.Execute(os.Stdout, p)
}
```

### Ergebnis
```
Hello GiraffeWithCode, you are 27 years old. You have BMW, Audi, Benz,
```

### Bedingungsanweisungen
Bedingungen können mit `if` implementiert werden.

```go
package main

import (
    "os"
    "log"
    "text/template"
)

type Person struct {
    Name string
    Age  int
    Cars []string
}

const (
    tmpl = `Hello {{.Name}}, you are {{.Age}} years old. You have {{range .Cars}}{{.}}, {{end}}{{if .Cars}}{{else}}no car{{end}}`
)

func main() {
    t := template.New("hello")
    t, err := t.Parse(tmpl)
    if err != nil {
        log.Fatal(err)
    }

    p := Person{Name: "GiraffeWithCode", Age: 27, Cars: []string{"BMW", "Audi", "Benz"}}
    t.Execute(os.Stdout, p)
}
```

### Ergebnis
```
Hello GiraffeWithCode, you are 27 years old. You have BMW, Audi, Benz
```

## `text/template` vs `html/template`
Die `text/template` und `html/template` Pakete sind beide Standardbibliotheken zur Verarbeitung von textbasierten Templates.

Der Hauptunterschied zwischen diesen beiden Paketen liegt in der Sicherheit im HTML-Kontext.
1. **`text/template`:** Entwickelt zur Verarbeitung von normalem Text. Man kann damit Template-Text verarbeiten, es findet jedoch keine spezielle Escape-Behandlung statt, wenn die generierte Zeichenfolge als HTML verwendet wird.

2. **`html/template`:** Entwickelt zur sicheren Verarbeitung von HTML-Inhalten. Dieses Paket führt automatisch Escape-Operationen durch, um sichere Zeichenfolgen in HTML, JavaScript, CSS, URL-Kontexten zu gewährleisten und Angriffe wie Cross-Site Scripting (XSS) zu verhindern. (Ähnlich wie die Rolle von [DOMPurify](https://github.com/cure53/DOMPurify) in JS-Bibliotheken.)

## Referenz
- [Arbeiten mit text/template und html/template](https://subscription.packtpub.com/book/programming/9781789800982/1/ch01lvl1sec08/working-with-text-template-and-html-template)