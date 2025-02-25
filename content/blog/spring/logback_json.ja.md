---
title: Spring BootでLogbackを利用したパターンログとJSONログの出力
type: blog
date: 2024-06-17
comments: true
translated: true
---
![image](/images/spring/logback_json-1718636794759.gif)

APIサーバーを運用していると、運用状況についてログを残したり、デバッグのためにログを残すことが多い。

伝統的にSpringではログを残す時にフォーマットが存在するが、Raw Text形式で残すことが多く、このような場合、筆者としては可視性の面ではJSON形式でログを残すよりも良いと考える。

しかし、ログを検索し、フィルタリングする場合には話が異なり、AWS CloudWatchのようにログを検索できるプラットフォームの場合、Raw Text形式でロギングするとどの関数でどのデータが出力されたのかフィルタリングが難しい。

特に複合的に複数の条件で検索しなければならない場合はさらに難しい。

もちろん通常、ログに特定のキーワードを追加してそのキーワードと一緒に検索すれば問題はないが、JSON形式でログを残せば形式的に検索がより容易になる。
(詳細な実装は分からないが、おそらくインデキシングのような部分も設定すれば利点があるのではないかと思う。)

これを実現するために、ローカルではより可視性の高いRaw Text形式で、デプロイ環境ではJSON形式でログを分けて残す方法を見てみよう。

## Logback

LogbackはSLF4Jの実装であり、Spring Bootで基本的に使用されているロギングライブラリである。

基本的に`spring-boot-starter-web`依存関係を追加するとLogbackが自動的に追加されるため、特別な依存関係の追加は必要ない。

## Slf4j

Slf4jは**Simple Logging Facade for Java**の略称で、Javaのロギングライブラリを抽象化したインターフェイスである。

文字通りインターフェイスであるため、実際の実装は[Logback](https://logback.qos.ch/)、[Log4j](https://logging.apache.org/log4j/2.x/)、[Log4j2](https://logging.apache.org/log4j/2.12.x/)、[JUL](https://docs.oracle.com/javase/8/docs/api/java/util/logging/package-summary.html)など様々なロギングライブラリを使用できる。

このように設定する理由は、特定のロギングライブラリで脆弱性が発見された場合や、他のロギングライブラリに変更が必要な場合に、実装だけを変更すれば済むためだと考えられる。

## Logback設定

基本的にLogbackの設定は`logback-spring.xml`ファイルを生成して設定できる。

この設定は大きく、Appender、Logger、Encoderで構成される。

### Appender

Appenderはログをどこに出力するかを決定する役割をする。

基本的に`ConsoleAppender`、`FileAppender`、`RollingFileAppender`、`SyslogAppender`など様々なAppenderが存在する。

### Logger

Loggerはログを残す対象を決定する役割をする。

Loggerは名前を持ち、その名前を持つLoggerだけにログを残す。

### Encoder

Encoderはログをどのような形式で出力するかを決定する役割をする。

基本的に`PatternLayoutEncoder`を使用するとRaw Text形式でログを残すことができ、`JsonEncoder`を使用するとJSON形式でログを残すことができる。

筆者はローカルでは`PatternLayoutEncoder`を使用し、デプロイ環境では`JsonLayout`を使用してログを残す方法を案内する。

## JsonLayout

`JsonLayout`はLogbackが提供するLayoutで、ログをJSON形式で出力できるようにする。

`JsonLayout`を使用するためには`logback-json-classic`と`logback-jackson`依存関係を追加する必要がある。

```gradle
dependencies {
    implementation 'ch.qos.logback.contrib:logback-json-classic:0.1.5'
    implementation 'ch.qos.logback.contrib:logback-jackson:0.1.5'
	implementation 'com.fasterxml.jackson.core:jackson-databind:2.15.2'
}
```

## `logback-spring.xml`

その後、`resources`ディレクトリ内に`logback-spring.xml`ファイルを生成し、以下のように設定する。

### Appender設定

まずJSON形式でログを出力するAppenderを設定する。

取得した依存関係はlayoutパートで使用する。

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
            <pattern>[%thread] %highlight([%-slevel]) %cyan(%logger{15}) - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 中略 -->

</configuration>
```

> まだappenderのみ設定したもので、実際にログを使用する部分はまだ設定していない。

パターンは簡潔にLogger、Messageのみ出力するように設定した。

#### `CONSOLE_JSON` Appender

`CONSOLE_JSON` AppenderはJSON形式でログを出力するように設定した。
その後の追加設定は以下の通り。

- `timestampFormat`: 日付の形式を指定する。(筆者はRFC3339形式で指定した。)
- `timestampFormatTimezoneId`はタイムゾーンを指定する。

#### `CONSOLE_STDOUT` Appender

`CONSOLE_STDOUT` AppenderはRaw Text形式でログを出力するように設定した。

### Logger設定

続いてプロファイルに応じてログを出力するAppenderを設定する。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration scan="true" scanPeriod="30 seconds">

    <!-- 中略 -->
    
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

上記の設定では、`springProfile`タグを使用してプロファイルに応じてログを出力するAppenderを設定した。

- `qa`、`dev`プロファイルでは`CONSOLE_JSON` Appenderを使用するように設定した。
- `local`プロファイルでは`CONSOLE_STDOUT` Appenderを使用するように設定した。

## 例コード
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

## 結果
環境別にロギングをこのように分ければ、ローカルでは可視性を確保しつつ、デプロイ環境では検索をより便利にすることができるだろう。

### `CONSOLE_STDOUT`
![image](/images/spring/logback_json-1718636141145.png)

### `CONSOLE_JSON`
![image](/images/spring/logback_json-1718636188423.png)
> 個人的には汚いと思うが、検索は便利になるだろう。

## 参考文献 
- [Logback](https://logback.qos.ch/)
- [Slf4j](http://www.slf4j.org/)
- [logbackを活用してログをjson形式でパースする](https://velog.io/@choihuk/logback%EC%9D%84-%ED%99%9C%EC%9A%A9%ED%95%98%EC%97%AC-%EB%A1%9C%EA%B7%B8%EB%A5%BC-json-%ED%98%95%EC%8B%9D%EC%9C%BC%EB%A1%9C-%ED%8C%8C%EC%8B%B1%ED%95%98%EA%B8%B0-%EB%A1%9C%EA%B7%B8-%EC%8B%9C%EC%8A%A4%ED%85%9C-3)
- [SpringbootでLogback設定を行う(logback-spring.xml)](https://velog.io/@woosim34/Springboot-Logback-%EC%84%A4%EC%A0%95%ED%95%B4%EB%B3%B4%EA%B8%B0)
- [Logbackを利用して運用環境別のログを残す](https://blog.pium.life/server-logging/)
- [logbackを活用してログをjson形式でパースする [ログシステム3]](https://velog.io/@choihuk/logback%EC%9D%84-%ED%99%9C%EC%9A%A9%ED%95%98%EC%97%AC-%EB%A1%9C%EA%B7%B8%EB%A5%BC-json-%ED%98%95%EC%8B%9D%EC%9C%BC%EB%A1%9C-%ED%8C%8C%EC%8B%B1%ED%95%98%EA%B8%B0-%EB%A1%9C%EA%B7%B8-%EC%8B%9C%EC%8A%A4%ED%85%9C-3)