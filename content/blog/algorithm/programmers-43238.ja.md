---
title: "[プログラミング] 入国審査 (Golang)"
type: blog
date: 2025-05-23
comments: true
translated: true
---

## 問題
[**プログラミング問題 入国審査**](https://school.programmers.co.kr/learn/courses/30/lessons/43238)
```
n人が入国審査のために並んで待っています。それぞれの入国審査官が審査するのにかかる時間は異なります。

最初はすべての審査場は空いています。一つの審査場では同時に一人だけ審査を行うことができます。最前列にいる人は空いている審査場に行って審査を受けることができます。ただし、より早く終わる審査場がある場合は、そこを待ってから行くこともできます。

すべての人が審査を受けるのにかかる時間を最小にしたいと思います。

入国審査を待っている人数 n と、各審査官が一人を審査するのにかかる時間の配列 times がパラメータとして与えられたとき、すべての人が審査を受けるのにかかる時間の最小値を return するように solution 関数を作成してください。
```

## 制限事項
```
- 入国審査を待っている人数は 1 人以上 1,000,000,000 人以下です。
- 各審査官が一人を審査するのにかかる時間は 1 分以上 1,000,000,000 分以下です。
- 審査官は 1 人以上 100,000 人以下です。
```

## アプローチ
一般的にこのように範囲が広い場合、二分探索を通じて問題を解決できます。

ただし、この場合は待っている人数が最大 1,000,000,000 人、かかる時間が 1,000,000,000 分、さらには審査官も 100,000 人まで存在するため、どのようにアプローチすべきかわからなくなりました。

何度考えてもどの部分でアプローチをすべきかわからず、今回は ChatGPT にヒントを求めてみました。
~~(実際、だからこそ書いている反省の投稿です)~~ 

### ChatGPT のヒント

![image](/images/algorithm/programmers-43238-1747970726257.png)

答えを要約すると、return 値である `処理するのにかかる総最小時間` を基準に二分探索を行うと提案されています。 `処理するのにかかる総時間 / 各審査官の処理時間` は `処理される人数` となるため、この部分を基準に二分探索を進めれば良いとのヒントを得ました。

この場合、先ほど考えた審査官 100,000 の配列はすべて回らなければなりません。筆者の考えではこの程度は負担が大きいと思ったのですが、今後はこの程度は大丈夫だと思ってアプローチすべきだと思います。

そこで、二分探索の基準を `処理するのにかかる総最小時間` に設定し、二分探索を実行してみましょう。

通常、二分探索の結果はその二分探索の対象となるため、今後このような問題では結果を基準にまず考えることが良いと思います。

### 実装
まず二分探索の基準となる `canHandled()` 関数を作成しました。 
本関数は `処理するのにかかる総最小時間` を基準に `処理される人数` を算出する関数です。

本関数の用途は二分探索の分岐ごとの条件確認用として使用されます。
```go
func canHandled(times []int, time int64, human int) bool {
	var total int64 = 0
	
    for _, t := range times {
		total += time / int64(t)
	}
    
	return total >= int64(human)
}
```

その後、この関数を用いて二分探索を実際に進めるコードを作成します。
```go
func solution(n int, times []int) int64 {
    maxTime := int64(1000000000) * int64(n)
    minTime := int64(1)
    answer := int64(0)
    for minTime <= maxTime {
        mid := (minTime + maxTime) / 2
        if canHandled(times, mid, n) {
            maxTime = mid - 1
            answer = mid
        } else {
            minTime = mid + 1
        }
    }
	
    return answer
}
```

`canHandled()` 関数の結果が `true` の場合、 `処理される人数` が `n` 以上である意味となりますので、 `maxTime` を減少させます。
逆に `false` の場合には `処理される人数` が `n` 未満である意味になりますので、次のステージでより多くの人を確保するために `minTime` を増加させます。

ここで `canHandled()` が `true` の時のみ `answer` を更新する必要があり、当然処理ができない時は `answer` を更新する必要はありません。
