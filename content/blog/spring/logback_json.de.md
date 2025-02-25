---
title: Ausgabe von Pattern-Logs und JSON-Logs mit Logback in Spring Boot
type: blog
date: 2024-06-17
comments: true
translated: true
---
![image](/images/spring/logback_json-1718636794759.gif)

Beim Betrieb eines API-Servers kommt es häufig vor, dass man Protokolle für Betriebsvorgänge oder zur Fehlersuche erstellt.

Traditionell gibt es beim Erstellen von Logs in Spring zwar ein Format, aber oft werden sie in Rohtextform hinterlassen. In solchen Fällen halte ich es für besser, die Logs im Rohtext zu hinterlassen, da sie sichtbarer sind als im JSON-Format.

Allerdings sieht es beim Suchen und Filtern von Logs anders aus. Bei Plattformen wie AWS CloudWatch, die Log-Suchfunktionen bieten, ist es schwierig, herauszufinden, welche Funktion welche Daten ausgibt, wenn in Rohtext protokolliert wird.

Besonders kompliziert ist es, wenn komplexe Bedingungen erfüllt sein müssen.

Natürlich kann man das Problem lösen, indem man dem Log bestimmte Schlüsselwörter hinzufügt und zusammen mit diesen sucht. Aber das Speichern in JSON-Form macht die formale Suche einfacher.
(Obwohl ich die detaillierte Implementierung nicht kenne, könnte es Vorteile geben, wenn man z. B. das Indexing konfiguriert.)

Schauen wir uns an, wie man lokal im Rohtextformat und in der Produktionsumgebung im JSON-Format loggen kann, um die Sichtbarkeit zu erhöhen.

## Logback

Logback ist die Implementierung von SLF4J und die standardmäßig verwendete Logging-Bibliothek in Spring Boot.

Wenn man die Abhängigkeit `spring-boot-starter-web` hinzufügt, wird Logback automatisch hinzugefügt. Eine separate Abhängigkeitsdeklaration ist nicht erforderlich.

## Slf4j

Slf4j steht für **Simple Logging Facade for Java** und ist eine Schnittstelle, die Java-Logging-Bibliotheken abstrahiert.

Da es sich um eine Schnittstelle handelt, können verschiedene Logging-Bibliotheken wie [Logback](https://logback.qos.ch/), [Log4j](https://logging.apache.org/log4j/2.x/), [Log4j2](https://logging.apache.org/log4j/2.12.x/), [JUL](https://docs.oracle.com/javase/8/docs/api/java/util/logging/package-summary.html) genutzt werden.

Der Grund dafür könnte sein, dass man bei Entdeckung von Schwachstellen in einer bestimmten Logging-Bibliothek einfach den Implementierungsteil austauschen kann.

## Logback-Konfiguration

Grundsätzlich kann man die Logback-Konfiguration durch Anlegen einer `logback-spring.xml` Datei einrichten.

Diese Konfiguration besteht im Wesentlichen aus Appender, Logger und Encoder.

### Appender

Der Appender entscheidet, wo die Logs ausgegeben werden.

Grundlegend gibt es unterschiedliche Appender wie `ConsoleAppender`, `FileAppender`, `RollingFileAppender`, `SyslogAppender`.

### Logger

Der Logger entscheidet, welches Element geloggt wird.

Ein Logger hat einen Namen, und es werden nur Logs für den Logger mit diesem Namen erstellt.

### Encoder

Der Encoder entscheidet das Format, in dem die Logs ausgegeben werden.

Standardmäßig kann man mit `PatternLayoutEncoder` Rohtext erstellen, und `JsonEncoder` wird verwendet, um Logs im JSON-Format zu speichern.

Ich werde zeigen, wie man lokal `PatternLayoutEncoder` verwendet und in der Betriebsumgebung `JsonLayout`.

## JsonLayout

`JsonLayout` ist ein von Logback bereitgestelltes Layout, das es erlaubt, Logs im JSON-Format auszugeben.

Um `JsonLayout` zu nutzen, müssen die Abhängigkeiten `logback-json-classic` und `logback-jackson` hinzugefügt werden.

```gradle
dependencies {
    implementation 'ch.qos.logback.contrib:logback-json-classic:0.1.5'
    implementation 'ch.qos.logback.contrib:logback-jackson:0.1.5'
	implementation 'com.fasterxml.jackson.core:jackson-databind:2.15.2'
}
```

## `logback-spring.xml`

Anschließend erstellt man eine `logback-spring.xml` Datei im `resources` Unterverzeichnis und konfiguriert sie wie folgt.

### Appender-Konfiguration

Zunächst konfigurieren wir den Appender, um Logs im JSON-Format auszugeben.

Die importierten Abhängigkeiten werden im Layout-Part verwendet.

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

    <!-- Abkürzung -->

</configuration>
```

> Der Appender ist nun konfiguriert, aber die Logausgabe ist noch nicht eingestellt.

Das Muster wurde einfach gehalten und nur Logger und Nachricht werden angezeigt.

#### `CONSOLE_JSON` Appender

Der `CONSOLE_JSON` Appender ist so konfiguriert, dass er die Logs im JSON-Format ausgibt.
Weitere Einstellungen sind wie folgt:

- `timestampFormat`: gibt das Datumsformat an (ich habe RFC3339-Format gewählt).
- `timestampFormatTimezoneId`: legt die Zeitzone fest.

#### `CONSOLE_STDOUT` Appender

Der `CONSOLE_STDOUT` Appender ist so konfiguriert, dass er die Logs im Rohtextformat ausgibt.

### Logger-Konfiguration

Jetzt wird der Appender basierend auf dem Profil für die Logausgabe eingestellt.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration scan="true" scanPeriod="30 seconds">

    <!-- Abkürzung -->
    
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

In dieser Konfiguration wurde das `springProfile`-Tag verwendet, um den Appender je nach Profil für die Logausgabe einzustellen.

- In den Profilen `qa` und `dev` wird der `CONSOLE_JSON` Appender verwendet.
- Im `local` Profil wird der `CONSOLE_STDOUT` Appender verwendet.



## Beispielcode
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

## Ergebnis
Wenn man die Logs nach Umgebung trennt, kann man lokal mehr Übersichtlichkeit haben und gleichzeitig in der Betriebsumgebung die Suche erleichtern.

### `CONSOLE_STDOUT`
![image](/images/spring/logback_json-1718636141145.png)

### `CONSOLE_JSON`
![image](/images/spring/logback_json-1718636188423.png)
> Persönlich finde ich es unordentlich, aber die Suche wird einfacher.

## Referenzen 
- [Logback](https://logback.qos.ch/)
- [Slf4j](http://www.slf4j.org/)
- [Protokollierung im JSON-Format mit Logback](https://velog.io/@choihuk/logback%EC%9D%84-%ED%99%9C%EC%9A%A9%ED%95%98%EC%97%AC-%EB%A1%9C%EA%B7%B8%EB%A5%BC-json-%ED%98%95%EC%8B%9D%EC%9C%BC%EB%A1%9C-%ED%8C%8C%EC%8B%B1%ED%95%98%EA%B8%B0-%EB%A1%9C%EA%B7%B8-%EC%8B%9C%EC%8A%A4%ED%85%9C-3)
- [Logback-Konfiguration in Springboot (logback-spring.xml)](https://velog.io/@woosim34/Springboot-Logback-%EC%84%A4%EC%A0%95%ED%95%B4%EB%B3%B4%EA%B8%B0)
- [Logging nach Umgebung mit Logback](https://blog.pium.life/server-logging/)
- [Protokollierung im JSON-Format mit Logback [Logsystem 3]](https://velog.io/@choihuk/logback%EC%9D%84-%ED%99%9C%EC%9A%A9%ED%95%98%EC%97%AC-%EB%A1%9C%EA%B7%B8%EB%A5%BC-json-%ED%98%95%EC%8B%9D%EC%9C%BC%EB%A1%9C-%ED%8C%8C%EC%8B%B1%ED%95%98%EA%B8%B0-%EB%A1%9C%EA%B7%B8-%EC%8B%9C%EC%8A%A4%ED%85%9C-3)