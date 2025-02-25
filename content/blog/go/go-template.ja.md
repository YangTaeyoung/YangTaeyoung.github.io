---
title: GolangでのTemplateの使用 (Go Template)
type: blog
date: 2023-09-23
comments: true
translated: true
---

## Go Template

Golangには、Go Templateという機能を活用して自分が指定したフォーマットに従って様々なデータをバインドしたり、操作した文字列として出力する機能があります。

### `text/template` パッケージ

- テキストベースのテンプレートを処理するための二つの標準ライブラリパッケージで、定められたフォーマットや特定のロジックに従ってテキストを生成する場合によく使用されます。
- `text/template`というパッケージを使用してテキストを定められたフォーマットで出力する例は以下の通りです。

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

コードからわかるように、`Person`という構造体の各フィールド `Name`, `Age` がテンプレート文字列 `"Hello {{.Name}}, you are {{.Age}} years old.\n"` の各要素にバインドされることが簡単に推測できます。

上記のコードを実行すると、次のような結果を得ることができます。

### 結果

```
Hello GiraffeWithCode, you are 27 years old.
```

### 繰り返し文

繰り返し文の場合にも `range` を使用して実装できます。

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

### 結果

```
Hello GiraffeWithCode, you are 27 years old. You have BMW, Audi, Benz,
```

### 条件文

条件文の場合は `if` を使用して実装できます。

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

### 結果

```
Hello GiraffeWithCode, you are 27 years old. You have BMW, Audi, Benz
```

## `text/template` vs `html/template`

`text/template` パッケージと `html/template` パッケージは、テキストベースのテンプレートを処理するための二つの標準ライブラリです。

この二つのパッケージの主な違いは、HTMLコンテキストでの安全性にあります。

1. **`text/template`:** 一般テキストを処理するために設計されています。このパッケージを使用してテンプレートテキストを処理することができますが、生成された文字列がHTMLで使用される場合、特別ないスケープ処理はありません。

2. **`html/template`:** HTMLコンテンツを安全に処理するために設計されています。このパッケージは、HTML、JavaScript、CSS、URLなどのコンテキストで安全な文字列を自動的にエスケープし、クロスサイトスクリプティング（XSS）などのウェブ攻撃を防止することができます。（JSライブラリの[DOMPurify](https://github.com/cure53/DOMPurify)と似た役割を果たすといえます。）

## 参考文献

- [Working with text/template and html/template](https://subscription.packtpub.com/book/programming/9781789800982/1/ch01lvl1sec08/working-with-text-template-and-html-template)