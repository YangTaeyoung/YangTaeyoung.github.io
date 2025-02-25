---
layout: post
title: Exploring the Difference Between Type Alias and Named Type (Golang)
date: 2023-10-13
comments: true
translated: true
---

Both are methods of redefining existing types when defining a new type, and are defined as follows:

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

In the case of a type alias, it assigns an alias to the existing type, so it has the same methods as the existing type.

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

A Named Type does not have the same methods as the existing type.

```go
package main

func main() {
    var m MyStructNamed
    m.Name = "GiraffeWithCode"
    m.Age = 27
    m.Print() // Error occurs
    // ./main.go:18:3: m.Print undefined (type MyStructNamed has no field or method Print)
}
```

Therefore, explicit type casting is necessary.

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

## When to Use?
- If you want to define a new type and clarify the relationship between types, it is better to use Named Type.
- If you want to improve the readability of the code by giving another name to an existing type, you can use a Type Alias.