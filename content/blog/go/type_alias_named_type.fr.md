---
layout: post
title: Examen de la différence entre Type Alias et Named Type (Golang)
date: 2023-10-13
comments: true
translated: true
---
Les deux sont des méthodes pour redéfinir un type existant lors de la définition d'un type, et la méthode de définition est comme suit.

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

## Alias de Type
Dans le cas d'un type alias, comme il attribue un alias à un type existant, il possède les mêmes méthodes que le type original.

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

## Type Nommé
Dans le cas du Type Nommé, il ne possède pas les mêmes méthodes que le type original.

```go
package main

func main() {
    var m MyStructNamed
    m.Name = "GiraffeWithCode"
    m.Age = 27
    m.Print() // Erreur
    // ./main.go:18:3: m.Print undefined (type MyStructNamed has no field or method Print)
}
```

Par conséquent, un casting explicite de type est nécessaire.

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

## Quand l'utiliser ?
- Si vous souhaitez définir un nouveau type et clarifier les relations entre les types, il est préférable d'utiliser le Type Nommé,
- Si vous souhaitez attribuer un autre nom à un type existant pour améliorer la lisibilité du code, vous pouvez utiliser l'Alias de Type.