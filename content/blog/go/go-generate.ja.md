---
title: Go Generateを使用したコード生成
type: blog
date: 2025-05-15
comments: true
translated: true
---
![image](/images/go/go-generate-1747269173961.png)

Goは、特性上ボイラープレートが他の言語に比べて頻繁に発生します。Javaを見ても、一般的なGetter/Setterを作成するために[`Lombok`](https://projectlombok.org/)のようなツールを使用し、モックのために[`Mockito`](https://site.mockito.org/)のようなツールを使用することができます。

これらの2つのライブラリは、Java Annotation Processorを使用してコードを生成しますが、開発者が直接コードを生成するわけではありません。

一方、GoにはJavaのようなAnnotation Processorがありません。一般的には、コードを生成するためにCLIを直接インストールし、CLIを介してコードを生成する必要があります。
筆者の場合、Swaggerを使用するために[`swaggo`](https://github.com/swaggo/swag)ライブラリを使用しています。このライブラリも内部コードを解析してSwaggerのドキュメントである`docs.json`を生成します。

この他にも、GRPCを使用するためにprotocを使用してコードを生成したり、モックインターフェースを使用するためにmockeryを使用してコードを生成したりするなど、さまざまなCLIツールを使用してコードを生成することができます。

## Makefileを使用したコード生成

生成時に使用するswagのコマンドは、筆者の場合次のようになります。
```bash
swag init -g ./cmd/main.go -o ./docs
```

毎回このようなコマンドを入力するには記憶力が不足しており、指も面倒なので、一般的にはAliasを使用するか、Makefileのようなツールを使用することになります。

Makefileを使用してコードを生成する方法は次のとおりです。
```makefile
.PHONY: swag
swag:
    @swag init -g ./cmd/main.go -o ./docs
```
このようにすると、`make swag`コマンドを通じてコードを生成することができます。

## Go Generateを使用したコード生成
Goもこういった部分に限界を感じたのか、コードを生成するためのツールである[`go generate`](https://pkg.go.dev/cmd/go#hdr-Generate_Go_files_by_processing_source)を提供しています。

Go Generateは、Goソースファイルにコメントとしてコマンドを記述し、該当コマンドを実行してコードを生成するツールです。

例えば、swagを例に挙げると次のように記述できます。
```go{filename="somefile.go"}
//go:generate swag init -g ./cmd/main.go -o ./docs
```

このように記述すると、`go generate ./somefile.go`コマンドを通じてコードを生成することができます。

ファイルを直接指定したくない場合は、以下のようにプロジェクト内のすべてのGoファイルを巡回し、`//go:generate`があれば実行するようにコマンドを構成することもできます。 

```bash
go generate ./...
```
> 実務ではこの方法が最も多く使われています。

## 注意点
Go Generateの実行は、該当ファイルのパスで実行されます。そのため、相対パスを使用する多くのCLIツールはGo Generateを使用する際にパスに注意を払う必要があります。

例えば、次のような構造があり、foo/bar.goファイルにgo:generateがあると仮定しましょう。
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

この場合、`go generate ./...`コマンドを実行すると、`./cmd/main.go`というパスを見つけられずエラーが発生します。
また、出力パスである`./docs`も相対パスで書かれているため、`foo/docs`に生成されます。

したがって、相対パスを使用する場合は、Go Generateを使用する際には注意が必要です。
```go
//go:generate swag init -g ../cmd/main.go -o ../docs
```

## 参考文献
- [Go Generate](https://pkg.go.dev/cmd/go#hdr-Generate_Go_files_by_processing_source)