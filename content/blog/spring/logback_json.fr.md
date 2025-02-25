---
title: Affichage des journaux Pattern et JSON avec Logback dans Spring Boot
type: blog
date: 2024-06-17
comments: true
translated: true
---
![image](/images/spring/logback_json-1718636794759.gif)

Lorsque vous gérez un serveur API, il est courant de laisser des journaux pour le suivi des opérations ou le débogage.

Traditionnellement, dans Spring, même si un format existe pour laisser des logs, ils sont souvent laissés sous forme de texte brut. Personnellement, je pense que cela offre une meilleure visibilité que de laisser des logs au format JSON.

Cependant, rechercher et filtrer des journaux est une autre histoire. Dans des plateformes comme AWS CloudWatch qui permettent de rechercher des logs, enregistrer des logs sous forme de texte brut rend difficile le filtrage pour savoir quelle fonction a produit quelles données.

Cela devient particulièrement compliqué lorsqu'il faut rechercher sous plusieurs conditions composites.

Bien sûr, en ajoutant des mots-clés spécifiques aux logs pour les rechercher ensemble, le problème serait résolu, mais enregistrer les logs au format JSON rend la recherche formelle plus facile.
(Je ne connais pas les détails de l'implémentation, mais je suppose qu'il pourrait y avoir un avantage si des parties comme l'indexation étaient également configurées.)

Pour atteindre cet objectif, apprenons comment séparer l'enregistrement des logs localement au format texte brut pour plus de visibilité et les enregistrer au format JSON dans l'environnement de déploiement.

## Logback

Logback est une implémentation de SLF4J, qui est la bibliothèque de journalisation par défaut utilisée dans Spring Boot.

En général, en ajoutant simplement la dépendance `spring-boot-starter-web`, Logback est automatiquement ajouté, donc aucune dépendance supplémentaire n'est nécessaire.

## Slf4j

Slf4j, acronyme pour **Simple Logging Facade for Java**, est une interface qui abstrait les bibliothèques de journalisation en Java.

En tant qu'interface, il vous permet d'utiliser diverses bibliothèques de journalisation telles que [Logback](https://logback.qos.ch/), [Log4j](https://logging.apache.org/log4j/2.x/), [Log4j2](https://logging.apache.org/log4j/2.12.x/), [JUL](https://docs.oracle.com/javase/8/docs/api/java/util/logging/package-summary.html), etc.

La raison de cette abstraction semble être que si une vulnérabilité est découverte dans une certaine bibliothèque de journalisation et qu'il devient nécessaire de changer de bibliothèque, seul l'implémentation doit être modifiée.

## Configuration de Logback

La configuration de Logback par défaut peut être définie en créant un fichier `logback-spring.xml`.

Cette configuration est principalement composée de Appender, Logger et Encoder.

### Appender

L'Appender détermine où les logs seront affichés.

Il existe divers Appender comme `ConsoleAppender`, `FileAppender`, `RollingFileAppender`, `SyslogAppender`, etc.

### Logger

Le Logger détermine pour quelle cible les logs seront laissés.

Le Logger a un nom et laisse des logs uniquement pour le Logger portant ce nom.

### Encoder

L'Encoder détermine le format dans lequel les logs seront affichés.

En utilisant `PatternLayoutEncoder`, vous pouvez laisser des logs sous forme de texte brut, et en utilisant `JsonEncoder`, vous pouvez laisser des logs au format JSON.

Je vais proposer d'utiliser `PatternLayoutEncoder` localement et `JsonLayout` dans l'environnement de déploiement pour enregistrer les logs.

## JsonLayout

`JsonLayout` est un Layout fourni par Logback, permettant d'afficher les logs au format JSON.

Pour utiliser `JsonLayout`, vous devez ajouter les dépendances `logback-json-classic` et `logback-jackson`.

```gradle
dependencies {
    implementation 'ch.qos.logback.contrib:logback-json-classic:0.1.5'
    implementation 'ch.qos.logback.contrib:logback-jackson:0.1.5'
    implementation 'com.fasterxml.jackson.core:jackson-databind:2.15.2'
}
```

## `logback-spring.xml`

Ensuite, créez un fichier `logback-spring.xml` dans le répertoire `resources` et configurez-le comme suit.

### Configuration de l'Appender

D'abord, configurez l'Appender pour afficher les logs au format JSON.

Les dépendances que nous avons obtenues sont utilisées dans la partie layout.

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

    <!-- réduit -->

</configuration>
```

> Pour l'instant, seuls les appender ont été configurés mais la partie qui utilise réellement les logs n’est pas encore définie.

Le pattern est défini pour afficher uniquement le Logger et le Message.

#### `CONSOLE_JSON` Appender

L'Appender `CONSOLE_JSON` est configuré pour afficher les logs au format JSON.
Les réglages supplémentaires sont les suivants:

- `timestampFormat`: définit le format de date. (Je l'ai défini au format RFC3339.)
- `timestampFormatTimezoneId`: définit le fuseau horaire.

#### `CONSOLE_STDOUT` Appender

L'Appender `CONSOLE_STDOUT` est configuré pour enregistrer des logs sous forme de texte brut.

### Configuration du Logger

Configurez ensuite l'Appender qui affichera les logs en fonction du profil.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration scan="true" scanPeriod="30 seconds">

    <!-- réduit -->
    
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

Dans cette configuration, `springProfile` est utilisé pour configurer l'Appender affichant les logs selon le profil.

- Dans les profils `qa`, `dev`, il est configuré pour utiliser l'Appender `CONSOLE_JSON`.
- Dans le profil `local`, il est configuré pour utiliser l'Appender `CONSOLE_STDOUT`.

## Exemple de code
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

## Résultat
En divisant ainsi la journalisation selon l'environnement, vous pouvez conserver la visibilité localement tout en facilitant la recherche dans les environnements de déploiement.

### `CONSOLE_STDOUT`
![image](/images/spring/logback_json-1718636141145.png)

### `CONSOLE_JSON`
![image](/images/spring/logback_json-1718636188423.png)
> Bien que je le trouve personnellement désordonné, la recherche sera simplifiée.

## Références
- [Logback](https://logback.qos.ch/)
- [Slf4j](http://www.slf4j.org/)
- [Utilisation de Logback pour analyser les logs au format JSON](https://velog.io/@choihuk/logback%EC%9D%84-%ED%99%9C%EC%9A%A9%ED%95%98%EC%97%AC-%EB%A1%9C%EA%B7%B8%EB%A5%BC-json-%ED%98%95%EC%8B%9D%EC%9C%BC%EB%A1%9C-%ED%8C%8C%EC%8B%B1%ED%95%98%EA%B8%B0-%EB%A1%9C%EA%B7%B8-%EC%8B%9C%EC%8A%A4%ED%85%9C-3)
- [Configurer Logback dans Spring Boot (logback-spring.xml)](https://velog.io/@woosim34/Springboot-Logback-%EC%84%A4%EC%A0%95%ED%95%B4%EB%B3%B4%EA%B8%B0)
- [Enregistrement des logs selon l'environnement avec Logback](https://blog.pium.life/server-logging/)
- [Utilisation de Logback pour analyser les logs au format JSON [Système de logs 3]](https://velog.io/@choihuk/logback%EC%9D%84-%ED%99%9C%EC%9A%A9%ED%95%98%EC%97%AC-%EB%A1%9C%EA%B7%B8%EB%A5%BC-json-%ED%98%95%EC%8B%9D%EC%9C%BC%EB%A1%9C-%ED%8C%8C%EC%8B%B1%ED%95%98%EA%B8%B0-%EB%A1%9C%EA%B7%B8-%EC%8B%9C%EC%8A%A4%ED%85%9C-3)