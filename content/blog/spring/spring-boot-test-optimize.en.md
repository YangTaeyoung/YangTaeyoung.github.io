---
title: Let's Optimize the Annotation @SpringBootTest (feat. @DataJpaTest, @WebMvcTest)
type: blog
date: 2025-01-20
comments: true
translated: true
---

When I first joined the company, I was concerned about the lengthy testing times. (about 28 minutes)

Interestingly, my colleagues were not bothered by it since this was the usual time consumption, but having come from a previous company where it took only 2-3 minutes, enduring such extended times was very difficult 🤣

![image](/images/spring/spring-boot-test-optimize-1737350813436.png)

At that time, we were not using tools like Testcontainers to launch containers and all tests were based on Mockito unit testing, so I couldn’t understand why the tests took so long.
> If we use tools like Testcontainers for repository or integration tests, additional time will be needed to launch containers and connect them with the service, which could increase the overall time taken.

Thus, this time I want to identify the reasons for the lengthy testing times in the service, how we optimized the testing, and share the process we went through.

## Identifying the Problem
### 1. Dependency Issue
Initially, there was a part I suspected within the dependencies. The test target I wrote was `HomeController` (a pseudonym), and its only dependency was `HomeService`.
However, it threw an error due to the absence of `ProductService` (a pseudonym).

```
Caused by: org.springframework.beans.factory.NoSuchBeanDefinitionException: No qualifying bean of type 'com.example.demo.service.ProductService' available: expected at least 1 bean which qualifies as autowire candidate. Dependency annotations: {@org.springframework.beans.factory.annotation.Autowired(required=true)}
```

Of course, just adding the dependency as below resolves the issue.

```java
@MockBean
private ProductService productService;
```

But having to add unused dependencies every time felt very cumbersome, particularly when adding new services or repositories required repeated additions, making it very tedious.

### 2. @SpringBootTest
`@SpringBootTest` is an annotation for integration tests. Using this annotation launches the actual service and conducts the tests.

The issue is that it loads all beans, resulting in lengthy test times. Spring, by default, conducts tests on a file-by-file basis, thus repeating the bean loading process for every single test.

Even if we designate the test environment through `application-test.yml`, it doesn't restrict bean usage. To limit this, specific configuration needs to be designated.
For example, how would you set up a test environment using H2 as a test DB for testing repositories?

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
    username: sa
    password: password
```
> The exact configuration isn't important.

If you try to test a Controller with SpringBootTest after setting it up like this:
```java
@SpringBootTest
class HomeControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void test() {
        mockMvc.perform(get("/"))
            .andExpect(status().isOk());
    }
}
```

Conducting the test this way will cause `@SpringBootTest` to load all beans, making the test inevitably slow.

If there's just one test code, it may not be a major issue. However, as files increase, even simple test codes like this will consume longer time.

## 3. Not Conducting Integration Tests
`@SpringBootTest` is typically used for integration tests configured to resemble all environments and accessed through API endpoints. But we weren’t running integration tests.

When asked, my team members mentioned they were performing only unit tests, and even those didn’t cover the Repository Layer.

It was merely operating as a Query Machine without a meaningful service layer test.
> This I will detail in another post concerning transitioning to a clean architecture.

## Solution
### `@WebMvcTest`, `@DataJpaTest`
To solve the issue of loading dependencies, we can use `@WebMvcTest`, `@DataJpaTest`, etc.

`@WebMvcTest`, as the name suggests, is for MVC testing. In other words, it's for testing controllers.
When this annotation is applied, it loads only web-related beans like `@Controller`, `@ControllerAdvice`, `@JsonComponent`, `Converter`, `GenericConverter`, `Filter`, `HandlerMethodArgumentResolver`, `HandlerInterceptor`, `WebMvcConfigurer`, `HandlerMethodReturnValueHandler`.

`@DataJpaTest` is for JPA testing, i.e., for testing repositories. 
When this annotation is applied, it loads only JPA-related beans like `EntityManager`, `TestEntityManager`, `DataSource`, `JpaTransactionManager`, `JpaRepository`.
> At that time, I was not using Testcontainers or H2 for repository testing, so I didn’t use `@DataJpaTest`.

### Limiting Test Classes
When `@WebMvcTest` is used as below, you can test `@Controller`, but all controllers will be loaded.
```java
@WebMvcTest
class HomeControllerTest {
    // ...
}
```

If there are few controllers, this might be manageable; however, with many, there’s the issue of loading all controllers for every file specified as `@WebMvcTest`, 
resulting in having to resolve all dependency issues for those controllers.

To solve this, specify the classes to be loaded by defining the controller to be tested in `@WebMvcTest`.
```java
@WebMvcTest(HomeController.class)
class HomeControllerTest {
    // ...
}
```

### Filling Missing Dependencies
If the test operates as intended, it’s very much a beneficial case, but `@WebMvcTest`, by default, does not load Spring Security-related beans, so you need to add the beans used in those settings.

There's nothing really special; just tweak as necessary and add them one by one as errors arise.

In my case, upon adding the SecurityConfig class, beans for Redis, UserRepository, etc., needed to be added.
```java
@WebMvcTest({HomeController.class, SecurityConfig.class})
```

However, since it doesn't have to function meaningfully, registering mock beans suffices.
```java
@TestConfiguration
public class WebMvcTestConfig {
    @Bean
    public RedisUtils redisUtils() {
        return Mockito.mock(RedisUtils.class);
    }
    
    @Bean
    public UserRepository userRepository() {
        return Mockito.mock(UserRepository.class);
    }
    
}
```

And since this file isn’t automatically loaded, use the `@Import` annotation to load it in the test file.
 
```java
@WebMvcTest({HomeController.class})
@Import(WebMvcTestConfig.class)
```

If additional errors arise, follow this process to add the necessary items:
- If actual operation is not necessary: Use Mock to register in `WebMvcTestConfig` without registering the real bean.
- For beans that require actual operation: Add them using `@Import`.

## Result
The test execution time reduced from 28 minutes to 7 minutes, achieving around a fourfold performance improvement.
> Although there's the disadvantage of needing to register the classes to be tested and `SecurityConfig`, saving 30 minutes for myself and my team is a significant advancement!