---
title: Trace ID und Span ID Logging mit Micrometer in Spring
type: blog
date: 2024-06-24
comments: true
translated: true
---
![image](/images/spring/trace-id-and-span-id-logging-1719164294946.png)

Beim Debugging durch Logging kann es vor allem in verteilten Systemen schwierig sein, den Fluss der Transaktionen zu erkennen.

Besonders in Produktionsumgebungen wird oft in mehreren Stufen geloggt, um Parameter normaler Anfragen oder Rückgabewerte zur Fehlersuche zu speichern. Das Problem solcher Logs ist, dass sie bei mehreren gleichzeitigen Anfragen durcheinander geraten können, was es schwer macht, die Logs einzelnen Anfragen zuzuordnen.

Zudem kann es schwierig sein, die Logs der Anfragen zu identifizieren, bei denen Fehler aufgetreten sind.

In solchen Fällen kann das Logging mit `Trace ID` und `Span ID` den Überblick über den Transaktionsfluss deutlich erleichtern.

## Vorwissen
- In diesem Teil werden keine Libraries für das Logging behandelt.
- Für Informationen zum Logging in Spring, zur Hinzufügung von JSON-Feldern und zur Trennung der Log-Formate je nach Umgebung siehe den vorherigen Beitrag [_"Pattern- und JSON-Logging mit Logback in Spring Boot konfigurieren"_](/blog/spring/logback_json).
- In diesem Abschnitt wird Logback verwendet, die Konfiguration erfolgt über die Datei `logback-spring.xml`.

## Trace ID vs Span ID
- `Trace ID`: ID zur Verfolgung der gesamten Transaktion, bleibt auch zwischen Microservices gleich.
- `Span ID`: ID zur Verfolgung einzelner Einheiten innerhalb einer Transaktion, bleibt nur innerhalb eines Microservice erhalten.

## Micrometer
[Micrometer](https://micrometer.io/) ist eine Bibliothek zur Erfassung von Metriken zur Messung der Anwendungsleistung. Es kann in Spring Boot und Spring Cloud verwendet werden und ist mit verschiedenen Monitoring-Systemen wie Zipkin, Prometheus und Graphite integrierbar.

Zwar bietet Micrometer viele komplexe und vielfältige Funktionen, hier wird jedoch nur die Funktion genutzt, Trace ID und Span ID pro Anfrage zuzuweisen und diese im Logging zu nutzen.
> Die Integration mit Zipkin zur Tracing wird in einem späteren Beitrag behandelt.

## Abhängigkeiten konfigurieren
Um verschiedene Tracing-Werkzeuge zu nutzen, können weitere Abhängigkeiten hinzugefügt werden, jedoch reichen die folgenden zwei für die Verwendung von Trace ID und Span ID aus:

```gradle{filename="build.gradle"}
dependencies {
    // micrometer
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    implementation 'io.micrometer:micrometer-tracing-bridge-brave'
}
```

Hierbei ist spring-boot-starter-actuator eine Abhängigkeit zur Nutzung von Spring Boot Actuator, welches Funktionen zur Überwachung und Verwaltung der Anwendung bereitstellt.

## Logging konfigurieren
Allein mit dieser Konfiguration lässt sich Trace ID und Span ID zum Logging hinzufügen.

Micrometer fügt Trace ID und Span ID zum MDC hinzu, daher können wir in Logback MDC nutzen, um diese IDs in das Logging aufzunehmen.
> MDC steht für Mutable Diagnostic Context und ermöglicht das Hinzufügen zusätzlicher Informationen beim Logging.

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

Der entscheidende Punkt ist die Hinzufügung von `%X{traceId}` und `%X{spanId}`. Durch das Hinzufügen von %X{variablenName} können Variablen aus dem MDC ins Logging aufgenommen werden.

Außerdem wurde das vorherige `<layout class="com.example.demo.common.log.TraceJsonLayout">` geerbt und die `toMap()` Methode überschrieben, um die `traceId` und `spanId` aus dem MDC hinzuzufügen:

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

## Ergebnis
So erhalten Sie die Logs:

### JSON-Log
![image](/images/spring/trace-id-and-span-id-logging-1719163927752.png)

### Konsolen-Log
![image](/images/spring/trace-id-and-span-id-logging-1719163985720.png)