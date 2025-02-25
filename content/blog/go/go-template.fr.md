---
title: Utiliser les Templates dans Golang (Go Template)
type: blog
date: 2023-09-23
comments: true
translated: true
---
## Go Template
Golang dispose d'une fonctionnalité appelée Go Template qui permet de lier ou de manipuler diverses données selon un format spécifié, pour les exporter sous forme de chaînes de caractères.

### Package `text/template`
- Il s'agit de deux bibliothèques standard pour gérer les templates basés sur du texte. Elles sont souvent utilisées pour générer du texte suivant un format spécifié ou une logique particulière.
- Un exemple d'utilisation du package `text/template` pour exporter du texte selon un format prédéfini est présenté ci-dessous.

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

Comme vous pouvez le voir dans le code, on peut facilement deviner que les champs `Name` et `Age` de la structure `Person` seront liés à chaque élément de la chaîne de template `"Hello {{.Name}}, you are {{.Age}} years old.\n"`.

En exécutant ce code, vous obtiendrez le résultat suivant :

### Résultat
```
Hello GiraffeWithCode, you are 27 years old.
```

### Boucles
Les boucles peuvent également être implémentées en utilisant `range`.

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

### Résultat
```
Hello GiraffeWithCode, you are 27 years old. You have BMW, Audi, Benz,
```

### Conditions
Les structures conditionnelles peuvent être implémentées en utilisant `if`.

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

### Résultat
```
Hello GiraffeWithCode, you are 27 years old. You have BMW, Audi, Benz
```

## `text/template` vs `html/template`
Les packages `text/template` et `html/template` sont tous deux destinés à gérer des templates basés sur du texte.

La principale différence entre ces deux packages réside dans leur sécurité dans un contexte HTML.
1. **`text/template`:** est conçu pour traiter du texte ordinaire. En utilisant ce package, vous pouvez traiter le texte des templates, mais les chaînes générées ne subissent pas d'échappement particulier si elles doivent être utilisées comme HTML.

2. **`html/template`:** est conçu pour gérer en toute sécurité le contenu HTML. Ce package échappe automatiquement les chaînes dans les contextes HTML, JavaScript, CSS, URL, etc., pour prévenir des attaques web telles que les Cross-Site Scripting (XSS). (Il peut être comparé au rôle joué par certaines bibliothèques JS comme [DOMPurify](https://github.com/cure53/DOMPurify).)

## Références
- [Travailler avec text/template et html/template](https://subscription.packtpub.com/book/programming/9781789800982/1/ch01lvl1sec08/working-with-text-template-and-html-template)