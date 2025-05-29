---
title: Implementing Min/Max Heap Using Standard Library in Golang
type: blog
date: 2025-05-29
comments: true
translated: true
---

![image](/images/go/container-heap-1748486874223.png)

When implementing algorithms for coding tests or specific requirements, there are times when sorted data is needed.

For instance, when implementing Dijkstra's algorithm, it is necessary to select the node with the shortest distance among the nodes that can be reached from the current node. Using a priority queue allows for a more efficient implementation compared to sorting every time.

In this case, using a minimum heap as the data structure for storing short nodes makes it easier to implement the abstract data type of a priority queue.

In Go, a minimum heap can be implemented using the `container/heap` package.

The container package is a standard library of the Go language, which includes `container/ring` for implementing circular lists, `container/list` for lists, and `container/heap` for heaps.

## Implementing Heap in Go

To implement a heap in Go, the `container/heap` package must be used. This package supports both minimum heaps and maximum heaps, and to implement a heap, several interfaces need to be defined.

### Implementing Interfaces

To implement a heap, you must implement the `heap.Interface`. This interface includes the following methods:
```go
package heap

// All methods are spelled out for convenience, but the actual interface embeds sort.Interface.
type Interface interface {
    Len() int           // Returns the length of the heap
    Less(i, j int) bool // Returns true if the i-th element is less than the j-th element
    Swap(i, j int)      // Swaps the i-th and j-th elements
    Push(x any)         // Adds a new element to the heap
    Pop() any           // Removes and returns the smallest element from the heap
}
```

In other languages, like Python, you can simply use `heapq`, but in Go, you have to start from the implementation, which can be cumbersome.

Now, let's implement it.

I will use a slice of int for a clear understanding of sorting.

```go
package main

import (
	"container/heap"
	"fmt"
)

// IntHeap - A struct that implements a heap using a slice of int.
type IntHeap []int

// Len - Returns the length of the heap.
func (h *IntHeap) Len() int {
	return len(*h)
}

// Less - Returns true if the i-th element is less than the j-th element.
// NOTE: This method can be used to change the sorting order.
// For a specific struct heap, you would write: ex) `(*h)[i].Field < (*h)[j].Field`
func (h *IntHeap) Less(i, j int) bool {
	return (*h)[i] < (*h)[j]
}

// Swap - Swaps the i-th and j-th elements. Used in the actual heap implementation for Upheap and Downheap.
func (h *IntHeap) Swap(i, j int) {
	(*h)[i], (*h)[j] = (*h)[j], (*h)[i]
}

// Push - Adds a new element to the heap.
func (h *IntHeap) Push(x any) {
	*h = append(*h, x.(int))
}

// Pop - Removes and returns the smallest element from the heap.
func (h *IntHeap) Pop() any {
	old := *h
	n := len(old)
	x := old[n-1]
	*h = old[0 : n-1]
	return x
}

func main() {
	// Initialize IntHeap.
	h := &IntHeap{2, 1, 5, 3, 4}
	heap.Init(h) // Initialize the heap.

	// Add a new element to the heap.
	heap.Push(h, 0)

	for h.Len() > 0 {
		fmt.Println(heap.Pop(h)) // Remove and print the smallest element from the heap.
	}
}
```

When the above code is executed, the following result is produced. As you can see, the sorting works perfectly.
```
0
1
2
3
4
5
```

## Reference
- https://pkg.go.dev/container/heap
- https://lktprogrammer.tistory.com/69
- https://www.daleseo.com/python-heapq/
