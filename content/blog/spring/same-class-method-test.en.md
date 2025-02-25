---
title: (JAVA) Mocking Methods Within the Same Service in Spring
type: blog
date: 2024-05-30
comments: true
translated: true
---

In general, Spring follows a Layered Architecture, and services primarily handle business logic.

As the code within a service increases, similar code tends to accumulate. In such cases, some separate out the common logic into additional layers, but often it is processed by declaring common methods within the service.

For example, consider the following:
```java
@Service
public class SomeService {
    public void methodA() {
        // do something
    }

    public void methodB() {
        methodA();
        // do something
    }
    
    public void methodC() {
        methodA();
        // do something
    }
}
```

In the code above, `methodA` is a method commonly used in both `methodB` and `methodC`.

If you need to write test code for `methodB()`, you would also need to write test code for `methodA()`. In the worst case, since it's considered as **"common"** logic, you might have to test the logic of `methodA()` even when testing `methodC()`.

Trying to reduce duplication could unexpectedly lead to having more duplicated test code.

## Mocking

If you are using methods from an object of a different class, you would specify the mock behavior of the method through a technique known as Mocking and write the test code. (This is because mocked methods are assumed to have already been tested, so tests inside those methods are unnecessary.)

However, Mocking isn't a panacea, especially when dealing with methods from the same class.

This is because in Java, Mocking typically involves creating a proxy object and using it as if it were the actual object, making it challenging to use the same class as both a mock object and a real object simultaneously.

Unlike in Java, testing methods within the same class in other languages can lead to duplication, as previously mentioned. For instance, in Python, Monkey Patching is used to change the method's pointer in the same class for testing,

During extensive development in Go, I would occasionally declare such common method pointers separately to inject them at test time, or as mentioned earlier, separate the layer handling common logic for testing. (Mocking interfaces that are different is not difficult in any language.) 

In Java, you can use `@Spy` to mock methods within the same class.

## `@Spy`
![image](/images/spring/same-class-method-test-1717083827711.png)

Before we learn about annotations, let's understand Spy objects.

Think about a spy from a movie. What comes to mind?

They behave as if they are on the same side but act differently under certain circumstances, which can help you understand what Spy objects are.

**Spy objects can call the actual object's methods in certain situations while changing the behavior of specific methods in others.**

`@Spy` is an annotation used to create such a Spy object.

Let's test the above code using the `@Spy` annotation.

Typically, if there are separate mock dependencies, the `@Mock` annotation is used on the object being mocked, and the `@InjectMocks` annotation is used on the object receiving the dependencies (the object where the method under test exists).

It's important to note that if `@Spy` is used in conjunction with these annotations, it should be declared before `@InjectMocks`.

```java
@Service
public class SomeService {
    @Mock
    SomeDependency someDependency;
    
    @Spy
    @InjectMocks
    SomeService someService;
}
```

Now, let's write the test code for `methodA()`.
```java
    @Test
    void testMethodA() {
        // given
        doNothing().when(someService).methodA();
        
        // when
        someService.methodA();
        
        // then
        verify(someService, times(1)).methodA();
    }
```

By leveraging the `@Spy` annotation, you can mock methods within the same class.

## Separating Common Logic Layer for Test Code

However, mocking methods within the same class can reduce the readability of your test code. Personally, I think it's better to have a separate layer for handling common logic in such cases.

For example, you could separate `methodA()` into its own class (named `SomeServiceSupport` in this case) and inject it into `SomeService`.

```java{filename=SomeServiceSupport.java}
@Component
public class SomeServiceSupport {
    public void methodA() {
        // do something
    }
}
```

```java{filename=SomeService.java}
@Service
@RequiredArgsConstructor
public class SomeService {

    private final SomeServiceSupport someServiceSupport;
    
    public void methodB() {
        someServiceSupport.methodA();
        
        // do something
    }
    
    public void methodC() {
        someServiceSupport.methodA();
        
        // do something
    }
}
```

By separating out, there's no need to mock methods within the same class, thus reducing the complexities of testing with `@Spy` annotations and method interrelationships.

```java
    @SpringBootTest
    class SomeServiceTest {
        
            @Mock
            SomeServiceSupport someServiceSupport;
            
            @InjectMocks
            SomeService someService;
            
            @Test
            void testMethodB() {
                // given
                doNothing().when(someServiceSupport).methodA();
                
                // when
                someService.methodB();
                
                // then
                verify(someServiceSupport, times(1)).methodA();
            }
            
            @Test
            void testMethodC() {
                // given
                doNothing().when(someServiceSupport).methodA();
                
                // when
                someService.methodC();
                
                // then
                verify(someServiceSupport, times(1)).methodA();
            }
    }
```

In this code, the test code doesn't change much. However, the separation of layers makes it easier for new developers to recognize that this is a layer for handling common logic, which can be advantageous for maintenance.