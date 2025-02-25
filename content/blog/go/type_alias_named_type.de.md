---
layout: post
title: Unterschiede zwischen Type Alias und Named Type verstehen (Golang)
date: 2023-10-13
comments: true
translated: true
---
Beide sind Methoden zur Neudefinition bestehender Typen bei der Typdefinition und werden wie folgt definiert.

```go
type MyStruct struct {
    Name string
    Age int
}

func(m MyStruct) Print(){
    fmt.Println(m.Name, m.Age)
}

type MyStructNamed MyStruct // Named Type
type MyStructAlias = MyStruct // Type Alias
```

## Type Alias
Bei einem Type Alias bleibt der bestehende Typ unverändert, da ein Alias für den bestehenden Typ erstellt wird. Daher besitzt er die gleichen Methoden wie der ursprüngliche Typ.

```go
package main

func main() {
    var m MyStructAlias
    m.Name = "GiraffeWithCode"
    m.Age = 27
    m.Print()
	// GiraffeWithCode 27
}
```

## Named Type
Ein Named Type hingegen hat nicht die gleichen Methoden wie der ursprüngliche Typ.

```go
package main

func main() {
    var m MyStructNamed
    m.Name = "GiraffeWithCode"
    m.Age = 27
    m.Print() // Fehler tritt auf
    // ./main.go:18:3: m.Print nicht definiert (Typ MyStructNamed hat kein Feld oder Methode Print)
}
```

Daher ist eine explizite Typumwandlung erforderlich.

```go
package main

func main() {
    var m MyStructNamed
    m.Name = "GiraffeWithCode"
    m.Age = 27
    m.(MyStruct).Print()
    // GiraffeWithCode 27
}
```

## Wann sollte man es verwenden?
- Um einen neuen Typ zu definieren und Beziehungen zwischen Typen klar zu definieren, ist es besser, den Named Type zu verwenden.
- Um die Lesbarkeit des Codes zu verbessern, indem man einem bestehenden Typ einen anderen Namen gibt, kann der Type Alias verwendet werden.