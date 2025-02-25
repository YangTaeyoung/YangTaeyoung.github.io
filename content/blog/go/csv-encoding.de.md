---
title: Lösung des Problems mit der Zeichenverfälschung im exportierten CSV-Datei unter Golang
type: blog
date: 2023-09-23
comments: true
translated: true
---
## BOM
Excel benötigt am Anfang der Datei eine BOM, um eine UTF-8-codierte CSV-Datei korrekt zu lesen.

> BOM: **Byte Order Mark** (Byte-Reihenfolgemarkierung, **BOM**) ist das Unicode-Zeichen U+FEFF zur Byte-Reihenfolgemarkierung und kann als [Magic Number](https://ko.wikipedia.org/wiki/%EB%A7%A4%EC%A7%81_%EB%84%98%EB%B2%84 "매직 넘버") am Anfang eines Dokuments hinzugefügt werden, um [Programmen](https://ko.wikipedia.org/wiki/%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%A8 "프로그램") verschiedene Informationen zu übermitteln.


## Im Code
Wenn Sie in Golang csv verwenden, können Sie das Problem der Zeichenverfälschung wie folgt verhindern.

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

    // HINWEIS: UTF-8 BOM hinzufügen
    file.WriteString("\xEF\xBB\xBF")

    writer := csv.NewWriter(file)
    defer writer.Flush()

    data := [][]string{
        {"이름", "나이", "주소"},
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

## Referenz
- [Byte Order Mark - Wikipedia](https://ko.wikipedia.org/wiki/%EB%B0%94%EC%9D%B4%ED%8A%B8_%EC%88%9C%EC%84%9C_%ED%91%9C%EC%8B%9D)