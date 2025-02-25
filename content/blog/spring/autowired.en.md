---
title: Let's Learn About the Autowired Annotation
type: blog
date: 2022-02-24
comments: true
translated: true
---
Last time, we learned about `Spring`'s `DI`, didn't we?

[Go to "Dependency Injection" Post](/blog/spring/di)

Today, we are going to explore the `@Autowired` annotation, which is closely related to `DI`.

First of all, whether it is a method or an annotation, the name carries a very important meaning.

Autowired? What does it feel like? Doesn't it feel like "automatically connected"?

Let's take a look even if we're not sure what it is.

## `@Autowired?`

This friend, which means automatically connected, plays a role in `Spring` by injecting dependencies. You can think of it as actually implementing the dependency injection we learned conceptually.

![image](https://user-images.githubusercontent.com/59782504/155427654-874ed5fc-d108-4420-9eec-43f5b546565e.png)

Let's check the definition through the above comment.

> It specifies that a `constructor`, `field`, `Setter` method, or `Config` method is to be used automatically by Spring's dependency injection feature.

Since we explained the definition of dependency injection last time, I will briefly explain only the role of `@Autowired`.

Previously, I mentioned that there must be a separate class that uses the `Student` object to perform dependency injection.

However, if we end up creating and using that object ourselves, another dependency might arise during the injection process, right?

To solve such problems, `@Autowired` eliminates the need for the `new` keyword.

```java
class StudentService{
  @Autowired
  private StudentRepository studentRepository;
  
  // Method to find a student by name
  public Student findByStdName(string name){
    return studentRepository.findByName(name);
  }
}
```

There are many strange things here (`repository`, `findByName()`, etc.), but you only need to notice two things:

1. There is a member variable called `studentRepository`.
2. A member function is called without initializing the member variable (without using `new` or any keyword).

These are the two points.

Originally, calling the member function `findByName()` without initialization should output a `NullPointer` error,

However, `@Autowired` plays the role of finding the appropriate constructor of the class and doing `student = new StudentRepository()` for you.

Therefore, no error occurs.

### `@Autowired` in Constructor

Just now, the Autowired part was a member variable, right? Constructors can also be `Autowired`, so where can dependency be injected?
```java
@Service
class StudentService{

  private StudentRepository studentRepository;
  
  @Autowired
  public StudentService(StudentRepository studentRepository){
    this.studentRepository = studentRepository;
  }
}
```

It is in the parameter section.

Constructors are called whenever any object is initialized. But wouldn't it be ugly if the code became something like `new StudentService(new StudentRepository())` every time we create one?

`StudentService` is also a service, and a service also has the `@Bean` annotation, so if another class tries to inject dependencies, it couldn't be stated separately in the constructor...ㅠㅠ

In this regard, the above `@Autowired` annotation makes calling just `new StudentService()` have the same effect as `new StudentService(new StudentRepository())`.

However, one point to note here is that if you define multiple constructors through constructor overloading, remember that **only one constructor can be annotated with `@Autowired`!**

#### TIP: Omitting `@Autowired` in Constructor
If there is only one constructor, you can omit it because the dependency needs to be injected anyway while creating it.

### `@Autowired` in Methods

If you thought "the usage must be the same because a constructor is also a method," you're half right and half wrong.

It is similar that it applies to parameters, but remember, I said earlier that constructors are called every time any object is initialized,

However, methods are different. When to call them is at the developer's discretion. They are not mandatory.

If you want to assume a case where dependency is assigned every time a method with `@Autowired` is called,

Mark it with an attribute (`required=false`) to indicate "This method is not essential but I'd like it to be automatically injected."

> Like below

```java
@Service
class StudentService{

  private StudentRepository studentRepository;
  
  // For cases where the method is not essential but you still want dependency injection
  @Autowired(required = false)
  public setStudentRepository(StudentRepository studentRepository){
    this.studentRepository = studentRepository;
  }
}
```

## In Conclusion
- Today, we explored various usages of the `@Autowired` annotation for automatic dependency injection. See you next time!
- If there's anything incorrect, please report it!