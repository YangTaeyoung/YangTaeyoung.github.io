---
title: "[Programmers] Immigration Check (Golang)"
type: blog
date: 2025-05-23
comments: true
translated: true
---

## Problem
[**Programmers Problem - Immigration Check**](https://school.programmers.co.kr/learn/courses/30/lessons/43238)
```
n people are waiting in line for immigration check. Each immigration officer takes a different amount of time to process each person.

At the start, all immigration desks are empty. Only one person can be processed at a desk at a time. The person at the front of the line can go to an empty desk to be processed. However, if there is a desk that finishes processing sooner, they can wait and go there instead.

We want to minimize the total time it takes for everyone to be processed.

You are given the number of people waiting for immigration n and an array times, where each element represents the time taken by an immigration officer to process one person. Write a solution function that returns the minimum time required to process all the people.
```

## Constraints
```
- The number of people waiting for immigration is at least 1 and at most 1,000,000,000.
- The time taken by each officer to process one person is at least 1 minute and at most 1,000,000,000 minutes.
- There is at least 1 and at most 100,000 officers.
```

## Approach
Generally, when the range is so wide, binary search can be used to solve the problem.

However, in this case, since the number of people waiting can be up to 1,000,000,000, the processing time can also be up to 1,000,000,000 minutes, and there can be as many as 100,000 officers, I was unsure how to approach this.

No matter how much I thought about it, I couldn't figure out where to start, so I requested hints from ChatGPT this time.
~~(In fact, this is a post reflecting on that decision)~~ 

### ChatGPT's Hint

![image](/images/algorithm/programmers-43238-1747970726257.png)

In summary, the suggestion was to perform binary search based on the return value, which is the `total minimum time required for processing`. Since `total time required / each officer's processing time` gives the `number of people processed`, we can base our binary search on this.

In this case, we would still have to iterate through the array of 100,000 officers. I thought this level of load would be a concern, but now I believe it's feasible for our approach.

So, let's set the basis for our binary search to `the total minimum time required for processing` and conduct the binary search.

Typically, the result of binary search serves as the target for the search, so moving forward, it would be beneficial to think first about the result for such problems.

### Implementation
First, I wrote the `canHandled()` function, which serves as the basis for the binary search. This function calculates the `number of people processed` based on `the total minimum time required for processing`.

The purpose of this function is to be used to check conditions during each iteration of the binary search.
```go
func canHandled(times []int, time int64, human int) bool {
    var total int64 = 0
    
    for _, t := range times {
		total += time / int64(t)
	}
    
    return total >= int64(human)
}
```

Then, using this function, I wrote the code to perform the binary search.
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

When the result of the `canHandled()` function is `true`, it means that the `number of people processed` is greater than or equal to `n`, so we reduce `maxTime`. Conversely, if `false`, it means that the `number of people processed` is less than `n`, so we increase `minTime` to secure more people in the next stage.

Here, we only update `answer` when `canHandled()` returns `true`, as it means processing is possible. Therefore, there is no need to update `answer` when processing is not achievable.