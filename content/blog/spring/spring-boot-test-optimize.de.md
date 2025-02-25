---
title: Optimierung der Annotation @SpringBootTest (feat. @DataJpaTest, @WebMvcTest)
type: blog
date: 2025-01-20
comments: true
translated: true
---

Als ich in meinem neuen Job anfing, machte ich mir Gedanken darüber, dass die Testzeiten sehr lang waren (ungefähr 28 Minuten). 

Nebenbei bemerkt, meine Teamkollegen empfanden diese Zeit nicht als besonders lang, da sie es gewohnt waren. In meinem vorherigen Unternehmen dauerten die Tests jedoch nur 2-3 Minuten, was die längeren Zeiten für mich sehr schwer zu ertragen machte. 🤣

![image](/images/spring/spring-boot-test-optimize-1737350813436.png)

Damals benutzten wir kein Tool wie Testcontainers, um Container zu starten, sondern ausschließlich Unit-Tests auf Mockito-Basis. Ich konnte nicht nachvollziehen, warum die Tests so viel Zeit in Anspruch nahmen.
> Wenn man Tools wie Testcontainers für Repository- oder Integrationstests verwendet, kann das zusätzliche Starten des Containers und Verbinden mit dem Dienst die Testzeit verlängern.

Deshalb möchte ich diesmal teilen, wie wir den Testprozess im Service optimieren konnten, welche Probleme auftraten und wie wir sie gelöst haben.

## Ursachenuntersuchung

### 1. Abhängigkeitsprobleme

Zuerst gab es einen Verdacht bezüglich der Abhängigkeiten. Die Tests, die ich durchführte, zielten auf den `HomeController` (fiktiver Name) ab, welcher nur eine Abhängigkeit zum `HomeService` hatte. Trotzdem trat ein Fehler auf, dass `ProductService` (fiktiver Name) fehlen würde.

```
Caused by: org.springframework.beans.factory.NoSuchBeanDefinitionException: No qualifying bean of type 'com.example.demo.service.ProductService' available: expected at least 1 bean which qualifies as autowire candidate. Dependency annotations: {@org.springframework.beans.factory.annotation.Autowired(required=true)}
```

Natürlich ließe sich dieses Problem einfach lösen, indem man die Abhängigkeit hinzufügt:

```java
@MockBean
private ProductService productService;
```

Es war jedoch mühsam, eine nicht genutzte Abhängigkeit ständig hinzuzufügen. Besonders lästig war es, dies bei jeder neuen Service- oder Repositoryeinführung zu wiederholen.

### 2. @SpringBootTest

`@SpringBootTest` ist eine Annotation für Integrationstests. Wird diese Annotation verwendet, wird der eigentliche Dienst gestartet und der Test durchgeführt.

Das Problem ist, dass alle Beans geladen werden, was die Testzeit verlängert. Standardmäßig führt Spring Datei-basierte Tests durch, was bedeutet, dass bei einem Test alle Beans immer wieder neu geladen werden.

Selbst wenn wir die Testumgebung über `application-test.yml` konfiguriert haben, beschränkt das nicht die Nutzung von Beans. Hierfür müssen gesonderte Einstellungen getroffen werden. Zum Beispiel: Wie wird vorgegangen, wenn H2 als Testdatenbank für das Testing eines Repositories genutzt wird?

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
    username: sa
    password: password
```
> So könnte das grob aussehen. Die genauen Einstellungen sind hier nicht von Bedeutung.

Wenn man in diesem Fall mit SpringBootTest den Controller testen möchte:

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

Wenn der Test so durchgeführt wird, verlängert sich die Testzeit zwangsläufig durch `@SpringBootTest`, da alle Beans geladen werden.

Ein einzelner Testfall ist vielleicht kein großes Problem. Doch je mehr Dateien hinzukommen, desto länger dauert selbst ein einfacher Test.

## 3. Keine Integrationstests

`@SpringBootTest` wird üblicherweise für Integrationstests verwendet, die einem echten Umfeld ähnlich sind und über API-Endpunkte zugreifen. Wir führten jedoch keine Integrationstests durch.

Laut meiner Teamkollegen führten sie lediglich Unit-Tests durch, und selbst diese testeten nicht die Repository-Schicht.

Der Dienst funktionierte dabei eher wie eine Query-Maschine, die lediglich einfache Service-Tests durchführte, was die Bedeutung der Tests in Frage stellte.
> Dies führte später zu einem Wechsel zu einer Clean Architecture, worauf ich in einem anderen Beitrag eingehen werde.

## Lösung

### `@WebMvcTest`, `@DataJpaTest`

Um das Abhängigkeitsproblem zu lösen, können `@WebMvcTest`, `@DataJpaTest` usw. genutzt werden.

`@WebMvcTest` ist, wie der Name vermuten lässt, eine Annotation für MVC-Tests, d.h., es handelt sich um eine Annotation für Controllertests. Wird diese Annotation angewandt, werden nur Web-bezogene Beans wie `@Controller`, `@ControllerAdvice`, `@JsonComponent`, `Converter`, `GenericConverter`, `Filter`, `HandlerMethodArgumentResolver`, `HandlerInterceptor`, `WebMvcConfigurer`, `HandlerMethodReturnValueHandler` geladen.

`@DataJpaTest` ist für JPA-Tests gedacht, d.h. es handelt sich um eine Annotation für Repository-Tests. Wird diese Annotation verwendet, werden JPA-bezogene Beans wie `EntityManager`, `TestEntityManager`, `DataSource`, `JpaTransactionManager`, `JpaRepository` geladen.
> Tatsächlich haben wir zu der Zeit noch keine Repository-Tests mit Testcontainers oder H2 implementiert, weshalb `@DataJpaTest` nicht genutzt wurde.

### Beschränkung auf zu testende Klassen

Wenn man `@WebMvcTest` wie folgt benutzt, kann man `@Controller` testen, allerdings werden dabei alle Controller geladen.

```java
@WebMvcTest
class HomeControllerTest {
    // ...
}
```

Falls es nur wenige Controller gibt, mag das in Ordnung sein. Doch bei vielen Controllern tritt das Problem auf, dass alle Controller für jedes als `@WebMvcTest` deklarierte Testfile geladen werden müssen, sowie alle Abhängigkeitsprobleme gelöst werden müssen.

Um dieses Problem zu lösen, gibt man die zu testenden Controller explizit in `@WebMvcTest` an.

```java
@WebMvcTest(HomeController.class)
class HomeControllerTest {
    // ...
}
```

### Auffüllen fehlender Abhängigkeiten

Natürlich wäre es im Idealfall erfreulich, wenn der Test so funktioniert. Doch bei `@WebMvcTest` werden standardmäßig keine Beans im Zusammenhang mit Spring Security geladen, sodass zusätzlich verwendete Beans registriert werden müssen.

Hierfür gibt es keine besonderen Maßnahmen: einfach Schritt für Schritt die Tests durchführen und die Beans hinzufügen.

In meinem Fall musste ich, nachdem ich die SecurityConfig-Klasse ergänzte, noch Redis, UserRepository und weitere Beans hinzufügen.

```java
@WebMvcTest({HomeController.class, SecurityConfig.class})
```

Diese Beans müssen nicht unbedingt tatsächlich arbeiten, es reicht aus, sie als Mock zu registrieren.

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

Da diese Datei nicht automatisch geladen wird, wird sie durch die `@Import`-Annotation in der zu testenden Datei importiert.

```java
@WebMvcTest({HomeController.class})
@Import(WebMvcTestConfig.class)
```

Wenn zusätzliche Fehler auftreten, können sie mit folgendem Prozess ergänzt werden:
- Beans, die nicht tatsächlich arbeiten müssen: Registrierung in `WebMvcTestConfig` ohne tatsächliche Bean-Implementierung, als Mock.
- Beans, die tatsächlich arbeiten müssen: `@Import`-ergänzte Registrierung.

## Ergebnis

Das Testergebnis reduzierte die Testzeit von 28 Minuten auf 7 Minuten. Es gab eine Leistungssteigerung von etwa dem Vierfachen.
> Natürlich gibt es den Nachteil, dass man zusätzlich zu testende Klassen und `SecurityConfig` registrieren muss, aber dass dies die Zeit von mir und meinen Teamkollegen um 30 Minuten reduziert, ist ein beachtlicher Fortschritt!