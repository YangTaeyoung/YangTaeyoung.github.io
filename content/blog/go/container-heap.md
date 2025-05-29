---
title: Golang에서 표준 라이브러리를 이용해 최소·최대힙 구현하기
type: blog
date: 2025-05-29 
comments: true
---

![image](/images/go/container-heap-1748486874223.png)

코딩 테스트나, 특정 요구사항에 맞는 알고리즘을 구현할 때 정렬된 형태의 데이터를 받고자 할 때가 있다.

예를 들어 다익스트라 알고리즘을 구현할 때, 현재 노드에서 갈 수 있는 노드들 중 가장 거리가 짧은 노드를 선택해야 한다. 이때 우선순위 큐를 사용하면 매번 정렬을 하는 것보다 훨씬 효율적으로 구현할 수 있다.

이때 짧은 노드들을 담기 위한 자료구조로 최소 힙 (Minimum Heap)을 이용하면 추상 자료형인 우선순위 큐를 쉽게 구현할 수 있다.

Go에서는 `container/heap` 패키지를 이용하여 최소 힙을 구현할 수 있다.

container 패키지는 Go 언어의 표준 라이브러리로, Circular list를 구현하기 위한 `container/ring`, 리스트를 구현하기 위한 `container/list`, 힙을 구현하기 위한 `container/heap` 등이 있다.

## Go 언어에서 힙 구현하기

Go 언어에서 힙을 구현하기 위해서는 `container/heap` 패키지를 사용해야 한다. 이 패키지는 최소 힙과 최대 힙을 모두 지원하며, 힙을 구현하기 위해서는 몇 가지 인터페이스를 구현해야 한다.

### 인터페이스 구현하기

힙을 구현하기 위해서는 `heap.Interface` 인터페이스를 구현해야 한다. 이 인터페이스는 다음과 같은 메서드를 포함한다
```go
package heap

// 편의상 모두 풀어서 적었지만, 실제 인터페이스는 sort.Interface를 임베드하고 있다.
type Interface interface {
    Len() int           // 힙의 길이를 반환
    Less(i, j int) bool // i번째 요소가 j번째 요소보다 작으면 true
    Swap(i, j int)      // i번째 요소와 j번째 요소를 교환
    Push(x any)         // 힙에 새로운 요소를 추가
    Pop() any           // 힙에서 가장 작은 요소를 제거하고 반환
}
```

다른 언어, 예를 들어 파이썬에서는 단순히 `heapq`를 이용하면 되지만, Go에서는 구현부터 시작해야 해서 번거로운 면이 있다. 

이제 실제로 구현해보자

필자는 정렬하는 것을 바로 알아보기 쉽게 int타입의 슬라이스를 이용하여 구현해보겠다.

```go
package main

import (
	"container/heap"
	"fmt"
)

// IntHeap - int 타입의 슬라이스를 힙으로 구현한 구조체이다.
type IntHeap []int

// Len - 힙의 길이를 반환한다.
func (h *IntHeap) Len() int {
	return len(*h)
}

// Less - i번째 요소가 j번째 요소보다 작으면 true를 반환한다.
// NOTE: 정렬 기준을 변경하고 싶을 때 해당 메서드를 사용할 수 있다. 
// 특정 구조체 힙이라면 구조체의 특정 필드: ex) `(*h)[i].Field < (*h)[j].Field` 와 같이 작성하면 된다. 
func (h *IntHeap) Less(i, j int) bool {
	return (*h)[i] < (*h)[j]
}

// Swap - i번째 요소와 j번째 요소를 교환한다. 실제 힙에서는 Upheap과 Downheap을 구현하기 위해 사용한다
func (h *IntHeap) Swap(i, j int) {
	(*h)[i], (*h)[j] = (*h)[j], (*h)[i]
}

// Push - 힙에 새로운 요소를 추가한다.
func (h *IntHeap) Push(x any) {
	*h = append(*h, x.(int))
}

// Pop - 힙에서 가장 작은 요소를 제거하고 반환한다.
func (h *IntHeap) Pop() any {
	old := *h
	n := len(old)
	x := old[n-1]
	*h = old[0 : n-1]
	return x
}

func main() {
	// IntHeap을 초기화한다.
	h := &IntHeap{2, 1, 5, 3, 4}
	heap.Init(h) // 힙을 초기화한다.

	// 힙에 새로운 요소를 추가한다.
	heap.Push(h, 0)

	for h.Len() > 0 {
		fmt.Println(heap.Pop(h)) // 힙에서 가장 작은 요소를 제거하고 출력한다.
	}
}
```

위 코드를 실행하면 다음과 같은 결과가 출력된다. 보다시피 정렬이 잘 되어 출력되는 것을 알 수 있다.
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