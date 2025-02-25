---
title: Output Pattern and JSON Logs Using Logback in Spring Boot
type: blog
date: 2024-06-17
comments: true
translated: true
---
![image](/images/spring/logback_json-1718636794759.gif)

When operating an API server, it is common to leave logs for operational reasons or debugging.

Traditionally, in Spring, while there is a format for leaving logs, they are often left in Raw Text form, which I think is better for visibility than leaving them in JSON form.

However, the story is different when searching and filtering logs. In platforms like AWS CloudWatch where logs can be searched, logging in Raw Text format makes it difficult to filter which function emitted which data.

It becomes especially challenging when you need to search under multiple combined conditions.

While this issue can generally be resolved by adding specific keywords to the logs and searching with those keywords, leaving logs in JSON format makes formal searches easier.
(I’m not sure of the exact implementation, but perhaps setting up parts like indexing could be advantageous.)

To address this, let's explore how to separate logs into Raw Text for local environments and JSON format for deployment environments to enhance visibility and facilitate searching.

## Logback

Logback is an implementation of SLF4J, which is the default logging library used in Spring Boot.

By simply adding the `spring-boot-starter-web` dependency, Logback is automatically included, eliminating the need for additional dependency inclusion.

## Slf4j

Slf4j stands for **Simple Logging Facade for Java**, and it's an interface that abstracts Java's logging libraries.

Since it's purely an interface, various logging libraries such as [Logback](https://logback.qos.ch/), [Log4j](https://logging.apache.org/log4j/2.x/), [Log4j2](https://logging.apache.org/log4j/2.12.x/), [JUL](https://docs.oracle.com/javase/8/docs/api/java/util/logging/package-summary.html) can be used.

The rationale behind this setup is likely to facilitate easy switching of implementations in case a vulnerability is discovered in a specific logging library.

## Logback Configuration

Logback configuration is primarily set up using a `logback-spring.xml` file.

This configuration comprises three main components: Appender, Logger, and Encoder.

### Appender

Appender determines where the log will be output.

By default, there are various Appenders like `ConsoleAppender`, `FileAppender`, `RollingFileAppender`, and `SyslogAppender`.

### Logger

Logger decides the target to which the logs will be recorded.

Logger possesses a name and only logs attached to that named Logger are recorded.

### Encoder

Encoder decides the format in which the log will be output.

By default, with `PatternLayoutEncoder`, you can log in Raw Text format, and with `JsonEncoder`, you can log in JSON format.

I will guide you on how to use `PatternLayoutEncoder` for local environments and `JsonLayout` for deployment environments.

## JsonLayout

`JsonLayout` is a Layout provided by Logback that enables logs to be output in JSON format.

To use `JsonLayout`, `logback-json-classic` and `logback-jackson` dependencies need to be added.

```gradle
dependencies {
    implementation 'ch.qos.logback.contrib:logback-json-classic:0.1.5'
    implementation 'ch.qos.logback.contrib:logback-jackson:0.1.5'
	implementation 'com.fasterxml.jackson.core:jackson-databind:2.15.2'
}
```

## `logback-spring.xml`

Next, create a `logback-spring.xml` file under the `resources` directory and configure it as follows.

### Appender Configuration

First, configure the Appender that will output logs in JSON format.

The dependencies we have received will be utilized in the layout part.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration scan="true" scanPeriod="30 seconds">
    <appender class="ch.qos.logback.core.ConsoleAppender" name="CONSOLE_JSON">
        <encoder class="ch.qos.logback.core.encoder.LayoutWrappingEncoder">
            <layout class="ch.qos.logback.contrib.json.classic.JsonLayout">
                <appendLineSeparator>true</appendLineSeparator>
                <jsonFormatter class="ch.qos.logback.contrib.jackson.JacksonJsonFormatter"/>
                <timestampFormat>yyyy-MM-dd'T'HH:mm:ss.SSS'Z'</timestampFormat>
                <timestampFormatTimezoneId>Etc/Utc</timestampFormatTimezoneId>
            </layout>
        </encoder>
    </appender>
    <appender class="ch.qos.logback.core.ConsoleAppender" name="CONSOLE_STDOUT">
        <encoder>
            <pattern>[%thread] %highlight([%-5level]) %cyan(%logger{15}) - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- Excerpt omitted -->

</configuration>
```

> Only the appender has been configured so far; the part for actual log usage hasn't been set up yet.

The pattern is configured concisely to only print the Logger and Message.

#### `CONSOLE_JSON` Appender

`CONSOLE_JSON` Appender is configured to output logs in JSON format.
Further configurations are as follows:

- `timestampFormat`: Specifies the date format. (I set it to RFC3339 format.)
- `timestampFormatTimezoneId` specifies the timezone.

#### `CONSOLE_STDOUT` Appender

`CONSOLE_STDOUT` Appender is configured to output logs in Raw Text format.

### Logger Configuration

Now, configure which Appender to use based on the profile.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration scan="true" scanPeriod="30 seconds">

    <!-- Excerpt omitted -->
    
    <springProfile name="qa, dev">
        <root level="INFO">
            <appender-ref ref="CONSOLE_JSON"/>
        </root>
    </springProfile>
    <springProfile name="local">
        <root level="INFO">
            <appender-ref ref="CONSOLE_STDOUT"/>
        </root>
    </springProfile>
</configuration>
```

In this setting, Appenders are configured based on profiles using the `springProfile` tag.

- `qa`, `dev` profiles are set to use the `CONSOLE_JSON` Appender.
- `local` profile is set to use the `CONSOLE_STDOUT` Appender.

## Example Code
```java
package com.example.demo.product.service;

import com.example.demo.product.domain.dto.ProductDto;
import com.example.demo.product.repository.ProductRepository;
import com.example.demo.product.util.EventNumberPicker;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<ProductDto> listProducts() {
        log.info("Hello World");
        
        return productRepository
            .findAll()
            .stream()
            .map(product -> new ProductDto(product, EventNumberPicker.pick(1, 1000)))
            .toList();
    }
}
```

## Result
By dividing logging like this by environment, local environments can retain visibility while also enabling more convenient searching in deployment environments.

### `CONSOLE_STDOUT`
![image](/images/spring/logback_json-1718636141145.png)

### `CONSOLE_JSON`
![image](/images/spring/logback_json-1718636188423.png)
> Although I personally find it messy, searching will become more convenient.

## Reference 
- [Logback](https://logback.qos.ch/)
- [Slf4j](http://www.slf4j.org/)
- [Parsing logs to JSON format using logback](https://velog.io/@choihuk/logback%EC%9D%84-%ED%99%9C%EC%9A%A9%ED%95%98%EC%97%AC-%EB%A1%9C%EA%B7%B8%EB%A5%BC-json-%ED%98%95%EC%8B%9D%EC%9C%BC%EB%A1%9C-%ED%8C%8C%EC%8B%B1%ED%95%98%EA%B8%B0-%EB%A1%9C%EA%B7%B8-%EC%8B%9C%EC%8A%A4%ED%85%9C-3)
- [Setting up Logback in Springboot (logback-spring.xml)](https://velog.io/@woosim34/Springboot-Logback-%EC%84%A4%EC%A0%95%ED%95%B4%EB%B3%B4%EA%B8%B0)
- [Using Logback for logging separate log environments](https://blog.pium.life/server-logging/)
- [Parsing logs to JSON format using Logback [Log System 3]](https://velog.io/@choihuk/logback%EC%9D%84-%ED%99%9C%EC%9A%A9%ED%95%98%EC%97%AC-%EB%A1%9C%EA%B7%B8%EB%A5%BC-json-%ED%98%95%EC%8B%9D%EC%9C%BC%EB%A1%9C-%ED%8C%8C%EC%8B%B1%ED%95%98%EA%B8%B0-%EB%A1%9C%EA%B7%B8-%EC%8B%9C%EC%8A%A4%ED%85%9C-3)