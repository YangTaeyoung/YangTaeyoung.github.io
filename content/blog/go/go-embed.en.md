---
title: How to retrieve files using embed in Go
type: blog
date: 2025-04-16
comments: true
translated: true
---

There are several ways to retrieve files in Go.

You can use `os.ReadFile()` to read a file, or you can use the `embed` package to retrieve a file.

Although used for slightly different purposes, using the `embed` package allows you to include files during the build, which is useful for distribution.

Let's take a simple example by creating a txt file as follows:

```txt{filename="hello.txt"}
Hello, World!
```

Now, let's retrieve this file using the `embed` package.

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

Running the above code will produce the following output:

```shell
Hello, World!
```

Not only `txt` files, but you can retrieve and read practically any file, including `html`, `css`, `js`, `yaml`, and more.

However, be cautious when retrieving very large files, as it may consume a significant amount of memory.