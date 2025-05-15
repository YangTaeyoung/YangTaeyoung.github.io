---
title: Generating Code with Go Generate
type: blog
date: 2025-05-15
comments: true
translated: true
---
![image](/images/go/go-generate-1747269173961.png)

Go tends to have boilerplate code more frequently than other languages. For example, in Java, tools like [`Lombok`](https://projectlombok.org/) can be used to create common Getters/Setters, and tools like [`Mockito`](https://site.mockito.org/) can be utilized for mocking.

Both libraries generate code using Java Annotation Processors, but developers do not write the code directly.

In contrast, Go does not have an Annotation Processor like Java. Typically, to generate code, you must manually install a CLI and generate code through it. In my case, I use the [`swaggo`](https://github.com/swaggo/swag) library to work with Swagger, which parses internal code to generate the Swagger documentation file `docs.json`.

Additionally, various CLI tools can be used to generate code, such as using `protoc` for GRPC or using `mockery` for generating mock interfaces.

## Generating Code Using Makefile

In my case, the command to generate using swag is as follows:
```bash
swag init -g ./cmd/main.go -o ./docs
```

Due to insufficient memory and finger fatigue from typing the same command repeatedly, it's common to use an alias or tools like Makefile.

Here is how to generate code using a Makefile:
```makefile
.PHONY: swag
swag:
    @swag init -g ./cmd/main.go -o ./docs
```
This allows you to generate code by running the command `make swag`.

## Generating Code Using Go Generate

Realizing the limitations of this approach, Go provides a tool called [`go generate`](https://pkg.go.dev/cmd/go#hdr-Generate_Go_files_by_processing_source) for generating code.

Go Generate allows you to write commands as comments in Go source files and execute them to generate code.

For example, when using swag, you could write as follows:
```go{filename="somefile.go"}
//go:generate swag init -g ./cmd/main.go -o ./docs
```

Writing it this way allows you to generate code using the command `go generate ./somefile.go`.

If you do not want to specify files directly, you can structure the command to traverse all Go files in the project and execute any `//go:generate` commands:

```bash
go generate ./...
```
> This method is most commonly used in practical application.

## Points to Note

When running Go Generate, it executes from the path of the file, so many CLI tools that use relative paths must be cautiously handled when using Go Generate.

For example, consider a structure where there is a `go:generate` in `foo/bar.go`:
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

In this case, running the command `go generate ./...` will lead to an error as it cannot find the path `./cmd/main.go`. Additionally, the output path `./docs` is also written as a relative path, thus it would be generated under `foo/docs`.

Therefore, when using relative paths, caution must be taken with Go Generate.
```go 
//go:generate swag init -g ../cmd/main.go -o ../docs
```

## References
- [Go Generate](https://pkg.go.dev/cmd/go#hdr-Generate_Go_files_by_processing_source)