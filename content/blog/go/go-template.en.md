---
title: Using Templates in Golang (Go Template)
type: blog
date: 2023-09-23
comments: true
translated: true
---
## Go Template
Golang provides a feature called Go Template, which allows binding various data or exporting manipulated strings according to a specified format.

### `text/template` package
- This package is one of the two standard library packages used for processing text-based templates and is commonly used when text needs to be generated according to a fixed format or specific logic.
- An example of using the `text/template` package to export text according to a fixed format is shown below.

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

As seen in the code, it is easy to guess that each field like `Name` and `Age` in the `Person` struct will be bound to each element of the template string `"Hello {{.Name}}, you are {{.Age}} years old.\n"`.

Running the above code will yield the following result.

### Result
```
Hello GiraffeWithCode, you are 27 years old.
```

### Loops
Loops can also be implemented using `range`.

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

### Result
```
Hello GiraffeWithCode, you are 27 years old. You have BMW, Audi, Benz,
```

### Conditionals
Conditionals can be implemented using `if`.

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

### Result
```
Hello GiraffeWithCode, you are 27 years old. You have BMW, Audi, Benz
```

## `text/template` vs `html/template`
Both the `text/template` package and the `html/template` package are standard libraries used for processing text-based templates.

The main difference between these two packages lies in their safety in the context of HTML.
1. **`text/template`:** Designed to handle plain text. Templates processed using this package will not have special escape processing if the generated strings are used as HTML.

2. **`html/template`:** Designed to securely handle HTML content. This package automatically escapes strings safely in the context of HTML, JavaScript, CSS, URLs, etc., to prevent web attacks like Cross-Site Scripting (XSS). (It performs a similar role to the JS library [DOMPurify](https://github.com/cure53/DOMPurify).)

## Reference
- [Working with text/template and html/template](https://subscription.packtpub.com/book/programming/9781789800982/1/ch01lvl1sec08/working-with-text-template-and-html-template)