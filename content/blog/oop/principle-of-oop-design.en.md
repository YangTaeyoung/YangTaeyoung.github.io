---
title: Let's Learn About Object-Oriented Design Principles - The SOLID Principles.
type: blog
date: 2022-02-25
comments: true
translated: true
---

Today's post is inspired by a topic that seems good to blog about while studying for the Information Processing Technician exam.

It's about the principles of object-oriented design, commonly known by the acronym `SOLID`.

These principles are critical not only in various object-oriented languages but also in web frameworks such as `Spring`, so it's highly beneficial for programmers to be familiar with them.

~~Great for interviews too~~

## 1. Single Responsibility Principle (SRP)

This principle states that **a class should have only one responsibility** when designing it.

The term "responsibility" might be a bit vague, but put simply, it's the scope affected by changes or modifications to the functionality.

Generally, the term responsibility is often used when someone has done something wrong, and we say, _"Someone needs to take responsibility!"_ It's similar to that.

The Single Responsibility Principle emphasizes that **a class responsible for a certain task should have only one responsibility**.
> As a programmer, you must have heard the term `class` at some point, right? A class is a collection of **similar attributes or behaviors** of a single object.

This becomes a problem if a class is handling more than one responsibility.

> Want an example?

Imagine you added `sales information` and `operational principles` of a `vehicle` in a `vehicle` class. If you change the `vehicle price`, it will inevitably impact the class referencing the `vehicle operational principle`.

Moreover, if there's a class using the vehicle's operational principle, it will unnecessarily include irrelevant information (`sales information`), taking on unwanted elements.

**Clearly, this is not a good design by any standards.**

To prevent such mishaps, **SRP** specifies that a class should **have only one responsibility**.

## 2. Open-Closed Principle (OCP)

The Open-Closed Principle (OCP) states that **software classes, modules, and methods should be open for extension but closed for modification**.

To best adhere to this principle, let's take writing specific content (`content`) into a file (`file`) as an example.

_The code below is for reference and does not actually run._
```java
void fileOneWrite(String content){
  File file = new File("./one.txt");
  file.write(content);
}
```

Suppose there's a function that writes a string passed as a parameter to a member function of the `File` class. If designed like this, only the `one.txt` file will be written with the parameter `content`. What if you also want to write to a two.txt file?

```java
void fileOneWrite(String content){
  File file = new File("./one.txt");
  file.write(content);
}
void fileTwoWrite(String content){
  File file = new File("./two.txt");
  file.write(content);
}
void fileThreeWrite(String content){
  File file = new File("./three.txt");
  file.write(content);
}
```
**You would need to add methods like the above, defining new functions or modifying existing ones.**

However, if designed with expansion in mind following the Open-Closed Principle, it could be designed as follows:

```java
void fileWrite(String filePath, String content){
  File file = new File(filePath);
  file.write(content);
}
```

This approach, which keeps expansion open and modification closed by utilizing **interfaces, inheritance, parameters, etc.**, is what `OCP` is all about.

## 3. Liskov Substitution Principle (LSP)

The principle states that program objects should be replaceable with instances of their subtypes without altering the correctness of the program.

This is particularly **related to polymorphism**.

```java
void sell(Item item){
  // Selling logic
}
```

If there's a function like this, it means that if `apple` is called with the `sell(apple)`, it should be seamlessly replaceable if `Item` is an interface or subclassed by the instance of a subtype without causing issues!

## 4. Interface Segregation Principle (ISP)

The principle states that **a client should not be forced to depend on methods it does not use**.

Dependency, as discussed in previous posts about dependency injection, is the same kind of dependency.

In other words, **a client should depend only on the methods it utilizes**.

If you think differently, when there is an interface used by multiple clients, and there are methods within the interface that some clients do not use, it suggests that the interface should be newly created by including only the essential methods of the interface, thus segregating it.

For example, both `Fender Electric Guitar` and `Samick Acoustic Guitar` may belong to the `Guitar` interface, but if due to the `connectToAmp()` method of `Fender Electric Guitar`, the `Guitar` interface includes the `connectToAmp()` method, the `Samick Guitar` client would have to **implement the irrelevant `connectToAmp()` method** due to inheriting the `Guitar` interface.

To prevent such inefficiency, dividing the `Guitar` interface into a `Acoustic Guitar` interface and `Electric Guitar` interface, for separate inheritance, would be a more suitable approach.

## 5. Dependency Inversion Principle (DIP)

This principle refers to a specific form of separating software modules.

### The principle includes the following contents:
1. High-level modules should not depend on low-level modules. Both should depend on abstractions.
2. Abstractions should not depend on details. Details should depend on abstractions.

This principle provides a major tenet of object-oriented design, stating that both high-level and low-level objects should depend on the same abstraction.

Does this seem confusing? Let's bring it to a more understandable level with an example.

<img width="337" alt="image" src="https://user-images.githubusercontent.com/59782504/155655942-d10562d9-147e-4465-a802-9c0e49b3cb99.png">

I use a mechanical keyboard, so I am an `object containing a mechanical keyboard` (dependent object).
But do I always use a mechanical keyboard? Of course not. Depending on the situation, I might use a `laptop keyboard` or a `membrane keyboard`.
Therefore, creating an intermediate `keyboard` interface that generalizes these objects for dependency would be better. Just like the figure below!

<img width="524" alt="image" src="https://user-images.githubusercontent.com/59782504/155656312-650f4ef5-33fa-4f84-9e8b-f199192d92ae.png">

## Conclusion
- Today, we've explored the five principles of object-oriented design, SOLID.
- It can be a bit abstract to grasp, but it's certainly necessary while coding, so I encourage you to practice and internalize these principles naturally through coding, rather than trying to memorize them forcibly.
- See you in the next post!