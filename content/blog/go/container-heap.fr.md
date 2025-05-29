---
title: Implémentation de tas minimum et maximum avec la bibliothèque standard en Golang
type: blog
date: 2025-05-29
comments: true
translated: true
---

![image](/images/go/container-heap-1748486874223.png)

Il y a des moments où l'on souhaite recevoir des données sous forme triée lors de tests de codage ou lors de l'implémentation d'un algorithme répondant à des exigences spécifiques.

Par exemple, lors de l'implémentation de l'algorithme de Dijkstra, nous devons choisir le nœud le plus proche parmi ceux accessibles depuis le nœud actuel. Dans ce cas, l'utilisation d'une file de priorité permet une implémentation beaucoup plus efficace que de trier à chaque fois.

Pour stocker les nœuds les plus courts, nous pouvons utiliser une structure de données appelée tas minimum (Minimum Heap), ce qui facilite l'implémentation d'une file de priorité, un type abstrait de donnée.

En Go, nous pouvons implémenter un tas minimum en utilisant le package `container/heap`.

Le package container fait partie de la bibliothèque standard du langage Go, et comprend des éléments tels que `container/ring` pour implémenter une liste circulaire, `container/list` pour une liste et `container/heap` pour un tas.

## Implémentation de tas en langage Go

Pour implémenter un tas en Go, nous devons utiliser le package `container/heap`. Ce package prend en charge à la fois les tas minimum et maximum, et pour l'utiliser, nous devons implémenter plusieurs interfaces.

### Implémentation de l'interface

Pour implémenter un tas, nous devons mettre en œuvre l'interface `heap.Interface`. Cette interface comprend les méthodes suivantes :
```go
package heap

// Bien que tout soit écrit en détail pour la commodité, l'interface réelle intègre sort.Interface.
type Interface interface {
    Len() int           // Retourne la longueur du tas
    Less(i, j int) bool // Retourne true si l'élément i est inférieur à l'élément j
    Swap(i, j int)      // Échange les éléments i et j
    Push(x any)         // Ajoute un nouvel élément au tas
    Pop() any           // Supprime et retourne l'élément le plus petit du tas
}
```

Dans d'autres langages, comme Python, il suffit d'utiliser `heapq`, mais en Go, on doit commencer par l'implémentation, ce qui peut être un peu fastidieux.

Voyons cela en pratique.

Je vais mettre en œuvre à l'aide d'un tableau de type int, pour faciliter la compréhension de l'ordre.

```go
package main

import (
	"container/heap"
	"fmt"
)

// IntHeap - Une structure qui implémente un tas à partir d'un tableau de type int.
type IntHeap []int

// Len - Retourne la longueur du tas.
func (h *IntHeap) Len() int {
	return len(*h)
}

// Less - Retourne true si l'élément i est inférieur à l'élément j.
// NOTE : Cette méthode peut être utilisée si vous souhaitez changer le critère de tri.
// Pour un tas d'une structure particulière, cela peut être écrit comme suit : `(*h)[i].Field < (*h)[j].Field`.
func (h *IntHeap) Less(i, j int) bool {
	return (*h)[i] < (*h)[j]
}

// Swap - Échange les éléments i et j. Utilisé dans le tas pour Upheap et Downheap.
func (h *IntHeap) Swap(i, j int) {
	(*h)[i], (*h)[j] = (*h)[j], (*h)[i]
}

// Push - Ajoute un nouvel élément au tas.
func (h *IntHeap) Push(x any) {
	*h = append(*h, x.(int))
}

// Pop - Supprime et retourne l'élément le plus petit du tas.
func (h *IntHeap) Pop() any {
	old := *h
	n := len(old)
	x := old[n-1]
	*h = old[0 : n-1]
	return x
}

func main() {
	// Initialisation de IntHeap.
	h := &IntHeap{2, 1, 5, 3, 4}
	heap.Init(h) // Initialisation du tas.

	// Ajout d'un nouvel élément au tas.
	heap.Push(h, 0)

	for h.Len() > 0 {
		fmt.Println(heap.Pop(h)) // Supprime et affiche l'élément le plus petit du tas.
	}
}
```

Lorsque vous exécutez ce code, le résultat suivant est affiché. Comme vous pouvez le voir, les éléments sont correctement triés :
```
0
1
2
3
4
5
```

## Références
- https://pkg.go.dev/container/heap
- https://lktprogrammer.tistory.com/69
- https://www.daleseo.com/python-heapq/