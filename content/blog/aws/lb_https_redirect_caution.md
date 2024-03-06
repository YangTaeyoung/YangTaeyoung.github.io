---
title: AWS Load Balancer를 사용할 때 계속 405 (Method Not Allowed) 가 뜨는 경우
type: blog
date: 2023-11-23
comments: true
---

회사 API 서버에서 웹훅 관련한 API를 만들 일이 있어 POST 요청을 받는 웹훅 엔드포인트를 생성했다.

그런데, 분명 요청을 보내는 서버에서는 정상적으로 POST로 요청을 보내는데, 받는 서버의 로그에서는 405 (Method Not Allowed)가 뜨고 있었다.

![image](/images/aws/lb_https_redirect_caution-1700742951722.png)

## 원인

AWS Load Balancer를 사용할 때, HTTP 요청을 HTTPS로 리다이렉트 시키는 기능이 있다.

![image](/images/aws/lb_https_redirect_caution-1700743047350.png)

일반적으로는 위와 같이 설정되는데, 이 경우 301 (Moved Permanently)로 리다이렉트 시키기 때문에 HTTP로 POST 요청을 보내면 HTTPS로 리다이렉션 되면서 GET 요청으로 바뀌게 된다.

서버는 Load Balancer 뒤에 있기 때문에, GET 요청을 받는 엔드포인트가 없어 405 (Method Not Allowed)가 뜨게 되었다.

이는 도표로 나타내면 다음과 같다.

![image](/images/aws/lb_https_redirect_caution-1700744557719.png)


### 리다이렉션 원리
일반적인 리다이렉션은 클라이언트(웹 브라우저 등)가 서버에서 301 (Moved Permanently)와 같은 리다이렉션 응답을 받으면, 클라이언트는 리다이렉션 응답에 포함된 Location 헤더의 주소로 다시 요청을 보내게 된다.

리다이렉션과 같은 경우 이전에 보냈던 Request, HTTP Method 와 같은 정보는 일반적으로 갖고있지 않기 때문에 GET 요청 및 이전에 보냈던 Body를 유실한 채로 다시 요청을 보내게 된다.

## 해결 방법
해결방법은 매우 간단하다. 리다이렉션 되지 않도록 처음부터 HTTPS로 요청을 보내면 된다.

Load Balancer에서 제공하는 해당 기능과 같은 경우 static한 페이지를 주고 받을 때 (ex. `text/html`과 같은 content-type을 가진 요청) HTTPS 프로토콜을 통해 받도록 리다이렉트 시키기 위해서 사용하는 것이기에, REST API 서버와 같은 경우는 URL에 `http`가 아닌 `https`로 명시하여 요청을 보내도록 하면 된다.

### Reference
- [https://webstone.tistory.com/65](https://webstone.tistory.com/65)
