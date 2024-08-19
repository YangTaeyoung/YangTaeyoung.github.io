---
title: Spring에서 Testcontainer를 이용해 QueryDSL을 테스트 해보자
type: blog
date: 2024-08-19
comments: true
---
![image](/images/spring/testcontainer-query-dsl-test-1724078089724.png)

실무에서 QueryDSL을 사용하다보면 실제 해당 쿼리가 정상적으로 동작하는지 알기 어려울 때가 있다.

이 때 Testcontainer를 이용하면 컨테이너 환경에서 실제 환경과 동일한 DB를 띄우고, 해당 쿼리를 실행하고 결과를 대조해 봄으로써 테스트를 진행해 볼 수 있다.

## 왜 QueryDSL 테스트를 하는가?
사실 DB에 접근하여 쿼리를 실행하는 것은 QueryDSL 뿐 아니라, JPA, MyBatis 등 다양한 ORM 프레임워크에서도 가능하다.

다만 JPA의 Query Method의 경우 워낙 사용법이 간단할 뿐 더러, 이미 테스트가 되어있다고 가정하기에 실제 SQL을 다루는 QueryDSL 이나, MyBatis에서 테스트를 진행하는 편이 더 많다.

## Testcontainer란?
![image](/images/spring/testcontainer-query-dsl-test-1724076186837.png)

[Testcontainer](https://testcontainers.com)는 Docker를 이용하여 테스트 환경을 구축할 수 있게 해주는 라이브러리이다.

H2와 같은 내장 DB의 Dialect를 사용하고 있는 DB에 맞추어 테스트를 할 수도 있지만, 실제 사용하는 DB와 동일한 환경이 아니기에 의도치 않은 오류가 발생할 가능성이 있다.

Testcontainer를 이용하면 실제 사용하는 DB를 Docker로 띄워서 테스트를 진행할 수 있게 해주기에, 설정만 신경써서 해준다면 실제 환경과 동일한 환경에서 테스트를 진행할 수 있다. (다만 H2와 같은 가벼운 내장 DB 대비 테스트 속도가 느릴 수 있다.)


### Testcontainer 연동
Testcontainer를 사용하기 위해서는 `build.gradle`에 다음과 같은 의존성을 추가해준다.

필자는 MySQL을 사용하였기에 MySQL을 사용하는 테스트 의존성을 추가하였다.

```groovy{filename=build.gradle}
dependencies {
    // ...
    testImplementation 'org.testcontainers:junit-jupiter:1.20.0'
    testImplementation 'org.testcontainers:mysql:1.20.0'
    // ...
}
```

### `QueryDslTestConfig` 정의

QueryDsl 테스트에서 사용할 `QueryDslTestConfig`를 정의한다.

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

해당 Config는 테스트 환경에서 QueryDSL이 사용하는 `EntityManager`를 주입받아 `JPAQueryFactory`를 생성해준다.


### `QueryDslTest` 클래스 정의

이후 컨테이너를 매번 설정하고, 테스트를 진행하는 소요를 줄이기 위해 추상 클래스 `QueryDslTest`를 정의한다.

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
`@DataJpaTest`는 JPA 관련 설정만 로드하고, `@Testcontainers`는 Testcontainer를 사용할 수 있게 해준다.

`@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)`는 DataSource를 사용하지 않도록 설정한다. (어차피 추후 `@DynamicPropertySource` 로 컨테이너 설정을 해줄 것이기 때문에 `DataSource`를 대체할 필요가 없다)

`@Import(QueryDslTestConfig.class)`는 QueryDslTestConfig를 로드한다.

`@ActiveProfiles("test")`는 `application-test.yml`을 사용하도록 설정한다.

`@SuppressWarnings("resource")`는 컨테이너를 사용할 때 발생하는 경고를 무시한다.

`@Container`는 컨테이너를 정의한다.

스키마를 초기에 설정하는 것이 필요하다면, `MySQLContainer`의 `withInitScript`를 사용하여 초기 스키마를 설정할 수 있다. 
```java
@Container
public static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0.32")
    // ...
    .withInitScript("init.sql");
```

### 테스트 코드 작성을 위한 밑준비

이후 테스트 코드를 상단에 정의한 `QueryDslTest`를 상속받아 필요한 테스트를 위한 밑준비를 해준다.

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

`@DynamicPropertySource`을 사용하면 동적으로 DataSource에 컨테이너의 정보를 주입할 수 있다. 이는 흔히 `application.yml`에 명시하는 값과 동일한 내용으로, 테스트 컨테이너 특성 상 계속 생성되고, 삭제되는 것이 때문에 `@DynamicPropertySource`를 사용하여 동적으로 주입해주기 위함이다.

이런 방식이 내키지 않는다면 `application-test.yml`에 컨테이너 정보를 주입하여 한개의 컨테이너로 테스트를 진행해볼 수도 있으나, 테이블 생성, 삭제 등의 작업 및 테스트 간 격리에 대한 고려가 필요하다.

### 테스트 코드 작성

이후 테스트 코드를 작성한다.

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

name을 기준으로 학생을 찾는 단순한 테스트 코드이다.

`@BeforeEach`를 통해 테스트 전에 데이터를 삽입하고, `@AfterEach`를 통해 테스트 후에 데이터를 삭제한다.

이렇게 테스트를 진행하면, 실제 환경과 동일한 환경에서 QueryDsl로 작성된 코드에 대해 테스트를 진행할 수 있게 된다.