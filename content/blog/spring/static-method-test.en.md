---
title: (JAVA) Mocking Static Methods in Spring Services
type: blog
date: 2024-06-15
comments: true
translated: true
---

Spring generally follows a Layered Architecture, with services primarily handling business logic.

Often, `static` methods are used, but in the case of regular components, dynamic runtime binding facilitates replacing the object implementing the interface with a mock object during testing. For `static` methods, binding occurs at compile time, making them challenging to mock.

So, what can be done?

## 1. Wrapper Class

Traditionally, you can componentize static methods.

By utilizing static methods within a regular method, you can encapsulate them in a Wrapper class.

### Example 
Consider the following code as an example:

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

The Product Entity is structured as follows:
```java
/**
 * Product DTO for transferring product information
 */
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@EqualsAndHashCode
@ToString
public class ProductDto {

    /**
     * Product ID
     */
    private Long id;

    /**
     * Product Name
     */
    private String name;

    /**
     * Product Description
     */
    private String description;

    /**
     * Product Price
     */
    private double price;

    /**
     * Event Number
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

In its constructor, the event number `eventNumber` is received as a parameter and set in the product entity using the `eventNumberPicker.pick(1, 1000)` method.

The `EventNumberPicker` class, which wraps the Math class, is structured as follows:

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

By structuring it this way, even though the `random` method of the Math class is used, since the `EventNumberPicker` class is utilized in the business logic, testing can proceed by mocking the `EventNumberPicker` in the test code.

### Drawbacks

This method requires creating a Wrapper class for every class using a `static` method, which can be cumbersome.

In practice, even for simple cases like using `LocalDateTime.now()`, a Wrapper class must be created.

In Python, Monkey Patching is often used to mock `static` methods, while in Golang, due to issues with arm architecture, creating and using a Wrapper class as demonstrated above is more common.
~~(Side note: I might be wrong. However, in my case with Golang, no mocking libraries supported mocking static methods.)~~

## 2. Mockito

Mockito is one of the most widely used mocking libraries in Java.

While it wasn't possible before, from version `3.4.0`, it supports mocking `static` methods.

### Example
First, assume that the `pick` method in the `EventNumberPicker` class from the previous example is `static`.
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

In the `ProductService` class using it, `EventNumberPicker` isn’t injected; the `pick` method is simply used.

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

### Writing Test Code
First, add Mockito dependency in `gradle`.

```gradle
    // https://mvnrepository.com/artifact/org.mockito/mockito-core
    testImplementation 'org.mockito:mockito-core:5.12.0'
```

Subsequently, the test code can be written as follows.
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
        void success() {
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

First, like any other test, inject mock instances as member variables and obtain the instance of the test target class through the `@InjectMocks` annotation.
While `MockStatic` can also be set that way, it's exclusively utilized within the test code to avoid confusion, as it doesn’t occur frequently.

Start by creating a `MockStatic` instance for `EventNumberPicker`. 
```java
eventNumberPicker = mockStatic(EventNumberPicker.class);
```

Then specify the return value when the `pick` method is invoked using the `when` method.
```java
eventNumberPicker.when(() -> EventNumberPicker.pick(1, 1000))
                .thenReturn(1);
```

Doing this ensures that `EventNumberPicker.pick(1, 1000)` returns 1 when called.

To return different values on subsequent calls, pass different parameters into `thenReturn()`.
```java
eventNumberPicker.when(() -> EventNumberPicker.pick(1, 1000))
                .thenReturn(1,2)
```

Finally, invoke the `close` method to close the `MockStatic` instance after the test concludes.
```java
eventNumberPicker.close();
```

By doing so, even `static` methods can be mocked, allowing for testable code.

![image](/images/spring/static-method-test-1718443380015.png)

### What if it's `void`?
If a `void` method writes to a file or calls an external API, you might need to ensure it doesn't perform any actions.

Simply creating a `MockStatic` instance prevents the actual action from occurring.

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

Without explicitly needing `when()` designation for the `doSomething()` method, "doSomething" does not print during actual testing.

![image](/images/spring/static-method-test-1718443206484.png)
> You can confirm that `doSomething` does not print.

#### Validating Parameter Values
Furthermore, by using the well-known `verify()` method, you can verify not only whether it was called, but also the parameter values.
```java{filename=EventNumberPicker.java} 
public static void doSomething(int from, int to) {
    System.out.println("doSomething" + from + to);
}
```
First, revise the method to accept parameters, then write the test code as below.

```
// ...
eventNumberPicker.verify(
() -> EventNumberPicker.doSomething(1, 900));
```

The difference from the general `Mockito.verify()` is that although it is a static method of Mockito, this method must be used with the `MockStatic` instance created via `mockStatic()`.

![image](/images/spring/static-method-test-1718522103669.png)
> You can see an error arises when parameters do not match expectations.

### What if you want to mock specific methods and use real methods for others?
In this case, utilize `when()` for mocking, but use `thenCallRealMethod()` for invoking the actual method.

```java
eventNumberPicker.when(() -> EventNumberPicker.doSomething())
                .thenCallRealMethod();
```

![image](/images/spring/static-method-test-1718443440348.png)
> You can see `doSomething` is outputted.