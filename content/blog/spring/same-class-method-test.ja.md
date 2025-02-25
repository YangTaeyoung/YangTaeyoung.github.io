---
title: (JAVA) Springで同じサービス内のメソッドをモック化する
type: blog
date: 2024-05-30
comments: true
translated: true
---

一般的にSpringはレイヤードアーキテクチャを採用しており、サービスで主にビジネスロジックを処理します。

サービスのコードが増えれば増えるほど、似たコードが多くなることが一般的です。このような場合、共通ロジックを処理する別のレイヤーを設けて分離するケースもありますが、通常はサービス内に共通メソッドを宣言して処理することが多いでしょう。

例えば、次のようにします。
```java
@Service
public class SomeService {
    public void methodA() {
        // do something
    }

    public void methodB() {
        methodA();
        // do something
    }
    
    public void methodC() {
        methodA();
        // do something
    }
}
```

上記のコードでは、`methodA`は`methodB`、`methodC`で共通に使用されるメソッドです。

もし`methodB()`のテストコードを書く必要がある場合、`methodA()`に対するテストコードも書かなければならないでしょう。最悪の場合、**「共通」** ロジックであるため、`methodC()`をテストする際にも`methodA()`のロジックを一緒にテストしなければならないことが発生するかもしれません。

重複を減らそうと思ったのに、かえってテストコードで重複が増える状況が発生する可能性があります。

## モック化

もし他のクラスのオブジェクト内のメソッドを使用する場合、モック化という方法でメソッドの模擬動作を指定し、テストコードを書きます。（モック化されたメソッドは既にテストされたと仮定するため、そのメソッド内でのテストは不要であるからです。）

しかし、モック化も万能ではなく、同一クラスでの場合、話が少し異なります。

一般的にJavaはモック化のためにプロキシオブジェクトを生成し、そのプロキシオブジェクトをあたかも実際のオブジェクトのように使用しますが、同一クラスを模擬オブジェクトおよび実際のオブジェクトとして使用することは困難です。

一般的にJavaを除く他の言語では同一クラス内のメソッドをテストすることは前述のように重複が発生する可能性があります。

Pythonのような場合、この状況でモンキーパッチを利用し同一クラス内のメソッド自体のポインタを変更してテストを行ったり、

以前Goで開発していた時には、そのような共通のメソッドポインタを別途宣言し、テストの時点でそのメソッドポインタをテスト時に注入するか、前述のように共通のロジックを処理するレイヤーを別に分離してテストする方法を使いました。（このようにインターフェイスが異なるとモック化はどの言語でも難しくありません。）

Javaではこのような場合、`@Spy`を使用して同じクラス内のメソッドをモック化できます。

## `@Spy`
![image](/images/spring/same-class-method-test-1717083827711.png)

まず、アノテーションについて知る前にSpyオブジェクトについて知りましょう。

スパイの意味を考えてみても良いのですが、映画でスパイを考えたらどうでしょうか？

実際は味方であるかのように振る舞いながら、特定の状況では別の行動を取ることを考えると理解が簡単でしょう。

**Spyオブジェクトはこのようにある程度のケースでは実際のオブジェクトのメソッドを呼び出し、あるケースでは特定のメソッドの動作を変更できるオブジェクト**です。

`@Spy`はこのようなSpyオブジェクトを生成するアノテーションです。

では、上のコードを`@Spy`アノテーションを利用してテストしてみましょう。

モック依存性が別途ある場合、通常モック化するオブジェクトに`@Mock`アノテーションを、依存性を受けるオブジェクト（テスト対象メソッドが存在するオブジェクト）に`@InjectMocks`アノテーションを使用します。

注意すべき点はこのように`@Spy`アノテーションを共に活用する場合、`@Spy`アノテーションが`@InjectMocks`アノテーションより先に宣言されるべきということです。

```java
@Service
public class SomeService {
    @Mock
    SomeDependency someDependency;
    
    @Spy
    @InjectMocks
    SomeService someService;
}
```

では`methodA()`をテストするコードを書いてみましょう。
```java
    @Test
    void testMethodA() {
        // given
        doNothing().when(someService).methodA();
        
        // when
        someService.methodA();
        
        // then
        verify(someService, times(1)).methodA();
    }
```

このように`@Spy`アノテーションを活用すれば、同じクラス内のメソッドでもモック化することができます。


## 共通ロジックレイヤー分離時のテストコード

ただし、このように同じクラス内のメソッドをモック化することはテストコードの可読性を低下させる可能性があるため、個人的な考えとしてはこのような場合には共通ロジックを処理する別のレイヤーを設けるのが良いと思います。

例えば、`methodA()`を別のクラス（ここでは`SomeServiceSupport`と命名）に分離して処理し、`SomeService`ではそのクラスを注入する方法があります。

```java{filename=SomeServiceSupport.java}
@Component
public class SomeServiceSupport {
    public void methodA() {
        // do something
    }
}
```

```java{filename=SomeService.java}
@Service
@RequiredArgsConstructor
public class SomeService {

    private final SomeServiceSupport someServiceSupport;
    
    public void methodB() {
        someServiceSupport.methodA();
        
        // do something
    }
    
    public void methodC() {
        someServiceSupport.methodA();
        
        // do something
    }
}
```

このように分離すれば、同じクラス内のメソッドをモック化する必要がなくなるため、`@Spy`アノテーションを通じたテスト、メソッド間の複雑な相関関係を減らすことができるでしょう。


```java
    @SpringBootTest
    class SomeServiceTest {
        
            @Mock
            SomeServiceSupport someServiceSupport;
            
            @InjectMocks
            SomeService someService;
            
            @Test
            void testMethodB() {
                // given
                doNothing().when(someServiceSupport).methodA();
                
                // when
                someService.methodB();
                
                // then
                verify(someServiceSupport, times(1)).methodA();
            }
            
            @Test
            void testMethodC() {
                // given
                doNothing().when(someServiceSupport).methodA();
                
                // when
                someService.methodC();
                
                // then
                verify(someServiceSupport, times(1)).methodA();
            }
    }
```

このコードでは実際のところ、テストコード自体はあまり変わりませんでした。しかし、階層間の分離によって、他の開発者がこのレイヤーが共通ロジックを処理するレイヤーであることが分かるため、メンテナンスにおいては多少の利点があるように思います。