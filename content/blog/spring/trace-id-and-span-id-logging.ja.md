---
title: SpringでMicrometerを活用してTrace IDとSpan IDをログに記録する
type: blog
date: 2024-06-24
comments: true
translated: true
---
![image](/images/spring/trace-id-and-span-id-logging-1719164294946.png)

デバッグのためにログを記録する際、特に分散システムでは、トランザクションの流れをログで把握するのが難しい場合があります。

特にプロダクション環境では、デバッグのために様々な段階で正常なリクエストのパラメータや返り値の情報をログに記録することがありますが、これらのログは同時に複数のリクエストが入ると混在し、特定のログがどのリクエストに関するものか把握しづらい場合があります。

また、エラー発生時にはエラーが発生したリクエストのログを把握しにくい場合があります。

このような場合、`Trace ID`と`Span ID`を活用してログを記録することで、ログの区分や検索面でトランザクションの流れを把握しやすくなります。

## 事前知識
- このパートでは、ログ記録用のライブラリなどは扱いません。
- Springでのログ記録方法やJSONフィールドの追加方法、環境ごとのログフォーマットの分離に関しては前回の投稿 [_"Spring BootでLogbackを利用したパターンログおよびJSONログの出力"_](/blog/spring/logback_json) を参照してください。
- このパートではLogbackを使用し、Logbackの設定は`logback-spring.xml`ファイルを使用します。

## Trace ID vs Span ID
- `Trace ID`: 全体のトランザクションを追跡するためのIDで、マイクロサービス間でも同一のIDを維持します。
- `Span ID`: トランザクション内の各ユニットを追跡するためのIDで、マイクロサービス内でのみ維持されます。

## Micrometer
[Micrometer](https://micrometer.io/)は、アプリケーションのパフォーマンスを測定するためのメトリクスを収集するライブラリです。MicrometerはSpring BootやSpring Cloudで使用可能で、Zipkin、Prometheus、Graphiteなど様々なモニタリングシステムと連携できます。

実際にはもっと複雑で多様な機能を持っていますが、ここではMicrometerがリクエストごとにTrace ID、Span IDを付与する機能のみを利用してこれをログに活用します。
> Zipkinと連携してトレースする方法は後日他の投稿で扱います。

## 依存関係の設定
複数のトレースツールを使用したい場合はさらに多くの依存関係を追加する必要がありますが、Trace IDとSpan IDを利用するためには以下の2つの依存関係を追加するだけです。

```gradle{filename="build.gradle"}
dependencies {
    // micrometer
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    implementation 'io.micrometer:micrometer-tracing-bridge-brave'
}
```

ここでspring-boot-starter-actuatorはSpring Boot Actuatorを使用するための依存関係であり、アプリケーションの動作方法をモニタリングおよび管理する機能を提供します。

## ログの設定
この設定を行うだけで、Trace IDとSpan IDをログに追加できます。

MicrometerがTrace IDとSpan IDをMDCに追加してくれるため、我々はLogbackでMDCを活用してTrace IDとSpan IDをログに追加することができます。
> MDCはMutable Diagnostic Contextの略で、ログ記録時に追加情報をログに追加できるようにします。

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

実際のところ、他の部分は前回の投稿と同じであり、注目すべき点は`%X{traceId}`と`%X{spanId}`を追加した部分です。このように%X{変数名}を追加すると、MDCにある変数をログに追加できます。

また、以前あった`<layout class="com.example.demo.common.log.TraceJsonLayout">`は`JsonLayout`を継承して以下のように`toMap()`メソッドをオーバーライドし、MDCにある`traceId`と`spanId`を追加しました。

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

## 結果
このようにすると次のようなログを得ることができます。

### JSONログ
![image](/images/spring/trace-id-and-span-id-logging-1719163927752.png)

### コンソールログ
![image](/images/spring/trace-id-and-span-id-logging-1719163985720.png)