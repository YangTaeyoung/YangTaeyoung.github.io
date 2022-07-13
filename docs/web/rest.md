---
layout: post
title: REST?, RESTful?, REST API? 가 도대체 뭐야?
parent: Web
---
## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}
---
안녕하세요! 이번 포스팅은 웹에서 널리 쓰이고 있는 REST에 대해서 알아보려 합니다.
`REST`는 로이 필딩(Roy Fielding)이라는 사람에 의해 2000년에 박사 논문에서 소개되었다고 합니다.
<br><br>
`REST`는 Representation State Transfer의 약자로 `하이퍼미디어` 시스템을 위한 소프트웨어 아키텍쳐의 한 형식입니다.

<hr>

## 하이퍼 미디어(Hyper Media)?

모르는 단어가 나왔죠? `하이퍼 미디어`는 뭘까요?
<br>
하이퍼 미디어란 **텍스트, 도형, 애니메이션 및 비디오 화상 등 복수의 정보를 노드와 링크로 유기적으로 연결한 네트워크 그물망 구조**를 뜻합니다. 
<br><br>
링크 기능을 이용하여 **정보를 유기적으로 연결하고 차례로 끌어내는 식으로 관련 정보를 대화식으로 끌어낼 수 있는 것**이 특징입니다! **정보가 링크를 통해 연결되어 있다는 것**이 핵심이에요!

<hr>

## 그래서 REST가 뭔데?

`REST`는 자원(`Resource`)을 자원의 이름(자원의 표현: `Representation`)으로 구분하여 자원의 상태(`State`)를 주고 받는 모든 것을 뜻합니다. 

이렇게 말하니 굉장히 어렵죠? 조금 더 쉽게 표현해보도록 하겠습니다.

![image](https://user-images.githubusercontent.com/59782504/155932531-4587a4ea-b9de-4625-a9ad-90adb1bd9e69.png)

자원은 우리가 흔히 인터넷 서핑을 하면서 보는 것들입니다. **텍스트, 동영상, 이미지 등 서비스가 제공하는 모든 것을 자원**이라고 표현할 수 있습니다.

**자원의 표현**은 뭘까요? **자원에 이름을 붙인 것**이라고 볼 수 있습니다. 

인터넷에서 어떤 자료를 보기 위해서는 이름을 붙여주어야 합니다. 

만약 다음과 같은 정보를 표현하고 싶을 떄를 생각해보죠.

![image](https://user-images.githubusercontent.com/59782504/155925520-e33b36c9-8d2b-49a2-b0bc-5346d0ab6db6.png)

> 네 사자 이미지입니다. 하지만 네트워크는 어떻게 DB에 있는 사자 이미지를 출력할 수 있는 것일까요?

<img width="541" alt="image" src="https://user-images.githubusercontent.com/59782504/155926067-7a1994ac-ad25-420e-91a4-7ff537605da1.png">

> 다음 그림처럼 사자 이미지를 인터넷 브라우저는 자원의 이름을 통해서 호출 합니다. 
> 
> 사진이에서 보시다시피 정확히는 자원을 담고 있는 링크를 통해 해당 자원을 요청하게 되는 것이죠.

`이처럼 자원의 이름을 명시`하고, 해당 이름을 통해 `자원을 주고 받는 것`을 `자원의 표현` 이라고 하는 것이죠 :)

근데 인터넷에서 이루어지는 작업은 사자 이미지를 얻어오는(`GET`) 작업만 있는 건 아니겠죠?

---

## REST Method

REST는 HTTP 프로토콜을 통해 여러 요청을 처리할 수 있게 크게 4가지의 `Method`를 제공합니다.

1. `GET`: **정보를 얻어오는 데에 중점**을 둔 프로토콜입니다. 여러분이 네이버에 로그인하면 프로필에 자신의 정보가 뜨게 되죠? 네이버는 로그인 하고 메인 페이지를 로딩하는 과정에서 사용자의 프로필 정보를 요청(Request)하게 되고 서비스는 해당 정보를 반환하게 됩니다. <br>
2. `POST`: **정보를 생성하는데 중점**을 둔 프로토콜입니다. 만약 여러분이 회원가입을 하게 되면 웹 브라우저에 기록된 사용자 정보가 DB에 반영되기 위해 POST Method를 통해 서비스에 전달됩니다. <br>
3. `PUT`: **정보를 수정하는데 중점**을 둔 프로토콜입니다. 네이버에서 프로필을 수정하게 된다면 해당 프로토콜을 통해 수정된 정보를 서비스에 전달합니다. <br>
4. `DELETE`: **정보를 삭제하는데 중점**을 둔 프로토콜입니다. 회원 탈퇴, 게시글 삭제 등 DB에 있는 레코드를 삭제하기 위해 서비스에 요청할 때 사용합니다 <br>

<hr>

## 그럼 실제 데이터는 어떻게 주고 받아? (자원의 상태: State)

`REST` 개념에서 핵심은 자원을 주고 받는 방식에 있습니다.
<br>
실제 데이터는 `XML`이나, `JSON`포멧을 통해 파일을 주고 받게 되는데요. 예를 들어 아까전의 사자 사진은 이렇게 `JSON`으로 표현할 수 있습니다.

```json
{
  pic_name: "lion",
  link: "https://cdn.example.com/img/lion.png"
}
```
> _▲ 예시 JSON_

```xml
<?xml version="1.0"?>
<pic>
    <pic_name>lion</pic_name>
    <link>"https://cdn.example.com/img/lion.png"</link>
</pic>
```
> _▲ 예시 XML_

이처럼 자원의 상태를 담은 값을 사용자에게 반환하고, 클라이언트는 해당 응답을 통해 적절한 태그(예: `img` tag) 속에 사자 이미지 링크를 부여하고 사용자에게 비로소 사자의 정보를 보여줄 수 있습니다.

---

## REST의 6가지 제한조건

개발자는 다음 조건을 준수하며, `REST`의 프로토콜을 구현할 수 있습니다.

1. **인터페이스 일관성**(Uniform Interface): **인터페이스는 일관적으로 분리**되어야 한다는 원칙입니다. 
> 특정 프레임워크나, 프로그램에 종속되는 형식이 아닌, `REST`를 따라 구현한 서비스의 경우 `HTTP`프로토콜을 통해 자원을 주고 받을 수 있어야 합니다.

2. **무상태**(Stateless): 각 요청간 **클라이언트의 콘텍스트가 서버에 저장되어선 안된다는 원칙**입니다.
> 이는 이전 요청은 현재 요청에 절대 영향을 끼쳐서는 안된다는 원칙을 갖고 있습니다. 
>
>예를 들어 로그인을 예시로 들 수 있습니다. 
>
> REST 이전과, 많은 서비스에서 현재에도 사용자 인증정보를 세션과 같은 형태로 서버에 저장하여 관리하고 있습니다.
>
> 다만 완벽히 REST로 구현한 서비스라면, 인증정보는 사용자(클라이언트)가 직접 관리해야 합니다. 
>
> 일반적으로 로그인 정보를 `JWT Token`과 같은 형태로 암호화하여 헤더속에 저장하고, **인증이 필요한 요청마다** 헤더에 인증정보를 담아 보내는 형식으로 로그인을 구현합니다.

3. **캐시 처리 가능**(Cacheable): **REST는 웹 표준 `HTTP`프로토콜을 그대로 사용**한다는 점에서 큰 장점이 있습니다.
> 즉, `HTTP`의 `캐싱`기능을 사용할 수 있는 것입니다. `캐싱`은 **주어진 리소스의 복사본을 저장하고 있다가 요청 시에 그것을 제공하는 기술**을 뜻합니다. 
> 
> 만약 모든 자원을 요청할 때마다 서버에 요청한다면, 서버에는 큰 부담이 될 것입니다.
> 
> 그래서 이미 한번 받은 파일이나, 요청의 경우 `HTTP` 프로토콜은 **이를 캐시파일로 저장해두었다가 이미 있는 자원의 요청의 경우 따로 서버에 요청하지 않고 해당 자원을 반환**합니다.

4. **계층화**(Layered System): 클라이언트는 직접 서비스에 요청하지 않습니다. 서비스는 사용자를 위한 API서버를 준비해야 하며, 클라이언트는 해당 `API`서버를 통해 자원을 요청(`Request`)하고, 응답(`Response`)받을 수 있습니다. 
> 흔히 `Spring`에서 말하는 `Controller`, `Django`에서는 `View`가 클라이언트와 소통하는 대표적인 부분입니다.
> + 추가적으로 `API Server`는 비즈니스 로직만 수행하며, 앞단에 인증, 로드밸런싱 등의 추가적인 기능을 구현할 수 있습니다.
5. **Code On Demand**: 클라이언트는 서버로부터 스크립트를 받아서 실행해야한다는 제한사항입니다. 다만 꼭 충족할 필요는 없습니다.
6. **클라이언트 - 서버** 구조(Server-Client): 자원을 보유한 쪽이 `Server`, 요청하는 쪽이 `Client`가 됩니다. 
> `서버`: `API`제공, 비즈니스 로직 처리 및 저장을 담당합니다
> 
> `클라이언트`: 서버에게 필요한 자원을 요청하며 추가적으로 사용자 인증이나 세션등을 관리하고 책임집니다

---

## REST API

REST API란 앞서 명시한 `REST` 아키텍처를 기반으로 하여 클라이언트가 요청을 보내고 사용할 수 있게끔 구현한 인터페이스를 뜻합니다.

앞서 제가 프로젝트를 하며 구현했던 `API`의 예시를 보시죠!

<img width="250" alt="image" src="https://user-images.githubusercontent.com/59782504/155930373-280d5db5-6273-4384-a533-5cedbed5ea26.png">

위와 같이 `API`는 요청 URI, URI를 통해 응답받을 수 있는 자원의 상태(`JSON`), `요청 Method` 등을 명시해야 합니다. 클라이언트 개발자는 해당 `API`를 보고 `JSON`이나, `XML` 내부의 데이터를 적절히 사용자에게 보여질 수 있도록 클라이언트를 구성합니다.

<hr>

## RESTful

`RESTful`이란 `REST` 아키텍처를 구현한 웹 서비스를 나타내기 위해 사용되는 용어입니다. 특정 웹 서비스가 `REST API`를 구현했다면 해당 서비스는 `RESTful`하다고 할 수 있습니다.

### 목적

누가봐도 직관적으로 이해할 수 있고, 사용하기 쉬운 API를 만드는 것을 목적으로 합니다. 

<hr>

## 마치며
> 이번에는 웹에서 널리 사용하는 아키텍처인 `REST`와 `REST API`, `RESTful`에 대해서 알아보았습니다. 
> <br>
> 부족한 설명이 있거나 틀린 설명이 있다면 언제든 말씀해주세요. 즉각 반영하겠습니다!

<hr>

## Reference
* [https://gmlwjd9405.github.io/2018/09/21/rest-and-restful.html](https://gmlwjd9405.github.io/2018/09/21/rest-and-restful.html)
* [https://developer.mozilla.org/ko/docs/Web/HTTP/Caching](https://developer.mozilla.org/ko/docs/Web/HTTP/Caching)
* [https://ko.wikipedia.org/wiki/REST](https://ko.wikipedia.org/wiki/REST)
* [https://blog.daum.net/hsyang112/7](https://blog.daum.net/hsyang112/7)