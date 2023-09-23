---
layout: post
title: MVC에 대해 알아보자
parent: 🌐 Web
date: 2022-02-22
---
## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}
---

# MVC? 그게 뭔데?

`MVC`는 `Model`, `View`, `Controller`의 약자입니다. 웹 어플리케이션을 구성하는 다양한 방법론 중 하나로 구성요소를 3가지로 나눈 대표적인 패턴입니다
웹 프레임워크로 유명한 `Spring Framework`에서 사용하는 것으로 유명하며, 소소한 차이가 있으나, 다양한 웹 프레임워크가 비슷한 패턴을 취하고 있습니다.

## 다른 프레임워크는 뭐가 있는데?
> 비슷한 패턴으로는 `MVT`패턴이 있습니다. 파이썬 기반 프레임워크 `Django`에서 사용하는 구성패턴으로 `Model`, `View`, `Template`의 약자입니다.
  각자 역할은 `MVC`패턴과 거의 일치하나, 매칭되는 기준이 다릅니다.

  ![image](https://user-images.githubusercontent.com/59782504/155057532-25c9325c-3009-4ee7-8cee-7946530643ec.png)
  
> 위 사진을 보면 `MVC`와 `MVT`의 관계가 어떻게 다른지 알 수 있습니다. 
> 
> `Django`의 `View`는 `Spring`에서는 `Controller`임을 알 수 있죠!
>
> 또한 `Spring`에서의 `View`가 `Django`에서는 `Template`인 것도 알 수 있습니다.

**이제 이 정도면 재미삼아 차이도 알았으니, 슬슬 `MVC`가 뭔지 알아볼까요?**

<hr>

# Model, View, Controller 그리고 User

![image](https://user-images.githubusercontent.com/59782504/155059391-11d1e224-cbc0-4eac-bdcc-31e7f255d2e1.png)

Model, View, Controller의 관계를 간략하게 표현하면 위 사진과 같지만, 실제로는 화살표가 여러 방향으로 더 갈 수 있습니다. 
<br>여기서 중요한 것은 화살표의 방향 같은 것이 아니라 **흐름**을 보셔야 합니다

<hr>

## Model


Model부터 보도록 하죠. Model은 데이터를 담는 객체, 엔티티를 부르는 말로, 데이터베이스에 저장할 실제 데이터의 클래스가 들어가는 객체입니다. 
<br>쉽게 말하자면 **데이터베이스와 소통하는 친구라고 보면 됩니다.** <br><br>CRUD연산이 일어나는 모든 객체의 정보를 담고 있어야 하며, **View**, **Controller**에 대해 참조해선 안됩니다.

<hr>

## View

사용자에게 보여지는 UI를 담는 객체입니다. RestFul한 API가 대세가 되면서, 최근에는 Spring에서 직접 HTML을 담는 일은 적어졌습니다. 
Vue.js, React와 같은 프론트엔드 프레임워크가 Spring MVC의 View를 담당하고 있다고 봐야겠군요! 
<br>
<br>
사용자에게서 가장 먼저 입력을 받아 Controller에게 보내는 역할을 수행합니다. 
HTML에서 input, checkbox, submit 버튼과 같은 사용자 입력 태그, 데이터 베이스에서 가져온 데이터를 사용자에게 보여주는 부분과 같은 일을 처리하죠!

<hr>

## Controller

사용자에게 요청을 받아 적절히 데이터를 처리하고(Model) View를 호출하거나 비동기 통신의 경우 상황에 맞는 형식(JSON/XML..etc)으로 응답을 하는 역할을 수행합니다

<hr>

오늘은 간단하게 MVC 패턴에 대해 알아보았습니다. 처음 만드는 기술 블로그이다 보니 포스팅 하나하는 것에 얼마나 정성이 들어가야 하는지 알게되었네요.
다음 주제는 Spring MVC 패턴에 대해 조금 더 자세히 알아보도록 하겠습니다.
