---
title: Let's Learn About Dependency Injection (DI)
type: blog
date: 2022-02-24
comments: true
translated: true
---

In this post, we will discuss Dependency Injection (DI), which is one of the important concepts of the Spring Framework.

DI is a crucial concept in Spring, and it frequently appears in job interviews, so it is essential to know.

First, let's understand what dependency is.

## Dependency

When object A depends on object B, it is closely related to the concept of composition.

Let's take a look at the code.

```java{filename=Korean.java}
class Korean {
    int score; // Subject score
    string content; // Subject content
}
```

```java{filename=Student.java}
class Student {
    private Korean korean;
    public Student() {
        korean = new Korean();
    }
}
```

As shown above, the `Student` class contains the `Korean` class, which holds the subject score `score` and the content `content`. Although it can be called a composition relation, it is also expressed as 

**“`Student` depends on `Korean`.”**

But what problems would arise from this setup?

What if `Korean` is to be removed from `Student` and `Math` is to be added instead?

Unfortunately, the developer would have to delete the member variable and add a new one, like the below:

```java{filename=Math.java}
class Korean{
    int score; // Subject score
    string content; // Subject content
}
```

```java{filename=Student.java}
class Math {
    int score;
    string content;
}
```

```java{filename=Student.java}
class Student {
    // private Korean korean;
    private Math math;
    public Student() {
        //korean = new Korean();
        math = new Math();
    }
}
```

### Isn't it too inconvenient?
Doing this way seems problematic. Wasting time switching comments on and off, adding or removing inside the constructor and member variables every time could be a hassle.

### Abstracting with Interface
To make this process a bit easier, it might be a good idea to use an interface grouping by subjects, like this.

```java{filename=Subject.java}
public interface Subject {
}
```

```java{filename=Korean.java}
class Korean implements Subject {
    int score; // Subject score
    string content; // Subject content
}
```

```java{filename=Math.java}
class Math implements Subject {
    int score;
    string content;
}
```

```java{filename=Student.java} 
class Student {
    private Subject subject;
    public Student(){
        subject = new Korean();
        // subject = new Math()
    }
}
```

Having only one member variable to declare makes it slightly easier. However, the `Student` class constructor still has to choose a class that implements the `Subject` interface. It has become a bit easier, yet it remains inconvenient.



## Dependency Injection

What methods are there to solve the above problem? Although you might temporarily comment out parts of the constructor, when maintenance is needed later on, developers will face a large number of issues to handle since there are many things to fix.

Dependency injection came about to address that issue. It is a method where objects are injected from outside the constructor.

```java{filename=Student.java}
// Student.java
class Student{
    private Subject subject;
    
    public Student(Subject subject){
        this.subject = subject;
    }
}
```

```java
class SomeClass {
    // Dependency injection
    Student student = new Student(new Korean());
}
```

How does that look? Although it's a straightforward implementation, the code can become much simpler. The interface is simply taken, and the actual `Korean` object is injected elsewhere.

## Summary
Dependency injection is about declaring member variables through an interface variable, then injecting and using an object that implements the interface from the outside.

## Closing
In this post, we looked at dependency injection. Next, we'll see how dependency injection is actually implemented in Spring.