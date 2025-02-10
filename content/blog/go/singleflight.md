---l
title: Singleflight로 중복 요청에도 강한 서버 만들기
type: blog
date: 2025-02-10
comments: true
---
최근 회사가 폐업하게 되면서 잠시동안 프리랜서로 일하게 되었다.

다행히도 뛰어나신 분을 만나 Go나 웹에 대해 여러 스킬에 대해 배우게 되었는데, 그 중 하나가 singleflight 패키지를 사용한 개선이었다.

![image](/images/go/singleflight-1739191305077.png)

## Singleflight?
영어로 직역하면, "단일 비행"이라는 뜻이다. 사실 너무 어렵게 이해할 필요 없이, 하나의 실행을 보장한다고 보면 된다.

예시를 보면 더더욱 간단한데 아래 코드를 보자

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
당연스러운 결과겠지만, 고루틴이기에 순서는 보장되지 않으나 카운터는 1부터 10에 도달하게 되었다.

이때 예시에서는 `DoSomething()` 함수를 바쁜 함수(시간이 오래 걸리고, CPU/Memory 소모가 큰 함수)로 가정했다.

만약 서버에 이런 함수가 있고 중복 요청까지 있다면 어떻게 될까?
> 매우 높은 확률로 서버가 다운될 것이다.

이럴때 유효한 방법으로 `singleflight` 패키지를 사용하여 개선할 수 있다.

singleflight는 단 하나의 함수만 실행되도록 보장하며, 동시간대(함수가 실행되는 시간에 들어온 모든 요청)에 들어온 요청에 대해 동일한 결과를 반환한다

### Singleflight 사용하기
먼저 singleflight 패키지를 설치하자
```shell
go get -u golang.org/x/sync/singleflight
```

그리고 다음과 같이 코드를 수정해보자
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

위에서 보면 고루틴으로 실행되었지만, res는 1로 counter가 1만 증가하였음을 알 수 있다.
> 한번만 실행되었기 때문이다.

이때 동시에 실행하는 기준은 `"key"` 파라미터이다. 고정키로 설정해두었기 때문에, 항상 1개까지 실행되도록 보장한다.

만약 특정 키를 기준으로 중복 실행을 막고자 한다면(예: 유저 ID 등) `"key"` 값을 원하는 파라미터로 대체하면 된다.

## HTTP Server에 적용하기
이를 http server에도 적용할 수 있다.

간단하게 `net/http` 패키지를 사용해서 다음과 같이 적용해보자 

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

위와 핸들러 정도만 다르고, 기본적으로 동일하다. group 변수를 파라미터로 받아 `Do` 함수를 실행한다.

클라이언트 코드도 다음과 같이 구성할 수 있다.
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

서버를 켠 상태로 실행해보면

서버측에서는 분명 로그가 1번 찍히는 걸 볼 수 있는데,
```shell
2025/02/10 21:09:31 INFO Server started addr=0.0.0.0:8080
2025/02/10 21:10:17 INFO Hello, World!
```

클라이언트에서는 요청한 횟수 5번 모두 동일한 응답을 받았음을 알 수 있다.
```shell
2025/02/10 21:10:17 INFO response body="Hello, World!"
2025/02/10 21:10:17 INFO response body="Hello, World!"
2025/02/10 21:10:17 INFO response body="Hello, World!"
2025/02/10 21:10:17 INFO response body="Hello, World!"
2025/02/10 21:10:17 INFO response body="Hello, World!"
```

이처럼 singleflight 패키지를 사용하면, 중복 요청에도 강한 서버를 만들 수 있다.

근데 이런 의문이 들 것이다

## 이럴 바엔 캐시 써도 되지 않나?
맞다. [이전 포스팅](/blog/spring/spring-redis-cache/)에서도 알아보았듯이 동일한 요청이라면 캐시를 사용해도, 많은 요청을 효과적으로 캐시를 통해 해소할 수 있다.

다만 역할이 조금 다르다.

### 캐시 

캐시의 경우 단일 실행을 보장하지 않기 때문에, 캐싱 전이나, Expire되어 Cache Miss가 발생하는 상황에서는 취약하다.

대부분 이런걸 붙이는 곳에서는 시간이 오래걸리거나, 부하가 많이 생기는 작업이기에 동시요청은 더더욱 치명적일 수 있다.

반대로 Cache Hit 상황에서는 singleflight보다 더 빠르게 응답을 할 수 있을 것이다.

![image](/images/go/singleflight-1739189940786.png)

### Singleflight 

반대로 singleflight의 경우 하나만 수행하는 것을 보장한다. 따라서 캐시 미스인 상황이라도 최대 수행하는 함수를 1개로 제한하므로써, 서버의 부하를 최소화할 수 있다.

다만, 역시 캐시가 아니기에 해당 함수의 실행이 끝나면 끝나면 다시 새롭게 수행해야 한다. 따라서 전체적인 시간으로만 보면 캐시보다 느릴 수 있다.

따라서 이런 경우 Singleflight와 캐시를 함께 사용하는 것이 가장 좋은 방법일 것이다.

## Lock
SingleFlight외에 다른 외부 락을 사용하는 방법도 있다. 특히 멀티컨테이너 상황에서 엄중하게 하나의 컨테이너만 돌아가야한다거나 할 때 해당 방법을 유용하게 사용할 수 있을 것이다.

이런 경우 결과물을 복사해서 내어준다거나 하긴 조금 어려울 수 있다. (못한다는 건 아니다. 방법은 다양하겠지만 락을 받을 때까지 wait을 걸고 캐시한 응답을 다른 컨테이너에서 접근 가능하다면 얼마든지 구현할 수 있을 것이다.)

다만 대부분의 일반적인 상황에선 락을 엄중하게 걸어야 할 상황이 많지 않고, singleflight와 같은 가벼운 도구만으로도 충분히 해결할 수 있을 것이다.

## Queue를 써도 되지 않나?
이전에 [EDA](/blog/web/eda/)에서도 알아봤듯이, Queue를 사용하면 이벤트를 순차적으로 처리할 수 있다. 당시에도 부하를 줄일 수 있는 좋은 방법이라 설명했으나, 용도가 서로 다르다.

Queue의 경우 서로 다른 요청을 처리하는 것에 좀 더 적합하다. 예를 들어 특정 외부 서비스에게 요청을 보내는 모든 집합을 묶어 한 큐에서 처리한다던가 하는 식이다.

반면 Singleflight는 동일한 요청에 대해 처리하는 것에 적합하다. 서버 메타데이터나, 크롤링 요청과같이 거의 동일할 것이라 여겨지는 요청에 대해 사용하는 것이 좋다.


### 마치며
해당 패키지는 x이긴 하나 golang에서 직접 제공한다는 것이 놀라웠다. 다른 언어에선 이런거까지 표준엔 없었던 것 같은데, Golang은 이런 부분까지도 신경쓰는 것 같아서 개인적으로 감회가 새로웠다.

미들웨어 형식으로 만들어서, 캐시를 사용하는 API라면 거의 모두 함께 사용할 수 있지 않을까 한다. (특히 오래 걸리는 작업에 매우 효과적일 것 같아 기대된다.)

모두 복잡도를 줄이면서, 서버의 부하를 줄이는 방법을 찾고 있다면, Singleflight를 사용해보도록 하자!

## Reference
- https://pkg.go.dev/golang.org/x/sync/singleflight
- https://velog.io/@divan/singleflight%EB%A5%BC-%ED%99%9C%EC%9A%A9%ED%95%9C-%EC%B5%9C%EC%A0%81%ED%99%94
- https://www.codingexplorations.com/blog/understanding-singleflight-in-golang-a-solution-for-eliminating-redundant-work
