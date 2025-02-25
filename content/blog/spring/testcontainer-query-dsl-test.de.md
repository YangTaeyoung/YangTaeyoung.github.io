---
title: Testen von QueryDSL in Spring mit Testcontainers
type: blog
date: 2024-08-19
comments: true
translated: true
---
![image](/images/spring/testcontainer-query-dsl-test-1724078089724.png)

In der Praxis ist es manchmal schwierig zu wissen, ob eine QueryDSL-Abfrage korrekt funktioniert.

Hierbei kann Testcontainers helfen, indem es eine Containerumgebung bereitstellt, in der die Datenbank so wie in der Echtumgebung ausgeführt wird. Dadurch können die Abfragen getestet und die Ergebnisse verglichen werden.

## Warum QueryDSL testen?
Das Ausführen von Abfragen in der Datenbank ist nicht nur mit QueryDSL, sondern auch mit anderen ORM-Frameworks wie JPA oder MyBatis möglich.

Allerdings sind JPA Query-Methoden in der Regel einfacher zu verwenden und bereits getestet, weshalb häufiger Tests mit QueryDSL oder MyBatis durchgeführt werden, wo SQL direkt verwendet wird.

## Was ist Testcontainers?
![image](/images/spring/testcontainer-query-dsl-test-1724076186837.png)

[Testcontainers](https://testcontainers.com) ist eine Bibliothek, die es ermöglicht, eine Testumgebung mit Docker zu erstellen.

Es ist möglich, eine Datenbank mit Dialekt wie H2 für Tests zu verwenden. Aber da es mit der tatsächlichen Datenbankumgebung nicht identisch ist, können unerwartete Fehler auftreten.

Wenn Testcontainers verwendet wird, kann die tatsächliche zu verwendende Datenbank mit Docker bereitgestellt werden, um Tests durchzuführen. Wenn die Konfiguration sorgfältig vorgenommen wird, können Tests in einer echten Umgebung durchgeführt werden. (Die Testgeschwindigkeit kann jedoch langsamer sein als bei leichten integrierten Datenbanken wie H2.)

### Integration von Testcontainers
Um Testcontainers zu verwenden, füge die folgenden Abhängigkeiten zu `build.gradle` hinzu.

Da ich MySQL verwendet habe, fügte ich eine Testabhängigkeit für MySQL hinzu.

```groovy{filename=build.gradle}
dependencies {
    // ...
    testImplementation 'org.testcontainers:junit-jupiter:1.20.0'
    testImplementation 'org.testcontainers:mysql:1.20.0'
    // ...
}
```

### Definition von `QueryDslTestConfig`

Definiere `QueryDslTestConfig` für die QueryDsl-Tests.

```java

@TestConfiguration
public class QueryDslTestConfig {

    @PersistenceContext
    private EntityManager entityManager;

    @Bean
    public JPAQueryFactory jpaQueryFactory() {
        return new JPAQueryFactory(entityManager);
    }
}
```

Diese Config injiziert den `EntityManager`, der in der Testumgebung von QueryDSL verwendet wird, um eine `JPAQueryFactory` zu erstellen.

### Definition der Klasse `QueryDslTest`

Um den Aufwand zu reduzieren, jedes Mal den Container zu konfigurieren und Tests durchzuführen, wird eine abstrakte Klasse `QueryDslTest` definiert.

```java
@DataJpaTest
@Testcontainers
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(QueryDslTestConfig.class)
@ActiveProfiles("test")
@SuppressWarnings("resource")
public abstract class QueryDslTest {

    @Container
    public static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0.32")
        .withDatabaseName("test_db")
        .withUsername("test")
        .withPassword("test")
}
```
`@DataJpaTest` lädt nur die JPA bezogenen Einstellungen und `@Testcontainers` ermöglicht die Nutzung von Testcontainers.

`@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)` verhindert die Nutzung von DataSource. (Da später `@DynamicPropertySource` die Containerkonfiguration übernimmt, ist kein Ersatz von DataSource erforderlich)

`@Import(QueryDslTestConfig.class)` lädt die QueryDslTestConfig.

`@ActiveProfiles("test")` setzt die Verwendung von `application-test.yml` fest.

`@SuppressWarnings("resource")` unterdrückt Warnungen, die bei der Nutzung des Containers auftreten.

`@Container` definiert den Container.

Um das Schema initial zu konfigurieren, kann `withInitScript` von `MySQLContainer` verwendet werden, um das anfängliche Schema zu setzen. 
```java
@Container
public static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0.32")
    // ...
    .withInitScript("init.sql");
```

### Vorbereitung zum Schreiben von Testcode

Definiere anschließend den Testcode, indem die Klasse `QueryDslTest` erweitert wird, um notwendige Tests vorzubereiten.

```java
class StudentRepositoryImplTest extends QueryDslTest {

    @Autowired
    StudentRepository studentRepository;

    @DynamicPropertySource
    static void registerMySQLProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
        registry.add("spring.datasource.driver-class-name", () -> "com.mysql.cj.jdbc.Driver");
    }
```

`@DynamicPropertySource` ermöglicht es, Containerinformationen dynamisch in die DataSource zu injizieren. Dies entspricht den in der `application.yml` angegebenen Werten, da der Testcontainer im Wesentlichen kontinuierlich erstellt und gelöscht wird und `@DynamicPropertySource` dynamische Injektion ermöglicht.

Wenn diese Methode unpraktisch ist, können die Containerinformationen in `application-test.yml` injiziert werden, um Tests mit einem einzigen Container durchzuführen. Dabei müssen jedoch Arbeiten wie das Erstellen und Löschen von Tabellen sowie die Isolierung zwischen Tests berücksichtigt werden.

### Schreiben von Testcode

Anschließend wird der Testcode geschrieben.

```java
class StudentRepositoryImplTest extends QueryDslTest {
    // ...

    @BeforeEach
    void setUp() {
        studentRepository.save(Student.builder()
            .name("test_name")
            .age(20)
            .build());
    }

    @Test
    void findStudent() {
        // given
        Student student = Student.builder()
            .name("test_name")
            .age(20)
            .build();
        studentRepository.save(student);

        // when
        List<Student> students = studentRepository.findStudent("test_name");

        // then
        assertThat(students).isNotEmpty();
        assertThat(students.get(0).getName()).isEqualTo("test_name");
    }
    
    @AfterEach
    void tearDown() {
        studentRepository.deleteAll();
    }
}
```

Der Testcode sucht nach einem Studenten basierend auf einem Namen.

`@BeforeEach` fügt Daten vor dem Test hinzu, und `@AfterEach` entfernt die Daten nach dem Test.

Durch die Durchführung der Tests auf diese Weise kann der in QueryDsl geschriebene Code in einer Umgebung getestet werden, die der echten Umgebung entspricht.