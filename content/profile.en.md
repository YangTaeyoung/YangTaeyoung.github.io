---
translated: true
title: Hello, CodeGiraffe 👋
type: about
date: 2022-07-13
---

<img src="/images/profile/profile.jpg" width="500" style="border-radius: 50%">

Hello, I am **Taeyoung Yang**, an _"inconvenient developer for a convenient world."_

I'm constantly thinking and working hard to improve the inconveniences around us and to create stable services and good structures.

## 📚 Skills

|    Category    | Skills                                                |
|:--------------:|-------------------------------------------------------|
|    Backend     | Java, Spring Boot, Go, Echo Framework, Python, Django |
|    Frontend    | Javascript, Typescript, React                         |
|    Database    | MySQL, PostgreSQL, MongoDB, Redis, Elasticsearch      |
| Message Queue  | AWS SQS, RabbitMQ                                     |
|     DevOps     | Docker, AWS, Github Actions                           |
|      IDE       | IntelliJ, Goland, PyCharm                             |
|      Etc       | Git, Github, Jira, Confluence, Notion                 |

## 📃 Careers

{{% steps %}}

### Illuminarian Co., Ltd. - Backend Engineer

> 2024-04 ~ Present

<img src="https://img.shields.io/badge/SPRING-6DB33F?style=for-the-badge&logo=Spring&logoColor=white" alt="spring" style="display: inline">
<img src="https://img.shields.io/badge/JAVA-000000?style=for-the-badge&logo=openjdk&logoColor=white" alt="java" style="display: inline">
<img src="https://img.shields.io/badge/MYSQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="mysql" style="display: inline">
<img src="https://img.shields.io/badge/GRAFANA-F46800?style=for-the-badge&logo=Grafana&logoColor=white" alt="grafana" style="display: inline">
<img src="https://img.shields.io/badge/PROMETHEUS-E6522C?style=for-the-badge&logo=Prometheus&logoColor=white" alt="prometheus" style="display: inline">
<img src="https://img.shields.io/badge/AWS%20SQS-FF4F8B?style=for-the-badge&logo=amazonsqs&logoColor=white" alt="prometheus" style="display: inline">
<img src="https://img.shields.io/badge/REDIS-FF4438?style=for-the-badge&logo=redis&logoColor=white" alt="prometheus" style="display: inline">

{{% details title="More" closed="true" %}}

#### Energy Shares US

- Responsible for server, back-office maintenance, and new feature development of the renewable energy investment crowdfunding platform Energy Shares US.
- Implemented REST API using Spring Boot and stored data using MySQL.
- Built a deployment CI/CD pipeline linking Github Actions > ECR > Event Bridge > ECS.
- Improved test reliability and optimized execution time.
    - Enhanced query reliability by adding Repository Test via Testcontainers.
    - Optimized test execution time by separating `@SpringBootTest` into `@WebMvcTest` and `@DataJpaTest`, reducing it to one-third.
    - Introduced Self-Hosted Runner to optimize execution time and prepared failover measures in case of Self-Hosted Runner downtime.
- Built a distributed tracing system using Grafana Tempo.
- [Improved log tracking by adding TraceID and SpanID to logging fields](/blog/spring/trace-id-and-span-id-logging/) and [changed logging format to JSON](/blog/spring/logback_json/) for easier searchability on platforms.
- [Developed a configuration file comparison tool](/blog/trouble-shooting/config-differ-check/) to resolve environment configuration omission issues during deployment.
- Conducted load testing using Locust to define appropriate server specs and improve performance.
    - Improved performance by asynchronizing cases where responses slowed due to external platforms using AWS SQS.
    - Used Redis to cache slow API responses, reducing load.
- Used Prometheus for monitoring.

{{% /details %}}

### Looko Co., Ltd. - Backend Engineer

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

{{% details title="More" closed="true" %}}

#### Acloset

- Responsible for API, batch, server maintenance for the Acloset service handling 400,000 MAU.
- Designed basic data structure for second-hand transactions and implemented related APIs.

#### Looko AI

- Constructed the backend for the service [Looko AI](https://business.acloset.net) to enhance work efficiency for vintage clothing businesses.
- Used Echo framework in Golang and stored data with MongoDB.
- Synchronized service status of orders/products/claims from three multisources (Acloset, Cafe24, Naver Smart Store) with Looko AI using [FSM](https://github.com/looplab/fsm), processing real-time synchronization for 300,000 products and 50,000 orders.
- Built serverless functions to refresh platform tokens using AWS Lambda and Event Bridge.

{{% /details %}}

### TwoDigits Co., Ltd - Backend Engineer

<img src="https://img.shields.io/badge/DJANGO-092E20?style=for-the-badge&logo=Django&logoColor=white" alt="django" style="display: inline">
<img src="https://img.shields.io/badge/PYTHON-3776AB?style=for-the-badge&logo=Python&logoColor=white" alt="python" style="display: inline">
<img src="https://img.shields.io/badge/JAVASCRIPT-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=black" alt="javascript" style="display: inline">
<img src="https://img.shields.io/badge/DOCKER-2496ED?style=for-the-badge&logo=Docker&logoColor=white" alt="docker" style="display: inline">
<img src="https://img.shields.io/badge/GITHUB%20ACTIONS-2088FF?style=for-the-badge&logo=GitHub-Actions&logoColor=white" alt="github-action" style="display: inline">

> 2022-04 ~ 2022-07

{{% details title="More" closed="true" %}}

- Responsible for back-office server maintenance, trading view development and deployment as a backend engineer.
- Refactored SQL queries in Django to Django ORM.
- Implemented stock charts using the Javascript module Trading View.

{{% /details %}}

{{% /steps %}}

## 📚 Projects & Activities

{{% steps %}}

### Lead Developer of the "Plog" Blog Platform for Developers

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
{{< card link="https://github.com/project-555" title="Github" subtitle="Explore how the source code is structured, with detailed internal code and configurations for each part." >}}
{{< card link="https://project-555.github.io/" title="Blog" subtitle="Documentations on key focus areas during the project and challenges faced during development.">}}
{{< card link="https://www.plogcareers.net" title="Plog" subtitle="Currently deployed service. May be shut down due to cost issues.">}}
{{< /cards >}}

{{% details title="More" closed="true" %}}

- Led the development of the blog platform "Plog" for developers, mainly for learning purposes.
- Conducted weekly meetings to monitor progress and used [Github Discussion](https://github.com/project-555/.github/discussions?discussions_q=) for documentation.
- Implemented REST API using Spring Boot and stored main data with PostgreSQL.
- Used Redis for API caching and email verification.
- Built deployment CI/CD pipeline linking Github Actions > ECR > ECS.
- Conducted Repository Test via Testcontainers, and wrote unit test codes for each layer.
- Used Grafana to monitor CloudWatch logs.
- Implemented the frontend using React, deployed with AWS Amplify.
- Implemented file upload and markdown editor using Toast UI Editor.

{{% /details %}}

### Leader of Internal Algorithm Study

<img src="https://img.shields.io/badge/GITHUB-181717?style=for-the-badge&logo=GitHub&logoColor=white" alt="github" style="display: inline">
<img src="https://img.shields.io/badge/ALGORITHM-008000?style=for-the-badge&logo=Algorithm&logoColor=white" alt="algorithm" style="display: inline">

> 2022-05 ~ 2022-06

{{% details title="More" closed="true" %}}

- Conducted an algorithm study to enhance the individual algorithm-solving capabilities.
- Held discussions and code reviews for solved algorithm problems twice a week.
- The content of this study can be found on the corresponding [Github](https://github.com/2022-2digit-study/2022-algorithm-study).

{{% /details %}}

### Leader of Python Clean Code Study

<img src="https://img.shields.io/badge/WIKIDOCS-56A5EB?style=for-the-badge&logo=Wikidocs&logoColor=white" alt="wikidocs" style="display: inline">
<img src="https://img.shields.io/badge/GITHUB-181717?style=for-the-badge&logo=GitHub&logoColor=white" alt="github" style="display: inline">

> 2022-05 ~ 2022-06

{{< cards >}}
{{< card link="https://wikidocs.net/book/8131" title="Wiki Docs" subtitle="The result of the study, an electronic book. Pay attention to the incorrect codes!" >}}
{{< card link="https://github.com/2022-2digit-study/2022-clean-code-study" title="Github" subtitle="Explore more about the study's rules and contents">}}
{{< /cards >}}

{{% details title="More" closed="true" %}}

- Conducted a Python clean code study to delve deeper into Python used within the company.
- The content of this study can be found on the corresponding [Github](https://github.com/2022-2digit-study/2022-clean-code-study).
- Documented the study's outcome as an e-book titled [Python Incorrect Codes](https://wikidocs.net/book/8131) using WikiDocs.

{{% /details %}}

### Development of API for User Warranty Management through Python Model Extraction from Shopping Mall Text

<img src="https://img.shields.io/badge/PYTHON-3776AB?style=for-the-badge&logo=Python&logoColor=white" alt="python" style="display: inline">
<img src="https://img.shields.io/badge/MARIADB-003545?style=for-the-badge&logo=MariaDB&logoColor=white" alt="mariadb" style="display: inline">
<img src="https://img.shields.io/badge/SPRING-6DB33F?style=for-the-badge&logo=Spring&logoColor=white" alt="spring" style="display: inline">
<img src="https://img.shields.io/badge/EC2-232F3E?style=for-the-badge&logo=amazonec2&logoColor=white" alt="ec2" style="display: inline">

{{< cards >}}
{{< card link="https://github.com/MaPDuck" title="Github">}}
{{< card link="https://gossamer-liver-d26.notion.site/MaPDuck-3e842cb9f60c4dfe878a97c3506ef2ae" title="Notion">}}
{{< /cards >}}

> 2021-09 ~ 2021-11

{{% details title="More" closed="true" %}}

- Conducted this project to develop a platform that manages model names and warranty periods of various products simultaneously.
- Developed an API for user warranty management through model extraction from shopping mall text using Python.
- The actual implementation of this project can be found on the corresponding [Github](https://github.com/MaPDuck).
- Detailed information about the project is available on the corresponding [Notion](https://gossamer-liver-d26.notion.site/MaPDuck-3e842cb9f60c4dfe878a97c3506ef2ae).

{{% /details %}}

### Python Basics Lecturer for Inha University Big Data Club [IBAS](https://www.inhabas.com)

<img src="https://img.shields.io/badge/PYTHON-3776AB?style=for-the-badge&logo=Python&logoColor=white" alt="python" style="display: inline">
<img src="https://img.shields.io/badge/YOUTUBE-FF0000?style=for-the-badge&logo=YouTube&logoColor=white" alt="youtube" style="display: inline">

> 2021-03 ~ 2021-07

{{% details title="More" closed="true" %}}

- Delivered Python basics lectures to enhance club members' skills as an initial member of the club.
- Conducted Python basic lectures for the Inha University Big Data Club [IBAS](https://www.inhabas.com).
- The conducted lectures are available at this [link](/lecture/#2-python-basic).

{{% /details %}}

### Team Leader of Inha University Big Data Club [IBAS](https://www.inhabas.com) Website Creation Project

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

{{% details title="More" closed="true" %}}

- Responsible for overall backend architecture and development using Django's MTV (Model, View, Template) pattern.
- Shared project progress through weekly meetings and managed project timelines.
- Configured the frontend using Django Template and transmitted data using Django Context.
- Deployed using AWS EC2 and configured the web server using Nginx.
- The actual implementation of the project can be found on the corresponding [Github](https://github.com/YangTaeyoung/IBAS).

{{% /details %}}

### Participation in Hanium ICT Mentorship

<img src="https://img.shields.io/badge/SPRING-6DB33F?style=for-the-badge&logo=Spring&logoColor=white" alt="spring" style="display: inline">
<img src="https://img.shields.io/badge/HADOOP-FF7F00?style=for-the-badge&logo=Apache-Hadoop&logoColor=white" alt="hadoop" style="display: inline">
<img src="https://img.shields.io/badge/JAVASCRIPT-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=black" alt="javascript" style="display: inline">

> 2020-04 ~ 2020-11

{{% details title="More" closed="true" %}}

- Participated as a mentee in the Hanium ICT Mentorship.
- Conducted projects using the Spring Legacy framework.
- Conducted projects extracting related search terms through simple word counting using Hadoop.

{{% /details %}}

### Oracle Database SQL Lecturer

<img src="https://img.shields.io/badge/ORACLE-F80000?style=for-the-badge&logo=Oracle&logoColor=white" alt="oracle" style="display: inline">
<img src="https://img.shields.io/badge/YOUTUBE-FF0000?style=for-the-badge&logo=YouTube&logoColor=white" alt="youtube" style="display: inline">

> 2020-04 ~ 2020-07

{{% details title="More" closed="true" %}}

- Delivered Oracle Database SQL lectures at the Inha University Programming Club IGRUS.
- The conducted lectures are available at the following [link](/lecture/#1-oracle-database-sql).

{{% /details %}}

{{% /steps %}}
