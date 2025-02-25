---
title: Testing in Golang Without Cache
type: blog
date: 2025-02-14
comments: true
translated: true
---
![image](/images/go/go-test-without-cache-1739518633592.png)

When testing in Golang, the test speed becomes significantly faster from the second run.

**1st Run**
```shell
ok      github.com/my/package/test    126.752s
```
**2nd Run**
```shell
ok      github.com/my/package/test    (cached)
```
While the first run took over 2 minutes, the second run finished so quickly that there wasn't even time to measure it.

In reality, nothing has changed performance-wise because the test result is reused via cache **if the code hasn't changed**.

## Integration Testing
First, integration testing refers to testing multiple components together.

Unlike unit tests, which mainly involve mocking, integration tests deal primarily with actual components, which is why they are typically slower.

However, in API servers, such integration tests are often used because they can test the user's actions most closely resembling real-world usage.

In integration testing, there are times when you need to exclude cache-related parts.

### Reasons to Test Without Cache in Integration Testing
This isn't true for all integration tests. If the test guarantees idempotency, using a cache is generally fine.

If external services are not used and such elements are excluded from the test, it's fine to use a cache (in fact, in such cases, you should use it to reduce testing time).

However, if there are many external service uses, if the test does not guarantee idempotency (such as different results every time), and there are many modifications required due to changes in external services, it's better to run tests each time rather than relying on cached results.

## Testing Without Cache
The reason was long, but the method to avoid using cache is very simple. Use the `-count 1` flag in the go test.
```shell
go test -count 1 -v ./...
```

With this approach, you can run tests each time without using a cache.

### Why `-count 1`?
The command `-count 1` is not a specific command to use or not use cache; it simply specifies how many times to run the test.

Furthermore, according to the [official documentation](https://pkg.go.dev/cmd/go#hdr-Testing_flags), the default value is 1, so theoretically, it should do the same thing even if you omit it.
```
-count n
    Run each test, benchmark, and fuzz seed n times (default 1).
    If -cpu is set, run n times for each GOMAXPROCS value.
    Examples are always run once. -count does not apply to
    fuzz tests matched by -fuzz.
```

However, this option does not behave the same.

Whether intentional or not is unclear, but the official documentation also indicates using `-count 1` as an idiomatic way to explicitly disable test caching.
> _"The idiomatic way to disable test caching explicitly is to use -count=1."_

## Conclusion
In my opinion, using an option like `-count 1` to decide on cache usage feels like a design flaw.
> People generally think there's no need to specify values that are the same as the default option.

This might even be considered a bug, and I'm not sure why Go maintains this method. Wouldn't it be clearer if there was a flag like `-no-cache`?