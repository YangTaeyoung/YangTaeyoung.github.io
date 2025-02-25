---
title: Testing QueryDSL with Testcontainers in Spring
type: blog
date: 2024-08-19
comments: true
translated: true
---
![image](/images/spring/testcontainer-query-dsl-test-1724078089724.png)

When using QueryDSL in real-world projects, there can be times when it's hard to determine if the query is functioning correctly.

In such cases, you can use Testcontainers to bring up a database in a container environment identical to the real one, execute the query, and compare the results to conduct tests.

## Why Test QueryDSL?
In fact, executing queries by accessing a database is possible not only with QueryDSL but also with a variety of ORM frameworks such as JPA and MyBatis.

However, given that JPA’s Query Method is simple to use and assumed to be already tested, testing is more commonly conducted with QueryDSL or MyBatis, which handle actual SQL.

## What is Testcontainers?
![image](/images/spring/testcontainer-query-dsl-test-1724076186837.png)

[Testcontainers](https://testcontainers.com) is a library that allows you to set up testing environments using Docker.

While you can use the dialects of embedded databases like H2 for testing, unintended errors might occur as it's not the same environment as the actual database.

With Testcontainers, you can spin up the actual database via Docker to conduct tests, thus ensuring you're testing in an environment identical to the real one, provided you pay attention to configurations. (however, it might be slower compared to using lightweight embedded databases like H2.)

### Integrating Testcontainers
To utilize Testcontainers, add the following dependencies to your `build.gradle`.

I used MySQL, so I added dependencies for testing with MySQL.

```groovy{filename=build.gradle}
dependencies {
    // ...
    testImplementation 'org.testcontainers:junit-jupiter:1.20.0'
    testImplementation 'org.testcontainers:mysql:1.20.0'
    // ...
}
```

### Defining `QueryDslTestConfig`

Define `QueryDslTestConfig` to be used in the QueryDSL test.

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

This config injects the `EntityManager` used by QueryDSL in the testing environment to create a `JPAQueryFactory`.

### Defining the `QueryDslTest` Class

Next, define an abstract class `QueryDslTest` to reduce the redundancy of setting up the container for each test.

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
        .withPassword("test");
}
```
`@DataJpaTest` loads only the JPA-related settings, and `@Testcontainers` enables the use of Testcontainers.

`@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)` configures not to use DataSource. (since `@DynamicPropertySource` will later handle container settings, there is no need to replace the `DataSource`)

`@Import(QueryDslTestConfig.class)` loads the QueryDslTestConfig.

`@ActiveProfiles("test")` configures the use of `application-test.yml`.

`@SuppressWarnings("resource")` suppresses warnings that occur when using the container.

`@Container` is used to define the container.

If initial schema setup is necessary, you can use `withInitScript` of `MySQLContainer` to set up the initial schema. 

```java
@Container
public static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0.32")
    // ...
    .withInitScript("init.sql");
```

### Preparation for Writing Test Code

Next, conduct preparation for necessary tests by extending the defined `QueryDslTest` with your test code.

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

`@DynamicPropertySource` allows dynamic injection of container information into the DataSource. This is equivalent to what is usually specified in `application.yml`. Given the characteristic of test containers being created and destroyed continuously, it's to dynamically inject using `@DynamicPropertySource`.

If this approach is unappealing, container information can also be injected into `application-test.yml` to conduct tests with a single container, but considerations for table creation, deletion, and isolation between tests are necessary.

### Writing Test Code

Finally, write the test code.

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

This is a simple test code to find a student based on name.

Data is inserted before each test with `@BeforeEach`, and removed after each test with `@AfterEach`.

By proceeding with the test in this way, you can conduct tests on the code written in QueryDSL in an environment identical to the actual one.