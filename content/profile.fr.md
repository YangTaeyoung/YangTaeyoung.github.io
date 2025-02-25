---
translated: true
title: Bonjour, 코드기린 👋
type: about
date: 2022-07-13
---

<img src="/images/profile/profile.jpg" width="500" style="border-radius: 50%"> 

Bonjour. Je suis **Yang Tae-yeong**, un _développeur inconfortable pour un monde confortable_.

Je m'efforce toujours d'améliorer ce qui est inconfortable autour de moi, de créer des services stables et de bonnes structures.

## 📚 Compétences

|    Catégorie   | Compétences                                            |
|:--------------:|-------------------------------------------------------|
|     Backend    | Java, Spring Boot, Go, Echo Framework, Python, Django |
|    Frontend    | Javascript, Typescript, React                         |
|    Base de données | MySQL, PostgreSQL, MongoDB, Redis, Elasticsearch  |
|  File d'attente | AWS SQS, RabbitMQ                                    |
|     DevOps     | Docker, AWS, Github Actions                           |
|      IDE       | IntelliJ, Goland, PyCharm                             |
|      Autres    | Git, Github, Jira, Confluence, Notion                 |

## 📃 Parcours

{{% steps %}}

### Illuminarian SAS - Ingénieur backend en poste

> 2024-04 ~ Actuellement

<img src="https://img.shields.io/badge/SPRING-6DB33F?style=for-the-badge&logo=Spring&logoColor=white" alt="spring" style="display: inline">
<img src="https://img.shields.io/badge/JAVA-000000?style=for-the-badge&logo=openjdk&logoColor=white" alt="java" style="display: inline">
<img src="https://img.shields.io/badge/MYSQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="mysql" style="display: inline">
<img src="https://img.shields.io/badge/GRAFANA-F46800?style=for-the-badge&logo=Grafana&logoColor=white" alt="grafana" style="display: inline">
<img src="https://img.shields.io/badge/PROMETHEUS-E6522C?style=for-the-badge&logo=Prometheus&logoColor=white" alt="prometheus" style="display: inline">
<img src="https://img.shields.io/badge/AWS%20SQS-FF4F8B?style=for-the-badge&logo=amazonsqs&logoColor=white" alt="prometheus" style="display: inline">
<img src="https://img.shields.io/badge/REDIS-FF4438?style=for-the-badge&logo=redis&logoColor=white" alt="prometheus" style="display: inline">

{{% details title="Plus" closed="true" %}}

#### Energy Shares US

- J'étais responsable de la maintenance et du développement des nouvelles fonctionnalités du serveur et du back-office pour la plateforme de crowdfunding d'investissement en énergies renouvelables Energy Shares US.
- J'ai implémenté l'API REST en utilisant Spring Boot et stocké les données avec MySQL.
- J'ai construit un pipeline CI/CD d'Actions Github > ECR > Event Bridge > ECS.
- J'ai amélioré la fiabilité des tests et optimisé le temps d'exécution.
    - J'ai augmenté la fiabilité des requêtes en ajoutant des tests de repository via Testcontainers.
    - Pour optimiser le temps de test, j'ai séparé `@SpringBootTest` en `@WebMvcTest` et `@DataJpaTest` pour réduire le temps d'exécution des tests à un tiers.
    - J'ai introduit un Self-Hosted Runner pour optimiser le temps d'exécution et préparé [une mesure de secours en cas d'échec du Self-Hosted Runner](/blog/github-action/self-hosted-online-checker/).
- J'ai mis en place un système de traçage distribué avec Grafana Tempo.
- J'ai facilité la traçabilité des logs en attribuant [TraceID et SpanID aux champs de log](/blog/spring/trace-id-and-span-id-logging/) et amélioré la recherche sur la plate-forme de recherche en [modifiant le format de log en JSON](/blog/spring/logback_json/).
- J'ai développé un outil de comparaison de fichiers de configuration pour résoudre le problème de paramètres manquants lors du déploiement](/blog/trouble-shooting/config-differ-check/).
- J'ai réalisé un test de charge avec Locust pour définir les spécifications adéquates du serveur et résoudre les problèmes de performance.
    - J'ai amélioré les performances en traitant de manière asynchrone les cas de réponse lente dus à un autre fournisseur de plateforme en utilisant AWS SQS.
    - J'ai abaissé la charge en cachant les réponses API lentes avec Redis.
- J'ai effectué le suivi du système à l'aide de Prometheus.

{{% /details %}}

### Looko SA - Ingénieur backend en poste

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

{{% details title="Plus" closed="true" %}}

#### Écloset

- Je me suis occupé de l'API, des tâches programmées et de la maintenance des serveurs du service Écloset, qui reçoit 400 000 visiteurs mensuels.
- J'ai conçu les données de base pour les transactions de seconde main et implémenté les API correspondantes.

#### Looko AI

- J'ai mis en place le backend pour le service [Looko AI](https://business.acloset.net) afin d'améliorer l'efficacité du travail des commerçants de vêtements vintage d'occasion.
- J'ai utilisé Go avec le framework Echo et stocké les données dans MongoDB.
- J'ai synchronisé le statut des services liés aux commandes/produits/réclamations de trois sources (Écloset, Café24, Naver Smart Store) avec Looko AI à l'aide de [FSM](https://github.com/looplab/fsm) et géré la synchronisation en temps réel de 300 000 produits et 50 000 commandes.
- J'ai utilisé AWS Lambda et Event Bridge pour créer une fonction serverless qui rafraîchit les tokens pour chaque plateforme.

{{% /details %}}

### Twodigit SA - Ingénieur backend en poste

<img src="https://img.shields.io/badge/DJANGO-092E20?style=for-the-badge&logo=Django&logoColor=white" alt="django" style="display: inline">
<img src="https://img.shields.io/badge/PYTHON-3776AB?style=for-the-badge&logo=Python&logoColor=white" alt="python" style="display: inline">
<img src="https://img.shields.io/badge/JAVASCRIPT-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=black" alt="javascript" style="display: inline">
<img src="https://img.shields.io/badge/DOCKER-2496ED?style=for-the-badge&logo=Docker&logoColor=white" alt="docker" style="display: inline">
<img src="https://img.shields.io/badge/GITHUB%20ACTIONS-2088FF?style=for-the-badge&logo=GitHub-Actions&logoColor=white" alt="github-action" style="display: inline">

> 2022-04 ~ 2022-07

{{% details title="Plus" closed="true" %}}

- En tant qu'ingénieur backend, j'ai été responsable de la maintenance du serveur back-office, du développement et du déploiement de la vue trading.
- J'ai refait le code SQL des requêtes en utilisant l'ORM de Django.
- J'ai utilisé le module Javascript Trading View pour implémenter des graphiques boursiers.

{{% /details %}}

{{% /steps %}}

## 📚 Projets & Activités

{{% steps %}}

### Responsable du développement de la plateforme de blogs pour développeurs "Plog"

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
{{< card link="https://github.com/project-555" title="Github" subtitle="Découvrez comment le code source est structuré, en examinant en détail l'intérieur de chaque section." >}}
{{< card link="https://project-555.github.io/" title="Blog" subtitle="Retrouvez ce qui a été bien souligné dans le projet, les défis rencontrés durant le développement.">}}
{{< card link="https://www.plogcareers.net" title="Plog" subtitle="Ceci est le service déployé. Il pourrait être temporairement inactif en raison de soucis de coût." >}}
{{< /cards >}}

{{% details title="Plus" closed="true" %}}

- En tant que leader, j'ai dirigé le développement de la plateforme de blogs pour développeurs "Plog" dans un but éducatif.
- J'ai organisé des réunions hebdomadaires pour suivre l'avancement et utilisé [Github Discussion](https://github.com/project-555/.github/discussions?discussions_q=) pour garder une trace.
- J'ai implémenté une API REST avec Spring Boot et stocké les données principales dans PostgreSQL.
- J'ai utilisé Redis pour mettre en cache les API et implémenter l'authentification par e-mail.
- J'ai construit un pipeline CI/CD comprenant Github Actions > ECR > ECS pour le déploiement.
- J'ai effectué des tests de repository avec Testcontainers et écrit des tests unitaires pour chaque couche.
- J'ai utilisé Grafana pour surveiller les logs de CloudWatch.
- J'ai développé le frontend avec React et l'ai déployé avec AWS Amplify.
- J'ai implémenté l'éditeur de markdown, avec téléchargement de fichiers, en utilisant Toast UI Editor.

{{% /details %}}

### Responsable de l'étude interne de l'algorithme

<img src="https://img.shields.io/badge/GITHUB-181717?style=for-the-badge&logo=GitHub&logoColor=white" alt="github" style="display: inline">
<img src="https://img.shields.io/badge/ALGORITHM-008000?style=for-the-badge&logo=Algorithm&logoColor=white" alt="algorithm" style="display: inline">

> 2022-05 ~ 2022-06

{{% details title="Plus" closed="true" %}}

- J'ai dirigé une étude d'algorithmes pour améliorer individuellement les compétences algorithmiques.
- Deux fois par semaine, nous avons discuté des problèmes algorithmiques résolus et effectué des examens de code.
- Les détails de cette étude peuvent être trouvés sur ce [Github](https://github.com/2022-2digit-study/2022-algorithm-study).

{{% /details %}}

### Responsable d'une étude interne sur le clean code Python

<img src="https://img.shields.io/badge/WIKIDOCS-56A5EB?style=for-the-badge&logo=Wikidocs&logoColor=white" alt="wikidocs" style="display: inline">
<img src="https://img.shields.io/badge/GITHUB-181717?style=for-the-badge&logo=GitHub&logoColor=white" alt="github" style="display: inline">

> 2022-05 ~ 2022-06

{{< cards >}}
{{< card link="https://wikidocs.net/book/8131" title="Wiki Docs" subtitle="Le résultat de l'étude, livre électronique Code Érroné Python, prêt à lire !" >}}
{{< card link="https://github.com/2022-2digit-study/2022-clean-code-study" title="Github" subtitle="Découvrez les règles de l'étude et plus encore." >}}
{{< /cards >}}

{{% details title="Plus" closed="true" %}}

- J'ai organisé une étude sur le clean code de Python pour explorer plus en profondeur le langage utilisé en interne.
- Les détails de cette étude peuvent être trouvés sur ce [Github](https://github.com/2022-2digit-study/2022-clean-code-study).
- Nous avons écrit le livre électronique [Code Python Érroné](https://wikidocs.net/book/8131) en utilisant WikiDocs.

{{% /details %}}

### Développement d'une API de gestion de la garantie utilisateur à partir de l'extraction de modèles de textes de courriel Python

<img src="https://img.shields.io/badge/PYTHON-3776AB?style=for-the-badge&logo=Python&logoColor=white" alt="python" style="display: inline">
<img src="https://img.shields.io/badge/MARIADB-003545?style=for-the-badge&logo=MariaDB&logoColor=white" alt="mariadb" style="display: inline">
<img src="https://img.shields.io/badge/SPRING-6DB33F?style=for-the-badge&logo=Spring&logoColor=white" alt="spring" style="display: inline">
<img src="https://img.shields.io/badge/EC2-232F3E?style=for-the-badge&logo=amazonec2&logoColor=white" alt="ec2" style="display: inline">

{{< cards >}}
{{< card link="https://github.com/MaPDuck" title="Github">}}
{{< card link="https://gossamer-liver-d26.notion.site/MaPDuck-3e842cb9f60c4dfe878a97c3506ef2ae" title="Notion">}}
{{< /cards >}}

> 2021-09 ~ 2021-11

{{% details title="Plus" closed="true" %}}

- Ce projet a été développé pour créer une plate-forme qui gère simultanément les modèles et les garanties de diverses marques de produits.
- J'ai développé une API pour gérer la période de garantie utilisateur en extrayant des modèles de courriel de boutiques en ligne à l'aide de Python.
- La mise en œuvre réelle de ce projet peut être vue sur ce [Github](https://github.com/MaPDuck).
- Plus de détails sur ce projet sont disponibles sur cette page Notion [Notion](https://gossamer-liver-d26.notion.site/MaPDuck-3e842cb9f60c4dfe878a97c3506ef2ae).

{{% /details %}}

### Formateur des bases de Python pour le club de big data [IBAS](https://www.inhabas.com) de l'Université d'Inha

<img src="https://img.shields.io/badge/PYTHON-3776AB?style=for-the-badge&logo=Python&logoColor=white" alt="python" style="display: inline">
<img src="https://img.shields.io/badge/YOUTUBE-FF0000?style=for-the-badge&logo=YouTube&logoColor=white" alt="youtube" style="display: inline">

> 2021-03 ~ 2021-07

{{% details title="Plus" closed="true" %}}

- En tant que membre fondateur du club, j'ai donné une formation de base en Python pour améliorer les compétences des membres.
- J'ai donné une formation de base en Python pour le club de big data [IBAS](https://www.inhabas.com) de l'Université d'Inha.
- Les formations effectuées peuvent être consultées via ce [lien](/lecture/#2-python-basic).

{{% /details %}}

### Responsable de projet pour le développement du site internet du club de big data [IBAS](https://www.inhabas.com) de l'Université d'Inha

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

{{% details title="Plus" closed="true" %}}

- J'ai été responsable de l'architecture backend, en utilisant Django pour développer une application basée sur le modèle MTV (Model, View, Template).
- J'ai partagé le statut du projet via des réunions hebdomadaires et géré le calendrier du projet.
- J'ai créé le frontend à l'aide de Django Template et utilisé Django Context pour passer les données.
- J'ai utilisé AWS EC2 pour le déploiement et Nginx pour configurer le serveur web.
- Le code réel de ce projet peut être examiné sur ce [Github](https://github.com/YangTaeyoung/IBAS).

{{% /details %}}

### Participation au mentoring ICT Hanium

<img src="https://img.shields.io/badge/SPRING-6DB33F?style=for-the-badge&logo=Spring&logoColor=white" alt="spring" style="display: inline">
<img src="https://img.shields.io/badge/HADOOP-FF7F00?style=for-the-badge&logo=Apache-Hadoop&logoColor=white" alt="hadoop" style="display: inline">
<img src="https://img.shields.io/badge/JAVASCRIPT-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=black" alt="javascript" style="display: inline">

> 2020-04 ~ 2020-11

{{% details title="Plus" closed="true" %}}

- J'ai participé en tant que mentoré au mentoring ICT Hanium.
- J'ai utilisé le framework Spring Legacy pour mener le projet.
- J'ai effectué un projet pour extraire des mots-clés liés à l'aide d'un simple comptage de mots avec Hadoop.

{{% /details %}}

### Formateur en SQL pour base de données Oracle

<img src="https://img.shields.io/badge/ORACLE-F80000?style=for-the-badge&logo=Oracle&logoColor=white" alt="oracle" style="display: inline">
<img src="https://img.shields.io/badge/YOUTUBE-FF0000?style=for-the-badge&logo=YouTube&logoColor=white" alt="youtube" style="display: inline">

> 2020-04 ~ 2020-07

{{% details title="Plus" closed="true" %}}

- J'ai donné une formation en SQL pour base de données Oracle au sein du club de programmation IGRUS de l'Université d'Inha.
- Les formations dispensées peuvent être consultées via ce [lien](/lecture/#1-oracle-database-sql).

{{% /details %}}

{{% /steps %}}
