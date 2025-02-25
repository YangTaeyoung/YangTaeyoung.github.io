---
title: Spring Beanについて知ろう
type: blog
date: 2022-02-24
comments: true
translated: true
---
今日は、`Spring MVC`について説明しようと思いましたが、その前にMVCを理解するために知っておくべきSpringの基本知識をまずご紹介しようと思います。

## Spring Beanとは？
`Spring Bean`は、`Springコンテナ`が管理するオブジェクトを指します。
でも、なんか変ですね。Springで管理するオブジェクト？ライブラリの中にあるSpringが定義したオブジェクトでしょうか？

答えを言うと、違います。もちろん、ライブラリの中にも`Bean`として定義されているオブジェクトが存在するかもしれませんが、ユーザーが作成したけど`Spring`で管理されるオブジェクトを`Bean`と定義します。
本来はユーザーがオブジェクトを管理する必要がありますが、このようにフレームワークで管理されることを制御の逆転、`IOC`と表現します。

### Tip

勉強されている方々は信じられないかもしれませんが、Springは自身が作成したオブジェクトや説明に関して非常に詳細に説明しています。もちろんSpringのドキュメントを見てもいいですが、コードの中から直接探すこともできます。
それでは、Springで定義されたオブジェクトを一度見てみましょう。 

![image](https://user-images.githubusercontent.com/59782504/155391935-40bfd711-b6bf-47c0-9041-38ab043cb462.png)

上の写真はSpringのBeanアノテーションのインターフェースをキャプチャした写真です。上を見ると、かなり多くのコメントがありますね？最初に見たときは理解しづらいかもしれませんが、途中でコードを通じて最大限理解しやすく説明しようとしているのがわかります。
一番上で彼らがどうBeanを表現しているのか見てみましょう。

![image](https://user-images.githubusercontent.com/59782504/155392187-882448f1-b28f-4756-b5f5-470954696387.png)

"このアノテーションが付いたメソッドは`Springコンテナ`によって`Bean`として管理される"ということです。

それでは、さらに下のコメント部分の要約を見てみましょう。

![image](https://user-images.githubusercontent.com/59782504/155393382-1a946d99-5d13-4f81-a312-a245039f2f60.png)

"この注釈の付いたメソッドはSpring Lagacyで使用されたXMLの<bean/>に定義されたオブジェクトと類似して動作します。"と説明しつつ、さらにコードを通じて例を示していますね。

### Beanの登録

```java
@Bean
 public MyBean myBean() {
     // instantiate and configure MyBean obj
     return obj;
}
```

このように`myBean`メソッドの前に`@Bean`というアノテーションを通じて`bean`として登録できるのを示していますね。

また、`Bean`のネーミングについても教えてくれますが、`Bean`の場合、別名をパラメータに入れることで指定でき、さらには配列を通じて1つのBeanが複数の別名を持つことができることも示しています。

### Beanの別名の付け方

```java
@Bean({"b1", "b2"}) // bean available as 'b1' and 'b2', but not 'myBean'
public MyBean myBean() {
   // instantiate and configure MyBean obj
   return obj;
}
```

上のコードを見ると、@Beanアノテーションのパラメータ`{"b1", "b2"}`を通じてb1, b2として該当`Bean`を管理することを教えているわけです。

#### 別名を付ける理由？

別名を付ける理由は様々ですが、最も代表的な理由はSpring Bean間で名前が重複しないようにするためです。

```java
@Bean
@Profile("production")
@Scope("prototype")
public MyBean myBean() {
   // instantiate and configure MyBean obj
   return obj;
} 
```

### Beanの属性？

![image](https://user-images.githubusercontent.com/59782504/155396490-29453e82-9160-416d-b053-8750373bc9ca.png)

次のコメントが説明しているのは、`Bean`は別名以外に他の属性を提供していないということです。
例として彼らが言うには、`Scope`, `Lazy`, `DependsOn`, `Primary`のような属性を提供していませんが、これらの属性は`@Scope`, `@Lazy`, `@DependsOn`, `@Primary`のようなアノテーションと一緒に使用する必要があると述べています。
突然多くの属性が出てきて理解できないかもしれないので、該当部分について説明していきましょう。

#### `@Lazy`

世の中には様々なBeanがあるでしょう。でも、時には特定のBeanがその中で他のBeanを呼び出すこともあるでしょう。

![image](https://user-images.githubusercontent.com/59782504/155397939-d440a56d-8dca-4443-aede-dead72bb6b47.png)

もし上記のように学生情報を持つBeanがあって、個人情報を含むBeanをメンバー変数として持っていると考えてみてください。
でも、そのオブジェクトを生成するのと同時に個人情報を初期化すると、他の人が簡単に個人情報を見ることができるかもしれませんよね？

すべての`Bean`は説明したように基本的に`Eager`ポリシーを採用しています。つまり、含まれている変数が生成と同時に初期化されるのです。
しかし、`@Lazy`アノテーションが指定された`Bean`は生成と同時に初期化されず、他のBeanが参照したり、`BeanFactory`で明示的に検索されるまで初期化されません。

`Bean Factory`: ビーンを生成し、依存関係を設定する機能を担当するIOCコンテナ

#### `@Scope`

それでは、`Scope`について見ていきましょう。
`@Scope`アノテーションは、`Bean`のスコープを設定するアノテーションです。

![image](https://user-images.githubusercontent.com/59782504/155399798-b6dc7a08-fb47-40d6-ae3f-a9f5d0633193.png)

ここにも説明があるので見てみましょう。`@Scope`アノテーションは`@Component`アノテーションと共に使う際、該当注釈が付いたウィジェットのインスタンスに使用するスコープの名前を示すとされていますね。
しかし、私たちはまだ`Component`について習ってないので、一旦飛ばして説明しましょう。

`@Bean`と一緒にメソッドレベルのアノテーションとして使用する場合、メソッドで返されるインスタンスに使用するスコープの名前を示します。

`Bean`の場合、シングルトン形式で維持されるため、1つのオブジェクトのみ返されるように設定されていますが、`@Scope`はその範囲を変えることができるようにします。
該当部分については、よく説明されている投稿があるのでリンクを付けておきます（この投稿を参考に作成しました）。

`singleton` – IoCコンテナごとに1つのビーンを返す
`prototype` – 要求があるたびに新しいビーンを作成して返す
`request` - HTTPリクエストオブジェクトごとに1つのビーンを返す
`session` - HTTPセッションごとに1つのビーンを返す
`globalSession` - 全セッションに対して1つのビーンを返す

http://ojc.asia/bbs/board.php?bo_table=LecSpring&wr_id=498

#### `@DependsOn`

依存しているという意味です。同様の文脈で考えても差し支えありません。
該当アノテーションが記載されている`Bean`の場合、`value`に宣言した`Bean`が生成された後に生成されることを保証します。
例えば、`@DependsOn(value="myBean")`と言うと、該当ビーンは`myBean`以降に必ず生成されることを保証します。

該当ビーンが解放される際も依存している`myBean`が解放された後に解放されるようになります。

#### `@Primary`

`component-scanning`を使用すると仮定した場合、該当アノテーションが`@Bean`と共に指定されている場合、`component scan`の対象中、最も優先的に注入されます。

コンポーネントスキャンについては、以下のブログでとてもよく説明されています。簡単に言うと、`@Configuration`に設定されたクラスを一つ一つ登録するのではなく、一度に登録することです。`@Primary`の場合は、該当スキャンで最も先に登録されることを示します。

以下のブログでは非常に詳しく説明されています。

Component Scan: https://velog.io/@hyun-jii/%EC%8A%A4%ED%94%84%EB%A7%81-component-scan-%EA%B0%9C%EB%85%90-%EB%B0%8F-%EB%8F%99%EC%9E%91-%EA%B3%BC%EC%A0%95

## 結びに
- 今日はこのようにSpring Beanに関するものを学びました。皆さんのコーディング勉強が楽しいものになればと思います。