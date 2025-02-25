---
translated: true
title: GolangでSingleflightを使って重複リクエストにも強いサーバーを作る
type: blog
date: 2025-02-10
comments: true
---
最近、会社が閉業することになり、しばらくフリーランスとして働くことにしました。

幸いにも優れた方に出会い、Goやウェブについて様々なスキルを学ぶことができました。その一つがsingleflightパッケージを使った改善でした。

![image](/images/go/singleflight-1739191305077.png)

## Singleflightとは？
英語で直訳すると「単一飛行」という意味ですが、そんなに難しく考えず、一つの実行を保証するものと考えれば十分です。

例を見ればより簡単に理解できるでしょう。以下のコードを見てみましょう。

```go
package main

import (
	"log/slog"
	"time"
	
)


var counter int

func DoSomething() {
	time.Sleep(5 * time.Second)

	counter++

	slog.Info("result", "counter", counter)
}

func main() {
	for i := 0; i < 10; i++ {
		go DoSomething()
	}

	time.Sleep(10 * time.Second)
}
```

```shell
2025/02/10 20:49:22 INFO result counter=3
2025/02/10 20:49:22 INFO result counter=4
2025/02/10 20:49:22 INFO result counter=10
2025/02/10 20:49:22 INFO result counter=5
2025/02/10 20:49:22 INFO result counter=2
2025/02/10 20:49:22 INFO result counter=6
2025/02/10 20:49:22 INFO result counter=7
2025/02/10 20:49:22 INFO result counter=9
2025/02/10 20:49:22 INFO result counter=1
2025/02/10 20:49:22 INFO result counter=8
```
当然の結果ですが、ゴルーチンなので順序は保証されませんが、カウンターは1から10に到達しました。

この例では、`DoSomething()` 関数が時間がかかり、CPU/メモリ消費が大きい忙しい関数であると仮定しています。

もしサーバーにこのような関数があり、重複したリクエストが存在する場合、どうなるでしょうか？
> 非常に高い確率でサーバーがダウンするでしょう。

このような場合の有効な方法として `singleflight` パッケージを使用して改善できます。

singleflightは一つの関数の実行のみを保証し、同時に入ってきたリクエストに対しては同じ結果を返します。

### Singleflightを利用する
まずsingleflightパッケージをインストールしましょう。
```shell
go get -u golang.org/x/sync/singleflight
```

そして次のようにコードを修正します。
```go
package main

import (
	"log/slog"
	"time"

	"golang.org/x/sync/singleflight"
)

var counter int

func DoSomething(group *singleflight.Group) {
	res, err, shared := group.Do("key", func() (interface{}, error) {
		time.Sleep(5 * time.Second)

		counter++
		return counter, nil
	})
	if err != nil {
		slog.Error("error", "err", err)
	}

	slog.Info("result", "res", res, "shared", shared)
}

func main() {
	group := singleflight.Group{}
	for i := 0; i < 10; i++ {
		go DoSomething(&group)
	}

	time.Sleep(10 * time.Second)
}
```
```shell
2025/02/10 20:43:25 INFO result res=1 shared=true
2025/02/10 20:43:25 INFO result res=1 shared=true
2025/02/10 20:43:25 INFO result res=1 shared=true
2025/02/10 20:43:25 INFO result res=1 shared=true
2025/02/10 20:43:25 INFO result res=1 shared=true
2025/02/10 20:43:25 INFO result res=1 shared=true
2025/02/10 20:43:25 INFO result res=1 shared=true
2025/02/10 20:43:25 INFO result res=1 shared=true
2025/02/10 20:43:25 INFO result res=1 shared=true
2025/02/10 20:43:25 INFO result res=1 shared=true
```

上記を見てわかるように、ゴルーチンとして実行されましたが、resは1でカウンターは1のみ増加しました。
> 一度のみ実行されたからです。

このとき、同時実行の基準は `"key"` パラメーターです。固定キーとして設定されているため、常に1つまで実行されることが保証されます。

もし特定のキーを基に重複実行を防ぎたい場合（例：ユーザーIDなど）、`"key"` の値を任意のパラメーターに置き換えるとよいでしょう。

## HTTPサーバーに適用する
これをHTTPサーバーにも適用できます。

簡単に `net/http` パッケージを使用して次のように適用してみましょう。

```go
package main

import (
	"log"
	"log/slog"
	"net/http"
	"time"

	"golang.org/x/sync/singleflight"
)

func HandleBusyLogic(group *singleflight.Group) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		res, err, _ := group.Do("key", func() (interface{}, error) {
			time.Sleep(5 * time.Second)
			slog.Info("Hello, World!")
			return "Hello, World!", nil
		})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Write([]byte(res.(string)))
	})
}

func main() {

	mux := http.NewServeMux()
	group := singleflight.Group{}
	mux.Handle("GET /", HandleBusyLogic(&group))

	s := &http.Server{
		Addr: "0.0.0.0:8080",
	}

	s.Handler = mux

	slog.Info("Server started", "addr", s.Addr)
	if err := s.ListenAndServe(); err != nil {
		log.Fatalf("ListenAndServe: %v", err)
	}
}
```

上記ではハンドラーが少し異なりますが、基本的に同じです。group変数をパラメーターとして受け取り `Do` 関数を実行します。

クライアントコードも次のように構成できます。
```go
package main

import (
	"io"
	"log/slog"
	"net/http"
	"sync"
)

func main() {
	var wg sync.WaitGroup
	for i := 0; i < 5; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			response, err := http.Get("http://localhost:8080")
			if err != nil {
				slog.Error("failed to get response", "err", err)
				return
			}

			bodyByte, err := io.ReadAll(response.Body)
			if err != nil {
				slog.Error("failed to read body", "err", err)
				return
			}

			slog.Info("response", "body", string(bodyByte))
		}()
	}

	wg.Wait()
}
```

サーバーを起動した状態で実行してみると、

サーバー側では確かにログが1回記録されるのがわかります。
```shell
2025/02/10 21:09:31 INFO Server started addr=0.0.0.0:8080
2025/02/10 21:10:17 INFO Hello, World!
```

クライアント側では、送信した5つすべてのリクエストが同一の応答を受けたことがわかります。
```shell
2025/02/10 21:10:17 INFO response body="Hello, World!"
2025/02/10 21:10:17 INFO response body="Hello, World!"
2025/02/10 21:10:17 INFO response body="Hello, World!"
2025/02/10 21:10:17 INFO response body="Hello, World!"
2025/02/10 21:10:17 INFO response body="Hello, World!"
```

このようにsingleflightパッケージを使用すると、重複リクエストにも強いサーバーを作ることができます。

しかし、こんな疑問が浮かぶかもしれません。

## このような場合、キャッシュを使ってもいいのでは？
その通りです。[前回の投稿](/blog/spring/spring-redis-cache/)でも見た通り、同一リクエストであればキャッシュを用いることで、多くのリクエストを効果的にキャッシュで処理できます。

ただし、役割が少し異なります。

### キャッシュ 

キャッシュの場合、単一実行を保証しないため、キャッシュ前や、Expireされてキャッシュミスが発生する状況では脆弱です。

たいていこのようなものを付ける場合、時間がかかるか、負荷が大きくなる処理なので、同時リクエストはさらに致命的である可能性があります。

逆に、キャッシュヒットの場合は、singleflightよりも迅速に応答することができるでしょう。

![image](/images/go/singleflight-1739189940786.png)

### Singleflight 

一方、singleflightの場合、1つだけを実行することを保証します。したがって、キャッシュミスの場合でも、最大で実行する関数を1つに制限することでサーバーの負荷を最小化できます。

ただし、当然キャッシュではないため、その関数の実行が終われば再び新しく実行する必要があります。このため、全体的な時間としてはキャッシュよりも遅くなることがあります。

したがって、このような場合、Singleflightとキャッシュを一緒に使用するのが最も良い方法でしょう。

## ロック
SingleFlight以外にも他の外部ロックを使用する方法があります。特にマルチコンテナの状況で、一つのコンテナのみが動作すべき場合にこの方法を有効に活用できます。

このような場合、結果をコピーして提示することが少し難しいかもしれません。（不可能とは言いません。方法は多様ですが、ロックを取得するまで待ち、キャッシュした応答を他のコンテナからアクセスできればいくらでも実現可能です。）

ただし、大部分の一般的な状況では、ロックを厳重に掛けなければならないケースはほとんどなく、singleflightのような軽量ツールのみで十分に解決できるでしょう。

## キューを使ってもよいのでは？
以前に [EDA](/blog/web/eda/) で取り上げたように、キューを使用するとイベントを順次処理できます。当時にも負荷を減らす良い方法と説明しましたが、目的が異なります。

キューの場合は、異なるリクエストを処理することにより適しています。例えば、特定の外部サービスへのリクエストをすべてまとめてキューで処理するといった具合です。

反対にSingleflightは、同一リクエストに対し処理することに適しています。サーバーメタデータや、クロールリクエストのように、ほぼ同一とみなされるリクエストに対して使用するのが望ましいです。


### 結論として
このパッケージはxであるにもかかわらず、golangが直接提供しているという事実は驚くべきことです。他の言語ではこのようなものまで標準に含まれていることはなかった気がしますが、Golangはこのような部分にも配慮しているようで個人的に新鮮でした。

ミドルウェア形式で作り、キャッシュを使用するAPIならほぼすべて一緒に使用できるのではないでしょうか。（特に時間がかかる作業に非常に効果的だと思われます。）

複雑性を減らし、サーバーの負荷を減らす方法を探しているならば、Singleflightを試してみましょう！

## 参考文献
- https://pkg.go.dev/golang.org/x/sync/singleflight
- https://velog.io/@divan/singleflight%EB%A5%BC-%ED%99%9C%EC%9A%A9%ED%95%9C-%EC%B5%9C%EC%A0%81%ED%99%94
- https://www.codingexplorations.com/blog/understanding-singleflight-in-golang-a-solution-for-eliminating-redundant-work
