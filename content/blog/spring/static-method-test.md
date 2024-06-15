---
title: (JAVA) Spring 에서 서비스 내에서 static 메소드 Mocking 하기
type: blog
date: 2024-06-15
comments: true
---

일반적으로 Spring은 Layered Architecture 를 따르고 있으며, 서비스에서 주로 비즈니스 로직을 처리하게 된다.

이 때 종종 `static` 메소드를 사용하는 경우가 있는데, 일반적인 컴포넌트의 경우 런타임 시점에 동적으로 바인딩되기 때문에 Mocking 시점에 해당 인터페이스를 구현한 객체를 Mocking 객체로 대체하여 테스트를 진행할 수 있다.
`static` 메서드의 경우, 컴파일 시점에 메서드가 정적으로 바인딩되기 때문에 Mocking 이 어렵다.

그럼 어떻게 해야할까?

## 1. Wrapper 클래스

전통적인 방식으로는 Static 메서드를 컴포넌트화 할 수 있다.

static 메서드를 일반 메서드 내에서 활용해서 한번 Wrapper 클래스로 감싸는 것이다.

### 예시 
예를 들어 다음과 같은 코드가 있다고 가정해보자.

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

Product Entity는 다음과 같이 구성된다.
```java
/**
 * 상품 DTO 상품 정보를 전달하기 위한 DTO
 */
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@EqualsAndHashCode
@ToString
public class ProductDto {

    /**
     * 상품 ID
     */
    private Long id;

    /**
     * 상품 이름
     */
    private String name;

    /**
     * 상품 설명
     */
    private String description;

    /**
     * 상품 가격
     */
    private double price;

    /**
     * 추첨 번호
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

생성자에서는 추첨번호인 `eventNumber`를 인자로 받아 상품 엔티티에 eventNumber를 설정해주는데, 이 때 `eventNumberPicker.pick(1, 1000)` 메서드를 사용하고 있다.

이 때 `EventNumberPicker`는 Math 클래스를 Wrapping 한 클래스로 다음과 같이 구성되어 있다.

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

이렇게 구성하면 Math 클래스의 random 메서드를 사용한다 하더라도 비즈니스 로직에서 사용하는 것은 `EventNumberPicker` 클래스이기 때문에 테스트 코드에서 `EventNumberPicker`를 Mocking 하여 테스트를 진행할 수 있다.

### 단점

하지만 이 방법은 `static` 메서드를 사용하는 모든 클래스에 Wrapper 클래스를 만들어야 하기 때문에 번거롭다.

사실상 단순히 `LocalDateTime.now()`를 사용하는 경우에도 Wrapper 클래스를 만들어야 하기 때문이다.

Python 의 경우 Monkey Patching 을 통해 `static` 메서드의 Mocking 을 해결하는 경우가 있었고, Golang 의 경우는 arm 아키텍처에서 Monkey Patching 이 잘 안되는 이슈가 있어서, 위의 경우처럼 Wrapper 클래스를 만들어서 사용하는 경우가 좀 더 흔했다.
~~(사담: 물론 틀렸을 수도 있다. 다만 내가 Golang 을 활용해서 일할 때는 어떤 Mocking 라이브러리도 static 메서드를 Mocking 하는 것을 지원하지 않았다.)~~

## 2. Mockito

Mockito 는 Java 에서 가장 많이 사용되는 Mocking 라이브러리 중 하나이다.

이전에는 되지 않았지만 버전 `3.4.0` 부터 `static` 메서드 Mocking 을 지원한다.

### 예시
예시에서는 먼저 앞선 `EventNumberPicker`클래스의 `pick` 메서드가 `static` 인 것으로 가정하고 진행한다.
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

그리고 사용하는 `ProductService` 클래스에서도 역시 `EventNumberPicker`를 주입받지 않고, `pick` 메서드를 사용한다.

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

### 테스트 코드 작성
먼저 gradle 에 Mockito 의존성을 추가한다.

```gradle
    // https://mvnrepository.com/artifact/org.mockito/mockito-core
    testImplementation 'org.mockito:mockito-core:5.12.0'
```

이후 테스트 코드를 다음과 같이 작성할 수 있다.
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
        void 성공() {
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

먼저 다른 테스트 코드는 동일하게 멤버변수로 Mock 인스턴스를 주입받고, `@InjectMocks` 어노테이션을 통해 테스트 대상 클래스의 인스턴스를 주입받는다.
`MockStatic` 역시 그런식으로 설정할 수는 있으나, 필자의 생각에는 자주 일어나는 일이 아니라서 혼동을 줄 수 있으므로, 테스트 코드 내에서만 활용하였다.

먼저 `EventNumberPicker`의 `MockStatic` 인스턴스를 생성한다. 
```java
eventNumberPicker = mockStatic(EventNumberPicker.class);
```


그리고 `when` 메서드를 통해 `pick` 메서드가 호출될 때 반환할 값을 지정한다.
```java
eventNumberPicker.when(() -> EventNumberPicker.pick(1, 1000))
                .thenReturn(1);
```

이렇게 하면 `EventNumberPicker.pick(1, 1000)` 메서드가 호출될 때 1을 반환하게 된다.

두 번째 호출, 세 번째 호출도 각각 다른 값을 반환하게 하고 싶다면 `thenReturn()` 의 파라미터로 각각 다른 값을 넣어주면 된다.
```java
eventNumberPicker.when(() -> EventNumberPicker.pick(1, 1000))
                .thenReturn(1,2)
```

마지막으로 테스트가 끝나면 `close` 메서드를 호출하여 `MockStatic` 인스턴스를 닫아준다.
```java
eventNumberPicker.close();
```

이렇게 하면 `static` 메서드라도 Mocking 할 수 있으며, 테스트 코드를 작성할 수 있다.

![image](/images/spring/static-method-test-1718443380015.png)

### `void`의 경우는?
만약 `void`의 경우에 파일에 쓴다거나, 외부 API를 호출하는 경우가 있으면 해당 행동을 하지 않고 아무것도 하지 않도록 설정이 필요할 수 있다.

이 경우 단순히 `MockStatic` 인스턴스를 만들어 주는 과정 만으로도 실제 행동을 하지 않게 된다.

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

테스트 코드는 이전과 같이 `doSomething()` 메서드를 굳이 `when()`을 통해 지정하지 않아도 실제 테스트 시에는 "doSomething" 이 출력되지 않는다.

![image](/images/spring/static-method-test-1718443206484.png)
> `doSomething` 이 출력되지 않는 것을 확인할 수 있다.

### 특정 메서드를 Mocking을, 다른 메서드는 실제 메서드를 사용하고 싶다면?
이 경우 `when()`을 이용해 Mocking 하되, `thenCallRealMethod()`를 사용하면 된다.

```java
eventNumberPicker.when(() -> EventNumberPicker.doSomething())
                .thenCallRealMethod();
```

![image](/images/spring/static-method-test-1718443440348.png)
> `doSomething` 이 출력되는 것을 확인할 수 있다.