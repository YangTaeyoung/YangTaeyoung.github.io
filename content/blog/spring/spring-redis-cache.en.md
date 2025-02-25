---
title: Applying Redis Cache in Spring Boot
type: blog
date: 2025-01-19
comments: true
translated: true
---

A while ago, I conducted API load testing using a tool called Locust. I want to share my experience of implementing Redis Cache to resolve response delays for a particular API that occurred at that time.

## What is Cache?

Cache refers to a memory area where data or values are pre-copied so they can be accessed quickly.

RDBs are stored on disk, so they are incomparable in speed to Redis, which is simply stored in memory.

Of course, the detailed flow can vary depending on the cache strategy, but based on the general cache strategy called Look-Aside Cache, it is as follows:

### Cache Hit
![image](/images/spring/spring-redis-cache-1737274879529.png)

Cache Hit refers to when data exists in the cache. In this case, the time taken to fetch data is very fast as it uses the data stored in the cache.

### Cache Miss
![image](/images/spring/spring-redis-cache-1737274917111.png)

Cache Miss refers to when data does not exist in the cache. In this case, data is fetched from the database or another storage, checked with Redis, fetched from the DB, and the response is stored back in Redis.

Therefore, in this case, it can be slower than when there is no cache.

## Why use Redis as a cache?

Redis, short for Remote Dictionary Server, is an open-source database with a memory-based Key-Value structure.

Literal view means it is a database.

Even if data is fetched from the RDB, as long as indexing is well done, there is no big problem in fetching data quickly.

However, in general, result values for searches, results from queries like pagination require quite a large amount of computation, so such result values are stored in cache and reused.

## Applying Redis Cache in Spring Boot

### 1. Add dependencies
Firstly, add dependencies to use Redis.
```gradle{filename=build.gradle}
implementation 'org.springframework.boot:spring-boot-starter-data-redis'
```

### 2. Add Redis configuration
Add configuration to connect to Redis.
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
First is `redisConnectionFactory()`, creating a ConnectionFactory for connecting to Redis, using `LettuceConnectionFactory`. Generally, for Java clients connecting to Redis, there are Jedis and Lettuce, but Lettuce is said to be faster due to supporting asynchronous processing and using Netty.

`redisTemplate()` is a Template for storing and retrieving data from Redis. `setKeySerializer()` and `setValueSerializer()` set the Serializer for Key and Value.
Simply, `StringRedisSerializer` is used.

### 3. Add Cache configuration
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
                // Set TTL (example: 60 seconds)
                .entryTtl(Duration.ofSeconds(60))
                // Prevent caching null values
                .disableCachingNullValues()
                // Key serialization
                .serializeKeysWith(
                    RedisSerializationContext.SerializationPair.fromSerializer(
                        new StringRedisSerializer()))
                // Value serialization
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

To set up the cache, a CacheConfig class was created.

- The `jackson2JsonRedisSerializer()` method creates a `Jackson2JsonRedisSerializer`, configuring JSON serialization through an ObjectMapper.
  `registerModule()` registers a `JavaTimeModule` to serialize/deserialize Java 8's Date/Time API without issues.
  If this is not set, the following error occurs when serializing objects from the `java.time` package:
    ```
    com.fasterxml.jackson.databind.exc.InvalidDefinitionException: No serializer found for class java.time.LocalDateTime and no properties discovered to create BeanSerializer (to avoid exception, disable SerializationFeature.FAIL_ON_EMPTY_BEANS)
    ```
  - `disable()` deactivates `WRITE_DATES_AS_TIMESTAMPS`, configuring not to serialize Date/Time objects as Timestamps.
  - `enable()` activates `ACCEPT_CASE_INSENSITIVE_ENUMS`, setting it to ignore case sensitivity of Enums.
  - `configure()` enables `ALLOW_BACKSLASH_ESCAPING_ANY_CHARACTER`, allowing escape of backslashes in JSON strings.
  - `activateDefaultTyping()` sets `EVERYTHING`, configuring to serialize type information for all objects.
    - With this setting, a `@class` field is added to JSON when stored, allowing to save type information for all objects, which can be referenced during deserialization.
    > However, with this method, if the type's position changes, the type may not be recognized, requiring cache invalidation during deployment.
  - `setSerializationInclusion()` sets `NON_NULL`, configuring not to serialize fields containing null values.
- The `cacheManager()` method creates a `RedisCacheManager`, responsible for detailed settings when storing and retrieving cache in Redis.
  - `defaultCacheConfig()` fetches the default cache configuration, and `entryTtl()` sets the TTL of the cache, set to 60 seconds here. (Setting too long can cause cache and real data inconsistency, requiring careful setting of cache time and cache update strategies.)

### 4. Using Cacheable, CacheEvict, CachePut
#### `@Cacheable`
The `@Cacheable` annotation stores the results of a method in cache and returns cached results when called with the same parameters.
```java
@RestController
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
Add the `@Cacheable` annotation to a method using cache, setting cache name with `value` and cache key with `key`.

#### `@CacheEvict`
The `@CacheEvict` annotation deletes data from the cache when the method is called. 
For queries like lists, when creation, modification, or deletion occurs, it’s hard to know what data can affect list queries, so one can configure strategies to delete caches.

Even for cache on single query APIs, it is safe to delete the cache when the data with a specific ID changes.
```java
@RestController
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping("/products/{id}")
    @Cacheable(value = "product", key = "#id")
    public Product getProduct(@PathVariable Long id) {
        return productService.getProduct(id);
    }

    @PostMapping("/products")
    @CacheEvict(value = "product", allEntries = true) # If there is no API for list retrieval, you don't need to specify this
    public Product createProduct(@RequestBody Product product) {
        return productService.createProduct(product);
    }
}
```
Add the `@CacheEvict` annotation to a method to delete a cache, setting cache name with `value` and determining whether to clear all caches with `allEntries`.
- If there is only single data retrieval, you can set to delete a specific key's cache using `key`.

#### `@CachePut`
The `@CachePut` annotation stores the results of a method in cache and returns cached results without calling the method.
```java
@RestController
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
    @CacheEvict(value = "product", allEntries = true) # If there's no list retrieval API, there's no need to specify. If there is single retrieval, using CachePut might be a way.
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
Add the `@CachePut` annotation to a method to update cache, setting cache name with `value` and cache key with `key`.

## Should Cache be Used Mandatorily?

The more data, the more repeated responses, and the more complex calculations, the better it is to use the cache.

Typically, static data like images and videos rarely change, so most browsers and CDNs use caches too.

However, if data changes frequently, there might be cases where it’s better not to use cache.
Especially for data where real-time is crucial (e.g., account balances, delivery information), it's more beneficial not to use cache (because resolving data inconsistencies could be more difficult).

Ultimately, whether to use cache or not should be determined by considering the characteristics of the data, user behavior patterns, and service characteristics. Cache time and cache update strategies should also be carefully considered in these parts.