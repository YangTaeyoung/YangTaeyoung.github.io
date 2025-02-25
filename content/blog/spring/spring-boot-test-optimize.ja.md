---
title: アノテーション @SpringBootTestを最適化しよう (feat. @DataJpaTest, @WebMvcTest)
type: blog
date: 2025-01-20
comments: true
translated: true
---

入社初めてテスト時間が非常に長くて悩んだ。（約28分程度）

余談だが、チームのメンバーたちは普段これくらいの時間がかかっていたので、テスト時間が長いとは感じていなかったが、前の会社では2〜3分程度の時間しかかからなかったので、これだけの時間がかかるのは非常に我慢が難しかった 🤣

![image](/images/spring/spring-boot-test-optimize-1737350813436.png)

当時はTestcontainersのようなコンテナを起動するツールは使用せず、すべてMockitoベースのユニットテストだけだったが、なぜこんなにテスト時間が長くかかるのか理解できなかった。
> Repositoryや統合テストのためにTestcontainersのようなツールを使用する場合、テスト時にコンテナを起動しサービスと接続する時間が追加でかかるため、ある程度時間がかかることがある。

そこで今回はサービスでどのようにテストを最適化できたのか、何が問題だったのかについて原因を把握し、最適化した過程を共有しようと思う。

## 原因把握
### 1. 依存性の問題
まず依存性で疑問に思う部分があった。私が作成したテスト対象は`HomeController`（仮称）だったが、このコントローラの依存性は`HomeService`だけだった。
しかし、`ProductService`（仮称）がないとエラーが出るのではないか。

```
Caused by: org.springframework.beans.factory.NoSuchBeanDefinitionException: No qualifying bean of type 'com.example.demo.service.ProductService' available: expected at least 1 bean which qualifies as autowire candidate. Dependency annotations: {@org.springframework.beans.factory.annotation.Autowired(required=true)}
```

もちろん次のように依存性を追加するだけで問題はない。

```java
@MockBean
private ProductService productService;
```

しかし使用しない依存性を毎回追加するのが非常に面倒だった。特に新しいサービスやリポジトリを追加するたびに毎回追加する必要があるため非常に面倒だった。

### 2. @SpringBootTest
`@SpringBootTest`は統合テストのためのアノテーションだ。このアノテーションを使用すると、実際のサービスを起動しテストを進めることになる。

問題はすべてのBeanを起動するため、テスト時間が長くかかることだ。Springは基本的にテスト時にファイル単位でテストを進めるため、たった一つのテストにすべてのBeanを起動する作業を繰り返すことになる。

私たちが`application-test.yml`などを通じて動作のためのテスト環境を指定したとしても、Beanの使用を制限していないため、これを制限するためには別途設定を指定する必要がある
例えばRepositoryをテストするためにH2をテストDBとして使用してテスト環境を指定しておいた場合どうするのだろう？

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
    username: sa
    password: password
```
> 大体こんな感じだろう。設定自体は重要ではない。

もしこうしてSpringBootTestでControllerをテストしようとするなら
```java
@SpringBootTest
class HomeControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void test() {
        mockMvc.perform(get("/"))
            .andExpect(status().isOk());
    }
}
```

このようにテストを進めると、`@SpringBootTest`によりすべてのBeanが起動されるため、テスト時間が長くかかるに違いない。

一つのテストコードであれば大きな問題にはならないだろう。しかしファイルが増えれば増えるほど、何でもないテストコードにも時間がかかるようになる。

## 3. 統合テストはしていない
`@SpringBootTest`は一般的にすべての環境と似たように構成してAPI Endpointを通してアクセスする統合テストのために使用される。しかし私たちは統合テストをしていなかった。

チームメンバーに聞いてみるとユニットテストを進めているだけで、ユニットテストもその程度であり、Repositoryレイヤーはテストしていなかった。

単純にサービスがQuery Machineのように動作しており、サービステストの意味がないほど非常に簡単にしか使用していなかったので、さらに問題だった。
> これは後にクリーンアーキテクチャに転換した話として別の投稿で後述しようと思う。

## 解決
### `@WebMvcTest`, `@DataJpaTest`
依存性をロードする問題を解決するためには`@WebMvcTest`, `@DataJpaTest`などを利用することができる。

`@WebMvcTest`はアノテーションの名前から予想できるように、MVCテストのためのアノテーションだ。すなわちコントローラテストのためのアノテーションと見ることができる。 
このアノテーションが付いた場合、`@Controller`, `@ControllerAdvice`, `@JsonComponent`, `Converter`, `GenericConverter`, `Filter`, `HandlerMethodArgumentResolver`, `HandlerInterceptor`, `WebMvcConfigurer`, `HandlerMethodReturnValueHandler`などのウェブ関連のBeanのみをロードする。

`@DataJpaTest`はJPAテストのためのアノテーションだ。すなわちリポジトリテストのためのアノテーションと見ることができる。 
このアノテーションが付いた場合、`EntityManager`, `TestEntityManager`, `DataSource`, `JpaTransactionManager`, `JpaRepository`などのJPA関連のBeanのみをロードする。
> 実は当時、TestcontainersやH2を利用したRepositoryテストは導入していなかったため、`@DataJpaTest`は使用しなかった。 

### テストするクラスを限定する
以下のように`@WebMvcTest`を使用すると、`@Controller`をテストすることができるが、すべてのコントローラを読み込むことになる。 
```java
@WebMvcTest
class HomeControllerTest {
    // ...
}
```

コントローラが少なければこのような方法もいいかもしれないが、コントローラが多い場合、やはりテストのために`@WebMvcTest`と指定されたファイルごとにすべてのコントローラを読み込む問題が発生し、 
そのコントローラのすべての依存性問題も解決しなければならない問題が発生する。

これらの問題を解決するためには、ロードするクラスを`@WebMvcTest`にテストするコントローラを指定しておく必要がある。
```java
@WebMvcTest(HomeController.class)
class HomeControllerTest {
    // ...
}
```

### 消えた依存性を埋める
もちろんこのようにテストが動作するなら非常にハッピーなケースだが、`@WebMvcTest`のような場合、基本的にSpring Security関連のBeanはロードされないため、関連設定に使用していたBeanを追加で登録する必要がある。

別に難しいことではなく、一つずつ試しながら追加すれば良い。

筆者の場合、SecurityConfigクラスを追加することでRedis、UserRepositoryなど追加しなければならないBeanがあった。
```java
@WebMvcTest({HomeController.class, SecurityConfig.class})
```

ただし実際に意味を持って動作する必要はなく、単にBeanがあれば良いので、Mockを使用して架空のBeanを登録しておいた
```java{filename=WebMvcTestConfig.java}
@TestConfiguration
public class WebMvcTestConfig {
    @Bean
    public RedisUtils redisUtils() {
        return Mockito.mock(RedisUtils.class);
    }
    
    @Bean
    public UserRepository userRepository() {
        return Mockito.mock(UserRepository.class);
    }
    
}
```

そして該当ファイルが自動でロードされるわけではないので、テストするファイルに`@Import`アノテーションを通じてロードしておいた。 
 
```java
@WebMvcTest({HomeController.class})
@Import(WebMvcTestConfig.class)
```

それ以外に追加でエラーが出るなら次のようなプロセスで追加すれば良い。
- 実際に動作する必要がないなら: `WebMvcTestConfig`に実際のBeanを登録せず、Mockを使用して登録
- 実際に動作が必要なBeanの場合: `@Import`を通して追加で登録

## 結果
実行結果テスト時間が28分から7分に短縮された。約4倍程度の性能向上があった。
> もちろん追加でテストするクラスと`SecurityConfig`を登録しなければならないという欠点はあるが、自分とチームメンバーの時間を30分短縮したというのはどれだけ意味のある進展か！