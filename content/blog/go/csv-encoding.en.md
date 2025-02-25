---
title: Resolving Korean Character Corruption in CSV Files Exported from Golang
type: blog
date: 2023-09-23
comments: true
translated: true
---
## BOM
Excel requires a BOM at the beginning of a file to correctly read a UTF-8 encoded CSV file.

> BOM: The **Byte Order Mark** (BOM) is the Unicode character U+FEFF byte order mark, and as a [magic number](https://en.wikipedia.org/wiki/Magic_number "Magic Number"), it is added at the very beginning of a document to convey various information to [programs](https://en.wikipedia.org/wiki/Program "Program") that read the text.


## In Code
When using CSV in Golang, you can prevent Korean character corruption as follows.

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

    // NOTE: Add UTF-8 BOM
    file.WriteString("\xEF\xBB\xBF")

    writer := csv.NewWriter(file)
    defer writer.Flush()

    data := [][]string{
        {"Name", "Age", "Address"},
        {"Hong Gil-dong", "30", "Seoul"},
        {"Kim Young-hee", "25", "Busan"},
    }

    for _, value := range data {
        err := writer.Write(value)
        if err != nil {
            panic(err)
        }
    }
}

```

## Reference
- [Byte Order Mark - Wikipedia](https://en.wikipedia.org/wiki/Byte_order_mark)