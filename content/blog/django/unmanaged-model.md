---
title: Unmanaged Model을 사용하면서 Test를 적용하기 (feat. Table XXX doesn't exist)
type: Blog
date: 2022-04-20
comments: true
---
저번에 회사에서 Raw Query로 적혀있던 레거시 코드를 Django ORM기반으로 개편하려 한다고 말씀 드린적이 있었죠?

저번에 작성해두었던 고민들이 어느 정도 결정된 바도 있고, 프로젝트 구조나, 파일을 정리하는 그런 방법론들이 어느정도 정리가 되어서, 실제로 모델을 분류하면서 있었던 일들을 포스팅하려해요.

기존 `SQL Query`를 분석하면서 각 테이블이 어떤 테이블과 조인이 되어있고, 영향도가 어느정도 인지 체크하면서 모델 분류까지는 잘 되었던 것 같아요. 
그리고 잘 되는지 테스트를 하려고 테스트 코드를 작성하고 있는데 문제가 발생했습니다. 개발자에겐 ~~반가운?~~ 에러가 발생한 것이죠

`Table my_database.XXX doesn't exist.`

~~뭐야 ㅆ... 테이블이 왜 없어?~~

---

## Unmanaged Model이 뭐야?

`Django`에서는 `DB`와 연결하는 `Model`을 정의할 때 `django.db.models.Model` 모듈을 사용해요. `Django`에서는 `Model`을 기반으로 `migration`을 지원하기 때문에 만약 `Django Native App`으로 설계를 했다면 `Django`에서 `DB Table`에 접근하여 직접 관리할 수 있도록 설정할 수 있어요.
_`migration`에 대해서는 다음에 다시 자세하게 포스팅 할게요!_

이런 경우에 `Django`에서 정의하는 `Model`은 데이터베이스에 직접 접속하여 설계도가 돼요.

이렇게 `Django`에서 관리되는 DB Schema를 `Model`클래스에서 디폴트로 설정되는 것이 `managed = True`에요. 실제 코드에선 이런식으로 적용되겠죠

```python
class MyModel(models.Model):
  ...
  # DB 필드를 정의합니다
  ...
  class Meta:
    db_table = "real_database_table_name"
    manage = True # 바로 이부분입니다. 
```

`Model` 내부 `Meta` 클래스는 `Django Native App`을 통해서 모델을 정의할 때에는 굳이 표시하지 않아도 `Django Model`에서 디폴트로 설정되어 있어서 따로 설정하지 않아도 돼요.

 > 바로 이때 Meta 클래스 내부에 설정되어 있는 managed 변수가 False로 되어 있을 때 이를 Unmanaged Model, 즉 Django에서 관리하지 않는 모델이 됩니다. 


## Table xxx doesn't exist

드디어 제가 맞딱드렸던 에러에 대해 설명할 수 있군요. 
`Django Unit Test`의 경우 테스트를 하기 위해 기존 데이터 베이스를 사용하지 않아요.

**오히려 사용하면 안돼죠.**

개발 데이터베이스라 하더라도, 내 프로젝트가 다른 프로젝트에도 영향을 끼칠 수 있거나, 많은 테스트 실행으로 데이터베이스가 지저분하게 될 수 있어요 (수 많은 중복된 테스트 케이스로 인한.. ~~더러운~~)

그런 문제를 해결하기 위해서 Django Test에서는 `managed = True`에 정의되어 있는 모델 스키마를 토대로 `Test Database`를 DB에 만들고, 임시 테이블을 만들어서 그 안에서 테스트를 실행해요. 그리고 테스트가 끝나면 테스트 데이터베이스와 함께 테이블을 지우죠. 

이때 `app/migration`에 정의되어 있는 테이블 스키마가 중요한데요. 

사실 모델대로 만든다고 했지만, 모델을 실제 DB에 적용하기 위해서는 모델의 변경 내역을 통해 DB에 적용하기 위해 중간 단계를 거쳐야 하기 때문에 `Django`에서는 각 앱 내의 `migrations`를 통해 변경 내역을 추적하고, 판단하게 돼요. 

_+ Django를 배울 때 `python manage.py makemigrations`, `python manage.py migrate` 명령어를 많이 사용하는데 그 때 생성되는 코드랍니다!_

하지만 `Unmanaged Model`의 경우 `migration`을 이용하면 안돼요. 다른 서비스에서도 사용할 지도 모르는 DB를 `Django`가 추적하게 두어선 안되겠죠. 그리고 테이블 수정 주체는 DB에 있다고 보고, `Django`에 있다고 보지 않아요. 따라서 `managed = False`이어야 하죠

DB에서 `Django`모델로 코드를 생성하기 위해서 `python manage.py inspectdb` 명령어를 많이 사용하는데, 이 때 생성되는 Model의 코드를 보면 `managed = False`인 것을 볼 수 있습니다.

하지만 `Test`는 상황이 많이 다르죠? 임시적인 DB라서 생성되도 상관이 없는데도, `managed = False`의 영향을 받기 때문에 Test DB를 생성하지 못하고, 결국 테이블이 없다고 하는 에러가 발생 것이에요.

## Solution, 그러면 어떻게 해야할까요?

저와 같은 경우는 단순하지만 조금 무식하게 해결했어요. (결론적으로 성공하였으나 바꿀 예정이고, 권장하지 않는 방법이에요.)

여러 블로그에서는 `Test`를 실행시키는 `Default Test Runner`를 바꾸어서 테스트가 실행되기 전에 `model`의 `Meta Class`에 접근하여 `managed`를 `False`로 바꾸어주는 방법을 소개하고 있어요.

제가 사용한 것도, 밑에 예시들도 원리는 위의 방법을 사용한다는 점에서는 같아요.

### Soluton #1: 명령어 가로채기(제가 사용한 방법)

저는 명령어를 통해 test를 진행할 때 해당 명령어를 가로채서 명령어 중 `test`가 포함되어 있다면, `managed = False`로 바꾸도록 설정했어요. 실제 바꿀 코드는 두 줄 뿐이라 정말 간단했었고, 잘 동작하는 코드였어요.

먼저 파이썬 명령어 속에 `test`가 포함되어 있는지 판별하는 코드를 설정파일에 정의합니다.

해당 레퍼런스를 참고했습니다: [https://stackoverflow.com/questions/53289057/how-to-run-django-test-when-managed-false](https://stackoverflow.com/questions/53289057/how-to-run-django-test-when-managed-false)

```python
# settings.py
...
UNDER_TEST = (len(sys.argv) > 1 and sys.argv[1] == 'test')
...
```
그리고 테스트 모델 클래스의 메타 클래스에 아래와 같이 `managed = getattr(settings, 'UNDER_TEST', False)`를 넣어주시면 됩니다.
```python
# models.py
from django.conf import settings # 내가 정의한 settings.py의 값을 가져올 수 있도록 하는 모듈입니다.


class MyModel(models.Model)
  ...
  # 내가 정의한 필드들
  ...
  class Meta(object):
      db_table = 'your_db_table'
      managed = getattr(settings, 'UNDER_TEST', False)
```

### Solution #2: Customed Test Runner 사용하기

위의 사례에서는 간단하게 테스트를 할 수 있다는 장점이 있으나, 테스트 대상인 모든 모델의 `managed` 변수를 같은 값으로 바꾸어야 한다는 단점이 있습니다.

만약 그렇게 계속 진행한다면 테이블이 많으면 많아질 수록 놓치는 것들이 생길 것이고, 협업을 하는 상황에서 다른 팀원이 테스트 코드를 짤 때 이를 따로 인지해야 하는 단점이 크겠죠. _(많은 룰은 개발자를 힘들게 합니다)_

앞서 말씀드렸던 것처럼 `Test Runner`를 따로 정의하고 실행시에 해당 `Test Runner`를 통해 테스트 코드를 실행하는 것이 `Django`의 기본 프로그래밍 규칙을 유지하면서 팀원들끼리 일관적인 코드를 특정한 인수인계 없이 진행할 수 있다는 장점이 있습니다.

원리는 `Test Runner`가 `managed = False`인 클래스를 인식하고 테스트 실행 시점에 모든 클래스를 `managed = True`로 바꾸어 Test를 실행시키는 클래스를 정의하는 거에요.

다만 해당 사례의 경우 아직 성공하지 못한 코드이기 때문에 Reference 링크만 남겨두도록 하겠습니다. 

_아마 마지막으로 성공한 위의 사례에서 `migration`폴더를 뒤늦게 삭제했는데, 남겨져 있었던 `migration`폴더가 비어있었던 것이 원흉이었던 것 같아요.(아예 없애버렸어야 했죠) 추후 회사에서 적용해보고 가능하다면 바꾸고 업데이트 하도록 할게요!_


[Django 1.9 이상](https://technote.fyi/programming/django/django-database-testing-unmanaged-tables-with-migrations/)

[Django 1.8 이하](https://www.pythonfixing.com/2021/11/fixed-how-to-create-table-during-django.html)

## 마치며

> 평소보다 깔끔하지는 못했지만, 하나하나 바꾸고 적용해가면서 자신감이 붙는 것 같아요. 실제 포스팅은 그리 길진 않지만, 이 글을 쓰기 위해 회사에서는 많은 시간을 썼어야 했답니다.. ㅠㅠ
> 
> 오늘의 포스팅은 이만 마치도록 하고, 다음에는 오늘 버그를 찾으며 알아보았던 `Django Test Runner`나, `migration`에 대해서 조금 더 자세히 포스팅 해보고 싶은 생각이 드네요!
> 오늘도 읽어주셔서 감사합니다. 질문이나, 지적해주시는 것은 언제든 환영합니다. 덧글을 이용해주세요!
