---
title: Découvrons comment importer des fichiers en utilisant embed dans Go
type: blog
date: 2025-04-16
comments: true
translated: true
---

Il existe plusieurs méthodes pour importer des fichiers dans Go.

On peut, par exemple, lire un fichier en utilisant `os.ReadFile()`, ou bien importer le fichier en utilisant le paquet `embed`.

Même si les usages diffèrent légèrement, l’utilisation du paquet `embed` permet d’inclure le fichier lors de la compilation, ce qui est utile pour le déploiement.

Examinons simplement un exemple en créant un fichier txt comme suit :

```txt{filename="hello.txt"}
Hello, World!
```

Maintenant, importons ce fichier en utilisant le paquet `embed`.

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

En exécutant ce code, on peut voir le résultat suivant :

```shell
Hello, World!
```

Cela ne fonctionne pas uniquement pour les fichiers `txt` : il est en fait possible d'importer et de lire tous types de fichiers, y compris `html`, `css`, `js`, `yaml`, etc.

Cependant, il faut être prudent avec les fichiers trop volumineux car ils peuvent consommer beaucoup de mémoire.