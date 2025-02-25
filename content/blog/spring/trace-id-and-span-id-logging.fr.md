---
translated: true
title: Utiliser Micrometer dans Spring pour journaliser avec Trace ID et Span ID
type: blog
date: 2024-06-24
comments: true
---
![image](/images/spring/trace-id-and-span-id-logging-1719164294946.png)

Lorsque vous effectuez un journalisation pour le débogage, en particulier dans les systèmes distribués, il peut être difficile de comprendre le flux des transactions grâce au journal.

En particulier dans les environnements de production, il est courant de consigner les paramètres des demandes normales ou les informations de retour à différents niveaux pour le débogage. Mais la caractéristique de ces journaux est qu'ils peuvent être mélangés si plusieurs requêtes arrivent en même temps, rendant difficile de déterminer à quelle requête appartient un journal spécifique.

De plus, en cas d'erreur, il peut être difficile d'identifier les journaux associés à la requête où l'erreur s'est produite.

Dans de tels cas, l'utilisation du `Trace ID` et du `Span ID` pour le journalisation peut faciliter la compréhension du flux des transactions en termes de distinction et de recherche des journaux.

## Connaissances préalables
- Cette section ne traite pas des bibliothèques de journalisation.
- Pour plus d'informations sur la manière de journaliser dans Spring, comment ajouter des champs JSON et comment séparer le format des journaux par environnement, consultez notre précédent article [_"Utilisation de Logback avec Spring Boot pour sortir des journaux de modèles et JSON"_](/blog/spring/logback_json).
- Cette section utilise Logback, et la configuration Logback utilise le fichier `logback-spring.xml`.

## Trace ID vs Span ID
- `Trace ID`: Un ID pour tracer la transaction entière, conservé entre microservices.
- `Span ID`: Un ID pour tracer chaque unité au sein de la transaction, conservé uniquement dans le microservice.

## Micrometer
[Micrometer](https://micrometer.io/) est une bibliothèque qui collecte des métriques pour mesurer la performance des applications. Micrometer est utilisable avec Spring Boot et Spring Cloud, et peut être intégré avec divers systèmes de monitoring comme Zipkin, Prometheus, Graphite, etc.

Bien qu'il ait des fonctionnalités plus complexes et variées, nous allons ici utiliser uniquement la fonctionnalité de Micrometer qui attribue un Trace ID et un Span ID par demande pour l'utiliser dans le journalisation.
> La manière de faire du traçage en intégrant Zipkin sera abordée dans un article ultérieur.

## Configuration des dépendances
Si vous souhaitez utiliser plusieurs outils de traçage, vous devrez ajouter plus de dépendances, mais pour utiliser le Trace ID et Span ID, vous n'avez besoin que d'ajouter les deux dépendances suivantes:

```gradle{filename="build.gradle"}
dependencies {
    // micrometer
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    implementation 'io.micrometer:micrometer-tracing-bridge-brave'
}
```

Ici, "spring-boot-starter-actuator" est une dépendance pour utiliser Spring Boot Actuator, fournissant des fonctionnalités pour surveiller et gérer le fonctionnement de l'application.

## Configuration du journalisation
Avec cette seule configuration, vous pouvez ajouter le Trace ID et le Span ID au journalisation.

Micrometer ajoute le Trace ID et Span ID au MDC, nous pouvons donc utiliser MDC dans Logback pour les ajouter au journalisation.
> MDC signifie Mutable Diagnostic Context et permet d'ajouter des informations supplémentaires au journalisation.

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

En fait, à part cela, le reste est le même que ce qui a été posté précédemment, mais le point à noter est l'inclusion de `%X{traceId}` et `%X{spanId}`. Ajouter %X{nom_variable} dans le journal permet d'inclure les variables présentes dans le MDC.

De plus, le précédent `<layout class="com.example.demo.common.log.TraceJsonLayout">` hérite de `JsonLayout` et surcharge la méthode `toMap()` pour ajouter `traceId` et `spanId` présents dans le MDC, comme suit:

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

## Résultat
Ainsi, vous pouvez obtenir les journaux comme suit.

### Journaux JSON
![image](/images/spring/trace-id-and-span-id-logging-1719163927752.png)

### Journaux Console
![image](/images/spring/trace-id-and-span-id-logging-1719163985720.png)
