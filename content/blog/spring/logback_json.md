---
title: Spring Boot에서 Logback을 이용한 JSON 로그 출력하기
type: blog
date: 2024-06-17
comments: true
---
![image](/images/spring/logback_json-1718636794759.gif)

API 서버를 운영하다 보면 운영 사항에 대해 로그를 남기거나, 디버그를 위해 로그를 남기는 경우가 많다.

전통적으로 스프링에서는 Log를 남길 때 포맷이 존재하긴 하나, Raw Text 형태로 남기는 경우가 많고, 이와 같은 경우 필자의 경우 가시성에 있어서는 JSON 형태로 로그를 남기는 것 보다 더 좋다고 생각한다.

다만 로그를 검색하고, 필터링 하는 경우에는 이야기가 다른데, AWS CloudWatch 와 같이 로그를 검색할 수 있는 플랫폼의 경우 Raw Text 형태로 로깅하면 어떤 함수에서 어떤 데이터가 나왔는지 필터링이 어렵다.

특히 복합적으로 여러 조건 하에서 검색해야 하는 경우 더욱 어렵다.

물론 일반적으로 로그에 특정 키워드를 추가하여 해당 키워드를 함께 검색하면 문제는 없겠지만, JSON 형태로 로그를 남기면 형식적으로 검색이 더 쉬워진다.
(자세한 구현은 모르지만, 아마 인덱싱 같은 부분도 설정한다면 이점이 있지 않을까 싶다.)

이를 위해 로컬에서는 좀 더 가시성 있게 Raw Text 형태로, 배포 환경에서는 JSON 형태로 로그를 분리하여 남기는 방법을 알아보자.

## Logback

Logback은 SLF4J의 구현체로, Spring Boot에서 기본적으로 사용하는 로깅 라이브러리이다.

기본적으로 `spring-boot-starter-web` 의존성을 추가하면 Logback이 자동으로 추가되므로, 별도의 의존성 추가는 필요하지 않다.

## Slf4j

Slf4j는 **Simple Logging Facade for Java**의 약자로, Java의 로깅 라이브러리를 추상화한 인터페이스이다.

말 그대로 인터페이스이기 때문에, 실제
구현체는 [Logback](https://logback.qos.ch/), [Log4j](https://logging.apache.org/log4j/2.x/), [Log4j2](https://logging.apache.org/log4j/2.12.x/), [JUL](https://docs.oracle.com/javase/8/docs/api/java/util/logging/package-summary.html)
등 다양한 로깅 라이브러리를 사용할 수 있다.

이렇게 해 둔 이유는 만약 특정 로깅 라이브러리에서 취약점이 발견되어서 다른 로깅 라이브러리로 변경해야 하는 경우, 구현체만 변경하면 되기 때문일 것으로 보인다.

## Logback 설정

기본적으로 Logback 설정은 `logback-spring.xml` 파일을 생성하여 설정할 수 있다.

해당 구성은 크게, Appender, Logger, Encoder 로 구성된다.

### Appender

Appender는 로그를 어디에 출력할지를 결정하는 역할을 한다.

기본적으로 `ConsoleAppender`, `FileAppender`, `RollingFileAppender`, `SyslogAppender` 등 다양한 Appender 가 존재한다.

### Logger

Logger는 로그를 남길 대상을 결정하는 역할을 한다.

Logger는 이름을 가지며, 해당 이름을 가진 Logger에 대해서만 로그를 남긴다.

### Encoder

Encoder는 로그를 어떤 형식으로 출력할지를 결정하는 역할을 한다.

기본적으로 `PatternLayoutEncoder`를 사용하면 Raw Text 형태로 로그를 남길 수 있으며, `JsonEncoder`를 사용하면 JSON 형태로 로그를 남길 수 있다.

필자는 로컬에서는 `PatternLayoutEncoder`를 사용하고, 배포 환경에서는 `JsonLayout`를 사용하여 로그를 남기는 방법을 안내할 것이다.

## JsonLayout

`JsonLayout`은 Logback에서 제공하는 Layout으로, 로그를 JSON 형태로 출력할 수 있게 해준다.

`JsonLayout`을 사용하기 위해서는 `logback-json-classic`과 `logback-jackson` 의존성을 추가해야 한다.

```gradle
dependencies {
    implementation 'ch.qos.logback.contrib:logback-json-classic:0.1.5'
    implementation 'ch.qos.logback.contrib:logback-jackson:0.1.5'
	implementation 'com.fasterxml.jackson.core:jackson-databind:2.15.2'
}
```

## `logback-spring.xml`

이후 `resources` 디렉토리 하위에 `logback-spring.xml` 파일을 생성하고 다음과 같이 설정한다.

### Appender 설정

먼저 JSON 형태로 로그를 출력할 Appender를 설정한다.

우리가 받은 의존성은 layout 파트에서 사용한다.

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

    <!-- 중략 -->

</configuration>
```

> 아직은 appender 만 설정한 것으로 실제 로그를 사용하는 부분은 아직 설정하지 않았다.

패턴은 간결하게 Logger, Message 만 출력하도록 설정하였다.

#### `CONSOLE_JSON` Appender

`CONSOLE_JSON` Appender는 JSON 형태로 로그를 출력하도록 설정하였다.
이후 추가적인 설정은 아래와 같다.

- `timestampFormat`: 은 날짜 형식을 지정한다. (필자는 RFC3339 형식으로 지정하였다.)
- `timestampFormatTimezoneId`는 타임존을 지정한다.

#### `CONSOLE_STDOUT` Appender

`CONSOLE_STDOUT` Appender는 Raw Text 형태로 로그를 출력하도록 설정하였다.

### Logger 설정

이제 프로필에 따라 로그를 출력할 Appender를 설정한다.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration scan="true" scanPeriod="30 seconds">

    <!-- 중략 -->
    
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

위 설저엥서는 `springProfile` 태그를 사용하여 프로필에 따라 로그를 출력할 Appender를 설정하였다.

- `qa`, `dev` 프로필에서는 `CONSOLE_JSON` Appender를 사용하도록 설정하였다.
- `local` 프로필에서는 `CONSOLE_STDOUT` Appender를 사용하도록 설정하였다.



## 예시 코드
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

## 결과
환경별로 로깅을 이렇게 나누면 로컬에서는 가시성을 가져가면서도, 동시에 배포 환경에서는 검색을 좀 더 편하게 할 수 있을 것이다.

### `CONSOLE_STDOUT`
![image](/images/spring/logback_json-1718636141145.png)

### `CONSOLE_JSON`
![image](/images/spring/logback_json-1718636188423.png)
> 개인적으로는 더럽다고 생각하지만, 검색은 편해질 것이다.

## Reference 
- [Logback](https://logback.qos.ch/)
- [Slf4j](http://www.slf4j.org/)
- [logback을 활용하여 로그를 json 형식으로 파싱하기](https://velog.io/@choihuk/logback%EC%9D%84-%ED%99%9C%EC%9A%A9%ED%95%98%EC%97%AC-%EB%A1%9C%EA%B7%B8%EB%A5%BC-json-%ED%98%95%EC%8B%9D%EC%9C%BC%EB%A1%9C-%ED%8C%8C%EC%8B%B1%ED%95%98%EA%B8%B0-%EB%A1%9C%EA%B7%B8-%EC%8B%9C%EC%8A%A4%ED%85%9C-3)
- [Springboot에서 Logback 설정하기(logback-spring.xml)](https://velog.io/@woosim34/Springboot-Logback-%EC%84%A4%EC%A0%95%ED%95%B4%EB%B3%B4%EA%B8%B0)
- [Logback을 이용해 운영 환경 별 로그 남기기](https://blog.pium.life/server-logging/)
- [logback을 활용하여 로그를 json 형식으로 파싱하기 [로그 시스템 3]](https://velog.io/@choihuk/logback%EC%9D%84-%ED%99%9C%EC%9A%A9%ED%95%98%EC%97%AC-%EB%A1%9C%EA%B7%B8%EB%A5%BC-json-%ED%98%95%EC%8B%9D%EC%9C%BC%EB%A1%9C-%ED%8C%8C%EC%8B%B1%ED%95%98%EA%B8%B0-%EB%A1%9C%EA%B7%B8-%EC%8B%9C%EC%8A%A4%ED%85%9C-3)