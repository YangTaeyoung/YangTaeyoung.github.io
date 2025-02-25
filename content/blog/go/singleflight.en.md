---
title: Building a Server Strong Against Duplicate Requests with Singleflight in Golang
type: blog
date: 2025-02-10
comments: true
translated: true
---

Recently, my company went out of business, and I started working as a freelancer for a while.

Fortunately, I met an excellent person and learned various skills regarding Go and the web, one of which was an improvement using the singleflight package.

![image](/images/go/singleflight-1739191305077.png)

## Singleflight?

Literally translated, it means "single flight." There's no need to understand it too difficultly; just consider it as ensuring a single execution.

The concept becomes even simpler with an example, as shown in the code below:

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

As expected, since it's a goroutine, the order is not guaranteed, but the counter reaches from 1 to 10.

In this example, the `DoSomething()` function is assumed to be a busy function (a function that takes a long time and consumes a lot of CPU/Memory).

What would happen if there is such a function on the server and there are duplicate requests?
> With a very high probability, the server will go down.

In such cases, using the `singleflight` package is an effective way to improve the situation.

Singleflight ensures that only one function is executed and returns the same result for all requests that arrived in the same period (during the function execution time).

### Using Singleflight

First, install the singleflight package:

```shell
go get -u golang.org/x/sync/singleflight
```

Then modify the code as follows:

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

As seen above, although it was executed with goroutines, the `res` stayed at 1, meaning the counter only incremented once.
> It was executed only once.

At this time, the criterion for simultaneous execution is the `"key"` parameter. Since we set it as a fixed key, it ensures only one can be executed at the same time.

If you want to prevent duplicate execution based on a specific key (e.g., user ID), replace the `"key"` value with the desired parameter.

## Applying to an HTTP Server

This can also be applied to an HTTP server.

Simply apply it using the `net/http` package as follows:

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

There isn't much difference except the handler part. The group variable is passed as a parameter to execute the `Do` function.

The client code can also be structured as follows:

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

If you run the server in this state, you can clearly see that the log on the server side is printed only once,

```shell
2025/02/10 21:09:31 INFO Server started addr=0.0.0.0:8080
2025/02/10 21:10:17 INFO Hello, World!
```

While the client side shows that all five requests received the same response.

```shell
2025/02/10 21:10:17 INFO response body="Hello, World!"
2025/02/10 21:10:17 INFO response body="Hello, World!"
2025/02/10 21:10:17 INFO response body="Hello, World!"
2025/02/10 21:10:17 INFO response body="Hello, World!"
2025/02/10 21:10:17 INFO response body="Hello, World!"
```

As such, by using the singleflight package, you can build a server strong against duplicate requests.

But one might wonder:

## Can't We Just Use Caching?

Yes, as discussed in a [previous post](/blog/spring/spring-redis-cache/), if the requests are identical, using caching can efficiently handle many requests through caching.

However, their roles are slightly different.

### Cache

In the case of cache, it does not guarantee single execution. Therefore, it is vulnerable under conditions before caching or when cache expires resulting in a cache miss.

Usually, such features are applied to operations that take a long time or result in a high load, making concurrent requests even more critical.

Conversely, in a Cache Hit situation, it may respond faster than singleflight.

![image](/images/go/singleflight-1739189940786.png)

### Singleflight

Conversely, singleflight ensures that only one execution takes place. Therefore, even in a cache miss situation, it minimizes server load by limiting the functions to be executed to one.

However, it is not a cache itself; it needs to perform the operation anew each time the function execution ends. Therefore, in terms of overall time, it might be slower than caching.

In such cases, the best approach might be to use Singleflight in conjunction with caching.

## Lock

There are other methods using external locks apart from SingleFlight. Particularly, in multi-container situations where only one container must run strictly, this approach can be useful.

In these cases, copying the outcome and providing it might be slightly challenging (not impossible though. Various methods could be implemented such as waiting until lock acquisition and making cached responses accessible from other containers).

However, in most standard situations, there aren't many times where you need to put a strict lock, and a lightweight tool like singleflight might suffice.

## Can't We Use Queues?

As previously mentioned in [EDA](/blog/web/eda/), using queues allows for sequential processing of events. At that time, it was also explained as a good method to reduce load, but their purposes are different.

Queues are more suited for processing different requests. For instance, grouping all requests sent to a specific external service and processing them in one queue.

On the other hand, Singleflight is more appropriate for handling identical requests, like server metadata or crawling requests presumed to be virtually identical.

### In Conclusion

Although it's under the x category, it's surprising that Golang directly provides such a package. In other languages, I don't think this was included up to the standard libraries, but Golang seems to consider these aspects, leaving a significant impression on me personally.

If it's made in a middleware format, almost all APIs that use caching could use it together (especially expecting it to be very effective for long-running operations).

If you are looking for ways to reduce complexity while also reducing the server load, try using Singleflight!

## Reference

- https://pkg.go.dev/golang.org/x/sync/singleflight
- https://velog.io/@divan/singleflight%EB%A5%BC-%ED%99%9C%EC%9A%A9%ED%95%9C-%EC%B5%9C%EC%A0%81%ED%99%94
- https://www.codingexplorations.com/blog/understanding-singleflight-in-golang-a-solution-for-eliminating-redundant-work