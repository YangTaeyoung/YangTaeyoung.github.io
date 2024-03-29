---
title: Spring Bean에 대해 알아보자
type: blog
date: 2022-02-24
comments: true
---
오늘은 `Spring MVC`에 대해서 설명을 드릴까 하다가 그 전에 MVC를 이해하기 위한 Spring 알아야 할 기본 지식들을 먼저 소개할까 합니다.

## Spring Bean?
`Spring Bean`은 `Spring Container`에서 관리하는 객체를 말합니다.
근데 이상합니다. Spring에서 관리하는 객체? 라이브러리 속 Spring이 정의한 객체일까요?

정답을 말하자면, 아닙니다. 물론 라이브러리 속에서도 `Bean`으로 정의되어있는 객체가 있을 수 있으나,
사용자가 작성하지만 `Spring`에서 관리하는 객체를 우리는 `Bean`이라고 정의합니다.
원래는 사용자가 객체를 관리해야 하나, 이렇게 프레임워크에서 관리하게 되는 것을 우리는 제어의 역전 `IOC`라고 표현합니다.

### Tip

공부하시는 분들은 믿지 않겠지만 스프링은 자신이 만든 객체나 설명에 대해 굉장히 자세하고 상세하게 설명하고 있습니다. 물론 Spring의 Document를 봐도 되지만, 바로 Code 속에서요
그럼 스프링에서 정의한 객체를 한번 볼까요? 

![image](https://user-images.githubusercontent.com/59782504/155391935-40bfd711-b6bf-47c0-9041-38ab043cb462.png)

위의 사진은 Spring의 Bean 어노테이션의 인터페이스를 캡쳐한 사진인데요. 위에보면 굉장히 주석이 많죠? 바로 봤을때는 이해가 잘 되지 않습니다만 중간중간에 코드를 통해 최대한 이해가 쉽도록 설명하려고 애쓰셨다는 것을 알 수 있습니다. 
가장 위에서 그들은 어떻게 Bean을 표현하고 있는지를 볼까요?

![image](https://user-images.githubusercontent.com/59782504/155392187-882448f1-b28f-4756-b5f5-470954696387.png)

"해당 어노테이션이 나타난 메서드는 `Spring Container`에 의해 `Bean`으로 관리될거야"라는 말이죠

이제 더 아래 주석부분의 요약을 보도록 할까요?

![image](https://user-images.githubusercontent.com/59782504/155393382-1a946d99-5d13-4f81-a312-a245039f2f60.png)

"이 주석이 들어간 메서드는 Spring Lagacy에서 사용한 XML에서 <bean/>에 정의한 객체와 유사하게 동작한다."라고 설명하면서 아래에 더 코드를 통해 예시를 들고 있군요

### Bean의 등록

```java
@Bean
 public MyBean myBean() {
     // instantiate and configure MyBean obj
     return obj;
}
```

이런식으로 `myBean` 메서드 앞에 `@Bean`이라는 어노테이션을 통해 `bean`으로 등록할 수 있음을 보이고 있죠

뒤에는 `Bean`의 네이밍에 대해서도 알려주는데요 `Bean`의 경우 별칭을 매개변수에 넣음으로써 지정할 수 있고, 심지어 배열을 통해서 한개의 빈이 여러 별칭을 가질 수 있음을 보여주고 있습니다.

### Bean의 별칭 짓기

```java
@Bean({"b1", "b2"}) // bean available as 'b1' and 'b2', but not 'myBean'
public MyBean myBean() {
   // instantiate and configure MyBean obj
   return obj;
}
```

위 코드를 보면 @Bean 어노테이션의 매개변수 `{"b1", "b2"}`를 통해 b1, b2로 해당 `Bean`을 관리한다고 알려주는 것이죠

#### 그럼 별칭은 왜 짓죠?

별칭을 짓는 이유는 여러가지가 있겠지만 가장 대표적인 이유는 Spring Bean 간의 이름을 겹치지 않게하기 위함이에요.

```java
@Bean
@Profile("production")
@Scope("prototype")
public MyBean myBean() {
   // instantiate and configure MyBean obj
   return obj;
} 
```

### Bean의 속성?

![image](https://user-images.githubusercontent.com/59782504/155396490-29453e82-9160-416d-b053-8750373bc9ca.png)

다음 주석이 설명하고 있는 것은 `Bean`은 별칭 외에 다른 속성을 제공하고 있지 않다는 것이에요. 
예시로 얘네가 말하는 것은 `Scope`, `Lazy`, `DependsOn`, `Primary`와 같은 속성을 제공하고 있지 않으며, 해당 속성은 `@Scope`, `@Lazy`, `@DependOn`, `@Primary` 와 같은 어노테이션과 같이 사용해야 함을 말하고 있죠
갑자기 여러 속성들이 나와 이해가 되지 않으실 테니 해당 부분에 대해서 설명하고 넘어가도록 하죠!

#### `@Lazy`

세상에는 여러 Bean이 있을 수 있겠죠? 하지만 간혹 어떤 Bean은 해당 Bean속에서 다른 Bean을 부를 수도 있을 거에요.

![image](https://user-images.githubusercontent.com/59782504/155397939-d440a56d-8dca-4443-aede-dead72bb6b47.png)

만약 위와 같이 학생 정보를 담는 Bean이 있다고 가정하고, 개인정보를 담은 Bean을 멤버변수로 갖고 있다고 생각해봐요.
근데 해당 객체를 생성과 동시에 개인정보를 초기화 하면 다른 사람들이 쉽게 개인정보를 볼 수도 있겠죠?

모든 `Bean`은 방금 설명과 같이 기본적으로 `Eager`정책을 따르고 있어요. 즉, 포함된 변수가 생성과 동시에 초기화를 하는 것이죠
하지만 `@Lazy`어노테이션이 명시된 `Bean`은 생성과 동시에 초기화 되지 않고, 다른 빈이 참조하거나, `BeanFactory`에서 명시적으로 검색할 때까지 초기화되지 않아요

`Bean Factory`: 빈을 생성하고 의존관계를 설정하는 기능을 담당하는 IOC 컨테이너

#### `@Scope`

이제 `Scope`에 대해서 알아보도록 하죠
`@Scope` 어노테이션은 `Bean`의 범위를 설정하는 어노테이션입니다

![image](https://user-images.githubusercontent.com/59782504/155399798-b6dc7a08-fb47-40d6-ae3f-a9f5d0633193.png)

여기에도 설명이 되어 있으니 보도록 하죠. `@Scope`어노테이션의 경우 `@Component` 어노테이션과 같이 쓸 경우 해당 주석이 달린 우형의 인스턴트에 사용할 스코프의 이름을 나타낸다라고 알려주네요
하지만 우리는 아직 `Component`에 대해 배우지 않았으니, 잠시 넘어가도록 할까요?

`@Bean`과 함께 메서드 수준 어노테이션으로 사용한다면 메서드에서 반환된 인스턴스에 사용할 스코프의 이름을 나타낸다 라고 적혀있습니다.

`Bean`의 경우 싱글톤 형식으로 유지되기 때문에 하나의 객체만 반환되도록 설정이 되어있는데 `@Scope`는 해당 범위를 바꿀 수 있게 하는 것입니다.
해당 부분에 대해서는 잘 설명해놓은 게시글이 있으니 링크를 걸어둘게요 (이 게시글을 통해 작성하였습니다)

`singleton` – IoC 컨테이너당 하나의 빈을 리턴
`prototype` – 요구가 있을 때 마다 새로운 빈을 만들어 리턴
`request` - HTTP request 객체당 하나의 빈을 리턴
`session` - HTTP session 당 하나의 빈을 리턴
`globalSession` - 전체 모든 세션에 대해 하나의 빈을 리턴

http://ojc.asia/bbs/board.php?bo_table=LecSpring&wr_id=498

#### `@DependsOn`

의존하고 있다 라는 뜻이지요? 같은 맥락이라고 봐도 무방합니다.
해당 어노테이션이 적혀있는 `Bean`의 경우 `value`에 선언한 `Bean`이 생성된 후에 생성됨을 보장합니다.
예를 들어 `@DependsOn(value="myBean")`이라고 한다면 해당 빈은 `myBean`이후에 꼭 생성되는 것을 보장한다는 것이죠.

해당 빈이 해제될 때도 의존하고 있는 `myBean`이 해제된 다음 해제되게 됩니다.


#### `@Primary`

`component-scanning`을 사용한다고 가정 하였을 때 해당 어노테이션이 `@Bean`과 같이 명시된 경우 `component scan` 대상 중 가장 우선적으로 주입됩니다.

Component Scan의 경우 아래의 블로그에서 매우 잘 설명하고 있습니다. 쉽게 말해 `@Configuration`에 설정된 클래스 들을 일일이 등록하는 것이 아닌, 한번에 등록시키는 것. `@Primary`의 경우 해당 Scan에서 가장 먼저 등록함을 명시하는 것이에요.

아래의 블로그에서 매우 자세하게 잘 설명하고 있습니다.

Component Scan: https://velog.io/@hyun-jii/%EC%8A%A4%ED%94%84%EB%A7%81-component-scan-%EA%B0%9C%EB%85%90-%EB%B0%8F-%EB%8F%99%EC%9E%91-%EA%B3%BC%EC%A0%95

## 마치며
- 오늘은 이렇게 Spring Bean에 대한 것들을 알아보았습니다. 다들 즐거운 코딩공부가 되었으면 좋겠어요

