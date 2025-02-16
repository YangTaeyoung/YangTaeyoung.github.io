---
title: Golang에서 Template 사용하기 (Go Template)
type: blog
date: 2023-09-23
comments: true
---
## Go Template
Golang에는 Go Template이라는 기능을 활용하여 자신이 지정한 포맷에 따라 여러가지 데이터를 바인딩하거나, 조작한 문자열로 내보내는 기능이 있다.

### `text/template` 패키지
- 텍스트 기반 템플릿을 처리하기 위한 두 개의 표준 라이브러리 패키지이며, 정해진 포맷이나, 특정 로직에 따라 텍스트를 생성해야 하는 경우 자주 사용한다.
- `text/template`라는 패키지를 사용하여 텍스트를 정해진 포맷대로 내보내는 예시는 아래와 같다.

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

코드에서 보다 싶이 `Person`이라는 구조체에 각 필드 `Name`, `Age`와 같은 필드가 템플릿 문자열인 `"Hello {{.Name}}, you are {{.Age}} years old.\n"`의 각 요소로 바인딩 될 것임을 쉽게 짐작해 볼 수 있다.

위 코드를 실행하면 다음과 같은 결과를 얻을 수 있다.

### Result
```
Hello GiraffeWithCode, you are 27 years old.
```

### 반복문
반복문의 경우에도 `range`를 사용하여 구현할 수 있다.

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

### Result
```
Hello GiraffeWithCode, you are 27 years old. You have BMW, Audi, Benz,
```

### 조건문
조건문의 경우에는 `if`를 사용하여 구현할 수 있다.

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

### Result
```
Hello GiraffeWithCode, you are 27 years old. You have BMW, Audi, Benz
```

## `text/template` vs `html/template`
`text/template` 패키지와 `html/template` 패키지는 텍스트 기반 템플릿을 처리하기 위한 두 개의 표준 라이브러리임은 같다.

이 두 패키지의 주요 차이점은 HTML 콘텍스트에서의 안전성에 있다.
1. **`text/template`:** 일반 텍스트를 처리하기 위해 설계되었다. 이 패키지를 사용하여 템플릿 텍스트를 처리할 수 있지만, 생성된 문자열이 HTML로 사용될 경우 특별한 이스케이프 처리가 없다.

2. **`html/template`:**  HTML 콘텐츠를 안전하게 처리하기 위해 설계되었다. 이 패키지는 HTML, JavaScript, CSS, URL 등의 컨텍스트에서 안전한 문자열을 자동으로 이스케이프하여 Cross-Site Scripting(XSS)과 같은 웹 공격을 방지할 수 있다. (JS 라이브러리 중 [DOMPurify](https://github.com/cure53/DOMPurify)와 비슷한 역할을 수행한다고 볼 수 있다.)

## Reference
- [Working with text/template and html/template](https://subscription.packtpub.com/book/programming/9781789800982/1/ch01lvl1sec08/working-with-text-template-and-html-template)