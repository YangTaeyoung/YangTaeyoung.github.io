---
title: Let's Learn About Spring Beans
type: blog
date: 2022-02-24
comments: true
translated: true
---

Today I considered explaining `Spring MVC`, but before doing so, I thought it might be helpful to introduce some basic knowledge about Spring that one should know to understand MVC.

## Spring Bean?

A `Spring Bean` refers to an object that is managed by the `Spring Container`. But isn’t that a bit strange? An object managed by Spring? Could it be an object defined within Spring’s library?

The answer is no. While there may be objects that are defined as `Beans` within a library, the objects we write and that are managed by `Spring` are what we define as `Beans`. Originally, users were supposed to manage objects, but allowing the framework to handle such tasks is what we call Inversion of Control, or `IOC`.

### Tip

Although some may not believe it, Spring goes to significant lengths to explain its own objects or descriptions in detail. You can refer to Spring’s Documentation, but it's also readily available in the Code itself.
Shall we take a look at an object defined by Spring?

![image](https://user-images.githubusercontent.com/59782504/155391935-40bfd711-b6bf-47c0-9041-38ab043cb462.png)

The picture above is a screenshot of the interface for Spring's Bean annotation. As you can see, there are many comments. Although it might seem confusing at first glance, you can see their efforts to make it as easy as possible to understand through the code itself.
Would you like to see how they express a Bean at the very top?

![image](https://user-images.githubusercontent.com/59782504/155392187-882448f1-b28f-4756-b5f5-470954696387.png)

"It means that the method marked by this annotation will be managed as a `Bean` by the `Spring Container`."

Shall we look at the summary of the comments further down?

![image](https://user-images.githubusercontent.com/59782504/155393382-1a946d99-5d13-4f81-a312-a245039f2f60.png)

The explanation states, "The method containing this annotation operates similarly to an object defined within `<bean/>` in XML used by Spring Legacy." and it proceeds to give examples below using code.

### Registering Beans

```java
@Bean
public MyBean myBean() {
    // instantiate and configure MyBean obj
    return obj;
}
```

As shown, you can register a method as a `bean` by using the `@Bean` annotation in front of the `myBean` method.

The documentation further informs us about `Bean` naming, indicating that `Beans` can be assigned aliases by inserting them into the parameters, and even a single bean can have multiple aliases by listing them in an array.

### Naming Bean Aliases

```java
@Bean({"b1", "b2"}) // bean available as 'b1' and 'b2', but not 'myBean'
public MyBean myBean() {
    // instantiate and configure MyBean obj
    return obj;
}
```

The above code tells us that you can manage the Bean using aliases `b1` and `b2` through the parameters `{"b1", "b2"}` of the @Bean annotation.

#### Why do we name aliases?

There can be several reasons for naming aliases, but the main reason is to prevent name conflicts among Spring Beans.

```java
@Bean
@Profile("production")
@Scope("prototype")
public MyBean myBean() {
    // instantiate and configure MyBean obj
    return obj;
} 
```

### Properties of Bean?

![image](https://user-images.githubusercontent.com/59782504/155396490-29453e82-9160-416d-b053-8750373bc9ca.png)

The comment above explains that a `Bean` does not offer properties beyond aliases.
It mentions, for example, that properties like `Scope`, `Lazy`, `DependsOn`, and `Primary` are not provided and that these properties should be used alongside annotations such as `@Scope`, `@Lazy`, `@DependsOn`, and `@Primary`.
You might find it difficult to understand with all these properties coming up suddenly, so let's explain them before moving on!

#### `@Lazy`

There can be many Beans in the world, right? However, sometimes a Bean might invoke another Bean within it.

![image](https://user-images.githubusercontent.com/59782504/155397939-d440a56d-8dca-4443-aede-dead72bb6b47.png)

Imagine a Bean that holds student information like above, and it also has a member variable containing personal information.
If this personal information is initialized immediately upon object creation, others might easily see it.

All `Beans` follow the `Eager` policy as demonstrated, which means their contained variables are initialized upon creation.
However, a `Bean` marked with the `@Lazy` annotation will not be initialized immediately—it will only initialize when another bean refers to it or when it is explicitly searched by the `BeanFactory`.

`Bean Factory`: An IOC container responsible for creating beans and configuring dependency relations.

#### `@Scope`

Let’s delve into `Scope`.
The `@Scope` annotation sets the scope of a `Bean`.

![image](https://user-images.githubusercontent.com/59782504/155399798-b6dc7a08-fb47-40d6-ae3f-a9f5d0633193.png)

As explained, the `@Scope` annotation represents the name of the scope to be used on the annotated component instance when used with the `@Component` annotation.
However, since we haven't learned about `Component` yet, let's skip it for now.

When used with `@Bean` as a method-level annotation, it represents the name of the scope to be used for the instance returned by the method.

`Bean` is maintained in a singleton format, which means only one object is returned, but `@Scope` allows changing this scope.
There is a well-written blog post explaining this part, so I'll leave a link to it (based on which this post was written).

`singleton`: Returns one bean per IoC container
`prototype`: Creates and returns a new bean each time it is requested
`request`: Returns one bean per HTTP request
`session`: Returns one bean per HTTP session
`globalSession`: Returns one bean for all sessions

http://ojc.asia/bbs/board.php?bo_table=LecSpring&wr_id=498

#### `@DependsOn`

This means dependency, right? It's quite the same in context.
A `Bean` with this annotation guarantees it will be created after the `Bean` declared in the `value`. 
For example, if it is written as `@DependsOn(value="myBean")`, it means the given bean is guaranteed to be created after `myBean`.

Similarly, when that `Bean` is released, it will be ensured that the dependent `myBean` is released before it.

#### `@Primary`

Assuming that `component-scanning` is used, a Bean marked with this annotation alongside `@Bean` will be preferentially injected among the components detected by the component scan.

Regarding Component Scan, it is excellently explained in the blog below. Briefly, it refers to registering classes configured in `@Configuration` all at once instead of individually. `@Primary` marks it as prioritized for registration in this scan.

Component Scan is well-explained in detail in the blog below.

Component Scan: https://velog.io/@hyun-jii/%EC%8A%A4%ED%94%84%EB%A7%81-component-scan-%EA%B0%9C%EB%85%90-%EB%B0%8F-%EB%8F%99%EC%9E%91-%EA%B3%BC%EC%A0%95

## In Conclusion

- Today, we explored different aspects of Spring Beans. I hope everyone had an enjoyable coding study!