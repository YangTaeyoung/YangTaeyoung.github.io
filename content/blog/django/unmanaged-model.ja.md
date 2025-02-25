---
title: Unmanagedモデルを使用しながらテストを適用する方法 (feat. Table XXXが存在しない)
type: Blog
date: 2022-04-20
comments: true
translated: true
---

以前、会社でRaw Queryで書かれていたレガシーコードをDjango ORMベースに改編しようとしているとお話ししたことがありましたよね？

以前に書いておいた悩みがある程度解決され、プロジェクト構造やファイルの整理方法も整ったので、実際にモデルを分類しながら起こった出来事を投稿しようと思います。

既存の`SQLクエリ`を分析しながら、各テーブルがどのテーブルと結合されているか、影響度がどの程度かを確認しながらモデル分類まではうまくいっていたと思います。そしてそれがうまく動作するかテストをしようとテストコードを作成しているときに問題が発生しました。開発者にとっては~~嬉しい？~~エラーが発生したのです。

`Table my_database.XXX doesn't exist.`

~~なんでテーブルがないの？~~

---

## Unmanagedモデルとは？

`Django`では、`DB`と接続する`Model`を定義する際に`django.db.models.Model`モジュールを使用します。`Django`では`Model`を基にして`migration`をサポートしているため、もし`Django Native App`で設計した場合、`Django`で`DB Table`にアクセスして直接管理できるように設定することができます。
_`migration`については次回に詳細に投稿しますね！_

このような場合、`Django`で定義した`Model`はデータベースに直接接続し設計図になります。

Djangoで管理されるDB Schemaは`Model`クラスでデフォルト設定されるのが`managed = True`です。実際のコードでは次のように適用されるでしょう。

```python
class MyModel(models.Model):
  ...
  # DBフィールドを定義します
  ...
  class Meta:
    db_table = "real_database_table_name"
    manage = True # ここがポイントです。 
```

`Model`内部`Meta`クラスは`Django Native App`を通じてモデルを定義する際にはわざわざ表記しなくても`Django Model`でデフォルトで設定されているので、別途設定しなくても大丈夫です。

> この時、Metaクラス内部で設定されているmanaged変数がFalseになっている場合、これをUnmanagedモデル、すなわちDjangoで管理しないモデルと呼びます。

## Table xxx doesn't exist

ついに私が直面したエラーについて説明できる時が来ました。
`Django Unit Test`の場合、テストをするために既存のデータベースを使用しません。

**むしろ使用してはいけません。**

開発データベースであっても、私のプロジェクトが他のプロジェクトに影響を及ぼす可能性があるか、テストの繰り返しでデータベースが散らかってしまう可能性があります（多くの重複したテストケースによる…~~汚い~~）

その問題を解決するために、Django Testでは`managed = True`に定義されているモデルスキーマを基に`Test Database`をDBに作成し、一時テーブルを作成してその中でテストを実行します。そしてテストが終わると、テストデータベースと共にテーブルを削除します。

この時、`app/migration`に定義されているテーブルスキーマが重要です。

実際にはモデルをそのまま作成したとしても、モデルを実際にDBに適用するためには、モデルの変更履歴を通じてDBに適用するために中間段階を経る必要があるので、`Django`では各アプリ内の`migrations`を通じて変更履歴を追跡し、判断します。

_+ Djangoを学ぶ際に`python manage.py makemigrations`、`python manage.py migrate`というコマンドをよく使いますが、その時生成されるコードです！_

しかし`Unmanagedモデル`の場合、`migration`を利用してはいけません。他のサービスでも使用される可能性があるDBを`Django`が追跡させてはいけません。そしてテーブル修正の主体はDBにあると考え、`Django`にはないと考えます。したがって`managed = False`であるべきです。

DBから`Django`モデルにコードを生成するために`python manage.py inspectdb`コマンドをよく使用しますが、この時生成されるモデルのコードを見ると`managed = False`であることがわかります。

しかし`Test`は状況がだいぶ違いますね？一時的なDBであっても生成されても問題ないのですが、`managed = False`の影響を受けて、Test DBを生成できず、結局テーブルがないというエラーが発生するのです。

## Solution, どうすればいいでしょうか？

私の場合は単純ですが、少し強引に解決しました。（結論として成功しましたが、変更する予定であり、お勧めしない方法です。）

いくつかのブログでは、`Test`を実行する`Default Test Runner`を変更して、テストが実行される前に`model`の`Meta Class`にアクセスして`managed`を`True`に変更する方法を紹介しています。

私が使用したのも、下の例も、原理的には上記の方法を使用している点では同じです。

### Soluton #1: コマンドをフックする（私が使用した方法）

私はコマンドを通じてテストを進行する際、そのコマンドをフックしてコマンド内に`test`が含まれている場合、`managed = False`に変更するように設定しました。実際に変更するコードは2行だけで本当に簡単で、よく動作するコードでした。

まずPythonコマンド内に`test`が含まれているかを判定するコードを設定ファイルに定義します。

参考にした文献はこちら: [https://stackoverflow.com/questions/53289057/how-to-run-django-test-when-managed-false](https://stackoverflow.com/questions/53289057/how-to-run-django-test-when-managed-false)

```python
# settings.py
...
UNDER_TEST = (len(sys.argv) > 1 and sys.argv[1] == 'test')
...
```
そしてテストモデルクラスのメタクラスに以下のように`managed = getattr(settings, 'UNDER_TEST', False)`を追加してください。
```python
# models.py
from django.conf import settings # 私が定義したsettings.pyの値を取得できるようにするモジュールです。


class MyModel(models.Model)
  ...
  # 私が定義したフィールド
  ...
  class Meta(object):
      db_table = 'your_db_table'
      managed = getattr(settings, 'UNDER_TEST', False)
```

### Solution #2: カスタムテストランナーを使用する

上記の事例では簡単にテストを行うことができるという利点がありますが、テスト対象であるすべてのモデルの`managed`変数を同じ値に変更しなければならないという短所があります。

もしそうやって進め続ければテーブルが多ければ多くなるほど漏れが生じることがあり、協力しているチームメンバーがテストコードを書くときにこれを別に認識しなければならない短所が大きいでしょう。_(多くのルールは開発者を苦しめます)_

先ほど申し上げたように`Test Runner`を別途定義して、実行時にその`Test Runner`を使用してテストコードを実行することが`Django`の基本的なプログラミングルールを維持しながら、チームメンバー間で一貫したコードを特定の伝達なしに進めることができるという利点があります。

原理は`Test Runner`が`managed = False`のクラスを認識してテスト実行時にすべてのクラスを`managed = True`に変更してTestを実行するクラスを定義することです。

ただし、この事例の場合、まだ成功していないコードなので、リンクだけを残しておきます。

_おそらく最後に成功した上記の事例で`migration`フォルダを後になって削除したところ、残っていた`migration`フォルダが空だったことが元の原因だったようです。（完全に削除するべきでした）。今後会社で適用してみて可能であれば変更して更新します！_

[Django 1.9 以上](https://technote.fyi/programming/django/django-database-testing-unmanaged-tables-with-migrations/)

[Django 1.8 以下](https://www.pythonfixing.com/2021/11/fixed-how-to-create-table-during-django.html)

## 結びに

> 普段よりもきちんとしていなかったですが、一つずつ変えて適用していく中で自信がついてきた気がします。実際の投稿はそれほど長くないですが、この文章を書くために会社ではかなりの時間をかけました… ㅠㅠ
>
> 今日の投稿はここまでにし、次回は今日バグを見つける中で学んだ`Django Test Runner`や、`migration`についてもう少し詳しく投稿したいと思います！
> 今日も読んでいただきありがとうございます。ご質問やご指摘はいつでも歓迎します。コメントをご利用ください！