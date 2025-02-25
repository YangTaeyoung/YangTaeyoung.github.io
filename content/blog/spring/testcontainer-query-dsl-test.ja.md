---
title: SpringでTestcontainerを利用してQueryDSLをテストしてみよう
type: blog
date: 2024-08-19
comments: true
translated: true
---
![image](/images/spring/testcontainer-query-dsl-test-1724078089724.png)

業務でQueryDSLを使用していると、実際にそのクエリが正常に動作するかどうかを知るのが難しい場合があります。

このとき、Testcontainerを利用すると、コンテナ環境で実際の環境と同じDBを起動し、そのクエリを実行して結果を対照することでテストを進めることができます。

## なぜQueryDSLのテストを行うのか？
実際DBにアクセスしてクエリを実行することは、QueryDSLだけでなく、JPA、MyBatisなどさまざまなORMフレームワークでも可能です。

ただし、JPAのクエリメソッドの場合、使い方が非常に簡単であるため、また既にテストがされていると仮定するため、実際のSQLを扱うQueryDSLや、MyBatisでテストを行う方が多いです。

## Testcontainerとは？
![image](/images/spring/testcontainer-query-dsl-test-1724076186837.png)

[Testcontainer](https://testcontainers.com)はDockerを利用してテスト環境を構築できるようにするライブラリです。

H2のような組み込みDBのDialectを使用しているDBに合わせてテストを行うこともできますが、実際に使用するDBと同じ環境ではないため、意図しないエラーが発生する可能性があります。

Testcontainerを利用すると、実際に使用しているDBをDockerで起動してテストを行うことができるため、設定さえ注意して行えば、実際の環境と同じ環境でテストを行うことができます。（ただし、H2のような軽量な組み込みDBに比べ、テスト速度が遅い場合があります。）

### Testcontainerとの連携
Testcontainerを使用するためには、`build.gradle`に以下のような依存性を追加します。

私はMySQLを使用しているので、MySQLを使用したテスト依存性を追加しました。

```groovy{filename=build.gradle}
dependencies {
    // ...
    testImplementation 'org.testcontainers:junit-jupiter:1.20.0'
    testImplementation 'org.testcontainers:mysql:1.20.0'
    // ...
}
```

### `QueryDslTestConfig`の定義

QueryDslテストで使用する`QueryDslTestConfig`を定義します。

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

このConfigはテスト環境でQueryDSLが使用する`EntityManager`を注入して`JPAQueryFactory`を生成します。

### `QueryDslTest`クラスの定義

その後、コンテナを毎回設定してテストを進める手間を減らすため、抽象クラス`QueryDslTest`を定義します。

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
`@DataJpaTest`はJPA関連設定のみをロードし、`@Testcontainers`はTestcontainerを使用可能にします。

`@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)`はDataSourceを使用しないように設定します。（後で`@DynamicPropertySource`でコンテナ設定をするため、`DataSource`を代替する必要はありません。）

`@Import(QueryDslTestConfig.class)`はQueryDslTestConfigをロードします。

`@ActiveProfiles("test")`は`application-test.yml`を使用するように設定します。

`@SuppressWarnings("resource")`はコンテナ使用時に発生する警告を無視します。

`@Container`はコンテナを定義します。

スキーマを初期設定する必要がある場合は、`MySQLContainer`の`withInitScript`を使用して初期スキーマを設定できます。 
```java
@Container
public static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0.32")
    // ...
    .withInitScript("init.sql");
```

### テストコード作成のための準備

その後、テストコードを上で定義した`QueryDslTest`を継承して必要なテストの準備をします。

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

`@DynamicPropertySource`を使用すると、動的にDataSourceにコンテナの情報を注入できます。これは一般に`application.yml`に明示する値と同じ内容で、テストコンテナの特性上、継続的に生成・削除されるため、`@DynamicPropertySource`を使用して動的に注入するためです。

この方法が気に入らない場合は、`application-test.yml`にコンテナ情報を注入して一つのコンテナでテストを試してみることもできますが、テーブルの作成・削除作業やテスト間の隔離についての考慮が必要です。

### テストコードの作成

その後、テストコードを作成します。

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

名前を基準に学生を探す単純なテストコードです。

`@BeforeEach`でテスト前にデータを挿入し、`@AfterEach`でテスト後にデータを削除します。

このようにテストを進めると、実際の環境と同じ環境でQueryDslで作成されたコードに対してテストを行うことができるようになります。