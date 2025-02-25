---
title: Golangでcsvとしてエクスポートしたファイルでの文字化け対策
type: blog
date: 2023-09-23
comments: true
translated: true
---
## BOM
ExcelはUTF-8エンコードされたCSVファイルを正しく読み取るために、ファイルのドキュメント前にBOMが必要です。

> BOM: **バイト順序マーク**（Byte Order Mark, **BOM**）は、[ユニコード](https://ja.wikipedia.org/wiki/%E3%83%A6%E3%83%8B%E3%82%B3%E3%83%BC%E3%83%89 "ユニコード")文字U+FEFFバイト順序マークで、[マジックナンバー](https://ja.wikipedia.org/wiki/%E3%83%9E%E3%82%B8%E3%83%83%E3%82%AF%E3%83%8A%E3%83%B3%E3%83%90%E3%83%BC "マジックナンバー")として文書の最前に追加しテキストを読む[プログラム](https://ja.wikipedia.org/wiki/%E3%83%97%E3%83%AD%E3%82%B0%E3%83%A9%E3%83%A0 "プログラム")へ様々な情報を提供することができます。


## コード内
Golangでcsvを使用する場合、次のように文字化けを防ぐことができます。

```go
package main

import (
    "encoding/csv"
    "os"
)

func main() {
    file, err := os.Create("test.csv")
    if err != nil {
        panic(err)
    }
    defer file.Close()

    // NOTE: UTF-8 BOM追加
    file.WriteString("\xEF\xBB\xBF")

    writer := csv.NewWriter(file)
    defer writer.Flush()

    data := [][]string{
        {"名前", "年齢", "住所"},
        {"홍길동", "30", "서울"},
        {"김영희", "25", "부산"},
    }

    for _, value := range data {
        err := writer.Write(value)
        if err != nil {
            panic(err)
        }
    }
}

```

## 参考
- [バイト順序マーク - ウィキペディア](https://ja.wikipedia.org/wiki/%E3%83%90%E3%82%A4%E3%83%88%E9%A0%86%E5%BA%8F%E3%83%9E%E3%83%BC%E3%82%AF)