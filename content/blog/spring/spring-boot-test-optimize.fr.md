---
title: Optimisation de l'annotation @SpringBootTest (feat. @DataJpaTest, @WebMvcTest)
type: blog
date: 2025-01-20
comments: true
translated: true
---

Lorsque j'ai commencé mon travail, le temps de test était très long, ce qui me préoccupait. (environ 28 minutes)

En passant, même si mes collègues ne trouvaient pas cela particulièrement long — ils étaient habitués à ce timing — dans mon ancienne entreprise, les tests ne prenaient que 2 à 3 minutes. Il était donc très difficile de supporter une attente aussi longue 🤣

![image](/images/spring/spring-boot-test-optimize-1737350813436.png)

À l'époque, nous n'utilisions pas d'outils pour lancer des conteneurs comme Testcontainers, et nos tests n'étaient composés que de tests unitaires basés sur Mockito. Je ne comprenais pas pourquoi ces tests prenaient autant de temps.
> Lorsque que l'on utilise des outils comme Testcontainers pour les tests de dépôt ou d'intégration, le lancement et la connexion du service ajoutent effectivement du temps aux tests.

Cette fois, je souhaite analyser et partager comment nous avons pu optimiser les tests de notre service et quelles en étaient les causes.

## Analyse des causes
### 1. Problème de dépendances
J'avais des doutes sur certaines parties des dépendances. La cible du test que j'avais écrit était `HomeController` (nom fictif), et sa seule dépendance était `HomeService`.
Cependant, une erreur affirmant que `ProductService` (nom fictif) était manquant survenait...

```
Caused by: org.springframework.beans.factory.NoSuchBeanDefinitionException: No qualifying bean of type 'com.example.demo.service.ProductService' available: expected at least 1 bean which qualifies as autowire candidate. Dependency annotations: {@org.springframework.beans.factory.annotation.Autowired(required=true)}
```

Bien sûr, il n'y a pas de problème si vous ajoutez simplement la dépendance suivante :

```java
@MockBean
private ProductService productService;
```

Mais ajouter des dépendances non utilisées chaque fois était très contraignant, surtout à chaque nouvelle création de service ou de dépôt.

### 2. @SpringBootTest
`@SpringBootTest` est une annotation pour les tests d'intégration. Elle lance le service réel pour procéder aux tests.

Le problème est qu'elle charge tous les beans, ce qui allonge le temps de test. Spring procède généralement aux tests par fichier, donc le chargement des beans pour chaque test alonge le processus.

Même si nous déterminons les environnements de test via des fichiers comme `application-test.yml`, cela ne limite pas l'utilisation des beans, et nous devons donc spécifier une configuration distincte. Par exemple, comment tester un dépôt en utilisant H2 comme base de données de test ?

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
    username: sa
    password: password
```
> Cela pourrait ressembler à ça. La configuration précise n'est pas cruciale.

Si vous souhaitez tester un contrôleur avec SpringBootTest :

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

Le problème est qu'avec `@SpringBootTest`, tous les beans sont chargés, allongeant ainsi le temps de test.

Un seul test ne poserait pas problème. Toutefois, à mesure que le nombre de fichiers augmente, la durée de test même pour des codes de test insignifiants s'allonge.

## 3. Pas de tests d'intégration
`@SpringBootTest` est généralement utilisé pour les tests d'intégration, qui sont configurés de manière similaire à l'environnement entier et accessibles via les endpoints API. Cependant, nous ne réalisions pas de tests d'intégration.

Après avoir consulté mes collègues, j'ai appris qu'ils se contentaient de tests unitaires, et ceux-ci ne couvraient même pas le layer des dépôts.

Le service fonctionnait principalement comme une machine de requêtes, ce qui rendait les tests de service peu significatifs.
> J'aborderai la transition vers une architecture propre dans un autre article.

## Solutions
### `@WebMvcTest`, `@DataJpaTest`
Pour résoudre le problème des dépendances, nous pouvons utiliser `@WebMvcTest`, `@DataJpaTest`, etc.

`@WebMvcTest`, comme son nom l'indique, est une annotation pour les tests MVC, principalement utilisées pour tester les contrôleurs. Elle charge uniquement les beans relatifs à un environnement web, tels que `@Controller`, `@ControllerAdvice`, `@JsonComponent`, `Converter`, `GenericConverter`, `Filter`, `HandlerMethodArgumentResolver`, `HandlerInterceptor`, `WebMvcConfigurer`, `HandlerMethodReturnValueHandler`.

`@DataJpaTest`, quant à elle, est destinée aux tests JPA, principalement utilisés pour tester les dépôts. Elle charge uniquement les beans relatifs à JPA, tels que `EntityManager`, `TestEntityManager`, `DataSource`, `JpaTransactionManager`, `JpaRepository`.
> À l'époque, nous n'utilisions pas encore les Testcontainers ou H2 pour les tests de dépôt, donc nous n'avons pas utilisé `@DataJpaTest`.

### Limiter la classe à tester
Vous pouvez utiliser `@WebMvcTest` comme suit pour tester un `@Controller`, mais cela charge tous les contrôleurs.

```java
@WebMvcTest
class HomeControllerTest {
    // ...
}
```

Lorsque vous avez peu de contrôleurs, cela peut être acceptable. Toutefois, avec un grand nombre de contrôleurs, `@WebMvcTest` spécifié pour chaque fichier entraîne le chargement de tous les contrôleurs et nécessite la résolution de tous leurs problèmes de dépendances.

Pour remédier à cela, vous pouvez spécifier la classe à charger dans `@WebMvcTest`.

```java
@WebMvcTest(HomeController.class)
class HomeControllerTest {
    // ...
}
```

### Remplir les dépendances manquantes
Bien sûr, si le test fonctionne ainsi, c'est très heureux. Néanmoins, avec `@WebMvcTest`, les beans liés à Spring Security ne sont pas chargés par défaut. Il faut donc enregistrer les beans utilisés dans ces configurations.

Il suffit d'ajouter un par un lors des tests.

Dans mon cas, l'ajout de la classe SecurityConfig nécessitait d'ajouter Redis, UserRepository, etc.
```java
@WebMvcTest({HomeController.class, SecurityConfig.class})
```

Cependant, pour qu'ils fonctionnent réellement, ils ont juste besoin d'être là, donc j'ai utilisé Mockito pour enregistrer des faux beans.

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

Ce fichier n'est pas automatiquement chargé, donc nous l'avons importé dans le fichier de test avec l'annotation `@Import`.

```java
@WebMvcTest({HomeController.class})
@Import(WebMvcTestConfig.class)
```

Si vous rencontrez des erreurs supplémentaires, suivez ce processus :
- S'il n'est pas nécessaire de fonctionner réellement : N'enregistrez pas le bean dans `WebMvcTestConfig`, utilisez Mock pour l'enregistrer.
- Pour les beans qui doivent réellement fonctionner : Enregistrez-les avec `@Import`.

## Résultat
Le temps de test est passé de 28 minutes à 7 minutes. Une amélioration d'environ 4 fois.
> Bien sûr, il y a l'inconvénient d'enregistrer des classes supplémentaires telles que le classe à tester et `SecurityConfig`, mais réduire le temps de mes collègues et moi-même de 30 minutes est un progrès significatif !