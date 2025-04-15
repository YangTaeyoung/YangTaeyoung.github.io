---
title: Goでembedを利用してファイルを取得する方法を学ぼう
type: blog
date: 2025-04-16
comments: true
translated: true
---
Goではファイルを取得する方法はさまざまあります。

`os.ReadFile()`を使用してファイルを読み込む方法もあれば、`embed`パッケージを使用してファイルを取り込む方法もあります。

用途は少し異なりますが、`embed`パッケージを使用するとビルド時にファイルを含めることができるため、配布時に非常に便利です。

簡単な例として、次のようなtxtファイルを作成してみましょう。

```txt{filename="hello.txt"}
Hello, World!
```

それでは、`embed`パッケージを使用してこのファイルを取り込んでみましょう。

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

上記のコードを実行すると、次のような結果が得られます。

```shell
Hello, World!
```

これは単に`txt`ファイルだけでなく、`html`、`css`、`js`、`yaml`など、事実上すべてのファイルを取り込んで読み込むことができるということです。

ただし、サイズが非常に大きなファイルを取り込むとメモリ消費が増大するため、注意が必要です。
