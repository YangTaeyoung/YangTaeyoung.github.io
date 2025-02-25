---
title: Exploring the Difference Between log.Fatal() and panic() in Golang
type: blog
date: 2025-02-11
comments: true
translated: true
---

## "In this case, it seems better to use `panic()` over `log.Fatal()`"
Recently, I received feedback like the one above while using `log.Fatal()`.

Huh? Isn’t `log.Fatal()` just printing logs better? I thought.

Embarrassingly, it was only recently that I clearly understood the difference between `log.Fatal()` and `panic()` in Golang, so I decided to take this opportunity to summarize it.

## Differences Between log.Fatal() and panic()
Both `log.Fatal()` and `panic()` are functions that terminate the program. Let's examine how they operate through code.

```go
package main

import (
    "log"
	"log/slog"
)

func RunWithFatal() {
	log.Fatal("This is a fatal error")
}

func main() {
	RunWithFatal()

	slog.Info("This is not executed")
}
```

When you run the above code, you will see the following result.

```shell
2025/02/11 20:02:31 This is a fatal error
```

Now let’s look at the code using `panic()`.

```go
package main

import (
    "log/slog"
)

func RunWithPanic() {
    panic("This is a panic error")
}

func main() {
    RunWithPanic()

    slog.Info("This is not executed")
}
```

When you run the above code, you will see the following result.

```shell
panic: This is a panic error

goroutine 1 [running]:
main.RunWithPanic(...)
	/Users/code_kirin/dev/personal/awesomeProject6/main.go:8
main.main()
	/Users/code_kirin/dev/personal/awesomeProject6/main.go:12 +0x30
```

Looking at the above code, `log.Fatal()` prints the error and terminates the program, whereas `panic()` also prints the error and terminates the program but outputs a stack trace as well.

### Recovering with recover()
Although using `panic()` will terminate the program, you can recover it without termination using `recover()`.

Ideally, panic should not occur, but since developers are human, mistakes are inevitable.
Therefore, in places like API servers, it is common to prevent unintended server crashes by creating middleware that recovers from `panic()` using a `recover()`.

To clearly understand the difference, let’s first attempt to recover `log.Fatal()`.
```go
package main

import (
    "log"
    "log/slog"
)

func RunWithFatal() {
    log.Fatal("This is a fatal error")
}

func main() {
    defer func() {
        if r := recover(); r != nil {
            slog.Info("Recovered from", "error", r)
        }
    }()

    RunWithFatal()

    slog.Info("This is not executed")
}
```

When you run the above code, you will see the following result.

```shell
2025/02/11 20:07:49 This is a fatal error
```

It has not been recovered. Now let's attempt to recover from `panic()`.

```go
package main

import (
	"log/slog"
	"runtime/debug"
)

func RunWithPanic() {
	panic("This is a panic error")
}

func main() {
	defer func() {
		if r := recover(); r != nil {
			slog.Info("Recovered from", "error", r)
			debug.PrintStack()
		}
	}()

	RunWithPanic()
}
```

When you run the above code, you will see the following result.

```shell
2025/02/11 20:09:51 INFO Recovered from error="This is a panic error"
goroutine 1 [running]:
runtime/debug.Stack()
	/opt/homebrew/opt/go/libexec/src/runtime/debug/stack.go:26 +0x64
runtime/debug.PrintStack()
	/opt/homebrew/opt/go/libexec/src/runtime/debug/stack.go:18 +0x1c
main.main.func1()
	/Users/code_kirin/dev/personal/awesomeProject6/main.go:16 +0x8c
panic({0x1004d6560?, 0x1004f4190?})
	/opt/homebrew/opt/go/libexec/src/runtime/panic.go:785 +0x124
main.RunWithPanic(...)
	/Users/code_kirin/dev/personal/awesomeProject6/main.go:9
main.main()
	/Users/code_kirin/dev/personal/awesomeProject6/main.go:20 +0x4c
```

Although it's not mandatory to use, `debug.PrintStack()` was utilized to print the stack trace similar to what was shown earlier.
> Middleware usually logs with such stack traces in serious situations like panic, so developers can quickly notice them.

You can handle the stack trace directly without outputting to Stderr using the `debug.Stack()` method.

## Purpose
`log.Fatal()` internally calls `os.Exit(1)`.

It is created to immediately terminate the program with an error code, which is why it cannot be recovered using `recover()`.

Meanwhile, `panic()` can be recovered using `recover()`.

Though they should not happen, if they do, and it is recoverable, it is better to use `panic()`.

Typically, it is recommended to use `panic()` in library functions or functions from specific packages. (If a server crashes due to a library and cannot recover, the outcome would be disastrous.)

For `log.Fatal()`, it is advisable to use it when handling `error` ultimately, such as in the `main()` function.

For example, if there is an error during dependency loading that prevents the program from executing, the module initializing the dependency returns an `error`, and the `main()` function calls `log.Fatal()`.

The structure would look something like this:
> This is a simplified example. Refer to it only for reference.
```go
package main

type Dependencies struct {
	DB *sql.DB
	redis *redis.Client
	...
}

func NewDependencies() (*Dependencies, error) {
    db, err := sql.Open("mysql", "user:password@/dbname")
    if err != nil {
        return nil, err
    }

    redis := redis.NewClient(&redis.Options{
        Addr: "localhost:6379",
    })
	
    if err = redis.Ping().Err(); err != nil {
        return nil, err
    }

    return &Dependencies{
        DB: db,
        redis: redis,
    }, nil
    
}


func main() {
    deps, err := NewDependencies()
    if err != nil {
        log.Fatal(err)
    }
	
	// ...
}
```

## + `log.Panic()`
The `log` package also includes a function called `log.Panic()`.

It is similar to `panic()` but with added logging functionality. When you execute the following code...

```go
package main

import (
	"log"
	"log/slog"
	"runtime/debug"
)

func RunWithPanic() {
	log.Panic("This is a panic error")
}

func main() {
	defer func() {
		if r := recover(); r != nil {
			slog.Info("Recovered from", "error", r)
			debug.PrintStack()
		}
	}()

	RunWithPanic()
}

```

It prints as follows:
```shell
2025/02/11 20:23:17 This is a panic error
2025/02/11 20:23:17 INFO Recovered from error="This is a panic error"
goroutine 1 [running]:
runtime/debug.Stack()
	/opt/homebrew/opt/go/libexec/src/runtime/debug/stack.go:26 +0x64
runtime/debug.PrintStack()
	/opt/homebrew/opt/go/libexec/src/runtime/debug/stack.go:18 +0x1c
main.main.func1()
	/Users/code_kirin/dev/personal/awesomeProject6/main.go:17 +0x8c
panic({0x100ad24e0?, 0x140000100a0?})
	/opt/homebrew/opt/go/libexec/src/runtime/panic.go:785 +0x124
log.Panic({0x1400010af20?, 0x0?, 0x68?})
	/opt/homebrew/opt/go/libexec/src/log/log.go:432 +0x60
main.RunWithPanic(...)
	/Users/code_kirin/dev/personal/awesomeProject6/main.go:10
main.main()
	/Users/code_kirin/dev/personal/awesomeProject6/main.go:21 +0x60
```

Compared to `panic`, it is seen as a logging enhanced version. It still triggers a `panic()`, but the characteristic is that it logs the error.

## Reference
- https://pkg.go.dev/log#Fatal
- Code review from the team lead
