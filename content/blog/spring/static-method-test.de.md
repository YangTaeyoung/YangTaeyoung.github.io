---
title: (JAVA) Mocking von statischen Methoden innerhalb eines Dienstes in Spring
type: blog
date: 2024-06-15
comments: true
translated: true
---

In der Regel folgt Spring einer Schichten-Architektur, wobei der Service hauptsächlich die Geschäftslogik verarbeitet.

Es gibt jedoch Fälle, in denen man `static`-Methoden verwendet. Da bei gewöhnlichen Komponenten zur Laufzeit dynamisch gebunden wird, kann das entsprechende Interface während des Mocking-Prozesses durch ein Mock-Objekt ersetzt und getestet werden. `static`-Methoden hingegen sind zur Compile-Zeit statisch gebunden, was das Mocking erschwert.

Was kann man also tun?

## 1. Wrapper-Klasse

Traditionell kann man statische Methoden in Komponenten umwandeln.

Indem man die statische Methode innerhalb einer gewöhnlichen Methode nutzt, kann sie einmal in eine Wrapper-Klasse eingebettet werden.

### Beispiel
Angenommen, wir haben den folgenden Code.

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

Die Product-Entity ist folgendermaßen aufgebaut:
```java
/**
 * Product DTO, um Produktinformationen zu übermitteln.
 */
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@EqualsAndHashCode
@ToString
public class ProductDto {

    /**
     * Produkt ID
     */
    private Long id;

    /**
     * Produktname
     */
    private String name;

    /**
     * Produktbeschreibung
     */
    private String description;

    /**
     * Produktpreis
     */
    private double price;

    /**
     * Event-Nummer
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

Im Konstruktor wird die Event-Nummer `eventNumber` als Parameter übergeben, wodurch der Produkt-Entity die Event-Nummer zugewiesen wird. Hierbei nutzen wir die Methode `eventNumberPicker.pick(1, 1000)`.

Der `EventNumberPicker` ist eine Klasse, die die Math-Klasse umhüllt und so aufgebaut ist:

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

Mit dieser Struktur wird, selbst wenn die random-Methode der Math-Klasse verwendet wird, in der Geschäftslogik die `EventNumberPicker`-Klasse verwendet, sodass `EventNumberPicker` im Testcode gemockt werden kann.

### Nachteil

Allerdings ist diese Methode umständlich, da für jede Klasse, die eine `static`-Methode verwendet, eine Wrapper-Klasse erstellt werden muss.

In Python wird manchmal Monkey Patching verwendet, um das Mocking von `static`-Methoden zu umgehen. In Golang hingegen, wo das Monkey Patching auf Arm-Architekturen nicht gut funktioniert, war es häufiger, Wrapper-Klassen zu erstellen, wie oben beschrieben. 
~~(Randnotiz: Das mag nicht korrekt sein. Allerdings wurde bei meinen Arbeiten mit Golang keine einzige Mocking-Bibliothek gefunden, die das Mocking von `static`-Methoden unterstützt hat.)~~

## 2. Mockito

Mockito ist eines der meistgenutzten Mocking-Frameworks in der Java-Welt.

Während es zuvor nicht möglich war, unterstützt es ab Version `3.4.0` das Mocking von `static`-Methoden.

### Beispiel
Angenommen, der `pick`-Methode der vorherigen `EventNumberPicker`-Klasse sei `static` und wir würden sie verwenden:
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

Und auch in der `ProductService`-Klasse wird `EventNumberPicker` nicht injiziert, sondern direkt die `pick`-Methode verwendet.

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

### Schreiben des Testcodes
Fügen Sie zunächst die Mockito-Abhängigkeiten in Gradle hinzu.

```gradle
    // https://mvnrepository.com/artifact/org.mockito/mockito-core
    testImplementation 'org.mockito:mockito-core:5.12.0'
```

Danach kann der Testcode wie folgt geschrieben werden.
```java
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
        void erfolgreich() {
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

Andere Testcodes injizieren wie gewohnt ein Mock-Interface als Mitgliedsvariable, und die Instanz der zu testenden Klasse wird mit der Annotation `@InjectMocks` erstellt. Auch `MockStatic` kann so eingerichtet werden, wurde jedoch ausdrücklich im Testcode verwendet, da es nicht häufig vorkommt und Verwirrung stiften könnte.

Zuerst wird eine `MockStatic`-Instanz des `EventNumberPicker` erstellt.
```java
eventNumberPicker = mockStatic(EventNumberPicker.class);
```

Mit der `when`-Methode wird der Rückgabewert der `pick`-Methode festgelegt.
```java
eventNumberPicker.when(() -> EventNumberPicker.pick(1, 1000))
                .thenReturn(1);
```

Dadurch wird bei jedem Aufruf der Methode `EventNumberPicker.pick(1, 1000)` 1 zurückgegeben.

Wenn beim zweiten oder dritten Aufruf unterschiedliche Rückgaben gewünscht sind, können unterschiedliche Werte als Parameter bei `thenReturn()` eingegeben werden.
```java
eventNumberPicker.when(() -> EventNumberPicker.pick(1, 1000))
                .thenReturn(1,2)
```

Am Ende des Tests wird die `MockStatic`-Instanz mit der Methode `close` geschlossen.
```java
eventNumberPicker.close();
```

Damit können `static`-Methoden gemockt und Testcodes geschrieben werden.

![image](/images/spring/static-method-test-1718443380015.png)

### Und was ist mit `void`?
Falls es eine `void`-Methode gibt, die in eine Datei schreibt oder eine externe API aufruft, könnte man sie so einstellen, dass sie bei einer bestimmten Ausführung nichts tut.

In dem Fall wird sie durch das bloße Erzeugen der `MockStatic`-Instanz gezwungen, nichts zu tun.

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

Auch hier wird `doSomething()` beim tatsächlichen Test nicht ausgeführt, obwohl wir in gewisser Weise `when()` verwenden.

![image](/images/spring/static-method-test-1718443206484.png)
> Sie können überprüfen, dass `doSomething` nicht ausgegeben wird.

#### Die Parameterwerte verifizieren
Darüber hinaus können durch die Nutzung der allgemein bekannten `verify()`-Methode nicht nur der Aufruf, sondern auch die Parameterwerte geprüft werden.
```java{filename=EventNumberPicker.java} 
public static void doSomething(int from, int to) {
    System.out.println("doSomething" + from + to);
}
```
Nach Anpassung der Methode, um Parameter entgegenzunehmen, könnte der Testcode wie folgt aussehen.

```
// ...
eventNumberPicker.verify(
() -> EventNumberPicker.doSomething(1, 900));
```

Der wesentliche Unterschied besteht darin, dass `Mockito.verify()` eine statische Methode von Mockito ist, jedoch innerhalb der `MockStatic`-Instanzen verwendet werden muss, die mit der `mockStatic()`-Methode erstellt wurden.

![image](/images/spring/static-method-test-1718522103669.png)
> Bei unerwarteten Parameterwerten tritt ein Fehler auf.

### Was, wenn eine bestimmte Methode gemockt, eine andere jedoch genutzt werden soll?
In diesem Fall nutzen Sie `when()` zum Mocken, verwenden jedoch das `thenCallRealMethod()`.

```java
eventNumberPicker.when(() -> EventNumberPicker.doSomething())
                .thenCallRealMethod();
```

![image](/images/spring/static-method-test-1718443440348.png)
> Sie können prüfen, dass `doSomething` ausgegeben wird.