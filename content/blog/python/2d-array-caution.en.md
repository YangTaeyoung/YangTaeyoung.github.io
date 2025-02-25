---
title: Precautions When Initializing Elements of a 2D Array with the Same Value
type: blog
date: 2022-03-02
comments: true
translated: true
---

This post is one of reflection ㅠㅠ

I want to correct the mistakes I made while taking the coding test!

## Problem Definition

The issue here is about initializing and modifying array elements.

I initialized a 2D array with the same elements in Python like this.

```python
two_arr = [[False] * 2] * 5
``` 

When you look at the output:

```python
[
  [False, False], 
  [False, False], 
  [False, False], 
  [False, False], 
  [False, False]
]
```

You can see the output consists of a `False` list in a 2*5 shape.

**It looks like it's initialized as I intended!**

But let's try changing a particular element in the array.
```python
two_arr[0][0] = True
```

I expected the element `False` in the first array to change to `True`, like this:

```python
[
  [True, False], 
  [False, False], 
  [False, False], 
  [False, False], 
  [False, False]
]
```

However, when you actually print it, you see this result:

```python
[
  [True, False], 
  [True, False], 
  [True, False], 
  [True, False], 
  [True, False]
]
```

I changed only `[0][0]`, but it affected the 0th element of every element. What's going on?

## Solution

The problem lies in the multiplication operation (`*`) while declaring a Python array with the same elements.

When copying a specific element using the multiplication operation in a 1D array, like `[False] * 2`, it works correctly because it copies the value `False` twice to place in the list. 

The reason is that the target to copy is not a `list` but a value `False`. As a result, a list like `[False, False]` is formed.

However, the issue arises in the second step. When copying the array declared as `[[False] * 2] * 5`, similar to the code below, a problem occurs.

The list instance such as `[[False] * 2]` is an `address`, not a `value`.

Do you understand? Ultimately, it's the same as giving the command to copy the address of `[False, False]` five times.

In simpler terms, it copied the address containing `[False, False]` five times. Therefore, because **each column's address shares the elements**, changing a part of one row makes it act as if a part of the entire row is changed.

To initialize arrays as intended, you need to manually initialize them using a `for` loop. Since `[False, False]` is called at different times as the loop iterates, different addresses are assigned.

To solve this, you can use the `append()` function like this:

```python
two_arr = []
for _ in range(5):
  two_arr.append([False] * 2)
```

If you want your code to look cleaner, you can use list comprehensions to write it more neatly:

```python
two_arr= [[False] * 2 for _ in range(5)]
```

Comparing the output afterwards, you'll see it comes out as intended.

## Output

```python
[
    [True, False], 
    [False, False], 
    [False, False], 
    [False, False], 
    [False, False]
]
```

## In Conclusion
- Through this coding test, I've realized the importance of cross-checking even what I already know. I implemented all the important logic, but I didn't expect errors in such a place.. :(
- List variables are objects, so they have address values unlike `primitive type` variables. If you're reading this post, remember this to avoid making the same mistakes I did!