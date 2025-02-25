---
layout: post
title: Type AliasとNamed Typeの違いについて学ぶ (Golang)
date: 2023-10-13
comments: true
translated: true
---
どちらもタイプ定義時に既存のタイプを再定義する方法であり、定義方法は以下のように定義します。

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
type aliasの場合、既存のタイプに別名を指定する方式なので、既存タイプと同じメソッドを持っています。

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
Named Typeの場合、既存タイプと同じメソッドを持っていません。

```go
package main

func main() {
    var m MyStructNamed
    m.Name = "GiraffeWithCode"
    m.Age = 27
    m.Print() // エラー発生
    // ./main.go:18:3: m.Print undefined (type MyStructNamed has no field or method Print)
}
```

したがって、明示的なタイプキャスティングが必要です。

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

## いつ使うべきか？
- 新しいタイプを定義し、タイプ間の関係を明確にしたい場合はNamed Typeを使用するのが良いです。
- 既存タイプに異なる名前をつけ、コードの可読性を向上させたい場合はType Aliasを使用できます。