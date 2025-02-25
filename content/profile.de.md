---
title: "Hallo, CodeGiraffe \U0001F44B"
type: about
date: 2022-07-13
translated: true
---

<img src="/images/profile/profile.jpg" width="500" style="border-radius: 50%"> 

Hallo, ich bin _"der unbequeme Entwickler für eine bequeme Welt"_ **Yang Taeyoung**.

Ich beschäftige mich ständig damit, Unannehmlichkeiten in meiner Umgebung zu verbessern und stabile Dienste sowie gute Strukturen zu schaffen.

## 📚 Fähigkeiten

|   Kategorie    | Fähigkeiten                                            |
|:--------------:|-------------------------------------------------------|
|    Backend     | Java, Spring Boot, Go, Echo Framework, Python, Django |
|    Frontend    | Javascript, Typescript, React                         |
|    Datenbank   | MySQL, PostgreSQL, MongoDB, Redis, Elasticsearch      |
| Nachrichtenschlange | AWS SQS, RabbitMQ                                    |
|     DevOps     | Docker, AWS, Github Actions                           |
|      IDE       | IntelliJ, Goland, PyCharm                             |
|      Sonstiges | Git, Github, Jira, Confluence, Notion                 |

## 📃 Berufserfahrung

{{% steps %}}

### Illuminarian - Tätigkeit als Backend-Entwickler

> 2024-04 ~ heute

<img src="https://img.shields.io/badge/SPRING-6DB33F?style=for-the-badge&logo=Spring&logoColor=white" alt="spring" style="display: inline">
<img src="https://img.shields.io/badge/JAVA-000000?style=for-the-badge&logo=openjdk&logoColor=white" alt="java" style="display: inline">
<img src="https://img.shields.io/badge/MYSQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="mysql" style="display: inline">
<img src="https://img.shields.io/badge/GRAFANA-F46800?style=for-the-badge&logo=Grafana&logoColor=white" alt="grafana" style="display: inline">
<img src="https://img.shields.io/badge/PROMETHEUS-E6522C?style=for-the-badge&logo=Prometheus&logoColor=white" alt="prometheus" style="display: inline">
<img src="https://img.shields.io/badge/AWS%20SQS-FF4F8B?style=for-the-badge&logo=amazonsqs&logoColor=white" alt="prometheus" style="display: inline">
<img src="https://img.shields.io/badge/REDIS-FF4438?style=for-the-badge&logo=redis&logoColor=white" alt="prometheus" style="display: inline">

{{% details title="Mehr" closed="true" %}}

#### Energy Shares US

- Verantwortlich für Wartung und Neuentwicklung von Funktionen für den Server und das Backoffice der Crowdfunding-Plattform Energy Shares US für erneuerbare Energien.
- Implementierung von REST APIs mit Spring Boot und Speicherung von Daten mit MySQL.
- Einrichtung einer CI/CD-Pipeline von Github Actions über ECR und Event Bridge zu ECS.
- Verbesserung der Testzuverlässigkeit und Optimierung der Ausführungszeiten.
    - Erhöhung der Zuverlässigkeit von Abfragen durch Hinzufügen von Repository-Tests mit Testcontainers.
    - Optimierung der Testdauer durch Trennung von `@SpringBootTest` in `@WebMvcTest` und `@DataJpaTest`, wodurch die Ausführungszeit auf ein Drittel reduziert wurde.
    - Einführung eines Self-Hosted Runners zur Optimierung der Ausführungszeit und einer Notfalllösung für den Ausfall eines Self-Hosted Runners.
- Aufbau eines verteilten Tracing-Systems mit Grafana Tempo.
- Einfachere Protokollverfolgung durch Zuordnung von TraceID und SpanID zu Log-Feldern und Änderung des Protokollformats in JSON.
- Entwicklung eines Konfigurationstoolvergleichs zur Lösung von fehlenden Umkonfigurationen bei der Bereitstellung.
- Belastungstests mit Locust zur Definition der optimalen Serverspezifikationen und zur Verbesserung der Leistung.
    - Asynchrone Verarbeitung von langsamen Antwortfällen externer Plattformen mit AWS SQS zur Leistungsverbesserung.
    - Caching langsamer API-Antworten mit Redis zur Reduzierung der Last.
- Überwachung mit Prometheus.

{{% /details %}}

### Looko Co. Ltd. - Tätigkeit als Backend-Entwickler

> 2022-08 ~ 2024-04

<img src="https://img.shields.io/badge/GO-00ADD8?style=for-the-badge&logo=Go&logoColor=white" alt="go" style="display: inline">
<img src="https://img.shields.io/badge/MONGODB-47A248?style=for-the-badge&logo=MongoDB&logoColor=white" alt="mongodb" style="display: inline">
<img src="https://img.shields.io/badge/POSTGRESQL-336791?style=for-the-badge&logo=PostgreSQL&logoColor=white" alt="postgresql" style="display: inline">
<img src="https://img.shields.io/badge/ELASTICSEARCH-005571?style=for-the-badge&logo=Elasticsearch&logoColor=white" alt="elasticsearch" style="display: inline">
<img src="https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=Amazon-AWS&logoColor=white" alt="aws" style="display: inline">
<img src="https://img.shields.io/badge/DOCKER-2496ED?style=for-the-badge&logo=Docker&logoColor=white" alt="docker" style="display: inline">
<img src="https://img.shields.io/badge/GITHUB%20ACTIONS-2088FF?style=for-the-badge&logo=GitHub-Actions&logoColor=white" alt="github-action" style="display: inline">
<img src="https://img.shields.io/badge/AWS%20LAMBDA-FF9900?style=for-the-badge&logo=awslambda&logoColor=white" alt="lambda" style="display: inline">
<img src="https://img.shields.io/badge/AWS%20ECS-FF9900?style=for-the-badge&logo=amazonecs&logoColor=white" alt="ecs" style="display: inline">
<img src="https://img.shields.io/badge/AWS%20RDS-527FFF?style=for-the-badge&logo=amazondynamodb&logoColor=white" alt="rds" style="display: inline">
<img src="https://img.shields.io/badge/AWS%20S3-569A31?style=for-the-badge&logo=amazons3&logoColor=white" alt="s3" style="display: inline">
<img src="https://img.shields.io/badge/AWS%20ROUTE53-8C4FFF?style=for-the-badge&logo=amazonroute53&logoColor=white" alt="route53" style="display: inline">
<img src="https://img.shields.io/badge/AWS%20CLOUDWATCH-FF4F8B?style=for-the-badge&logo=amazoncloudwatch&logoColor=white" alt="cloudwatch" style="display: inline">

{{% details title="Mehr" closed="true" %}}

#### AcCloset

- Verantwortlich für die Wartung von API, Batch und Server des AcCloset-Dienstes mit 400k MAU.
- Implementierung von Grunddaten und zugehörigen APIs für den Gebrauchtwarenhandel.

#### Looko AI

- Entwicklung des Backends für Looko AI, einen Service zur Effizienzsteigerung von Vintage-Kleidungsanbietern.
- Verwendung des Echo-Frameworks in Golang und MongoDB zur Datenspeicherung.
- Synchronisierung des Service-Status für Bestellungen/Produkte/Claims von drei Quellen (AcCloset, Café24, Naver Smart Store) mit Looko AI durch FSM und Echtzeit-Synchronisierung von 300k Produkten und 50k Bestellungen.
- Entwicklung von serverlosen Funktionen zur Token-Aktualisierung jeder Plattform mit AWS Lambda und Event Bridge.

{{% /details %}}

### 2Digit Co. Ltd. - Tätigkeit als Backend-Entwickler

<img src="https://img.shields.io/badge/DJANGO-092E20?style=for-the-badge&logo=Django&logoColor=white" alt="django" style="display: inline">
<img src="https://img.shields.io/badge/PYTHON-3776AB?style=for-the-badge&logo=Python&logoColor=white" alt="python" style="display: inline">
<img src="https://img.shields.io/badge/JAVASCRIPT-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=black" alt="javascript" style="display: inline">
<img src="https://img.shields.io/badge/DOCKER-2496ED?style=for-the-badge&logo=Docker&logoColor=white" alt="docker" style="display: inline">
<img src="https://img.shields.io/badge/GITHUB%20ACTIONS-2088FF?style=for-the-badge&logo=GitHub-Actions&logoColor=white" alt="github-action" style="display: inline">

> 2022-04 ~ 2022-07

{{% details title="Mehr" closed="true" %}}

- Verantwortlich für die Wartung des Backoffice-Servers und die Entwicklung und Bereitstellung von Trading View.
- Refactoring bestehender SQL-Abfragen in Django mit Django ORM.
- Implementierung eines Aktienkursdiagramms mit dem Javascript-Modul Trading View.

{{% /details %}}

{{% /steps %}}

## 📚 Projekte & Aktivitäten

{{% steps %}}

### Entwicklung des Blog-Plattformprojekts "Plog" für Entwickler als Teamleiter

> 2022-07 ~ 2023-11

<img src="https://img.shields.io/badge/SPRING-6DB33F?style=for-the-badge&logo=Spring&logoColor=white" alt="spring" style="display: inline">
<img src="https://img.shields.io/badge/JAVA-000000?style=for-the-badge&logo=openjdk&logoColor=white" alt="java" style="display: inline">
<img src="https://img.shields.io/badge/POSTGRESQL-336791?style=for-the-badge&logo=PostgreSQL&logoColor=white" alt="postgresql" style="display: inline">
<img src="https://img.shields.io/badge/DOCKER-2496ED?style=for-the-badge&logo=Docker&logoColor=white" alt="docker" style="display: inline">
<img src="https://img.shields.io/badge/GRAFANA-F46800?style=for-the-badge&logo=Grafana&logoColor=white" alt="grafana" style="display: inline">
<img src="https://img.shields.io/badge/AWS%20ECS-FF9900?style=for-the-badge&logo=amazonecs&logoColor=white" alt="ecs" style="display: inline">
<img src="https://img.shields.io/badge/REDIS-FF4438?style=for-the-badge&logo=redis&logoColor=white" alt="prometheus" style="display: inline">
<img src="https://img.shields.io/badge/REACT-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="react" style="display: inline">
<img src="https://img.shields.io/badge/AWS%20AMPLIFY-FF9900?style=for-the-badge&logo=awsamplify&logoColor=white" alt="amplify" style="display: inline">
<img src="https://img.shields.io/badge/GITHUB%20ACTION-2088FF?style=for-the-badge&logo=GitHub-Actions&logoColor=white" alt="github-action" style="display: inline">

{{< cards >}}
{{< card link="https://github.com/project-555" title="Github" subtitle="Sehen Sie sich die detaillierte interne Code- und Modulstruktur des Quellcodes an.">}}
{{< card link="https://project-555.github.io/" title="Blog" subtitle="Details zu wichtigen Projektaspekten und Herausforderungen während der Entwicklung.">}}
{{< card link="https://www.plogcareers.net" title="Plog" subtitle="Der bereitgestellte Dienst, der situationsabhängig aus Kostengründen eventuell geschlossen ist.">}}
{{< /cards >}}

{{% details title="Mehr" closed="true" %}}

- Leitung der Entwicklung der Blog-Plattform "Plog" zur Lernzwecken.
- Wöchentliche Meetings zur Statusüberprüfung und Dokumentation mithilfe von GitHub Discussions.
- Implementierung von REST APIs mit Spring Boot und Speicherung der Hauptdaten mit PostgreSQL.
- Implementierung von API-Caching und E-Mail-Verifizierung mit Redis.
- Einrichtung einer CI/CD-Pipeline von Github Actions über ECR zu ECS.
- Durchführung von Repository-Tests mit Testcontainers und Erstellung von Unit-Tests für jede Schicht.
- Überwachung von CloudWatch-Logs mithilfe von Grafana.
- Implementierung des Frontends mit React und Bereitstellung über AWS Amplify.
- Implementierung eines Dateiuploads und eines Markdown-Editors über Toast UI Editor.

{{% /details %}}

### Leitung eines unternehmensinternen Algorithmus-Studien

<img src="https://img.shields.io/badge/GITHUB-181717?style=for-the-badge&logo=GitHub&logoColor=white" alt="github" style="display: inline">
<img src="https://img.shields.io/badge/ALGORITHM-008000?style=for-the-badge&logo=Algorithm&logoColor=white" alt="algorithm" style="display: inline">

> 2022-05 ~ 2022-06

{{% details title="Mehr" closed="true" %}}

- Durchführung eines Studienprogramms zur Verbesserung der Algorithmenfähigkeiten der Teilnehmer.
- Diskussionen und Code-Reviews zu den zweimal wöchentlich gelösten Algorithmenproblemen.
- Vollständige Studieninhalte sind auf diesem [Github](https://github.com/2022-2digit-study/2022-algorithm-study) erhältlich.

{{% /details %}}

### Leitung eines internen Python Clean Code-Studienprogramms

<img src="https://img.shields.io/badge/WIKIDOCS-56A5EB?style=for-the-badge&logo=Wikidocs&logoColor=white" alt="wikidocs" style="display: inline">
<img src="https://img.shields.io/badge/GITHUB-181717?style=for-the-badge&logo=GitHub&logoColor=white" alt="github" style="display: inline">

> 2022-05 ~ 2022-06

{{< cards >}}
{{< card link="https://wikidocs.net/book/8131" title="Wiki Docs" subtitle="Ergebnisse des Studienprogramms als E-Book, mit dem Fokus auf fehlerhaften Code.">}}
{{< card link="https://github.com/2022-2digit-study/2022-clean-code-study" title="Github" subtitle="Detaillierte Studienregeln und Inhalte">}}
{{< /cards >}}

{{% details title="Mehr" closed="true" %}}

- Durchführung eines Clean Code-Studienprogramms zur tiefergehenden Erforschung der intern verwendeten Python-Methoden.
- Studieninhalte stehen auf diesem [Github](https://github.com/2022-2digit-study/2022-clean-code-study) zur Verfügung.
- Verwendung von WikiDocs zur Erstellung des E-Books [Python False Code](https://wikidocs.net/book/8131) als Studienergebnis.

{{% /details %}}

### Entwicklung einer API zur Verwaltung von Benutzer-Garantiefristen durch Extraktion des Modellnamens aus Shopping-Texten mittels Python-Modell

<img src="https://img.shields.io/badge/PYTHON-3776AB?style=for-the-badge&logo=Python&logoColor=white" alt="python" style="display: inline">
<img src="https://img.shields.io/badge/MARIADB-003545?style=for-the-badge&logo=MariaDB&logoColor=white" alt="mariadb" style="display: inline">
<img src="https://img.shields.io/badge/SPRING-6DB33F?style=for-the-badge&logo=Spring&logoColor=white" alt="spring" style="display: inline">
<img src="https://img.shields.io/badge/EC2-232F3E?style=for-the-badge&logo=amazonec2&logoColor=white" alt="ec2" style="display: inline">

{{< cards >}}
{{< card link="https://github.com/MaPDuck" title="Github">}}
{{< card link="https://gossamer-liver-d26.notion.site/MaPDuck-3e842cb9f60c4dfe878a97c3506ef2ae" title="Notion">}}
{{< /cards >}}

> 2021-09 ~ 2021-11

{{% details title="Mehr" closed="true" %}}

- Entwicklung eines Projekts zur Plattformverwaltung von Modellnamen und Garantiezeiten diverser Produkte.
- Entwicklung einer API zur Verwaltung von Benutzer-Garantiezeiten durch Extraktion von Modellnamen aus Shopping-Texten mit Python.
- Die Umsetzung des Projekts finden Sie auf diesem [Github](https://github.com/MaPDuck).
- Detaillierte Projektausführungen sind auf diesem [Notion](https://gossamer-liver-d26.notion.site/MaPDuck-3e842cb9f60c4dfe878a97c3506ef2ae) zu finden.

{{% /details %}}

### Grundlagenvorlesung über Python in der Inha University Big Data Society [IBAS](https://www.inhabas.com)

<img src="https://img.shields.io/badge/PYTHON-3776AB?style=for-the-badge&logo=Python&logoColor=white" alt="python" style="display: inline">
<img src="https://img.shields.io/badge/YOUTUBE-FF0000?style=for-the-badge&logo=YouTube&logoColor=white" alt="youtube" style="display: inline">

> 2021-03 ~ 2021-07

{{% details title="Mehr" closed="true" %}}

- Durchführung einer Grundlagenvorlesung über Python zur Verbesserung der Fähigkeiten der Society-Mitglieder.
- Durchführung der Vorlesungsreihe in der Inha University Big Data Society [IBAS](https://www.inhabas.com).
- Aufgezeichnete Vorlesungen befinden sich in diesem [Link](/lecture/#2-python-basic).

{{% /details %}}

### Leitung des Webseitenerstellungsprojekts der Inha University Big Data Society [IBAS](https://www.inhabas.com)

<img src="https://img.shields.io/badge/PYTHON-3776AB?style=for-the-badge&logo=Python&logoColor=white" alt="python" style="display: inline">
<img src="https://img.shields.io/badge/DJANGO-092E20?style=for-the-badge&logo=Django&logoColor=white" alt="django" style="display: inline">
<img src="https://img.shields.io/badge/MARIADB-003545?style=for-the-badge&logo=MariaDB&logoColor=white" alt="mariadb" style="display: inline">
<img src="https://img.shields.io/badge/EC2-232F3E?style=for-the-badge&logo=amazonec2&logoColor=white" alt="ec2" style="display: inline">
<img src="https://img.shields.io/badge/NGINX-269539?style=for-the-badge&logo=NGINX&logoColor=white" alt="nginx" style="display: inline">
<img src="https://img.shields.io/badge/HTML-E34F26?style=for-the-badge&logo=HTML5&logoColor=white" alt="html" style="display: inline">
<img src="https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=CSS3&logoColor=white" alt="css" style="display: inline">
<img src="https://img.shields.io/badge/JAVASCRIPT-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=black" alt="javascript" style="display: inline">

> 2020-12 ~ 2021-09

{{< cards >}}
{{< card link="https://github.com/YangTaeyoung/IBAS" title="Github">}}
{{< card link="https://www.inhabas.com" title="IBAS">}}
{{< /cards >}}

{{% details title="Mehr" closed="true" %}}

- Verantwortlich für die Backend-Architektur und Entwicklung mit dem Model-View-Template (MTV) Muster von Django.
- Wöchentliche Meetings zur Überwachung des Projektfortschritts und zur Verwaltung des Projektplans.
- Verwendung von Django Template für die Frontend-Entwicklung und Datenübergabe mithilfe von Django Context.
- Bereitstellung auf AWS EC2 und Aufbau eines Webservers mit Nginx.
- Der tatsächliche Code des Projekts kann auf diesem [Github](https://github.com/YangTaeyoung/IBAS) eingesehen werden.

{{% /details %}}

### Teilnahme am Hainum ICT Mentoring

<img src="https://img.shields.io/badge/SPRING-6DB33F?style=for-the-badge&logo=Spring&logoColor=white" alt="spring" style="display: inline">
<img src="https://img.shields.io/badge/HADOOP-FF7F00?style=for-the-badge&logo=Apache-Hadoop&logoColor=white" alt="hadoop" style="display: inline">
<img src="https://img.shields.io/badge/JAVASCRIPT-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=black" alt="javascript" style="display: inline">

> 2020-04 ~ 2020-11

{{% details title="Mehr" closed="true" %}}

- Teilnahme als Mentee am Hainum ICT Mentoring.
- Durchführung eines Projekts mit dem Spring Legacy Framework.
- Ausführung eines einfachen Word Count Projekts mit Hadoop zur Extraktion verwandter Suchbegriffe.

{{% /details %}}

### Vorlesungen über Oracle Database SQL

<img src="https://img.shields.io/badge/ORACLE-F80000?style=for-the-badge&logo=Oracle&logoColor=white" alt="oracle" style="display: inline">
<img src="https://img.shields.io/badge/YOUTUBE-FF0000?style=for-the-badge&logo=YouTube&logoColor=white" alt="youtube" style="display: inline">

> 2020-04 ~ 2020-07

{{% details title="Mehr" closed="true" %}}

- Durchführung von Vorlesungen über SQL mit Oracle Database im Inha University Programming Club IGRUS.
- Aufgezeichnete Vorlesungen stehen unter diesem [Link](/lecture/#1-oracle-database-sql) zur Verfügung.

{{% /details %}}

{{% /steps %}}