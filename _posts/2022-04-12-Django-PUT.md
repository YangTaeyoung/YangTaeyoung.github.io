---
layout: post
title: (Django)Class View에서 PUT을 통해 데이터를 파싱해오기
tags: [django]
date: 2022-04-12
---

# Request has no Attribute 'data'

회사에서 이번에 함수형으로 설계되어 있던 뷰를 클래스 뷰로 재설계 하면서 생겼던 이슈에 대해서 알아보려고 합니다. 
<br><br>
Django를 쓰다보면 조금 의아한 부분들이 있습니다. 특히 `REST Framework`를 통해서 데이터를 받을 때인데요
<br>
저 같은 경우에는 `AttributeError: request has no attribute 'data'`라는 오류가 났었어요. 
<br><br>
우선 제가 구현한 클래스를 보도록 하죠

```python
# urls.py
urlpatterns = [
  path('my_url/', views.MyView.as_view())
]

# views.py 
class MyView(View)
  def put(self, request):
    my_data = request.data
    # my business logic
    
```

물론 `JavaScript`에서는 `myapp/my_url/` 로 제대로 된 데이터를 보내고 있었어요.하지만 `request.data`라는 변수는 생기질 않았죠. 
<br>
`Django Rest Framework`를 배우신 분은 이 코드가 이상하다는 것을 알거에요.
<br><br>
저도 알아요. 일반적으로는 `Serializer`를 구현하고 해당 클래스를 통해 `JSON`데이터를 파싱하는 것이 일반적이죠?
<br>
하지만, 아쉽게도 제 상황은 그러기엔 여의치 않았어요. 참고할 수 있는  모델은 없었고, 거의 모든 Model과 관련되어있는 함수가 Raw Query를 직접 데이터 베이스에 연결하여 실행시키는 쿼리라서 `Serializer`를 독립적으로 구성하는 것이 부담스러웠거든요. 모델보다 `Serializer`가 앞단에서 받고 있는 셈인데 결국 그걸 다시 풀어헤쳐서 데이터를 뽑아낸다면 나중에 모델을 새로 짤 때 새로운 리스크가 생길 수도 있다고 생각했어요.

<br><br>
아무튼! 코드로 돌아와보죠. 결국 위의 코드는 제대로 데이터를 받지 못했고, 저는 문제가 있음을 느끼고 PyCharm IDE를 통해 디버그를 해보았어요.
<br>
결론적으로 `request`안에는 `data`라는 멤버변수는 아예 존재하지 않았죠.
<br><br>
이상하죠? `Class View`가 아닌 `Function View`를 사용하여 아래 코드처럼 설계했을 때는 `request.data`는 잘 들어왔거든요.
<br><br>
물론 `GET`과 `POST`에 들어온 데이터의 경우 `request.POST`, `request.GET`과 같은 형식으로 따로 데이터를 파싱해서 저장하는 내부 멤버변수가 존재하지만, `PUT`과 `DELETE`는 그런게 없다는 것이 정말 의아했어요.

```python
# urls.py
urlpatterns = [
  path('my_url/', views.my_view)
]

# views.py 
  def my_view(self, request):
    my_data = request.data
    # my business logic
    
```
저는 구글에 `class view django put` 이라는 키워드로 검색을 했고, 다음과 같은 페이지를 찾는데 성공했어요.
<br> 
블로그에서 답을 찾아보도록 하죠.
<br><br>
뒤의 내용은 해당 블로그를 참고했습니다.
<br>
\# Reference: https://thihara.github.io/Django-Req-Parsing/

<hr>

# request.POST는 REST의 POST와는 달라.

해당 블로그를 통해 들어가 보면 구글 그룹에서 개발자들끼리 한 이런 대화를 엿볼 수 있는데요(아마 장고 관련자이신가 봐요..?)
<br>
https://groups.google.com/g/django-developers/c/dxI4qVzrBY4/m/m_9IiNk_p7UJ
<br><br>
대화 내용 중 `Django`의 `reuqest.POST`는 `REST`를 통해 설계된 것이 아니라 `HTML`의 `form`에서 `method="post"`로 설정하여 제출했을 때 받는 데이터를 상정했다는 것을 알 수 있어요.
<br><br>
대부분 form에서 전송되는 POST형식의 경우 `Content Type`이 `multipart/form-data`로 설정되어 인코딩이 `JSON`과 다르다는 것을 알려주고 있습니다.
<br><br>
`Django`는 `request.POST`가 이러한 형식의 데이터를 파싱하는 것을 전제에 두었기 때문에 많은 경우 예기치 못한 오류가 날 수 있음을 경고하고 있습니다.
<br><br>
특히 `REST framework`를 사용하여 `JSON` 형식으로 데이터를 보내도 `request.POST`에는 제대로 데이터가 들어오는데, 이 역시 항상 `form`을 통해 인코딩 된 데이터이기 때문에 무시하라고 말하고 있습니다.
<br><br>
어려운 이야기이지만 결국` request`안에는 `request.PUT`, `request.DELETE`과 같은 것은 없던 것이죠.

<hr>

# 그럼 어떻게 해?

사실 저희가 사용하는 웹에서는 우선 적절히 모델을 통해 구현되어있는 `Serializer`가 없고, 현재 클래스 뷰로 만드는 것이 목적이기 때문에 `request.POST`, `request.GET`과 같은 형식으로 `request.PUT` 처럼 데이터를 받으면 굉장히 편할 것 같습니다.
<br><br>
이를 위해 `request`가 함수로 전달되는 도중에 미들웨어쪽에서 `request`를 선제적으로 받고 `request`의 하위 속성에 `PUT`이라는 변수를 추가하는 형식으로 진행해보도록 하겠습니다.
<br><br>
추후 POST나 PUT에 `content-type`이 `application/json`으로 전달되었을 때를 대비하여 `JSON`이라는 속성도 만들도록 하죠!

<hr>

# Solution

우선 여러분께서 만든 공통 모듈 폴더가 있다면 그곳에, 없다면 새로 폴더를 만들고 `parsing_middleware.py`라고 만들도록 합시다(이름은 상관없으니 여러분이 하고 싶은걸로 해도 됩니다.)
그리고 다음과 같은 코드를 입력해주세요
<br>
저는 `COMMON`이라는 공통 모듈 폴더를 만들고 모듈 간 구분을 위해` middleware`라는 폴더를 안에 넣고, `parsing_middleware.py` 파일을 만들었어요
```python
# COMMON/middleware/parsing_middleware.py

import json

from django.http import HttpResponseBadRequest
from django.utils.deprecation import MiddlewareMixin


class PutParsingMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.method == "PUT" and request.content_type != "application/json":
            if hasattr(request, '_post'):
                del request._post
                del request._files
            try:
                request.method = "POST"
                request._load_post_and_files()
                request.method = "PUT"
            except AttributeError as e:
                request.META['REQUEST_METHOD'] = 'POST'
                request._load_post_and_files()
                request.META['REQUEST_METHOD'] = 'PUT'

            request.PUT = request.POST


class JSONParsingMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if (request.method == "PUT" or request.method == "POST") and request.content_type == "application/json":
            try:
                request.JSON = json.loads(request.body)
            except ValueError as ve:
                return HttpResponseBadRequest("unable to parse JSON data. Error : {0}".format(ve))
```

그리고 settings.py에 해당 미들웨어를 사용하도록 설정해주면 끝입니다.

```python
# my_project_name/settings.py
MIDDLEWARE = [
...
  # PUT, JSON 파싱을 위한 미들웨어 추가
  'COMMON.middleware.parsing_middleware.PutParsingMiddleware',
  'COMMON.middleware.parsing_middleware.JSONParsingMiddleware',
...
]
```

<hr>

# 마치며

> 오늘은 제가 함수형 뷰를 클래스형 뷰로 바꾸면서 생겼던 오류에 대해 해결하는 과정에 대해 알아보았습니다. 물론 저와 같은 상황이 다들 많지는 않겠지만, 여러분도 해당 포스팅을 참고하셔서 문제를 해결하는데 도움이 되셨으면 좋겠습니다.
> 언제든 좋은 지적, 좋은 말씀은 감사히 받겠습니다.
> 고마워요!
