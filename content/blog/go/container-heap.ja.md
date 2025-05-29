---
title: Golangで標準ライブラリを利用した最小・最大ヒープの実装
type: blog
date: 2025-05-29
comments: true
translated: true
---

![image](/images/go/container-heap-1748486874223.png)

コーディングテストや、特定の要件に合ったアルゴリズムを実装する際に、整列された形のデータが必要になります。

例えば、ダイジェストラアルゴリズムを実装する際には、現在のノードからアクセス可能なノードの中から最も距離の短いノードを選択する必要があります。この時、優先度キューを使用することで、毎回整列するよりもはるかに効率的に実装できます。

この時、短いノードを保持するためのデータ構造として最小ヒープ(Minimum Heap)を利用すれば、抽象データ型である優先度キューを簡単に実装できます。

Goでは`container/heap`パッケージを利用して最小ヒープを実装できます。

containerパッケージはGo言語の標準ライブラリで、Circular listを実装するための`container/ring`、リストを実装するための`container/list`、ヒープを実装するための`container/heap`などがあります。

## Go言語でのヒープ実装

Go言語でヒープを実装するには、`container/heap`パッケージを使用する必要があります。このパッケージは最小ヒープと最大ヒープの両方をサポートしており、ヒープを実装するためにはいくつかのインターフェースを実装する必要があります。

### インターフェースの実装

ヒープを実装するには、`heap.Interface`インターフェースを実装しなければなりません。このインターフェースには、以下のメソッドが含まれています。
```go
package heap

// 便利上すべて展開して書いていますが、実際のインターフェースはsort.Interfaceを埋め込んでいます。
type Interface interface {
    Len() int           // ヒープの長さを返す
    Less(i, j int) bool // i番目の要素がj番目の要素より小さいとtrueを返す
    Swap(i, j int)      // i番目の要素とj番目の要素を交換
    Push(x any)         // ヒープに新しい要素を追加
    Pop() any           // ヒープから最小の要素を削除して返す
}
```

他の言語、例えばPythonでは単に`heapq`を使えば良いですが、Goでは実装から始める必要があるため、面倒な面があります。

では、実際に実装してみましょう。

筆者は整列されていることがわかりやすいようにint型のスライスを用いて実装してみます。

```go
package main

import (
	"container/heap"
	"fmt"
)

// IntHeap - int型のスライスをヒープとして実装した構造体。
type IntHeap []int

// Len - ヒープの長さを返します。
func (h *IntHeap) Len() int {
	return len(*h)
}

// Less - i番目の要素がj番目の要素より小さい場合はtrueを返します。
// NOTE: ソートの基準を変更したい場合、こちらのメソッドを使用できます。
// 特定の構造体ヒープであれば、構造体の特定のフィールド：ex) `(*h)[i].Field < (*h)[j].Field`のように記述します。
func (h *IntHeap) Less(i, j int) bool {
	return (*h)[i] < (*h)[j]
}

// Swap - i番目の要素とj番目の要素を交換します。実際のヒープではUpheapとDownheapを実装するために使用されます。
func (h *IntHeap) Swap(i, j int) {
	(*h)[i], (*h)[j] = (*h)[j], (*h)[i]
}

// Push - ヒープに新しい要素を追加します。
func (h *IntHeap) Push(x any) {
	*h = append(*h, x.(int))
}

// Pop - ヒープから最小の要素を削除して返します。
func (h *IntHeap) Pop() any {
	old := *h
	n := len(old)
	x := old[n-1]
	*h = old[0 : n-1]
	return x
}

func main() {
	// IntHeapを初期化します。
	h := &IntHeap{2, 1, 5, 3, 4}
	heap.Init(h) // ヒープを初期化します。

	// ヒープに新しい要素を追加します。
	head.Push(h, 0)

	for h.Len() > 0 {
		fmt.Println(heap.Pop(h)) // ヒープから最小の要素を削除して出力します。
	}
}
```

上記のコードを実行すると、以下のような結果が出力されます。見ての通り、整列がうまくいって出力されていることがわかります。
```
0
1
2
3
4
5
```

## 参考
- https://pkg.go.dev/container/heap
- https://lktprogrammer.tistory.com/69
- https://www.daleseo.com/python-heapq/