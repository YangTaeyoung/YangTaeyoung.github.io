---
layout: post
title: Let's Learn About Case Style (Camel Case? Pascal Case? Kebab Case?)
date: 2022-04-14
comments: true
translated: true
---

Today, I want to share one of the posts I've written for work.

I have some advice for those starting out in coding, and I plan to gather only those parts and post them with the `Code Guide` tag!

## Coding Style

There's no problem if you're developing alone. Nowadays, almost all languages support UTF-8 encoding, so you can even use Korean in your code.

Specifically, for things like `variable names`, `function names`, and `class names`, which developers can name freely, there's theoretically no issue whether you name them in Chinese or Korean.

## So why is most code written in English?

It might seem like I'm diverging a bit here, but there are modules or functions that only operate in English from time to time.

Especially with older languages like `C++`, supporting Korean may require separate parsing modules to convert Korean into characters that English or the operating system can understand.

Even more importantly, it's to **align coding styles among collaborating developers**.

If one person uses Korean, another uses English, and another uses Chinese for variable names, doing the same task, it would be very difficult for a new team member to understand the code.

That's why there are defined rules on how developers should write and define code, known as coding guides or conventions, among other names.

I've been digressing for a bit. Let's move on to the main topic.

## Case Style

Case style can be thought of as a kind of naming rule.

It's a rule followed when naming variables, function names, and class names. It's particularly related to spacing.

Many languages include spacing as part of their syntax, so there's consideration on how to set characters to replace that spacing.

_▼ A picture humorously illustrating case styles_
![image](https://user-images.githubusercontent.com/59782504/163414665-0c9bf7d7-8e04-4fb3-bdf9-400db3c5959a.png)

While there are many case styles, there are mainly four commonly used ones.

```python
camelCase # Camel Case
PascalCase # Pascal Case
snake_case # Snake Case
kabab-case # Kebab Case
```

As many might have noticed, yes, the code written above highlights the representative features of these cases.

## Camel Case

Camel case is derived from the shape of a dromedary camel. When spacing is needed, the following character is capitalized instead of adding a space. While there's a distinction between lower camel case and upper camel case, it's generally known as Pascal case when referring to upper camel case.

_▼ Example of Camel Case_
```python
todayDate = "2022-04-14";
```

In the above method, the phrase `today date` can be noted as `todayDate` instead of using spaces.

Looking at Google's Java code style guide, you can see that this method is used for naming methods and variables in `Java` and `Kotlin`, a language based on Java.

(Reference link: https://google.github.io/styleguide/javaguide.html#s5-naming)

## Pascal Case
 
Pascal case is also known as upper camel case. It originated from the Pascal languages where the first letter was always capitalized.

▼ Example of Pascal Case
```python
TodayDate = "2022-04-14"
```

This notation is widely used in naming rules for `Python` class names, structures in `C`, class names in `C++`, and Java classes and interfaces.

Additionally, in `PEP8`, Python's code guide, you can understand that this case is employed in Python classes through the following link.

_While the page refers to Pascal case as camel case, please remember it corresponds to upper camel case as explained earlier._
https://realpython.com/python-pep8/#naming-styles

# Snake Case

Named because the code appears to resemble the shape of a snake, this naming method is called Snake Case.

It refers to the format of separating spaces in variable or function names with underscores `_`.

_▼ Example of Snake Case_
```python
today_date = "2022-04-14"
```

This is a notation method recommended in Python's naming guidelines `PEP8` for module names, function names, method names, and variable names.

(Reference link: https://google.github.io/styleguide/javaguide.html#s5-naming)

Moreover, if you declare variable names that deviate from this manner, in PyCharm, a typical IDE for `Python`, it will underline the deviation saying it conflicts with `PEP8`, suggesting you rename it.

_▼ Example of a Deviant Variable Name_
```
HelloMyMrYesterday = "2021-01-10"
```

_▼ Warning in PyCharm_

![image](https://user-images.githubusercontent.com/59782504/163415564-6536513c-0a1b-46c3-a0e9-b38f73cf139d.png)

### + Helpful Tip

`PEP8` not only offers naming conventions but also precise rules on indentation and spacing, and most of these conventions can be organized at once in `PyCharm IDE` using the code cleanup shortcut (`Ctrl` + `Alt` + `L`).

_▼ For intuitive understanding, let's deliberately violate code conventions like in the below code._

```python
def func_1():
    return 1
def func_2():
    return 2
```

In PyCharm, there's a yellow warning underline indicating corrections needed for the code. Conveniently prefixed with `PEP8`!

![image](https://user-images.githubusercontent.com/59782504/163415681-d8fe6dd6-0179-4936-ade5-9f0c3fb87688.png)

![image](https://user-images.githubusercontent.com/59782504/163415693-44ad9ad7-f00a-41d3-9400-33d10c566459.png)

- Then press `Ctrl` + `Alt` + `L`,

```python
def func_1():
    return 1
    
    
def func_2():
    return 2
```
You can see that it indents the functions twice and the warning disappears.

## Kebab Case

Looking at Camel Case, Snake Case, and Kebab Case, you can see that developers approach code very intuitively.

```python
today-date = "2022-04-14"
```

As you can see, the way the text appears as if threaded on a skewer, replacing spaces with dashes (-), is termed Kebab Case.

It is often used in publishing languages like `CSS`, and details about it can be found in the naming convention `BEM`.
https://en.bem.info/methodology/naming-convention/

## In Conclusion:
- Today, we explored various naming conventions, closely related to coding style guidelines and conventions through case styles!
- I'd like to also delve into conventions like the `Git commit` convention.
- If you have any questions or notice any mistakes, please leave a comment!