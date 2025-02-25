---
title: 依存性注入 (Dependency Injection, DI)について学ぼう
type: blog
date: 2022-02-24
comments: true
translated: true
---
この投稿では、Spring Frameworkの重要な概念の一つである依存性注入（Dependency Injection: DI）について取り扱います。

DIはSpringの非常に重要な概念の一つで、会社の面接でもよく出てくるので、必ず知っておくと良いです。

まず依存性について学びましょう。

## 依存性

AオブジェクトがBオブジェクトに依存しているということは、包含関係と非常に密接な関係があります。

一度コードで見てみましょう。

```java{filename=Korean.java}
class Korean {
    int score; // 科目の点数
    string content; // 科目の内容
}
```

```java{filename=Student.java}
class Student {
    private Korean korean;
    public Student() {
        korean = new Korean();
    }
}
```

上記のように`Student`クラスの場合、国語の点数`score`と科目の内容`content`を持つ`Korean`クラスを含んでいます。
包含関係と呼ぶこともできますが、

**"`Student`が`Korean`を依存している。"**とも表現します。

では、これでどんな問題が起こるでしょうか？

もし`Student`から`Korean`が消え、`Math`を追加しなければならない場合はどうでしょう？

残念ながら、開発者はメンバー変数を削除し、新しいメンバー変数を追加する必要があります。すぐ下のように。

```java{filename=Math.java}
class Korean {
    int score; // 科目の点数
    string content; // 科目の内容
}
```

```java{filename=Student.java}
class Math {
    int score;
    string content;
}
```

```java{filename=Student.java}
class Student {
    // private Korean korean;
    private Math math;
    public Student() {
        // korean = new Korean();
        math = new Math();
    }
}
```

### とても不便ではないでしょうか？
これでは問題があるように思います。毎回メンバー変数やコンストラクタの中でコメントを解除したり、書き換えたり、追加したりすることで時間を浪費してしまいます。

### インターフェースで抽象化
もう少し便利にするために、こういった作業をせずに科目ごとにまとめてインターフェースを作るのも良いと思います。
まさにこのように。

```java{filename=Subject.java}
public interface Subject {
}
```

```java{filename=Korean.java}
class Korean implements Subject {
    int score; // 科目の点数
    string content; // 科目の内容
}
```

```java{filename=Math.java}
class Math implements Subject {
    int score;
    string content;
}
```

```java{filename=Student.java} 
class Student {
    private Subject subject;
    public Student(){
        subject = new Korean();
        // subject = new Math()
    }
}
```

メンバー変数を一つだけ宣言すれば良いので少し便利になりました。
しかし、依然として`Student`クラスのコンストラクタでは`Subject`インターフェースを実装しているクラスを選択しなければなりません。
かなり便利にはなりましたが、まだ不便というわけです。



## 依存性注入 (Dependency Injection)

上記の問題を解決するための方法は何があるでしょうか？
コンストラクタ部分をコメント化しても良いでしょうが、そうすると後で保守しなければならない時に、開発者が処理しなければならない問題が大きすぎます。修正すべきことが一つや二つではないでしょうから。

それを修正するために出てきたのが依存性注入です。オブジェクトを外部から注入する方法です。

```java{filename=Student.java}
// Student.java
class Student{
    private Subject subject;
    
    public Student(Subject subject){
        subject = subject;
    }
}
```

```java
class SomeClass {
    // 依存性注入
    Student student = new Student(new Korean());
}
```

どうでしょうか？本当に単純な実装ですが、コードがはるかに簡潔になります。インターフェースだけを持ち込んで、実際の`Korean`というオブジェクトを注入する部分は別にあります。

## まとめ
このように依存性注入はインターフェース変数を通じてメンバー変数を宣言し、使用時に外部からインターフェースを実装したオブジェクトを注入して使用する方法です。

## 締めくくり
今回の投稿では依存性注入について学びました。次回は依存性注入を実際にSpringでどのように実装しているのかを見ていきましょう。