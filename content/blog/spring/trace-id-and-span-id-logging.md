---
title: Spring에서 Micrometer를 활용하여 Trace ID와 Span ID 로깅하기
type: blog
date: 2024-06-24
comments: true
---
![image](/images/spring/trace-id-and-span-id-logging-1719164294946.png)

디버깅을 위해 로깅을 하다보면, 특히나 분산 시스템에서는 로깅을 통해 트랜잭션의 흐름을 파악하기 어려울 수 있다.

특히나 프로덕션 환경에서는 디버깅을 위해 여러 단계에 정상 요청에 대한 파라미터나, 리턴에 대한 정보를 로깅하기도 하는데, 이런 로그들의 특징은 동시에 여러 요청이 들어올 경우, 로그들이 섞이게 되어 특정 로그가 어떤 요청에 대한 로그인지 파악하기 어려울 수 있다.

또한 에러 발생 시 에러가 발생된 요청에 대한 로그들을 파악하기 어려울 수 있다.

이런 경우 `Trace ID`와 `Span ID`를 활용하여 로깅을 하면 로그의 구분 및 검색 면에서 트랜잭션의 흐름을 파악하기 좀 더 용이해질 수 있다.

## 사전 지식
- 해당 파트에서는 로깅을 위한 라이브러리 등은 다루지 않는다. 
- Spring에서 로깅을 하는 방식 및 JSON 필드를 추가하는 방법, 환경별 로그 포맷 분리에 대한 부분은 이전 포스팅 [_"Spring Boot에서 Logback을 이용한 Pattern 로그 및 JSON 로그 출력하기"_](/blog/spring/logback_json) 를 참고하자.
- 해당 파트에서는 Logback을 사용하며, Logback 설정은 `logback-spring.xml` 파일을 사용한다.

## Trace ID vs Span ID
- `Trace ID`: 전체 트랜잭션을 추적하기 위한 ID, Microservice 간에서도 동일한 ID를 유지한다.
- `Span ID`: 트랜잭션 내에서의 각각의 단위를 추적하기 위한 ID, Microservice 내에서만 유지한다.

## Micrometer
[Micrometer](https://micrometer.io/)는 애플리케이션의 성능을 측정하기 위한 메트릭을 수집하는 라이브러리이다. Micrometer는 Spring Boot와 Spring Cloud에서 사용할 수 있으며, Zipkin, Prometheus, Graphite 등 다양한 모니터링 시스템과 연동할 수 있다.

사실 좀 더 복잡하고 다양한 기능을 갖고 있지만, 여기서는 Micrometer가 요청 당 Trace ID, Span ID를 부여하는 기능만을 이용하여 이를 로깅에 활용할 것이다.
> Zipkin과 연동하여 트레이싱을 하는 방법은 추후 다른 포스팅에서 다룰 것이다.

## 의존성 설정
여러 트레이스 도구를 사용하고 싶다면 더 많은 의존성을 추가해야 하지만, Trace ID와 Span ID를 이용하기 위해서는 아래 두 의존성만 추가해주면 된다

```gradle{filename="build.gradle"}
dependencies {
    // micrometer
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    implementation 'io.micrometer:micrometer-tracing-bridge-brave'
}
```

여기서 spring-boot-starter-actuator는 Spring Boot Actuator를 사용하기 위한 의존성이며, 어플리케이션의 작동 방법을 모니터링하고 관리할 수 있는 기능을 제공한다.

## 로깅 설정
해당 설정을 하는 것만으로도 Trace ID와 Span ID를 로깅에 추가할 수 있다.

Micrometer에서 Trace ID와 Span ID를 MDC에 추가해주기 때문에, 우리는 Logback에서 MDC를 활용하여 Trace ID와 Span ID를 로깅에 추가할 수 있다.
> MDC는 Mutable Diagnostic Context의 약자로, 로깅 시 추가적인 정보를 로깅에 추가할 수 있도록 해준다.

```xml{filename="src/main/resources/logback-spring.xml"}
<?xml version="1.0" encoding="UTF-8"?>
<configuration scan="true" scanPeriod="30 seconds">

  <appender class="ch.qos.logback.core.ConsoleAppender" name="CONSOLE_JSON">
    <encoder class="ch.qos.logback.core.encoder.LayoutWrappingEncoder">
      <layout class="com.example.demo.common.log.TraceJsonLayout">
        <appendLineSeparator>true</appendLineSeparator>
        <jsonFormatter class="ch.qos.logback.contrib.jackson.JacksonJsonFormatter"/>
        <timestampFormat>yyyy-MM-dd'T'HH:mm:ss.SSS'Z'</timestampFormat>
        <timestampFormatTimezoneId>Etc/Utc</timestampFormatTimezoneId>
      </layout>
    </encoder>
  </appender>
  <appender class="ch.qos.logback.core.ConsoleAppender" name="CONSOLE_STDOUT">
    <encoder>
      <pattern>[%thread] %highlight([%-5level traceId=%X{traceId} spanId=%X{spanId}]) %cyan(%logger{15}) - %msg%n</pattern>
    </encoder>
  </appender>
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

사실 다른 부분은 이전에 포스팅 했던 부분과 같으며 주목해야 할 점은 `%X{traceId}`와 `%X{spanId}`를 추가한 부분이다. 이렇게 %X{변수명}을 추가하면 MDC에 있는 변수를 로깅에 추가할 수 있다.

또한 이전에 있던 `<layout class="com.example.demo.common.log.TraceJsonLayout">`은 `JsonLayout`을 상속 받아 아래와 같이 `toMap()` 메소드를 오버라이딩하여 MDC에 있는 `traceId`와 `spanId`를 추가했다

```java{filename="TraceJsonLayout.java"}
package com.example.demo.common.log;

import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.contrib.json.classic.JsonLayout;
import java.util.Map;

public class TraceJsonLayout extends JsonLayout {

    @Override
    protected Map toJsonMap(ILoggingEvent event) {
        var map = super.toJsonMap(event);

        add("traceId", true, event.getMDCPropertyMap().get("traceId"), map);
        add("spanId", true, event.getMDCPropertyMap().get("spanId"), map);

        return map;
    }
}
```

## 결과
이렇게 하면 다음과 같이 로그를 얻을 수 있다.

### JSON 로그
![image](/images/spring/trace-id-and-span-id-logging-1719163927752.png)

### Console 로그
![image](/images/spring/trace-id-and-span-id-logging-1719163985720.png)

