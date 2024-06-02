---
title: (JAVA) Spring에서 같은 서비스 내의 메소드 Mocking 하기
type: blog
date: 2024-05-30
comments: true
---

일반적으로 Spring은 Layered Architecture 를 따르고 있으며, 서비스에서 주로 비즈니스 로직을 처리하게 된다. 

서비스의 코드가 많아지면 많아질 수록 비슷한 코드가 많아지게 되는데, 이런 경우 공통 로직을 처리하는 별도 레이어를 두어 분리하는 경우도 있지만, 대개 서비스 내에 공통 메서드를 선언해서 처리하는 경우도 많을 것이다.

예를 들어 다음을 보자
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

위의 코드에서 `methodA`는 `methodB`, `methodC`에서 공통적으로 사용되는 메소드이다. 

만약 `methodB()`의 테스트 코드를 작성해야 한다면, `methodA()`에 대한 테스트 코드도 함께 작성해야 할 것이다. 최악의 상황은 **"공통"** 로직이라 한 만큼 `methodC()`를 테스트 할 때에도 `methodA()`의 로직을 함께 테스트해야 하는 경우가 발생할 수 있다.

중복을 줄이려 했는데, 오히려 테스트 코드에서는 중복이 더 많아지는 상황이 발생할 수 있다.

## Mocking

만약 다른 클래스의 객체 내 메서드를 사용한다면, 이런 경우 Mocking 이라는 방식을 통해 메서드의 모의 동작을 지정하고, 테스트 코드를 작성한다. (왜냐하면 Mocking 된 메서드는 이미 테스트 되었다고 가정하기 때문에 해당 메서드 내에서의 테스트는 불필요하기 때문이다.)

하지만 Mocking도 만능은 아닌 것이 동일한 클래스의 경우에는 얘기가 좀 다르다.

왜냐하면 일반적으로 Java는 Mocking을 위해 프록시 객체를 생성하고, 해당 프록시 객체를 마치 실제 객체인 것처럼 사용하는데, 동일한 클래스를 모의 객체인 동시에 실제 객체로 사용하는 것은 어려운 일이기 때문이다.

일반적으로 Java 를 제외한 다른 언어에서는 동일한 클래스 내의 메서드를 테스트하는 것은 앞서 말한 것처럼 중복이 발생할 수 있다. 

파이썬 같은 경우는 해당 상황에서 Monkey Patching을 통해 동일한 클래스 내의 메서드 자체의 포인터를 변경하여 테스트를 진행하기도 하며,

이전에 Go로 한참 개발할 때에는 그런 공통적인 메서드 포인터를 따로 선언하여 테스트 시점에 해당 메서드 포인터를 테스트 시에 주입하거나, 앞서 말했던 것처럼 공통적인 로직을 처리하는 레이어를 따로 분리하여 테스트하는 방법을 사용했었다. (이처럼 인터페이스가 서로 다르면 Mocking을 하는 것은 어떤 언어든 어렵지 않다.) 

Java 에서는 이런 경우 `@Spy`를 사용하여 같은 클래스 내의 메서드를 Mocking 할 수 있다.

## `@Spy`
![image](/images/spring/same-class-method-test-1717083827711.png)

우선 어노테이션에 대해 알기 전에 Spy 객체에 대해 알아보자.

스파이의 의미를 생각해보아도 좋은데, 영화에서 스파이를 생각해보면 어떤가?

실제 한 편인 것처럼 행동하다가, 특정 상황에서는 다른 행동을 하는 것을 생각해보면 이해가 쉬울 것이다.

**Spy 객체는 이처럼 어떤 경우에는 실제 객체의 메서드를 호출하면서, 어떤 경우에는 특정 메서드의 동작을 변경할 수 있는 객체**이다.

`@Spy`는 이러한 Spy 객체를 생성하는 어노테이션이다.

이제 위의 코드를 `@Spy` 어노테이션을 이용해 테스트 해보자

Mock 의존성이 별도로 있는 경우 일반적으로 Mocking할 객체에 `@Mock` 어노테이션을, 의존성을 받는 객체(테스트 대상 메서드가 존재하는 객체)에 `@InjectMocks` 어노테이션을 사용한다.

주의할 점은 이렇게 `@Spy` 어노테이션을 함께 활용하는 경우 `@Spy` 어노테이션이 `@InjectMocks` 어노테이션보다 먼저 선언되어야 한다.

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

이제 `methodA()`를 테스트하는 코드를 작성해보자.
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

이렇게 `@Spy` 어노테이션을 활용하면 같은 클래스 내의 메서드라도 Mocking 할 수 있다.


## 공통 로직 레이어 분리 시 테스트 코드

다만, 이렇게 같은 클래스 내의 메서드를 Mocking 하는 것은 테스트 코드의 가독성을 떨어뜨릴 수 있으므로, 개인적인 생각으로는 이런 경우에는 공통 로직을 처리하는 별도의 레이어를 두는 것이 좋은 것 같다.

예를 들어 `methodA()`를 별도의 클래스(해당 글에서는 `SomeServiceSupport`로 작명)로 분리하여 처리하고, `SomeService`에서는 해당 클래스를 주입받아 사용하는 방법이 있을 것이다.

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


이렇게 분리하면 굳이 같은 클래스 내의 메서드를 Mocking 할 필요가 없어지므로, `@Spy` 어노테이션을 통한 테스트, 메서드 간 복잡한 상관관계를 줄일 수 있을 것이다.


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

해당 코드에서는 사실 테스트 코드는 별로 달라지지는 않았다. 다만 계층 간의 분리를 다른 개발자가 와서 보더라도 해당 레이어가 공통 로직을 처리하는 레이어임을 알 수 있으므로, 유지 보수에 좀 더 이점이 있는 것 같다.