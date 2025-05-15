---
title: Générer du code avec Go Generate
type: blog
date: 2025-05-15
comments: true
translated: true
---
![image](/images/go/go-generate-1747269173961.png)

Go a la particularité d'avoir une quantité de code boilerplate plus fréquente que d'autres langages. En Java, par exemple, pour créer des getters et des setters courants, on peut utiliser un outil tel que [`Lombok`](https://projectlombok.org/), et pour le mocking, des outils comme [`Mockito`](https://site.mockito.org/) sont disponibles.

Ces deux bibliothèques utilisent toutes deux le processeur d'annotations Java pour générer du code, mais les développeurs ne génèrent pas directement le code.

En revanche, Go n'a pas de processeur d'annotations comme Java. En général, pour générer du code, il faut installer un CLI et créer le code via celui-ci.
Pour ma part, j'utilise la bibliothèque [`swaggo`](https://github.com/swaggo/swag) pour utiliser Swagger. Cette bibliothèque analyse également le code interne pour générer le document Swagger `docs.json`.

En plus de cela, on peut utiliser `protoc` pour générer du code en utilisant GRPC, ou utiliser `mockery` pour générer du code pour des interfaces mock. Il existe donc divers outils CLI pour générer du code.

## Générer du code avec un Makefile

La commande utilisée pour générer avec swag est, pour ma part, la suivante :
```bash
swag init -g ./cmd/main.go -o ./docs
```

Mémoriser une telle commande peut s'avérer difficile et fastidieux, donc on peut généralement utiliser des alias ou des outils tels que des Makefiles.

Voici comment générer du code en utilisant un Makefile :
```makefile
.PHONY: swag
swag:
    @swag init -g ./cmd/main.go -o ./docs
```
De cette façon, on peut générer le code en exécutant la commande `make swag`.

## Générer du code avec Go Generate

Go semble avoir ressenti cette nécessité et offre l'outil [`go generate`](https://pkg.go.dev/cmd/go#hdr-Generate_Go_files_by_processing_source), qui sert à générer du code.

Go Generate est un outil qui permet de générer du code en écrivant des commandes en commentaire dans les fichiers sources Go et en les exécutant.

Par exemple, si l'on prend swag comme exemple, on peut écrire cela :
```go{filename="somefile.go"}
//go:generate swag init -g ./cmd/main.go -o ./docs
```

Ainsi, on peut générer le code en exécutant la commande `go generate ./somefile.go`.

Si vous ne souhaitez pas spécifier un fichier directement, vous pouvez également structurer la commande pour parcourir tous les fichiers Go du projet et exécuter ceux qui contiennent `//go:generate` :
```bash
go generate ./...
```
> En pratique, c'est la méthode la plus utilisée.

## Points à considérer

L'exécution de Go Generate se fait dans le chemin du fichier concerné. Ainsi, de nombreux outils CLI qui utilisent des chemins relatifs doivent faire attention lorsqu'ils utilisent Go Generate.

Prenons par exemple une structure comme suit, avec `go:generate` dans le fichier foo/bar.go :
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

Dans ce cas, si on exécute la commande `go generate ./...`, une erreur se produit car le chemin `./cmd/main.go` ne peut pas être trouvé. De plus, le chemin de sortie `./docs` est également écrit en relatif et sera donc créé dans `foo/docs`.

Par conséquent, lorsque vous utilisez des chemins relatifs, il faut faire attention lors de l'utilisation de Go Generate.
```go 
//go:generate swag init -g ../cmd/main.go -o ../docs
```

## Références
- [Go Generate](https://pkg.go.dev/cmd/go#hdr-Generate_Go_files_by_processing_source)