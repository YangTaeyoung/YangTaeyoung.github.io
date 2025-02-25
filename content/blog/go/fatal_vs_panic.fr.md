---
title: Comprendre la différence entre log.Fatal() et panic() en Golang
type: blog
date: 2025-02-11
comments: true
translated: true
---

## "Dans ce cas, il semble préférable d'utiliser `panic()` plutôt que `log.Fatal()`"
Récemment, alors que j'utilisais `log.Fatal()`, j'ai reçu ce type de retour d'information.

Hmm? Je pensais que `log.Fatal()` était juste un meilleur moyen de journaliser les erreurs, non ?

Bien que ce soit embarrassant, ce n'est que récemment que j'ai compris clairement la différence entre `log.Fatal()` et `panic()` en Golang, et je profite de cette opportunité pour clarifier cela.

## Différences entre log.Fatal() et panic()
`log.Fatal()` et `panic()` sont tous deux des fonctions qui terminent un programme. Voyons cela dans le code.

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

Lorsque vous exécutez ce code, vous pouvez voir le résultat suivant.

```shell
2025/02/11 20:02:31 This is a fatal error
```

Regardons maintenant le code utilisant `panic()`.

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

Lorsque vous exécutez ce code, vous pouvez voir le résultat suivant.

```shell
panic: This is a panic error

goroutine 1 [running]:
main.RunWithPanic(...)
	/Users/code_kirin/dev/personal/awesomeProject6/main.go:8
main.main()
	/Users/code_kirin/dev/personal/awesomeProject6/main.go:12 +0x30
```

En observant ces codes, `log.Fatal()` imprime l'erreur et termine le programme, alors que `panic()` fait de même mais en plus, imprime une trace de la pile.

### Récupération avec recover()
L'utilisation de `panic()` entraîne la fermeture du programme, mais grâce à `recover()`, il est possible de récupérer et de ne pas fermer le programme.

Bien sûr, il serait préférable qu'il n'y ait jamais de panique, mais comme les développeurs sont humains, ils peuvent faire des erreurs. C'est pourquoi, dans des endroits comme les serveurs API, il est courant de créer des middlewares qui récupèrent des panics pour empêcher le serveur de s'éteindre involontairement.

Pour clarifier la différence, essayons d'abord de récupérer log.Fatal()

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

Quand vous exécutez ce code, vous voyez le résultat suivant.

```shell
2025/02/11 20:07:49 This is a fatal error
```

Aucune récupération. Essayons maintenant de récupérer `panic()`

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

Quand vous exécutez ce code, vous voyez le résultat suivant.

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

Pour obtenir l'impression de la trace de la pile comme précédemment, `debug.PrintStack()` a été utilisé.
> Généralement, dans un middleware, lors de situations critiques comme une panique, les développeurs laissent de nombreux journaux contenant la trace de la pile pour permettre une détection rapide du problème.

Grâce à la méthode `debug.Stack()`, il est possible de gérer directement la trace de la pile sans l'imprimer sur Stderr.

## Utilisation
`log.Fatal()` appelle `os.Exit(1)` en interne.

Il est destiné à arrêter immédiatement le programme avec un code d'erreur, ce qui le rend impossible à récupérer avec `recover()`.

D'autre part, `panic()` peut être récupéré avec `recover()`.

Bien que cela ne devrait pas arriver, si un problème qui peut être récupéré survient, il est préférable d'utiliser `panic()`.

En général, il est conseillé d'utiliser `panic()` dans les fonctions de bibliothèques ou de certains packages. (Si un serveur tombe en panne à cause d'une bibliothèque et ne peut être récupéré, le résultat serait désastreux.)

Dans le cas de `log.Fatal()`, il est préférable de l'utiliser dans des situations où l'on gère finalement l'erreur, comme la fonction `main()`.

Par exemple, lorsqu'on charge des dépendances et que l'on rencontre une erreur qui rend impossible l'exécution du programme, le module qui initialise ces dépendances renvoie une `error`, et la fonction `main()` appelle `log.Fatal()`. 

Cela pourrait ressembler à ceci :
> C'est écrit de manière simplifiée. À titre de référence uniquement.
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
Le paquet `log` fournit également une fonction appelée `log.Panic()`.

Ajoutant une fonctionnalité de journalisation à `panic()`, l'exécution du code suivant déclenchera

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

le résultat suivant.
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

Comparé à `panic()`, il s'agit essentiellement d'ajouter une fonctionnalité de journalisation. Bien qu'il déclenche une `panic()` tout de même, il est caractérisé par l'ajout de journaux.

## Référence
- https://pkg.go.dev/log#Fatal
- Mon superviseur qui a fait une revue de code
