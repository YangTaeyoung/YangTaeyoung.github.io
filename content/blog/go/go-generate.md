---
title: Go Generate를 통해 코드 생성하기
type: blog
date: 2025-05-15
comments: true
---
![image](/images/go/go-generate-1747269173961.png)

Go은 특성상 보일러 플레이트가 타 언어에 비해 잦은 편이다. Java만 봐도 흔한 Getter/Setter를 만들기 위해 [`Lombok`](https://projectlombok.org/)과 같은 도구를 사용할 수 있고, Mocking을 위해 [`Mockito`](https://site.mockito.org/) 같은 도구를 사용할 수 있다.

두 라이브러리 모두 Java Annotation Processor를 사용하여 코드를 생성하지만, 개발자가 직접 코드를 생성하진 않는다.

반면에 Go는 Java와 달리 Annotation Processor가 없다. 일반적으로는 코드 생성을 위해 CLI를 직접 설치하고, CLI를 통해 코드를 생성해야 한다.
Go는
필자의 경우 Swagger를 사용하기 위해 [`swaggo`](https://github.com/swaggo/swag) 라이브러리를 사용하고 있다. 이 라이브러리 역시 내부 코드를 파싱하여 
Swagger의 문서인 `docs.json`을 생성한다. 

이 외에도 GRPC를 사용하기 위해 protoc를 사용하여 코드를 생성하거나, Mock 인터페이스를 사용하기 위해 mockery를 사용하여 코드를 생성하는 등 다양한 CLI 도구를 사용하여 코드를 생성할 수 있다.

## Makefile을 사용하여 코드 생성하기

생성시 사용하는 swag의 명령어는 필자의 경우 다음과 같은데
```bash
swag init -g ./cmd/main.go -o ./docs
```

매번 이런 명령어를 입력하기엔 기억력도 부족하고, 손가락도 귀찮기 때문에 일반적으로 Alias를 사용하거나, Makefile과 같은 도구를 사용할 수 있을 것이다.

Makefile을 사용하여 코드를 생성하는 방법은 다음과 같다.
```makefile
.PHONY: swag
swag:
    @swag init -g ./cmd/main.go -o ./docs
```
이렇게 하면 `make swag` 명령어를 통해 코드를 생성할 수 있다.

## Go Generate를 사용하여 코드 생성하기
Go도 이런 부분에 한계를 느꼈는지, 코드를 생성하기 위한 도구인 [`go generate`](https://pkg.go.dev/cmd/go#hdr-Generate_Go_files_by_processing_source)라는 도구를 제공한다.

Go Generate는 Go 소스 파일에 주석으로 명령어를 작성하여, 해당 명령어를 실행하여 코드를 생성하는 도구이다.

예를 들어 swag를 예시로 든다면 다음과 같이 작성할 수 있다.
```go{filename="somefile.go"}
//go:generate swag init -g ./cmd/main.go -o ./docs
```

이렇게 작성하면 `go generate ./somefile.go` 명령어를 통해 코드를 생성할 수 있다.

파일을 직접 명시하기 싫다면, 아래와 같이 프로젝트 내의 모든 Go 파일을 순회하며 `//go:generate` 있다면 실행시키도록 명령어를 구성할 수도 있다. 

```bash
go generate ./...
```
> 실무에선 이 방법을 가장 많이 사용한다.

## 주의할 점
Go Generate의 실행은 해당 파일의 경로에서 실행된다. 따라서 상대 경로를 사용하는 많은 CLI 도구들은 Go Generate를 사용할 때 경로에 주의를 기울여야 한다.

예를 들어 다음과 같은 구조가 있고, foo/bar.go 파일에 go:generate가 있다고 가정하자.
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

이 경우  `go generate ./...` 명령어를 실행하면 `./cmd/main.go` 경로를 찾지 못해 에러가 발생한다.
또한 output 경로인 `./docs` 역시 상대 경로로 작성되어 있어, `foo/docs`에 생성된다.

따라서 상대 경로를 사용할 경우, Go Generate를 사용할 때는 주의해야 한다.
```go 
//go:generate swag init -g ../cmd/main.go -o ../docs
```

## References
- [Go Generate](https://pkg.go.dev/cmd/go#hdr-Generate_Go_files_by_processing_source)