---
translated: true
title: Spring BootでRedis Cacheを適用する
type: blog
date: 2025-01-19
comments: true
---

少し前ですが、Locustというツールを通じてAPI負荷テストを行ったことがあります。その際発生した特定のAPIの応答遅延を解決するためにRedis Cacheを適用した経験を共有しようと思います。

## とは?
キャッシュとは、データや値を事前にコピーしておいて速やかにアクセスできるようにするメモリ領域を指します。

基本的にRDBはディスクに保存されているため、単にメモリに保存されているRedisとは比べ物にならない速さで取得できます。

もちろんキャッシュの戦略によって詳細な流れは異なることもありますが、一般的なキャッシュ戦略であるLook-Aside Cacheを基準に説明すると以下の通りです。

### Cache Hit
![image](/images/spring/spring-redis-cache-1737274879529.png)

Cache Hit、つまりキャッシュにデータが存在する場合を指します。この場合、キャッシュに保存されたデータを取り出して使用するため、データを取得するのにかかる時間が非常に速いです。

### Cache Miss
![image](/images/spring/spring-redis-cache-1737274917111.png)

Cache Miss、つまりキャッシュにデータが存在しない場合を指します。この場合、データを取得するためにデータベースや他のストレージからデータを取り出し、Redisでデータをチェックし、DBからデータを取得し、応答を再びRedisに保存する過程を経ます。

そのため、この場合は逆にキャッシュがない場合よりも遅くなることがあります。

## Redisをキャッシュに使用する理由
RedisはRemote Dictionary Serverの略で、メモリベースのKey-Value構造を持っているオープンソースデータベースです。

つまりデータベースと見ればよいです。

一般的にRDBからデータを取得する時でもインデックスがうまく構築されていれば、データを速やかに取得することに大きな問題はありません。

ただ、一般的に検索に対する結果値、ページングなどクエリによる結果値などはかなり膨大な演算を要求するため、そのような結果をキャッシュとして保存しておき、再利用するのです。

## Spring BootでRedis Cacheを適用する

### 1. 依存性の追加
まずRedisを使用するための依存性を追加する必要があります。
```gradle{filename=build.gradle}
implementation 'org.springframework.boot:spring-boot-starter-data-redis'
```

### 2. Redis設定の追加
Redisに接続するための設定を追加する必要があります。
```java{filename=RedisConfig.java}
@RequiredArgsConstructor
@Configuration
@EnableRedisRepositories
public class RedisConfig {

    @Value("${spring.redis.host}")
    private String host;

    @Value("${spring.redis.port}")
    private int port;

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory(host, port);
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate() {
        var redisTemplate = new RedisTemplate<String, Object>();
        redisTemplate.setKeySerializer(new StringRedisSerializer());
        redisTemplate.setValueSerializer(new StringRedisSerializer());
        redisTemplate.setConnectionFactory(redisConnectionFactory());
        
        return redisTemplate;
    }
}
```
まず、`redisConnectionFactory()`でRedisに接続するためのConnectionFactoryを生成し、`LettuceConnectionFactory`を使用しました。通常、Redisに接続するJavaクライアントにはJedisとLettuceの2つがありますが、Lettuceは非同期処理をサポートしており、Nettyを使用しているため、より速いとされています。

`redisTemplate()`はRedisにデータを保存し、取得するためのTemplateです。`setKeySerializer()`、`setValueSerializer()`を通じてKeyとValueのSerializerを設定しました。
簡単に`StringRedisSerializer`を使用しました。

### 3. キャッシュ設定の追加
```java
@Configuration
@EnableCaching
public class CacheConfig {
    private Jackson2JsonRedisSerializer<Object> jackson2JsonRedisSerializer() {
        var objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        objectMapper.enable(MapperFeature.ACCEPT_CASE_INSENSITIVE_ENUMS);
        objectMapper.configure(
            JsonReadFeature.ALLOW_BACKSLASH_ESCAPING_ANY_CHARACTER.mappedFeature(), true);
        objectMapper.activateDefaultTyping(
            objectMapper.getPolymorphicTypeValidator(),
            ObjectMapper.DefaultTyping.EVERYTHING,
            JsonTypeInfo.As.WRAPPER_OBJECT
        );
        objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);

        return new Jackson2JsonRedisSerializer<>(objectMapper, Object.class);
    }


    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration defaultCacheConfig =
            RedisCacheConfiguration.defaultCacheConfig()
                // TTL設定 (例: 60秒)
                .entryTtl(Duration.ofSeconds(60))
                // null 値キャッシュ防止
                .disableCachingNullValues()
                // key 直列化
                .serializeKeysWith(
                    RedisSerializationContext.SerializationPair.fromSerializer(
                        new StringRedisSerializer()))
                // value 直列化
                .serializeValuesWith(
                    RedisSerializationContext.SerializationPair.fromSerializer(
                        jackson2JsonRedisSerializer()));

        return RedisCacheManager
            .builder(connectionFactory)
            .cacheDefaults(defaultCacheConfig)
            .build();
    }
}
```

キャッシュを設定するためにCacheConfigクラスを生成しました。

- `jackson2JsonRedisSerializer()` メソッドは `Jackson2JsonRedisSerializer`を生成し、ObjectMapperを通じてJSON直列化を設定しました。
`registerModule()`を通じて `JavaTimeModule`を登録しました。これはJava 8のDate/Time APIを問題なく直列化/逆直列化するためです。
これを設定しないと `java.time` パッケージのオブジェクトを直列化する際に次のようなエラーが発生します。
    ```
    com.fasterxml.jackson.databind.exc.InvalidDefinitionException: No serializer found for class java.time.LocalDateTime and no properties discovered to create BeanSerializer (to avoid exception, disable SerializationFeature.FAIL_ON_EMPTY_BEANS)
    ```
  - `disable()`を通じて `WRITE_DATES_AS_TIMESTAMPS`を無効化しました。これはDate/TimeオブジェクトをTimestampとして直列化しないように設定したものです。
  - `enable()`を通じて `ACCEPT_CASE_INSENSITIVE_ENUMS`を有効化しました。これはEnumの大文字小文字を区別しないように設定したものです。
  - `configure()`を通じて `ALLOW_BACKSLASH_ESCAPING_ANY_CHARACTER`を有効化しました。これはJSON文字列でバックスラッシュをエスケープできるように設定したものです。
  - `activateDefaultTyping()`を通じて `EVERYTHING`を設定しました。これはすべてのオブジェクトに対してタイプ情報を直列化するように設定したものです。
    - これを設定すると、JSONを保存する際に `@class` フィールドがJSONに追加され、すべてのオブジェクトに対するタイプ情報を保存できます。これにより、オブジェクトを逆直列化する際にタイプ情報を参照できます。
    > ただし、この方法の場合、タイプの位置を変更するなどの場合にそのタイプを認識できない問題が発生するため、デプロイ時にキャッシュを削除するなどの方法を考慮する必要があります。
  - `setSerializationInclusion()`を通じて `NON_NULL`を設定しました。これはnull値が含まれたフィールドを直列化しないように設定したものです。
- `cacheManager()` メソッドは `RedisCacheManager`を生成し、これはRedisにキャッシュを保存し取得する際の詳細設定を担当します。
  - `defaultCacheConfig()`を通じて基本キャッシュ設定を取得し、`entryTtl()`を通じてキャッシュのTTLを設定しました。ここでは60秒に設定しました。（長すぎるとキャッシュと実際のデータの不整合が発生する可能性があるため、キャッシュ時間およびキャッシュ更新戦略を慎重に設定する必要があります。）

### 4. Cacheable、CacheEvict、CachePutの使用
#### `@Cacheable`
`@Cacheable`アノテーションはメソッドの結果をキャッシュに保存し、同じパラメータで呼び出された際にキャッシュされた結果を返します。
```java
@RestContoller
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping("/products/{id}")
    @Cacheable(value = "product", key = "#id")
    public Product getProduct(@PathVariable Long id) {
        return productService.getProduct(id);
    }
}
```
`@Cacheable`アノテーションはキャッシュを使用するメソッドに追加し、`value`を通じてキャッシュ名を設定し、`key`を通じてキャッシュキーを設定します。


#### `@CacheEvict`
`@CacheEvict`アノテーションは該当のメソッド呼び出し時にキャッシュからデータを削除します。
リストを表示するような場合、生成、修正や、削除が発生する時、どのデータがリスト表示に影響を与えるか見極めが難しいため、キャッシュを削除するように戦略を設定できます。

単一表示のAPIキャッシュであっても、特定のID値のデータが変更された時にキャッシュを削除するのが安全でしょう。
```java
@RestContoller
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping("/products/{id}")
    @Cacheable(value = "product", key = "#id")
    public Product getProduct(@PathVariable Long id) {
        return productService.getProduct(id);
    }

    @PostMapping("/products")
    @CacheEvict(value = "product", allEntries = true) # リストで表示するAPIがないなら特に指定する必要はありません。
    public Product createProduct(@RequestBody Product product) {
        return productService.createProduct(product);
    }
}
```
`@CacheEvict`アノテーションはキャッシュを削除するメソッドに追加し、`value`を通じてキャッシュ名を設定し、`allEntries`を通じて全てのキャッシュを削除するかどうかを設定します。
- 単一の表示が存在する場合、`key`を通じて特定のキーのみキャッシュを削除することができます。

#### `@CachePut`
`@CachePut`アノテーションはメソッドの結果をキャッシュに保存し、メソッドを呼び出さずにキャッシュされた結果を返します。
```java
@RestContoller
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping("/products/{id}")
    @Cacheable(value = "product", key = "#id")
    public Product getProduct(@PathVariable Long id) {
        return productService.getProduct(id);
    }
    
    @GetMapping("/products")
    @Cacheable(value = "product")
    public ListProductsResponse listProducts() {
        return productService.listProducts();
    }

    @PostMapping("/products")
    @CacheEvict(value = "product", allEntries = true) # リストで表示するAPIがないなら特に指定する必要はありません。単一表示があるならCachePutを使用するのも方法でしょう。
    public Product createProduct(@RequestBody Product product) {
        return productService.createProduct(product);
    }

    @PutMapping("/products/{id}")
    @CachePut(value = "product", key = "#id")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return productService.updateProduct(id, product);
    }
}
```
`@CachePut`アノテーションはキャッシュを更新するメソッドに追加し、`value`を通じてキャッシュ名を設定し、`key`を通じてキャッシュキーを設定します。

## キャッシュは必ず使うべきか？
データが多ければ多いほど、同じ応答を複数回繰り返す場合が多ければ多いほど計算が複雑であればあるほどキャッシュを使用することが望ましいです。

一般に画像、動画などの静的データは変更されることが非常に少ないため、大多数のブラウザ、CDNでもキャッシュを使用します。

しかし、データが頻繁に変更される場合、キャッシュを使用しない方が良い場合もあります。
むしろリアルタイム性が重要なデータ（例：口座残高、配送情報など）に関してはキャッシュを使用しない方がはるかに良いでしょう。（データ不整合を解消するのはもっと大変だからです。）

結局、キャッシュを使用すべきかどうかはデータの特性、ユーザーの行動パターン、サービスの特性などを考慮する必要があり、キャッシュの時間、キャッシュの更新戦略などもこのような部分を非常に慎重に検討する必要があります。
