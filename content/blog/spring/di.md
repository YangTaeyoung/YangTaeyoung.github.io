---
title: 의존성 주입 (Dependency Injection, DI)에 대해 알아보자
type: blog
date: 2022-02-24
comments: true
---
이번 포스팅에서는 Spring Framework의 중요한 개념중 하나인 의존성 주입(Dependency Injection): DI에 대해 다루겠다.

DI는 Spring의 매우 중요한 개념 중 하나이고, 회사 면접에서도 단골로 나오는 개념이니 꼭 알고 있는 것이 좋다.

먼저 의존성에 대해 알아보자.

## 의존성

A 객체가 B 객체에 의존하고 있다는 것의 뜻은 포함관계와 매우 밀접한 관련이 있다.

한번 코드로 보도록 하자.


```java{filename=Korean.java}
class Korean {
    int score; // 과목 점수
    string content; // 과목 내용
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

위와 같이 `Student` 클래스의 경우 국어 점수 `score`와 과목의 내용 `content`이 담긴 `Korean`클래스를 포함하고 있다.
포함관계라고 말을 해도 되지만,

**"`Student`가 `Korean`을 의존하고 있다."** 라고도 표현한다.

근데 이러면 무슨 문제가 생길까?

만약 `Student`에 `Korean`이 없어지고 `Math`를 추가해야 한다면?

안타깝겠지만 개발자는 멤버변수를 지우고, 새로운 멤버변수를 추가해주어야 한다. 바로 아래처럼.

```java{filename=Math.java}
class Korean{
    int score; // 과목 점수
    string content; // 과목 내용
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

### 너무 불편하지 않은가?
이렇게 하면 문제가 생길 것 같다. 매번 멤버변수에도, 생성자 안에서도 주석을 풀었다 바꾸었다, 추가했다 말았다 하면서 시간낭비를 하게 될 것이다.

### 인터페이스로 추상화하기
조금 더 편하게 하기 위해선 이런 작업 말고 과목별로 묶어버리는 인터페이스로 만드는 것도 좋을 것 같다.
바로 이렇게 말이다.

```java{filename=Subject.java}
public interface Subject {
}
```

```java{filename=Korean.java}
class Korean implements Subject {
    int score; // 과목 점수
    string content; // 과목 내용
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

멤버변수를 하나만 선언하면 되니 조금 더 편해졌다.
하지만 여전히 `Student` 클래스의 생성자에서는 `Subject` 인터페이스를 구현하고 있는 클래스를 선택해야만 한다.
많이 편해졌지만, 아직 불편한 셈이다.



## 의존성 주입 (Dependency Injection)

위에있는 문제를 해결하기 위한 방법이 무엇이 있을까?
생성자 부분을 주석처리해가도 좋겠지만, 그러면 나중에 유지보수를 해야할 일이 생기면, 개발자가 처리할 문제가 너무 커지겠다. 고칠게 한 두가지가 아닐테니까.

그걸 고치기 위해 나온 것이 의존성 주입이다. 객체를 생성자를 외부에서 외부에서 주입하는 방식인 것이다.

```java{filename=Student.java}
// Student.java
class Student{
    private Subject subject;
    
    public Student(Subject subject){
        subject = subject;
    }
}
```

```java
class SomeClass {
    // 의존성 주입
    Student student = new Student(new Korean());
}
```

어떤가? 정말 단순한 구현이지만 코드가 훨씬 간결해질 수 있다. 아예 인터페이스만 가져가고 실제 `Korean`이라는 객체를 주입하는 곳은 따로 있는 셈이다.

## 정리
이처럼 의존성 주입은 인터페이스 변수를 통해 멤버변수를 선언하고, 사용할 때 외부에서 인터페이스를 구현한 객체를 주입받아 사용하는 방식이다.

## 마치며
이번 포스팅에서는 의존성 주입에 대해서 알아보았다. 다음에는 의존성 주입을 실제로 Spring에서는 어떤 형식으로 구현하고 있는지를 알아보도록 하자.
