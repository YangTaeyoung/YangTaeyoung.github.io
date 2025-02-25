---
title: Golangでのlog.Fatal() vs panic()の違いについて
type: blog
date: 2025-02-11
comments: true
translated: true
---

## "この場合、`log.Fatal()`よりも`panic()`を使用する方が良いと思います"
最近`log.Fatal()`を使用していたところ、上記のようなフィードバックを受けた。

え？`log.Fatal()`はログをもっとよく記録するんじゃないの？と思った。

恥ずかしい事実だが、最近になってようやくGolangでの`log.Fatal()`と`panic()`の違いを明確に知ることができたので、この機会にまとめてみようと思う。

## log.Fatal()とpanic()の違い
`log.Fatal()`と`panic()`はどちらもプログラムを終了する関数だ。コードを見て動作を見てみよう。

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

上記のコードを実行すると次のような結果が得られる。

```shell
2025/02/11 20:02:31 This is a fatal error
```

次に`panic()`を使用したコードを見てみよう。

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

上記のコードを実行すると次のような結果が得られる。

```shell
panic: This is a panic error

goroutine 1 [running]:
main.RunWithPanic(...)
	/Users/code_kirin/dev/personal/awesomeProject6/main.go:8
main.main()
	/Users/code_kirin/dev/personal/awesomeProject6/main.go:12 +0x30
```

上記のコードを見てみると、`log.Fatal()`はエラーを出力しプログラムを終了させるが、`panic()`はエラーを出力しプログラムを終了させるのは同じだが、`panic()`はスタックトレースを出力する。

### recover()を使用して復旧する
`panic()`を使用するとプログラムが終了するが、`recover()`を使用するとプログラムを終了せずに復旧することができる。

実際にはパニックが全くなければよいが、開発者も人間なのでミスを避けられない。
そのため、一般的にAPIサーバーのような場所では、`panic()`を`recover()`するミドルウェアを作り、意図せずにサーバーが落ちてしまう状況を防ぐことが多い。

違いを明確に知るために、まず`log.Fatal()`を`recover()`してみよう。

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

上記のコードを実行すると次のような結果が得られる。

```shell
2025/02/11 20:07:49 This is a fatal error
```

復旧されないのである。それでは`panic()`を`recover()`してみよう。

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

上記のコードを実行すると次のような結果が得られる。

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

使用しなくてもよかったが、さっきのようなスタックトレースを出力するために`debug.PrintStack()`を使用した。
> 一般的にミドルウェアでは、重大度が高いパニックのような状況で開発者がすぐに気づけるように、上記のようなスタックトレースを含むログを多く残す。

`debug.Stack()`メソッドを使用してStderrに出力せずに、スタックトレースを直接処理することもできる。

## 用途
`log.Fatal()`は内部的に`os.Exit(1)`を呼び出す。

本来はエラーコードと共にプログラムを直ちに終了するために作られており、`recover()`で復旧することはできない。

一方、`panic()`は`recover()`で復旧することができる。

発生してはならないが、発生した際に復旧可能な状況であれば、`panic()`を使用する方が良い。

一般的にライブラリ関数や特定のパッケージの関数の場合に`panic()`を使用する方が良い。（ライブラリのためにサーバーが落ちて復旧もできない場合、その結果は悲惨であろう。）

`log.Fatal()`の場合は、`main()`関数のようなところで`error`を最終的に処理する時に使用するのが良い。

例えば依存関係を読み込む過程でプログラムを実行できないようなエラーが発生した際、その依存関係を初期化するモジュールは`error`を返し、`main()`関数で`log.Fatal()`を呼び出す形である。

構造としては以下のようになる。

> 単純に書いたものです。参考用に見てください。
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
`log`パッケージには`log.Panic()`という関数もある。

`panic()`にログ機能を追加したもので、以下のようなコードを実行させると

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

次のように出力される。

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

パニックと比較して、ログ機能を追加したものと見ていい。`panic()`を発生させるが、ログを残すのが特徴だと言える。

## Reference
- https://pkg.go.dev/log#Fatal
- コードレビューをしてくださった代表님
