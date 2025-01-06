---
title: Hello, 코드기린 👋
type: about
date: 2022-07-13
---



<img src="/images/profile/profile.jpg" width="500"> 

안녕하세요. _"편리한 세상을 위한 불편한 개발자"_ **양태영**입니다

## 📃 Careers

{{% steps %}}

### (유)일루미나리안 - 백엔드 엔지니어 재직
> 2024-04 ~ 현재
 
<img src="https://img.shields.io/badge/SPRING-6DB33F?style=for-the-badge&logo=Spring&logoColor=white" alt="spring" style="display: inline">
<img src="https://img.shields.io/badge/JAVA-000000?style=for-the-badge&logo=openjdk&logoColor=white" alt="java" style="display: inline">
<img src="https://img.shields.io/badge/MYSQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="mysql" style="display: inline">
<img src="https://img.shields.io/badge/GRAFANA-F46800?style=for-the-badge&logo=Grafana&logoColor=white" alt="grafana" style="display: inline">
<img src="https://img.shields.io/badge/PROMETHEUS-E6522C?style=for-the-badge&logo=Prometheus&logoColor=white" alt="prometheus" style="display: inline">
<img src="https://img.shields.io/badge/AWS%20SQS-FF4F8B?style=for-the-badge&logo=amazonsqs&logoColor=white" alt="prometheus" style="display: inline">
<img src="https://img.shields.io/badge/REDIS-FF4438?style=for-the-badge&logo=redis&logoColor=white" alt="prometheus" style="display: inline">

{{% details title="More" closed="true" %}}

#### Energy Shares US
- 신재생 에너지 투자 크라우드 펀딩 투자 플랫폼 Energy Shares US의 서버, 백오피스 유지보수 및 신규 기능 개발을 담당하였습니다.
- Spring Boot를 사용하여 REST API를 구현하였으며, MySQL을 사용하여 데이터를 저장하였습니다.
- Github Actions > ECR > Event Bridge > ECS 로 이어지는 배포 CI/CD 파이프라인을 구축하였습니다.
- 테스트 관련 신뢰성을 향상시키고 실행 시간을 최적화 하였습니다.
  - Testcontainers를 통해 Repository Test를 추가하여 쿼리에 대한 신뢰성을 향상시켰습니다.
  - 테스트 시간을 최적화하기 위해 `@SpringBootTest`를 `@WebMvcTest`와 `DataJpaTest`로 분리하여 실행시간을 3분의 1로 최적화하였습니다.
  - Self-Hosted Runner를 도입하여 실행시간을 최적화하고, [Self-Hosted Runner가 다운되었을 때 Failover를 위한 대비책을 마련](/blog/github-action/self-hosted-online-checker/)하였습니다.
- Grafana Tempo를 활용한 분산 추적 시스템을 구축하였습니다.
- 로깅 필드에 [TraceID, SpanID를 부여하여 로그 추적이 용이](/blog/spring/trace-id-and-span-id-logging/)하게 변경하고, [로깅 포맷을 JSON으로 변경함](/blog/spring/logback_json/)으로써 검색 플랫폼에서 좀 더 검색이 용이하도록 개선하였습니다. 
- 배포 시 [환경 설정이 누락되는 문제를 해결하기 위해 설정 파일 비교 도구를 개발](/blog/trouble-shooting/config-differ-check/)하였습니다.
- Locust를 활용하여 부하 테스트를 진행하여 서버 적정 스펙을 정의하고, 성능상의 문제를 찾아 개선하였습니다.
  - 외부 플랫폼으로 인해 응답이 느려지는 케이스를 AWS SQS를 활용하여 비동기 처리하고 성능을 개선하였습니다.
  - Redis를 활용하여 반응이 늦은 API 응답을 캐시하여 부하를 낮추었습니다.
-  Prometheus를 활용하여 모니터링을 진행하였습니다.

{{% /details %}}

### (주)룩코 - 백엔드 엔지니어 재직
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

#### 에이클로젯
- 40만 MAU를 받아내는 에이클로젯 서비스에 API, 배치, 서버 유지보수를 담당하였습니다.
- 중고 거래의 기초 데이터 설계 및 관련 API를 구현하였습니다.

#### Looko AI
- 중고 빈티지 의류 사업자의 작업 효율을 높이기 위한 서비스 [Looko AI](https://business.acloset.net)의 백엔드를 구축하였습니다.
- Golang 의 Echo 프레임워크를 사용하였고, MongoDB를 사용하여 데이터를 저장하였습니다.
- 3개의 멀티소스 (에이클로젯, 카페24, 네이버 스마트 스토어)의 주문/상품/클레임에 대한 서비스 상태를 [FSM](https://github.com/looplab/fsm)을 통해 Looko AI와 동기화 하고, 30만건의 상품, 5만건의 주문의 상태를 실시간 동기화 처리한 경험이 있습니다.
- AWS Lambda, Event Bridge 를 사용하여 각 플랫폼의 토큰을 리프레시하는 서비리스 함수를 구축한 경험이 있습니다.

{{% /details %}}



### (주)투디지트 - 백엔드 엔지니어 재직
<img src="https://img.shields.io/badge/DJANGO-092E20?style=for-the-badge&logo=Django&logoColor=white" alt="django" style="display: inline">
<img src="https://img.shields.io/badge/PYTHON-3776AB?style=for-the-badge&logo=Python&logoColor=white" alt="python" style="display: inline">
<img src="https://img.shields.io/badge/JAVASCRIPT-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=black" alt="javascript" style="display: inline">
<img src="https://img.shields.io/badge/DOCKER-2496ED?style=for-the-badge&logo=Docker&logoColor=white" alt="docker" style="display: inline">
<img src="https://img.shields.io/badge/GITHUB%20ACTIONS-2088FF?style=for-the-badge&logo=GitHub-Actions&logoColor=white" alt="github-action" style="display: inline">

> 2022-04 ~ 2022-07

{{% details title="More" closed="true" %}}

- 백엔드 엔지니어로써 백오피스 서버 유지보수 및 트레이딩 뷰 개발 및 배포를 담당하였습니다.
- Django에서 SQL쿼리로 되어있는 부분을 Django ORM으로 리펙토링한 경험이 있습니다.
- Javascript 모듈 Trading View를 이용하여 주가 차트를 구현한 경험이 있습니다.

{{% /details %}}


{{% /steps %}}

## 📚 Projects & Activities

{{% steps %}} 

### 개발자를 위한 블로그 플랫폼 "Plog" 개발 팀장
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
{{< card link="https://github.com/project-555" title="Github" subtitle="어떻게 소스코드가 구성되어 있는지, 각 파트별 디테일한 내부 코드와 구성을 살펴볼 수 있어요." >}}
{{< card link="https://project-555.github.io/" title="Blog" subtitle="프로젝트에서 신경 쓴 부분, 개발하면서 맞이하였던 역경을 기록해두었어요.">}}
{{< card link="https://www.plogcareers.net" title="Plog" subtitle="배포되어 있는 서비스에요. 상황에 따라 비용 문제로 닫혀있을 수 있어요." >}}
{{< /cards >}}

{{% details title="More" closed="true" %}}

- 공부를 목적으로 개발자를 위한 블로그 플랫폼 "Plog"의 팀장으로 개발을 리딩하였습니다.
- 매주 회의를 통해 진행사항을 확인하고 [Github Discussion](https://github.com/project-555/.github/discussions?discussions_q=)을 활용하여 기록을 남겨두었습니다.
- Spring Boot를 사용하여 REST API를 구현하였으며, PostgreSQL을 사용하여 메인 데이터를 저장하였습니다.
- Redis를 이용하여 API 캐싱, 이메일 인증을 구현하였습니다.
- Github Actions > ECR > ECS 로 이어지는 배포 CI/CD 파이프라인을 구축하였습니다.
- Testcontainers를 통해 Repository Test를 진행하였고, 각 레이어별 유닛 테스트 코드를 작성하였습니다.
- Grafana를 활용하여 CloudWatch 로그를 모니터링하였습니다.
- React를 사용하여 프론트엔드를 구현하였으며, AWS Amplify를 사용하여 배포하였습니다.
- Toast UI Editor를 통해 파일 업로드 및 마크다운 에디터를 구현하였습니다.

{{% /details %}}

### 알고리즘 사내 스터디장
<img src="https://img.shields.io/badge/GITHUB-181717?style=for-the-badge&logo=GitHub&logoColor=white" alt="github" style="display: inline">
<img src="https://img.shields.io/badge/ALGORITHM-008000?style=for-the-badge&logo=Algorithm&logoColor=white" alt="algorithm" style="display: inline">

> 2022-05 ~ 2022-06

{{% details title="More" closed="true" %}}

- 개개인의 알고리즘 실력을 향상시키기 위해 알고리즘 스터디를 진행하였습니다.
- 매주 2회 푼 알고리즘 문제에 대해 토의하고, 코드 리뷰를 진행하였습니다.
- 해당 스터디에 대한 내용은 해당 [Github](https://github.com/2022-2digit-study/2022-algorithm-study)에서 확인하실 수 있습니다.

{{% /details %}}


### 파이썬 클린코드 사내 스터디장
<img src="https://img.shields.io/badge/WIKIDOCS-56A5EB?style=for-the-badge&logo=Wikidocs&logoColor=white" alt="wikidocs" style="display: inline">
<img src="https://img.shields.io/badge/GITHUB-181717?style=for-the-badge&logo=GitHub&logoColor=white" alt="github" style="display: inline">

> 2022-05 ~ 2022-06

{{< cards >}}
{{< card link="https://wikidocs.net/book/8131" title="Wiki Docs" subtitle="스터디의 결과물, 전자 책 틀린코드를 주목해주세요!" >}}
{{< card link="https://github.com/2022-2digit-study/2022-clean-code-study" title="Github" subtitle="스터디의 룰, 내용들을 좀 더 살펴볼 수 있어요">}}
{{< /cards >}}

{{% details title="More" closed="true" %}}

- 사내에서 사용했던 파이썬에 대해 좀 더 심층적으로 탐구하고자 클린코드 스터디를 진행하였습니다.
- 해당 스터디에 대한 내용은 해당 [Github](https://github.com/2022-2digit-study/2022-clean-code-study)에서 확인하실 수 있습니다.
- 스터디의 결과물을 WikiDocs를 활용하여 전자책 [파이썬 틀린코드](https://wikidocs.net/book/8131)로 집필하였습니다.

{{% /details %}}

### 쇼핑몰 텍스트에서 Python 모델명 추출 모델을 통한 사용자 보증기간 관리 API 개발
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

- 여러가지 제품의 모델명과 보증기간을 한번에 관리하는 플랫폼을 개발하기 위해 해당 프로젝트를 진행하였습니다.
- 쇼핑몰 텍스트에서 Python 모델명 추출을 통한 사용자 보증기간 관리 API를 개발하였습니다.
- 해당 프로젝트에 실제 구현은 해당 [Github](https://github.com/MaPDuck)에서 확인하실 수 있습니다.
- 해당 프로젝트에 대한 상세한 내용은 해당 [Notion](https://gossamer-liver-d26.notion.site/MaPDuck-3e842cb9f60c4dfe878a97c3506ef2ae)에서 확인하실 수 있습니다.

{{% /details %}}

### 인하대학교 빅데이터 동아리 [IBAS](https://www.inhabas.com) 파이썬 기초 강의자
<img src="https://img.shields.io/badge/PYTHON-3776AB?style=for-the-badge&logo=Python&logoColor=white" alt="python" style="display: inline">
<img src="https://img.shields.io/badge/YOUTUBE-FF0000?style=for-the-badge&logo=YouTube&logoColor=white" alt="youtube" style="display: inline">

> 2021-03 ~ 2021-07

{{% details title="More" closed="true" %}}

- 동아리 초기 멤버로써 동아리원의 실력향상을 위해 파이썬 기초 강의를 진행했습니다.
- 인하대학교 빅데이터 동아리 [IBAS](https://www.inhabas.com)에서 파이썬 기초 강의를 진행했습니다.
- 진행한 강의는 해당 [링크](/lecture/#2-python-basic)에서 확인하실 수 있습니다.

{{% /details %}}

### 인하대학교 빅데이터 동아리 [IBAS](https://www.inhabas.com) 웹사이트 제작 프로젝트 팀장
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

- 전반적인 백엔드 아키텍처 구성을 담당하였으며, Django로 MTV(Model, View, Template) 패턴을 사용하여 개발하였습니다.
- 매주 회의를 통해 프로젝트 진행 상황을 공유하였으며, 프로젝트 일정을 관리하였습니다.
- Django Template을 사용하여 프론트엔드를 구성하였으며, Django Context를 사용하여 데이터를 전달하였습니다.
- AWS EC2를 사용하여 배포하였으며, Nginx를 사용하여 웹 서버를 구성하였습니다.
- 해당 프로젝트에 실제 구현은 해당 [Github](https://github.com/YangTaeyoung/IBAS)에서 확인하실 수 있습니다.

{{% /details %}}

### 한이음 ICT 멘토링 참여
<img src="https://img.shields.io/badge/SPRING-6DB33F?style=for-the-badge&logo=Spring&logoColor=white" alt="spring" style="display: inline">
<img src="https://img.shields.io/badge/HADOOP-FF7F00?style=for-the-badge&logo=Apache-Hadoop&logoColor=white" alt="hadoop" style="display: inline">
<img src="https://img.shields.io/badge/JAVASCRIPT-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=black" alt="javascript" style="display: inline">

> 2020-04 ~ 2020-11

{{% details title="More" closed="true" %}}

- 한이음 ICT 멘토링에 참여하여 멘티로 활동했습니다.
- Spring Legacy 프레임워크를 사용하여 프로젝트를 진행하였습니다.
- Hadoop를 이용하여 간단한 워드 카운팅을 통해 연관검색어를 추출하는 프로젝트를 진행하였습니다.

{{% /details %}}

### 오라클 데이터베이스 SQL 강의자

<img src="https://img.shields.io/badge/ORACLE-F80000?style=for-the-badge&logo=Oracle&logoColor=white" alt="oracle" style="display: inline">
<img src="https://img.shields.io/badge/YOUTUBE-FF0000?style=for-the-badge&logo=YouTube&logoColor=white" alt="youtube" style="display: inline">

> 2020-04 ~ 2020-07

{{% details title="More" closed="true" %}}

- 인하대학교 프로그래밍 동아리 IGRUS에서 Oracle Database SQL 강의를 진행했습니다.
- 진행한 강의는 해당 [링크](/lecture/#1-oracle-database-sql)에서 확인하실 수 있습니다.

{{% /details %}}

{{% /steps %}}