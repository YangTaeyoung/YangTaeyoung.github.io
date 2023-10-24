---
layout: post
title: Golang 에서 csv로 내보낸 파일에서 한글 깨짐 해결
parent: <i class="fa-brands fa-golang"></i> Go
date: 2023-09-23
---
## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}
---

# BOM
Excel은 UTF-8 인코딩된 CSV 파일을 올바르게  읽기 위해 파일의 문서 앞에 BOM이 필요하다.

> BOM: **바이트 순서 표시**(Byte Order Mark, **BOM**)는 [유니코드](https://ko.wikipedia.org/wiki/%EC%9C%A0%EB%8B%88%EC%BD%94%EB%93%9C "유니코드") 문자 U+FEFF byte order mark로, [매직 넘버](https://ko.wikipedia.org/wiki/%EB%A7%A4%EC%A7%81_%EB%84%98%EB%B2%84 "매직 넘버")로서 문서의 가장 앞에 추가하여 텍스트를 읽는 [프로그램](https://ko.wikipedia.org/wiki/%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%A8 "프로그램")에 여러 정보를 전달할 수 있다


# In Code
Golang에서 csv를 사용하는 경우 다음과 같이 한글이 깨지는 문제를 방지할 수 있다.

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

    // NOTE: UTF-8 BOM 추가
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

## Reference
- [바이트 순서 표식 - 위키백과](https://ko.wikipedia.org/wiki/%EB%B0%94%EC%9D%B4%ED%8A%B8_%EC%88%9C%EC%84%9C_%ED%91%9C%EC%8B%9D)