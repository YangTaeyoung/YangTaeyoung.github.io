---
layout: post
title: Golang 의 Type Alias 와 Named Type에 대해 알아보자
parent: <i class="fa-brands fa-golang"></i> Go
date: 2023-10-13
---
## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}
---
둘 다 타입 정의 시 기존의 타입을 재정의하는 방법이며 정의 방식은 아래와 같이 정의한다.

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

# Type Alias
type alias의 경우 기존에 타입에 별칭을 지정하는 방식이기 때문에 기존 타입과 동일한 메서드를 가지고 있다.

```go
func main() {
    var m MyStructAlias
    m.Name = "GiraffeWithCode"
    m.Age = 27
    m.Print()
	// GiraffeWithCode 27
}
```

# Named Type
Named Type의 경우 기존 타입과 동일한 메서드를 가지고 있지 않다.

```go
func main() {
    var m MyStructNamed
    m.Name = "GiraffeWithCode"
    m.Age = 27
    m.Print() // 에러 발생
    // ./main.go:18:3: m.Print undefined (type MyStructNamed has no field or method Print)
}
```

따라서 명시적인 타입 캐스팅이 필요하다.

```go
func main() {
    var m MyStructNamed
    m.Name = "GiraffeWithCode"
    m.Age = 27
    m.(MyStruct).Print()
    // GiraffeWithCode 27
}
```

# 언제 사용할까?
- 새로운 타입을 정의하고 타입 간의 관계를 명확하게 하려면 Named Type을 사용하는 것이 좋고, 
- 기존 타입에 다른 이름을 붙여 코드의 가독성을 개선하려면 Type Alias를 사용할 수 있다.
