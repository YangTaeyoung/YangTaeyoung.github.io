---
layout: post
title: Autowired 어노테이션에 대해 알아보자
nav_order: 3
parent: <iconify-icon icon="logos:spring-icon"></iconify-icon> Spring
date: 2022-02-24
---
## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}
---
저번시간에는 `Spring`의 `DI` 에 대해서 알아보았죠?

["의존성 주입" 포스팅 보러가기](/docs/spring/di)

오늘은 `DI`과 밀접한 관련이 있는 어노테이션 `@Autowired`에 대해서 알아볼까 합니다.

우선 어떤 메서드나 어노테이션이건 간에 이름에 굉장히 중요한 의미가 있어요

Autowired? 어떤 느낌인가요? "자동으로 연결된" 뭐 이런 느낌이지 않나요?

뭔지는 모르겠지만 한번 보도록 해요.

# `@Autowired?`

자동으로 연결되어있다는 뜻을 가진 이 친구는 `Spring`에서 의존성을 주입시켜주는 역할을 담당해요. 개념적으로 배운 의존성 주입을 실제로 실현하고 있는 친구라고 봐도 돼요

![image](https://user-images.githubusercontent.com/59782504/155427654-874ed5fc-d108-4420-9eec-43f5b546565e.png)

위의 주석을 통해 정의를 확인해보도록 하죠

> `생성자`, `필드`, `Setter`메서드, 혹은 `Config`메서드를 `Spring`의 의존성 주입 기능에 의해 자동으로 사용하도록 하기위해 나타내는 어노테이션이다. 라고 명시하고 있죠?

지난번 의존성 주입에 대한 정의를 함께 설명하였으니, `@Autowired`의 역할에 대해서만 간략하게 설명하겠습니다.

지난번에 의존성 주입을 하기 위해서는 `Student`객체를 사용하는 클래스가 따로 있어야 한다고 설명을 드렸습니다. 

하지만 해당 객체를 결국 우리가 만들어서 사용한다면 주입하는 과정에서 또 다른 의존성이 발생할 수 있겠죠?

그런 것들을 해결하기 위해 `@Autowired`는 더이상 `new` 라는 키워드가 필요 없도록 해줍니다.

```java
class StudentService{
  @Autowired
  private StudentRepository studentRepository;
  
  // 이름으로 학생을 찾는 메서드
  public Student findByStdName(string name){
    return studentRepository.findByName(name);
  }
}
```

여기서 이상한 것들(`repository`, `findByName()` 등)이 많이 나왔지만 여러분들은 여기서 두가지만 보면 됩니다

1. `studentRepository`라는 멤버변수가 존재한다.
2. 해당 멤버변수를 초기화 하지 않고(`new` 등의 키워드를 쓰지 않고) 멤버 함수를 호출하고 있다.

이 두가지죠.

원래는 초기화 하지않고 멤버함수인 `findByName()`을 호출하는 순간 `NullPointer` 에러를 출력해야 하나,

`@Autowired`는 해당 클래스의 적절한 생성자를 찾아서 `student = new StudentRepository()`를 해주는 역할을 수행합니다. 

따라서 오류가 발생하지 않죠

## 생성자에서의 `@Autowired`

방금 전에는 Autowired 된 부분이 멤버변수였죠? 생성자도 `Autowired`할 수 있는데요 바로 어디서 의존성을 주입받을 수 있을까요?
```java
@Service
class StudentService{

  private StudentRepository studentRepository;
  
  @Autowired
  punlic StudentService(StudentRepository studentRepository){
    this.studentRepository = studentRepository;
  }
}
```

바로 파라미터 부분입니다.

생성자는 어떤 객체든 초기화 할 때 호출됩니다. 하지만 만들때마다 `new StudentService(new StudentRepository())` 같은 코드가 되면 보기 싫겠죠?

`StudentService` 역시 서비스이고, 서비스 역시 `@Bean` 어노테이션을 갖고 있기 때문에 다른 클래스에서 의존성을 주입하게 된다면 따로 생성자에다가 명시할 수도 없고요..ㅠㅠ

이 부분에 있어 위의 `@Autowired` 어노테이션은 `new StudentService()`만 호출하더라도 `new StudentService(new StudentRepository())`과 같은 효과를 갖게 해줍니다.

다만 여기서 주의해야 할 점은, 생성자 오버로딩을 통해 여러개의 생성자에 정의했을 경우 **`@Autowired`가 붙는 생성자는 단 하나여야한다는 점!** 기억해주세요.

### TIP: 생성자의 `@Autowired` 생략
생성자가 하나인 경우 어차피 생성을 하면서 의존성을 주입받아야 하기 때문에 생략이 가능합니다.

---

## 메서드에서의 `@Autowired`
 
생성자도 메서드니까 용법이 똑같겠네? 라고 생각하셨다면 반은 맞고 반은 틀리셨습니다.

파라미터에 적용되는 것은 비슷하지만 아까전에 말했죠? 어떤 객체든 초기화 할 때 생성자는 호출된다고,

하지만 메서드는 다릅니다. 호출하는건 개발자 마음이겠죠? 필수가 아니니까요

메서드에 붙는 `@Autowired`를 통해 호출할 때마다 의존성이 부여되는 경우를 가정하고 싶다면 

"해당 메서드는 필수적인 메서드는 아니지만 **자동으로 주입을 해줬으면 좋겠다**" 라고 

속성(`required=false`)을 통해 표시해주어야 합니다.
> 아래처럼요

```java
@Service
class StudentService{

  private StudentRepository studentRepository;
  
  // 필수가 아닌 메서드지만 의존성은 주입받고 싶은경우
  @Autowired(required = false)
  punlic setStudentRepository(StudentRepository studentRepository){
    this.studentRepository = studentRepository;
  }
}
```

---

> 오늘은 의존성 자동주입을 위한 `@Autowired` 어노테이션의 다양한 용법에 대해 알아보았습니다. 다음에 또 만나요!
> 틀린 것이 있다면 꼭 제보 부탁드려요!!!
