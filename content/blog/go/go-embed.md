---
title: Go에서 embed를 이용해서 파일을 가져오는 방법에 대해 알아보자
type: blog
date: 2025-04-16
comments: true
---
Go에서 파일을 가져오는 방법은 여러가지가 있다.

`os.ReadFile()`을 사용해서 파일을 읽어오는 방법도 있고, `embed` 패키지를 사용해서 파일을 가져오는 방법도 있다.

용도가 조금 다르지만, `embed` 패키지를 사용하면 빌드할 때 파일을 포함시킬 수 있어서 배포할 때 유용하다.

간단히 예를 살펴보면 다음과 같은 txt 파일을 만들어보자

```txt{filename="hello.txt"}
Hello, World!
```
이제 `embed` 패키지를 사용해서 이 파일을 가져와보자.

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
위 코드를 실행하면 다음과 같은 결과를 볼 수 있다.

```shell
Hello, World!
```

단순히 `txt`파일만 되는 것은 아니고, `html`, `css`, `js`, `yaml` 등 사실상 모든 파일을 가져와서 읽을 수 있는 셈이다.

다만 너무 크기가 큰 파일을 가져오면 메모리 소비가 큰 편으로 주의해야 한다.
