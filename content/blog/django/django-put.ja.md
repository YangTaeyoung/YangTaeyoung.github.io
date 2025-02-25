---
title: クラスビューでPUTを介してデータをパースする
type: blog
date: 2022-04-12
comments: true
translated: true
---

## リクエストに'データ'属性がない
会社で今回、関数型で設計されていたビューをクラスビューに再設計する際に発生した問題について見ていこうと思います。

Djangoを使っていると少し疑問に思う部分があります。特に`REST Framework`を通じてデータを受け取るときですが

私の場合は`AttributeError: request has no attribute 'data'`というエラーが発生しました。

まず、私が実装したクラスを見てみましょう。

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

もちろん`JavaScript`では `myapp/my_url/`に正しくデータを送っていましたが、`request.data`という変数は生成されませんでした。

`Django Rest Framework`を学んだことがある方なら、このコードが変だとわかるはずです。

私もわかっています。通常は`Serializer`を実装して、そのクラスを通じて`JSON`データをパースするのが一般的ですよね？

しかし、残念ながら私の状況ではそれができませんでした。

参照できるモデルもなく、ほとんどのモデルと関連のある関数がRaw Queryで直接データベースに接続して実行するクエリだったので、`Serializer`を独立して構成するのは難しかったのです。

モデルより`Serializer`がフロントエンドで受け取っているということになるので、結局それをまた解いてデータを取り出すのであれば、後でモデルを新たに設計する際に新たなリスクが生じるかもしれないと考えました。

ともかく、コードに戻りましょう。結局、上記のコードは正しくデータを受け取ることができず、私は問題があると感じてPyCharm IDEを通じてデバッグしてみました。

結論として、`request`には`data`というメンバ変数は全く存在しませんでした。

おかしいですよね？`Class View`ではなく`Function View`を使用して下記のコードのように設計したときは、`request.data`はうまく入ってきました。

もちろん`GET`と`POST`で入ってきたデータに関しては、`request.POST`、`request.GET`のような形式で、別途データをパースして保存する内部メンバ変数が存在しますが、`PUT`と`DELETE`にはそれが無いというのが本当に不思議でした。

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
私はGoogleで`class view django put`というキーワードで検索し、次のようなページを見つけることに成功しました。

ブログで答えを探してみましょう。

この後の内容は、この[ブログ](https://thihara.github.io/Django-Req-Parsing/)を参考にしました。

## `request.POST`はRESTのPOSTとは違う

このブログに入ってみると、Googleグループで開発者たちが行った[このような会話](https://groups.google.com/g/django-developers/c/dxI4qVzrBY4/m/m_9IiNk_p7UJ)を垣間見ることができます。

会話の内容から`Django`の`request.POST`は`REST`を通じて設計されたものではなく、`HTML`の`form`で`method="post"`として設定して送信したときに受け取るデータを前提としていることがわかります。

ほとんどのformから送信されるPOST形式のケースでは、`Content Type`が`multipart/form-data`に設定されており、エンコーディングが`JSON`とは異なることを教えています。

`Django`は`request.POST`がこの形式のデータをパースすることを前提としているため、多くの場合、予期しないエラーが発生する可能性があることに注意を促しています。

特に`REST framework`を使用して`JSON`形式でデータを送信しても、`request.POST`には正しくデータが入ってきますが、この場合も常に`form`を通じてエンコードされたデータであるため、無視するようにと言っています。

難しい話ですが、結局`request`には`request.PUT`、`request.DELETE`のようなものが無かったのです。

## それではどうするか？

実際に私たちが使用しているウェブでは、まず適切にモデルを通じて実装された`Serializer`がなく、クラスビューで作成することが目的であるため、`request.POST`、`request.GET`のような形式で`request.PUT`のようにデータを受け取ると非常に便利だと思われます。

これを実現するために、`request`が関数に渡される途中でミドルウェア側で`request`を先行して受け取り、`request`の下位プロパティに`PUT`という変数を追加する形式で進めてみようと思います。

後でPOSTやPUTに`content-type`が`application/json`で渡された場合に備えて、`JSON`というプロパティも作成することにしましょう！

## ソリューション

まず皆さんが作成した共通モジュールフォルダがある場合はそこに、ない場合は新たにフォルダを作成し、`parsing_middleware.py`と作成しましょう（名前は関係ないので、好きなものにしても構いません）。
次のようなコードを入力してください

私は`COMMON`という共通モジュールフォルダを作成し、モジュール間の区別のために`middleware`というフォルダを中に入れ、`parsing_middleware.py`ファイルを作成しました。
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

そして`settings.py`に該当ミドルウェアを使用するように設定すれば終わりです。

```python
# my_project_name/settings.py
MIDDLEWARE = [
...
  # PUT, JSONパースのためのミドルウェア追加
  'COMMON.middleware.parsing_middleware.PutParsingMiddleware',
  'COMMON.middleware.parsing_middleware.JSONParsingMiddleware',
...
]
```


## 後の悩み

Raw QueryをDjango Model基盤に改善する際に発生する問題についても後で投稿する予定ですが、問題はDjangoのプロジェクト構造のようですね。

さまざまなリファレンスを探しましたが、Djangoのドキュメントでも`views.py`、`models.py`が大きくならざるを得ない構造を推奨していますね。

_▼ Djangoで提案されるベストプラクティス例_

![image](https://user-images.githubusercontent.com/59782504/163424387-9d327726-249a-4212-9089-053b6ef04825.png)

`python`でこれが最善か、理想的な構造かはわかりませんが、当面考えつく問題が多いです。

`Django`は独立したアプリに`views.py`にはビジネスロジックおよびコントローラーを、modelsにはDBに関連するモデルを、`template`には`HTML`ページと`CSS`、`JS`を入れますが、アプリに機能が追加されればされるほど、一つのファイルが持つ依存性がますます大きくなるでしょう。

しかし、むやみに`views.py`を分離すると、循環参照、依存性がますます大きくなるなど様々な部分で問題が生じ、連鎖的に問題が発生するでしょう。

モジュールはオブジェクト指向モデルに合わせて独立して設計するべきですが、`Django`の場合は`Spring`のように依存性を管理してくれる`IOC`コンテナのような良い機能がないので。

独立してモジュールをどのように設計し、良いサービスをどのように作り上げていくかを考えるのが今後の課題です。

引き継ぎのためのドキュメント自動化も重要な課題ですね。

私の悩みとこれらの問題をどのように解決したかを後に投稿しようと思います！

## 結びに

- 今日は私が関数型ビューをクラス型ビューに変えた際に発生したエラーの解決プロセスについて学びました。もちろん私と同じ状況にある方は少ないとは思いますが、皆さんもこの投稿を参考にして問題を解決するのに役立てていただければ幸いです。
- いつでも良い指摘、良い言葉はありがたく受け取ります。
- ありがとう！