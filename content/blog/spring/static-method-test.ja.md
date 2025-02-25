---
title: (JAVA) Springでサービス内でstaticメソッドをMockingする方法
type: blog
date: 2024-06-15
comments: true
translated: true
---

一般的に、Springはレイヤードアーキテクチャを採用しており、サービス層で主にビジネスロジックを処理することになります。

この時、`static`メソッドを使用することがありますが、一般的なコンポーネントの場合、ランタイム時に動的にバインディングされるため、Mocking時にそのインターフェースを実装したオブジェクトをMockingオブジェクトで置き換えてテストを進めることができます。
しかし、`static`メソッドの場合は、コンパイル時にメソッドが静的にバインディングされるため、Mockingが難しくなります。

では、どうすれば良いでしょうか？

## 1. ラッパークラス

伝統的な方法としては、Staticメソッドをコンポーネント化することができます。

staticメソッドを通常のメソッド内で利用して、一度ラッパークラスで囲むことです。

### 例
例えば次のようなコードがあると仮定してみましょう。

```java
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final EventNumberPicker eventNumberPicker;

    public List<ProductDto> listProducts() {
        return productRepository
            .findAll()
            .stream()
            .map(product -> new ProductDto(product, eventNumberPicker.pick(1, 1000)))
            .toList();
    }
}
```

Productエンティティは次のように構成されます。
```java
/**
 * 商品DTO 商品情報を伝達するためのDTO
 */
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@EqualsAndHashCode
@ToString
public class ProductDto {

    /**
     * 商品ID
     */
    private Long id;

    /**
     * 商品名
     */
    private String name;

    /**
     * 商品説明
     */
    private String description;

    /**
     * 商品価格
     */
    private double price;

    /**
     * 抽選番号
     */
    private int eventNumber;

    public ProductDto(Product product, int eventNumber) {
        this.id = product.getId();
        this.name = product.getName();
        this.description = product.getDescription();
        this.eventNumber = eventNumber;
        this.price = product.getPrice();
    }
}
```

コンストラクタでは抽選番号である`eventNumber`を引数として受け取り、商品エンティティにeventNumberを設定しますが、この時に`eventNumberPicker.pick(1, 1000)`メソッドを使用しています。

この時、`EventNumberPicker`はMathクラスをラッピングしたクラスで次のように構成されています。

```java
package com.example.demo.product.util;

@Component
public class EventNumberPicker {
    private EventNumberPicker() {
    }

    public int pick(int from, int to) {
        return from + (int) (Math.random() * ((to - from) + 1));
    }
}
```

このように構成すると、Mathクラスのrandomメソッドを使用しているとはいえ、ビジネスロジックで使用するのは`EventNumberPicker`クラスなので、テストコードで`EventNumberPicker`をMockingしてテストを進めることができます。

### 短所

しかし、この方法は`static`メソッドを使用するすべてのクラスにラッパークラスを作らなければならないため、手間がかかります。

事実上、単に`LocalDateTime.now()`を使用する場合でもラッパークラスを作らなければならないということになります。

Pythonの場合はMonkey Patchingを通じて`static`メソッドのMockingを解決する場合があり、Golangの場合はarmアーキテクチャでMonkey Patchingがうまくいかない問題があったため、上記のようにラッパークラスを作成して使用することがもう少し一般的でした。
~~(ただし、これは筆者の経験に基づくもので、異なる場合もあるかもしれません。筆者がGolangを使用していた際には、どのMockingライブラリもstaticメソッドのMockingをサポートしていませんでした。)~~

## 2. Mockito

MockitoはJavaで最も使用されているMockingライブラリの一つです。

以前はできなかったものの、バージョン`3.4.0`から`static`メソッドのMockingをサポートしています。

### 例
例では、まず先の`EventNumberPicker`クラスの`pick`メソッドが`static`であるとして進めます。
```java
package com.example.demo.product.util;

import java.util.Random;

public class EventNumberPicker {

    private static final Random rand = new Random();

    private EventNumberPicker() {
        throw new IllegalStateException("Utility class");
    }

    public static int pick(int from, int to) {

        rand.setSeed(System.currentTimeMillis());

        return rand.nextInt(to - from + 1) + from;
    }
}
```

そして、使用する`ProductService`クラスでも同様に`EventNumberPicker`を注入せずに、`pick`メソッドを使用します。

```java
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<ProductDto> listProducts() {
        return productRepository
            .findAll()
            .stream()
            .map(product -> new ProductDto(product, EventNumberPicker.pick(1, 1000)))
            .toList();
    }
}
```

### テストコードの作成
まずgradleにMockitoの依存関係を追加します。

```gradle
    // https://mvnrepository.com/artifact/org.mockito/mockito-core
    testImplementation 'org.mockito:mockito-core:5.12.0'
```

その後、テストコードを次のように作成することができます。
```
package com.example.demo.product.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mockStatic;
import com.example.demo.product.domain.dto.ProductDto;
import com.example.demo.product.domain.model.Product;
import com.example.demo.product.repository.ProductRepository;
import com.example.demo.product.util.EventNumberPicker;
import java.util.List;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {


    @Mock
    ProductRepository productRepository;

    @InjectMocks
    ProductService productService;

    @Nested
    class ListProducts {


        @Test
        void 成功() {
            // given
            var products = List.of(
                Product.builder()
                    .id(1L)
                    .name("test_name_1")
                    .description("test_description_1")
                    .build(),
                Product.builder()
                    .id(2L)
                    .name("test_name_2")
                    .description("test_description_2")
                    .build()
            );
            given(
                productRepository.findAll()
            ).willReturn(products);

            var eventNumberPicker = mockStatic(EventNumberPicker.class);

            eventNumberPicker.when(() -> EventNumberPicker.pick(1, 1000))
                .thenReturn(1);

            // when
            var result = productService.listProducts();

            // then
            assertThat(result).isEqualTo(List.of(
                    ProductDto.builder()
                        .id(1L)
                        .name("test_name_1")
                        .description("test_description_1")
                        .eventNumber(1)
                        .build(),
                    ProductDto.builder()
                        .id(2L)
                        .name("test_name_2")
                        .description("test_description_2")
                        .eventNumber(1)
                        .build()
                )
            );

            eventNumberPicker.close();
        }
    }
}
```

まず、他のテストコードと同様にメンバー変数としてMockインスタンスを注入し、`@InjectMocks`アノテーションを使用してテスト対象クラスのインスタンスを注入します。
`MockStatic`も同様に設定できますが、頻繁に行うことではないため、テストコード内でのみ活用しました。

まず`EventNumberPicker`の`MockStatic`インスタンスを生成します。
```java
eventNumberPicker = mockStatic(EventNumberPicker.class);
```

その後、`when`メソッドを使用して`pick`メソッドが呼び出される際に返す値を設定します。
```java
eventNumberPicker.when(() -> EventNumberPicker.pick(1, 1000))
                .thenReturn(1);
```

これにより、`EventNumberPicker.pick(1, 1000)`メソッドが呼び出される際に1を返すようになります。

2回目の呼び出しや3回目の呼び出しに異なる値を返すようにしたい場合は、`thenReturn()`のパラメータにそれぞれ異なる値を入れれば良いでしょう。
```java
eventNumberPicker.when(() -> EventNumberPicker.pick(1, 1000))
                .thenReturn(1,2)
```

最後にテストが終了したら`close`メソッドを呼び出して`MockStatic`インスタンスを閉じます。
```java
eventNumberPicker.close();
```

このようにすれば`static`メソッドでもMockingでき、テストコードを作成することができます。

![image](/images/spring/static-method-test-1718443380015.png)

### `void`メソッドの場合は？
もし、`void`メソッドの場合にファイルに書き込んだり、外部APIを呼び出している場合、実際の動作をさせず何も行わないように設定する必要があるかもしれません。

この場合、単に`MockStatic`インスタンスを作成するだけで実際の動作を行いません。

```java
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<ProductDto> listProducts() {
        EventNumberPicker.doSomething();

        return productRepository
            .findAll()
            .stream()
            .map(product -> new ProductDto(product, EventNumberPicker.pick(1, 1000)))
            .toList();
    }
}
```

```java
public class EventNumberPicker {

    private static final Random rand = new Random();

    private EventNumberPicker() {
        throw new IllegalStateException("Utility class");
    }

    public static int pick(int from, int to) {

        rand.setSeed(System.currentTimeMillis());

        return rand.nextInt(to - from + 1) + from;
    }

    public static void doSomething() {
        System.out.println("doSomething");
    }
}
```

テストコードでは、以前と同様に`doSomething()`メソッドを特に`when()`を通じて指定しなくても、実際のテスト時には"doSomething"が出力されることはありません。

![image](/images/spring/static-method-test-1718443206484.png)
> `doSomething`が出力されないことを確認できます。

#### パラメータ値まで検証する
これ以外にも、一般的に知られている`verify()`メソッドを使用すると、呼び出しの有無だけでなくパラメータ値まで検証することができます。
```java{filename=EventNumberPicker.java}
public static void doSomething(int from, int to) {
    System.out.println("doSomething" + from + to);
}
```
まず上記のようにパラメータを受け取るようにメソッドを修正し、テストコードでは以下のように記述します。

```
// ...
eventNumberPicker.verify(
() -> EventNumberPicker.doSomething(1, 900));
```

一般的な`verify()`メソッドと違う点は、`Mockito.verify()`がMockitoのstaticメソッドであるのに対し、このメソッドは`mockStatic()`メソッドを通じて生成した`MockStatic`インスタンスで使用する必要がある点です。

![image](/images/spring/static-method-test-1718522103669.png)
> パラメータが期待値と異なる場合にエラーが発生する様子を確認できます。

### 特定のメソッドをMockingし、他のメソッドは実際のメソッドを使用したい場合？
この場合、`when()`を利用してMockingし、`thenCallRealMethod()`を使用すれば良いでしょう。

```java
eventNumberPicker.when(() -> EventNumberPicker.doSomething())
                .thenCallRealMethod();
```

![image](/images/spring/static-method-test-1718443440348.png)
> `doSomething`が出力されることを確認できます。