---
title: 어노테이션 @SpringBootTest를 최적화 해보자 (feat. @DataJpaTest, @WebMvcTest) 
type: blog
date: 2025-01-20
comments: true
---

입사를 처음 했을 때 테스트 시간이 매우 길어서 고민을 했다. (약 28분 정도) 

여담이지만 팀원분들은 평소 이정도의 시간이 소요됬기에, 테스트 시간이 길다고 느끼지 않으셨지만, 이전 회사에서는 2~3분 정도의 시간만 소요됐기에, 이정도 시간이 소요된다는 것이 매우 참기 힘들었다 🤣

![image](/images/spring/spring-boot-test-optimize-1737350813436.png)

당시에는 Testcontainers와 같은 컨테이너를 띄우는 도구를 따로 사용하지도 않았고, 모두 Mockito 기반의 유닛 테스트가 전부였는데, 왜 이렇게 테스트 시간에 오랜 시간이 소요되는지 이해하지 못했다.
> Repository나 통합 테스트를 위해서 Testcontainers와 같은 도구를 사용한다면 테스트 시 컨테이너를 띄우고 서비스와 연결하는 시간이 추가로 소요되기 때문에, 어느 정도 시간이 소요될 수 있다.

그래서 이번에는 서비스에서 어떻게 테스트를 최적화 할 수 있었는지, 무엇이 문제였는지에 대해 원인 파악을 하고, 최적화 했던 과정을 공유하려고 한다.

## 원인 파악
### 1. 의존성 문제
먼저 의존성에서 의심이 가는 파트가 있었다. 내가 작성한 테스트 대상은 `HomeController`(가칭)이었는데, 이 컨트롤러의 의존성은 `HomeService` 밖에 없었다.
근데 `ProductService`(가칭)이 없다고 에러가 나는 것이 아닌가..

```
Caused by: org.springframework.beans.factory.NoSuchBeanDefinitionException: No qualifying bean of type 'com.example.demo.service.ProductService' available: expected at least 1 bean which qualifies as autowire candidate. Dependency annotations: {@org.springframework.beans.factory.annotation.Autowired(required=true)}
```

물론 다음과 같이 의존성을 추가해주기만 하면 문제가 없다.

```java
@MockBean
private ProductService productService;
```

다만 사용하지도 않는 의존성을 매번 추가해주는 것이 매우 번거로웠다. 특히 새로운 서비스나, 레포지토리를 추가할 때마다 매번 추가해주어야 하기 때문에 매우 번거로웠다.

### 2. @SpringBootTest
`@SpringBootTest`는 통합 테스트를 위한 어노테이션이다. 이 어노테이션을 사용하면, 실제 서비스를 띄우고, 테스트를 진행하게 된다.

문제는 모든 빈을 띄우기 때문에, 테스트 시간이 오래 걸린다는 것이다. 스프링은 기본적으로 테스트 시 파일 단위로 테스트를 진행하기 때문에, 단 하나의 테스트에 모든 빈을 띄우는 작업을 반복하게 된다.

우리가 `application-test.yml`등을 통해 동작을 위한 테스트 환경을 지정했더라도, 빈의 사용을 제한하진 않기 때문에 이를 제한하기 위해서는 별도로 설정을 지정해야 한다
예를 들어 Repository를 테스트 하기 위해 H2를 테스트 DB로 사용해서 테스트 환경을 지정해두었다면 어떻게 할까?

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
    username: sa
    password: password
```
> 대충 이런 식일 것이다. 설정이 중요하진 않다

만약 이렇게 하고 SpringBootTest로 Controller를 테스트 하려한다면
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

이렇게 테스트를 진행하게 된다면, `@SpringBootTest`로 인해 모든 빈이 띄워지기 때문에, 테스트 시간이 오래 걸릴 수 밖에 없다.

단 하나의 테스트 코드라면 크게 문제되지 않을 것이다. 다만 파일이 늘어나면 늘어날 수록, 별거 없는 테스트 코드에도 시간이 오래 걸리게 된다.

## 3. 통합 테스트는 하지 않고 있음
`@SpringBootTest`는 일반적으로 모든 환경과 비슷하게 구성하고 API Endpoint를 통해 접근하는 통합 테스트를 위해 사용된다. 하지만 우리는 통합 테스트를 하지 않고 있었다.

팀원에게 물어보니 유닛 테스트 정도만 진행하고 있었고 유닛 테스트 역시 그 마저도 Repository Layer는 테스트 하고 있지 않았다.

단순히 서비스가 Query Machine처럼 동작하고 있었는데, 서비스 테스트 의미가 없을 정도로 매우 간단하게만 사용하고 있어 더욱 문제였다.
> 이는 추후 클린 아키텍처로 전환한 이야기로 다른 포스팅에서 후술하겠다.

## 해결
### `@WebMvcTest`, `@DataJpaTest`
의존성을 로드하는 문제를 해결하기 위해서는 `@WebMvcTest`, `@DataJpaTest` 등을 이용할 수 있다.

`@WebMvcTest`는 어노테이션 이름에서 예상할 수 있듯, MVC 테스트를 위한 어노테이션이다. 즉, 컨트롤러 테스트를 위한 어노테이션이라고 볼 수 있다. 
해당 어노테이션이 붙은 경우 `@Controller`, `@ControllerAdvice`, `@JsonComponent`, `Converter`, `GenericConverter`, `Filter`, `HandlerMethodArgumentResolver`, `HandlerInterceptor`, `WebMvcConfigurer`, `HandlerMethodReturnValueHandler`등 웹 관련 빈만 로드한다.

`@DataJpaTest`는 JPA 테스트를 위한 어노테이션이다. 즉, Repository 테스트를 위한 어노테이션이라고 볼 수 있다. 
해당 어노테이션이 붙은 경우 `EntityManager`, `TestEntityManager`, `DataSource`, `JpaTransactionManager`, `JpaRepository`등 JPA 관련 빈만 로드한다.
> 사실 당시에는 Testcontainers나 H2를 이용한 Repository 테스트는 도입하고 있지 않았기에, `@DataJpaTest`는 사용하지 않았다. 

### 테스트 할 클래스 한정하기
아래와 같이 `@WebMvcTest`를 사용하면, `@Controller`를 테스트 할 수 있지만, 모든 컨트롤러를 불러온다. 
```java
@WebMvcTest
class HomeControllerTest {
    // ...
}
```

컨트롤러가 적다면 이런 방법도 괜찮을 수 있지만, 컨트롤러가 많다면 역시 테스트를 위해 `@WebMvcTest`라고 명시된 파일별로 모든 컨트롤러를 불러오는 문제가 발생하며, 
해당 컨트롤러의 모든 의존성 문제 역시 해결해야 하는 문제가 발생한다.

이런 문제를 해결하기 위해서는 로드할 클래스를 `@WebMvcTest`에 테스트 할 컨트롤러를 명시해주면 된다.
```java
@WebMvcTest(HomeController.class)
class HomeControllerTest {
    // ...
}
```

### 사라진 의존성 채우기
물론 이렇게 테스트가 동작한다면 매우 해피한 케이스이나, `@WebMvcTest`와 같은 경우, 기본적으로 Spring Security 관련 빈은 로드하지 않기 때문에, 관련 설정에 사용했던 빈들을 추가로 등록해주어야 한다.

별건 없고, 하나씩 돌려보며 추가하면 된다.

필자의 경우 SecurityConfig 클래스를 추가해주니 Redis, UserRepository 등 추가해야 할 빈들이 있었다.
```java
@WebMvcTest({HomeController.class, SecurityConfig.class})
```

다만 실제로 의미있게 동작할 필요는 없고, 그저 빈만 있으면 되는 것이기에, Mock을 사용하여 가라 빈을 등록해두었다
```java{filename=WebMvcTestConfig.java}
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

그리고 해당 파일이 자동으로 로드 되진 않기에, 테스트 할 파일에 `@Import` 어노테이션을 통해 로드해주었다. 
 
```java
@WebMvcTest({HomeController.class})
@Import(WebMvcTestConfig.class)
```

그 밖에 추가적으로 에러가 난다면 다음과 같은 프로세스로 추가해주면 된다.
- 실제로 동작할 필요가 없다면: `WebMvcTestConfig`에 실제 빈을 등록하지 않고, Mock을 사용하여 등록
- 실제로 동작이 필요한 Bean의 경우: `@Import`를 통해 추가로 등록

## 결과
실행 결과 테스트 시간이 28분에서 7분으로 줄어들었다. 약 4배 정도의 성능 향상이 있었다.
> 물론 추가적으로 테스트 할 클래스와 `SecurityConfig`를 등록해야한다는 단점은 있지만, 나와 팀원의 시간을 30분 줄여준다는 것은 얼마나 유의미한 발전인가!

