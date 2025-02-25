---
title: Autowired アノテーションについて知ろう
type: blog
date: 2022-02-24
comments: true
translated: true
---
前回は `Spring` の `DI` について学びましたね？

["依存性注入" の記事を見に行く](/blog/spring/di)

今日は `DI` と深く関係するアノテーション `@Autowired` について見てみましょう。

まず、どのメソッドやアノテーションでも名前には非常に重要な意味があります。

Autowired? どんな感じですか？「自動的に接続された」みたいな感じですよね？

何だか分からないけれど、見てみましょう。

## `@Autowired?`

自動で接続されているという意味を持つこのアノテーションは、`Spring`において依存性を注入する役割を担っています。概念的に学んだ依存性注入を実際に実現しているものと言ってもいいでしょう。

![image](https://user-images.githubusercontent.com/59782504/155427654-874ed5fc-d108-4420-9eec-43f5b546565e.png)

上の注釈を通じて定義を確認してみましょう。

> `コンストラクタ`、`フィールド`、`Setter`メソッド、または `Config`メソッドを `Spring` の依存性注入機能によって自動で使用できるように表すアノテーションです、と記されています。

前回依存性注入についての定義を説明しましたので、`@Autowired` の役割について簡単に説明します。

前回は依存性を注入するためには `Student` オブジェクトを利用するクラスが別途必要と説明しました。

しかし、該当オブジェクトを最終的に自分で作成して使用するならば、注入の過程でまた別の依存性が発生するかもしれませんよね？

そのような問題を解決するために、`@Autowired` はもう `new` というキーワードが必要ないようにします。

```java
class StudentService{
  @Autowired
  private StudentRepository studentRepository;
  
  // 名前で学生を探すメソッド
  public Student findByStdName(string name){
    return studentRepository.findByName(name);
  }
}
```

ここでおかしなもの (`repository` や `findByName()` など) が多く出てきましたが、ここでは二つだけを見ればいいです。

1. `studentRepository` というメンバ変数が存在する。
2. 該当メンバ変数を初期化せず (`new` などのキーワードを使用せず) メンバ関数を呼び出している。

この二つです。

本来であれば、初期化せずにメンバ関数である `findByName()` を呼び出した瞬間に `NullPointer` エラーを出力するはずですが、

`@Autowired` は該当クラスの適切なコンストラクタを見つけて `student = new StudentRepository()` をしてくれる役割を果たします。

したがって、エラーは発生しません。

### コンストラクタでの `@Autowired`

今度はAutowiredが付けられている部分がメンバ変数でしたよね？コンストラクタも `@Autowired` することができますが、一体どこで依存性を注入受けるのでしょうか？
```java
@Service
class StudentService{

  private StudentRepository studentRepository;
  
  @Autowired
  public StudentService(StudentRepository studentRepository){
    this.studentRepository = studentRepository;
  }
}
```

それがまさにパラメータの部分です。

コンストラクタはどんなオブジェクトでも初期化時に呼び出されます。しかし、作成するたびに `new StudentService(new StudentRepository())` のようなコードになると見苦しいでしょう？

`StudentService` もサービスであり、サービスも `@Bean` アノテーションを持っているため、他のクラスで依存性を注入が行われるのであれば、別にコンストラクタに記述することはできません…（涙）。

この部分で上の `@Autowired` アノテーションは `new StudentService()` だけを呼び出すことで `new StudentService(new StudentRepository())` と同じ効果を得ることを可能にします。

ただしここで注意しなければならないのは、コンストラクタのオーバーロードにより複数のコンストラクタに定義した場合、**`@Autowired` が付くコンストラクタは一つのみということ！**覚えておいてください。

#### TIP: コンストラクタの `@Autowired` 省略
コンストラクタが一つの場合、どうせ生成しながら依存性を注入する必要があるため省略が可能です。

### メソッドでの `@Autowired`

コンストラクタもメソッドだから用法は同じかな？と考えた方は半分合っていて、半分違います。

パラメータに適用されるのは似ていますが、さっき言いましたね？どんなオブジェクトでも初期化時にコンストラクタが呼び出されると、

しかしメソッドは違います。呼び出すのは開発者の自由です。必須ではないからです。

メソッドに付けられる `@Autowired` を通じて呼び出すたびに依存性が付与される場合を想定したいのであれば、

「該当メソッドは必須のメソッドではないけれど、**自動で注入してほしい**」と

属性 (`required=false`) を通じて示す必要があります。
> 下のように

```java
@Service
class StudentService{

  private StudentRepository studentRepository;
  
  // 必須ではないメソッドだが依存性は注入されたい場合
  @Autowired(required = false)
  public setStudentRepository(StudentRepository studentRepository){
    this.studentRepository = studentRepository;
  }
}
```

## 終わりに
- 今日は依存性の自動注入のための `@Autowired` アノテーションの様々な用法について学びました。また次回お会いしましょう！
- 誤りがあれば、ぜひフィードバックをお願いします！！