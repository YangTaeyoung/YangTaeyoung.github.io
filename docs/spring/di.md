---
layout: post
title: 의존성 주입 (Dependency Injection, DI)에 대해 알아보자
parent: <iconify-icon icon="logos:spring-icon"></iconify-icon> Spring
nav_order: 2
date: 2022-02-24
---
## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}
---

이번 포스팅에서는 `Spring Framework`의 중요한 개념중 하나인 의존성 주입(Dependency Injection): DI에 대해 다루겠어요.
<br><br>
`DI`는 `Spring`의 가장 중요한 개념이고 회사 면접에서도 단골로 나오는 개념이니 꼭 알고있는게 좋아요.

<br><br>
먼저 의존성에 대해 알아볼까요?

<hr>

## 의존성

A객체가 B객체에 의존하고 있다는 것의 뜻은 포함관계와 매우 밀접한 관련이 있어요. 
한번 코드로 보도록 하죠!
<br>

{%- highlight java -%}
// Korean.java
class Korean{
    int score; // 과목 점수
    string content; // 과목 내용
}

// Student.java
class Student{
    private Korean korean;
    public Student(){
        korean = new Korean();
    }
}
{%- endhighlight -%}
<br>
위와 같이 `Student` 클래스의 경우 국어 점수 `score`와 과목의 내용`content`이 담긴 `Korean`클래스를 포함하고 있어요.
포함관계라고 말을 해도 되지만,
<br>
<br>
 **"`Student`가 `Korean`을 의존하고 있다."** 라고도 표현해요
<br>
근데 이러면 무슨 문제가 생길까요?
<br>
만약 Student에 Korean이 없어지고 Math를 추가해야 한다면?
<br>
안타깝겠지만 개발자는 멤버변수를 지우고, 새로운 멤버변수를 추가해주어야해요. 바로 아래처럼요.
<br>
{%- highlight java -%}
// Korean.java
class Korean{
int score; // 과목 점수
string content; // 과목 내용
}

// Math.java
class Math {
    int score;
    string content;
}

// Student.java
class Student{
    // private Korean korean;
    private Math math;
    public Student(){
        //korean = new Korean();
        math = new Math();
    }
}
{%- endhighlight -%}
<br>
<br>
**너무 불편하지 않나요?**<br>
이렇게 하면 문제가 생길 것 같아요. 매번 `멤버변수`에도, `생성자` 안에서도 주석을 풀었다 바꾸었다, 추가했다 말았다 하면서 시간낭비를 하게 될 거에요

<hr>

## 인터페이스로 추상화하기

조금 더 편하게 하기 위해선 이런 작업 말고 과목별로 묶어버리는 `인터페이스`로 만드는 것도 좋을 것 같아요.
바로 이렇게요

{%- highlight java -%}

// Subject.java
public interface Subject {
}

// Korean.java
class Korean implements Subject{
int score; // 과목 점수
string content; // 과목 내용
}

// Math.java
class Math implements Subject{
int score;
string content;
}


// Student.java 
class Student{
    private Subject subject;
    public Student(){
        subject = new Korean();
        // subject = new Math()
    }
}
{%- endhighlight -%}

멤버변수를 하나만 선언하면 되니 조금 더 편해졌죠?
하지만 여전히 `Student` 클래스의 생성자에서는 `Subject` 인터페이스를 구현하고 있는 클래스를 선택해야만 해요.
많이 편해졌지만, 아직 불편한 셈이죠.

<hr>

## 의존성 주입 (Dependency Injection)

위에있는 문제를 해결하기 위한 방법이 무엇이 있을까요?
생성자 부분을 주석처리해가도 좋겠지만, 그러면 나중에 유지보수를 해야할 일이 생기면, 개발자가 처리할 문제가 너무 커지겠죠? 고칠게 한 두가지가 아닐 테니까요.
<br><br>
그걸 고치기 위해 나온 것이 의존성 주입이에요. 객체를 생성자를 외부에서 외부에서 주입하는 방식인 것이죠

{%- highlight java -%}
// Student.java
class Student{
    private Subject subject;
    
    public Student(Subject subject){
        subject = subject;
    }
}

// Student클래스를 사용하는 곳.java
Student student = new Student(new Korean());

{%- endhighlight -%}

어떤가요? 정말 단순한 구현이지만 코드가 훨씬 간결해질 수 있어요. 아예 인터페이스만 가져가고 실제 `Korean`이라는 객체를 주입하는 곳은 따로 있는 셈이죠.

### 정리
이처럼 의존성 주입은 **인터페이스 변수를 통해 멤버변수를 선언하고, 사용할 때 외부에서 인터페이스를 구현한 객체를 주입받아 사용하는 방식**이에요

<hr>

>이번 포스팅에서는 의존성 주입에 대해서 알아보았어요. 다음에는 의존성 주입을 실제로 Spring에서는 어떤 형식으로 구현하고 있는지를 알아보도록 해요
