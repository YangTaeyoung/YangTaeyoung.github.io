---
title: Testons QueryDSL avec Testcontainer dans Spring
type: blog
date: 2024-08-19
comments: true
translated: true
---
![image](/images/spring/testcontainer-query-dsl-test-1724078089724.png)

Lorsqu'on utilise QueryDSL dans des projets réels, il peut être difficile de savoir si la requête fonctionne correctement.

Dans ces cas-là, en utilisant Testcontainer, on peut soulever une base de données dans un environnement containerisé identique à l'environnement réel, exécuter la requête, et comparer les résultats pour réaliser un test.

## Pourquoi tester QueryDSL ?
En réalité, exécuter des requêtes en accédant à une base de données est possible non seulement avec QueryDSL, mais aussi avec des frameworks ORM variés comme JPA, MyBatis, etc.

Cependant, dans le cas des méthodes de requête de JPA, leur utilisation est si simple qu'elles sont déjà testées, c'est pourquoi il est plus courant de tester avec QueryDSL qui traite de requêtes SQL réalistes, ou avec MyBatis.

## Qu'est-ce que Testcontainer ?
![image](/images/spring/testcontainer-query-dsl-test-1724076186837.png)

[Testcontainer](https://testcontainers.com) est une bibliothèque permettant de créer des environnements de test en utilisant Docker.

Bien qu'il soit possible de tester avec un Dialect de DB incorporé comme celui de H2, cela peut entraîner des erreurs inattendues car l'environnement n'est pas identique à celui de la DB utilisée réellement.

En utilisant Testcontainer, vous pouvez soulever la DB réellement utilisée avec Docker pour réaliser vos tests, et en prenant soin des configurations, vous pouvez tester dans un environnement identique à l’environnement réel. (Cependant, la vitesse du test peut être plus lente qu'avec une DB incorporée légère comme H2.)

### Intégration avec Testcontainer
Pour utiliser Testcontainer, ajoutez les dépendances suivantes dans votre `build.gradle`.

Vu que j'utilise MySQL, j'ai ajouté la dépendance de test pour MySQL.

```groovy{filename=build.gradle}
dependencies {
    // ...
    testImplementation 'org.testcontainers:junit-jupiter:1.20.0'
    testImplementation 'org.testcontainers:mysql:1.20.0'
    // ...
}
```

### Définition de `QueryDslTestConfig`

Définissez le `QueryDslTestConfig` à utiliser dans le test de QueryDSL.

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

Cette configuration crée un `JPAQueryFactory` en injectant un `EntityManager` utilisé par QueryDSL dans l'environnement de test.

### Définition de la classe `QueryDslTest`

Ensuite, pour réduire le temps passé à configurer et tester le container à chaque fois, définissez une classe abstraite `QueryDslTest`.

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
`@DataJpaTest` charge uniquement les configurations relatives à JPA, et `@Testcontainers` permet d'utiliser Testcontainer.

`@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)` configure pour ne pas utiliser DataSource. (De toute façon, comme on va configurer le container avec `@DynamicPropertySource`, il n'y a pas besoin de remplacer `DataSource`)

`@Import(QueryDslTestConfig.class)` charge QueryDslTestConfig.

`@ActiveProfiles("test")` configure l'utilisation de `application-test.yml`.

`@SuppressWarnings("resource")` ignore les avertissements qui apparaissent lors de l'utilisation du container.

`@Container` définit le container.

Si vous avez besoin de configurer un schéma initialement, vous pouvez utiliser `withInitScript` de `MySQLContainer` pour configurer le schéma initial.
```java
@Container
public static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0.32")
    // ...
    .withInitScript("init.sql");
```

### Préparation pour l'écriture des tests

Ensuite, préparez le nécessaire pour les tests en réalisant l'héritage de `QueryDslTest` défini précédemment.

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

Avec `@DynamicPropertySource`, vous pouvez injecter dynamiquement les informations du container dans DataSource. Cela est équivalent aux valeurs habituellement spécifiées dans `application.yml`, mais comme le test container est continuellement créé et supprimé, `@DynamicPropertySource` est utilisé pour injection dynamique.

Si cette méthode ne vous convient pas, vous pouvez injecter les informations du container dans `application-test.yml` et procéder aux tests avec un seul container, mais il vous faudra considérer la création, la suppression des tables, et l'isolation entre les tests.

### Écriture du code de test

Ensuite, écrivez les codes de test.

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

Il s'agit d'un test simple cherchant un étudiant par nom.

Avec `@BeforeEach`, on insère des données avant le test et avec `@AfterEach`, on supprime les données après le test.

En procédant ainsi, vous pouvez réaliser des tests sur le code écrit avec QueryDsl dans un environnement identique à l'environnement réel.