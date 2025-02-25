---
translated: true
title: (JAVA) Mocking de méthodes statiques dans un service avec Spring
type: blog
date: 2024-06-15
comments: true
---

Généralement, Spring suit une architecture en couches dans laquelle la logique métier est principalement traitée dans le service.

Dans ce contexte, il arrive souvent d'utiliser des méthodes `static`. Pour les composants ordinaires, ceux-ci sont dynamiquement liés au moment de l'exécution, ce qui permet de remplacer l'objet qui implémente l'interface par un objet Mock lors du test. Cependant, les méthodes `static` sont liées statiquement au moment de la compilation, rendant leur Mocking plus difficile.

Que faire dans ce cas?

## 1. Classe Wrapper

La façon traditionnelle consiste à convertir les méthodes statiques en composants.

Cela consiste à envelopper la méthode statique dans une classe Wrapper en l'utilisant dans une méthode ordinaire.

### Exemple
Supposons que nous ayons le code suivant.

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

L'entité Product est structurée de la manière suivante.
```java
/**
 * DTO de produit pour transmettre les informations du produit
 */
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@EqualsAndHashCode
@ToString
public class ProductDto {

    /**
     * ID du produit
     */
    private Long id;

    /**
     * Nom du produit
     */
    private String name;

    /**
     * Description du produit
     */
    private String description;

    /**
     * Prix du produit
     */
    private double price;

    /**
     * Numéro d'événement
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

Le constructeur reçoit le `eventNumber` en tant que paramètre pour le définir dans l'entité produit, et utilise la méthode `eventNumberPicker.pick(1, 1000)`.

Dans ce cas, `EventNumberPicker` est une classe qui enveloppe la classe Math, structurée de cette manière.

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

En configurant ainsi, même en utilisant la méthode random de la classe Math, la classe `EventNumberPicker` utilisée dans la logique métier peut être mockée dans le code de test.

### Inconvénients

Cependant, cette méthode oblige à créer une classe Wrapper pour chaque classe utilisant une méthode `static`, ce qui est contraignant.

Il faut une classe Wrapper même pour quelque chose d'aussi simple que `LocalDateTime.now()`.

En Python, on utilise souvent le Monkey Patching pour résoudre le Mocking de méthodes `static`. En revanche, en Golang, où le Monkey Patching est problématique sur l'architecture arm, une solution fréquente est celle-ci : utiliser des classes Wrapper comme décrit ci-dessus.
~~(Note : cela peut être faux. Cependant, lorsque je travaillais avec Golang, aucune librairie de Mocking ne supportait le Mocking de méthodes statiques.)~~

## 2. Mockito

Mockito est l’une des bibliothèques de Mocking les plus utilisées en Java.

Alors qu'il ne le permettait pas auparavant, il supporte le Mocking des méthodes `static` depuis la version `3.4.0`.

### Exemple
Dans cet exemple, supposons que la méthode `pick` de la classe `EventNumberPicker` soit `static` et agissons en conséquence.
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

La classe `ProductService` n'injecte pas `EventNumberPicker` et utilise également la méthode `pick`.

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

### Code de test

Tout d’abord, ajoutez la dépendance Mockito à Gradle.

```gradle
    // https://mvnrepository.com/artifact/org.mockito/mockito-core
    testImplementation 'org.mockito:mockito-core:5.12.0'
```

Ensuite, le code de test peut être écrit comme suit.
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
        void réussite() {
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

Comme pour tout autre test, une instance Mock est injectée dans la variable membre, et l'instance de la classe cible de test est injectée grâce à l'annotation `@InjectMocks`.
Bien que `MockStatic` puisse également être configuré de cette manière, l'auteur a préféré l'utiliser uniquement dans le code de test pour éviter de la confusion étant donné que ce n'est pas un besoin fréquent.

D'abord, créez une instance `MockStatic` pour `EventNumberPicker`.
```java
eventNumberPicker = mockStatic(EventNumberPicker.class);
```

Ensuite, utilisez la méthode `when` pour définir la valeur à retourner lorsque la méthode `pick` est appelée.
```java
eventNumberPicker.when(() -> EventNumberPicker.pick(1, 1000))
                .thenReturn(1);
```

Ainsi, lorsque la méthode `EventNumberPicker.pick(1, 1000)` est appelée, elle retourne 1.

Si vous souhaitez que les deuxièmes et troisièmes appels renvoient différentes valeurs, vous pouvez fournir d'autres valeurs en paramètre à `thenReturn()`.
```java
eventNumberPicker.when(() -> EventNumberPicker.pick(1, 1000))
                .thenReturn(1,2)
```

Enfin, appelez la méthode `close` pour fermer l'instance `MockStatic` à la fin du test.
```java
eventNumberPicker.close();
```

De cette manière, même les méthodes `static` peuvent être mockées et les codes de test peuvent être écrits.

![image](/images/spring/static-method-test-1718443380015.png)

### Et les méthodes `void` ?
Si une méthode `void` écrit dans un fichier ou appelle une API externe, vous voudrez peut-être la configurer pour qu'elle n'effectue aucune action.

Dans ce cas, la simple création d'une instance `MockStatic` suffit à empêcher l'action réelle.

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

Dans les tests, même sans spécifier la méthode `doSomething()` avec `when()`, "doSomething" ne s'affiche pas durant le test.

![image](/images/spring/static-method-test-1718443206484.png)
> Vous pouvez constater que `doSomething` ne s'affiche pas.

#### Vérification de la valeur de paramètre

En utilisant la méthode `verify()`, vous pouvez vérifier non seulement si un appel est effectué, mais aussi la valeur des paramètres.
```java{filename=EventNumberPicker.java} 
public static void doSomething(int from, int to) {
    System.out.println("doSomething" + from + to);
}
```
Modifiez la méthode pour recevoir les paramètres ci-dessus, et écrivez le code de test comme suit.

```
// ...
eventNumberPicker.verify(
() -> EventNumberPicker.doSomething(1, 900));
```

La différence ici est que `Mockito.verify()` est une méthode `static` dans Mockito, mais cette méthode est utilisée sur une instance `MockStatic` créée via la méthode `mockStatic()`.

![image](/images/spring/static-method-test-1718522103669.png)
> Nous voyons qu'une erreur survient lorsque le paramètre ne correspond pas à nos attentes.

### Mocking d'une méthode spécifique tout en utilisant d'autres méthodes réelles ?
Dans ce cas, utilisez `when()` pour le Mocking, mais recourez à `thenCallRealMethod()`.

```java
eventNumberPicker.when(() -> EventNumberPicker.doSomething())
                .thenCallRealMethod();
```

![image](/images/spring/static-method-test-1718443440348.png)
> Vous pouvez constater que `doSomething` s'affiche.
