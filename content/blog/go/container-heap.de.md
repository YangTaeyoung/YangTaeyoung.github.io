---
title: Implementierung eines Minimal- und Maximalheaps mit der Standardbibliothek in Golang
type: blog
date: 2025-05-29
comments: true
translated: true
---

![image](/images/go/container-heap-1748486874223.png)

Bei Codetests oder beim Implementieren von Algorithmen, die bestimmten Anforderungen entsprechen, kann es nötig sein, Daten in sortierter Form zu erhalten.

Zum Beispiel, wenn man den Dijkstra-Algorithmus implementiert, muss man den Knoten mit dem kürzesten Abstand aus den Knoten auswählen, die man vom aktuellen Knoten aus erreichen kann. In diesem Fall ist die Verwendung einer Prioritätswarteschlange viel effizienter, als jedes Mal eine Sortierung durchzuführen.

Um in diesem Fall die kürzeren Knoten zu speichern, kann man eine Minimum Heap-Datenstruktur verwenden, die es erleichtert, den abstrakten Datentyp Prioritätswarteschlange zu implementieren.

In Go kann man eine Minimum Heap mit dem Paket `container/heap` implementieren.

Das Container-Paket ist die Standardbibliothek der Go-Sprache und umfasst unter anderem `container/ring` zur Implementierung von zirkulären Listen, `container/list` zur Implementierung von Listen und `container/heap` zur Implementierung von Heaps.

## Implementierung von Heaps in der Go-Sprache

Um einen Heap in der Go-Sprache zu implementieren, muss das Paket `container/heap` verwendet werden. Dieses Paket unterstützt sowohl Minimum- als auch Maximumheaps und zur Implementierung eines Heaps müssen mehrere Schnittstellen implementiert werden.

### Implementierung der Schnittstellen

Um einen Heap zu implementieren, muss die Schnittstelle `heap.Interface` implementiert werden. Diese Schnittstelle umfasst die folgenden Methoden:
```go
package heap

// Aus Gründen der Bequemlichkeit sind hier alle Methoden im Detail angegeben, tatsächlich bettet die Schnittstelle sort.Interface ein.
type Interface interface {
    Len() int           // Gibt die Länge des Heaps zurück
    Less(i, j int) bool // Gibt true zurück, wenn das i-te Element kleiner ist als das j-te Element
    Swap(i, j int)      // Tauscht das i-te Element mit dem j-ten Element
    Push(x any)         // Fügt ein neues Element zum Heap hinzu
    Pop() any           // Entfernt und gibt das kleinste Element aus dem Heap zurück
}
```

In anderen Sprachen, wie zum Beispiel Python, kann man einfach `heapq` verwenden, aber in Go muss man von Grund auf implementieren, was etwas umständlich sein kann.

Jetzt lass uns tatsächlich implementieren.

Ich werde die Implementierung zur Veranschaulichung in Form eines int-Typ-Slices durchführen.

```go
package main

import (
	"container/heap"
	"fmt"
)

// IntHeap - Struktur, die ein Slice vom Typ int als Heap implementiert.
type IntHeap []int

// Len - Gibt die Länge des Heaps zurück.
func (h *IntHeap) Len() int {
	return len(*h)
}

// Less - Gibt true zurück, wenn das i-te Element kleiner ist als das j-te Element.
// HINWEIS: Diese Methode kann verwendet werden, um die Sortierkriterien zu ändern.
// Für einen spezifischen Strukturheap kann man die spezifischen Felder des Struktur verwenden: z.B. `(*h)[i].Field < (*h)[j].Field`.
func (h *IntHeap) Less(i, j int) bool {
	return (*h)[i] < (*h)[j]
}

// Swap - Tauscht das i-te Element mit dem j-ten Element. Wird in der Praxis verwendet, um Upheap und Downheap zu implementieren.
func (h *IntHeap) Swap(i, j int) {
	(*h)[i], (*h)[j] = (*h)[j], (*h)[i]
}

// Push - Fügt ein neues Element zum Heap hinzu.
func (h *IntHeap) Push(x any) {
	*h = append(*h, x.(int))
}

// Pop - Entfernt und gibt das kleinste Element aus dem Heap zurück.
func (h *IntHeap) Pop() any {
	old := *h
	n := len(old)
	x := old[n-1]
	*h = old[0 : n-1]
	return x
}

func main() {
	// Initialisierung des IntHeaps.
	h := &IntHeap{2, 1, 5, 3, 4}
	heap.Init(h) // Heap initialisieren.

	// Neues Element zum Heap hinzufügen.
	heap.Push(h, 0)

	for h.Len() > 0 {
		fmt.Println(heap.Pop(h)) // Entfernt und gibt das kleinste Element aus dem Heap aus.
	}
}
```

Wenn man den obigen Code ausführt, wird folgendes Ergebnis ausgegeben. Man kann sehen, dass die Sortierung erfolgreich durchgeführt wurde.
```
0
1
2
3
4
5
```

## Referenzen
- https://pkg.go.dev/container/heap
- https://lktprogrammer.tistory.com/69
- https://www.daleseo.com/python-heapq/