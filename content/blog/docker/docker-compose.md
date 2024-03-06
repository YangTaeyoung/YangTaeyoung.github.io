---
title: "[Docker] Docker Compose를 알아보자"
type: blog
date: 2022-07-21
weight: 5
comments: true
---
## 형냐들 나만 불편해?
두 번째 형냐들이다. 사실 불편한 것들이 많기 때문이다.

## Docker의 용도
Docker를 어떤 때에 사용한다고 했는가?

Docker의 핵심 기술인 Container를 사용하고자 할 때일 것이다. 
> 즉, 재사용을 위함이다.

앞서 배운 `Dockerfile`은 컨테이너를 만드는데에 필요한 많은 부분을 자동화하였다.

그러나 `Dockerfile`에도 단점이 있다.

[이전 포스팅](/docs/docker/04.dockerfile/)에서도 다루었듯, Host OS의 설정을 자동화 하는데 제한이 있다는 부분이었다.

예를 들어 Host OS의 포트포워딩이나, Volume의 Path를 마운팅하는 것까지 미치진 못하였다.

결국 많은 개발자들은 `Dockerfile`을 만들고, 

`build`를 통해 만들어진 컨테이너를 서로 연결하고, 

`volume`를 마운트시켜주었어야 했다.

## Docker Compose
![img.png](https://miro.medium.com/max/1000/1*JK4VDnsrF6YnAb2nyhMsdQ.png)

Docker Compose는 위의 에로사항을 해결한다. 

`docker-compose.yml`에 정의할 수 있는 내역에는 `volume`, `port`, `env` 뿐 아니라 컨테이너를 정의하는 다양한 작업을 수행할 수 있도록 하고 있다.

또한 단일 컨테이너 뿐 아니라, **다중 컨테이너를 정의하고, 컨테이너 간 관계를 설정할 수도 있도록 지원**하고 있다.

[Docker 공식 문서](https://docs.docker.com/compose/compose-file/) 에서는 Compose를 **플랫폼에 구애받지 않는 컨테이너 기반 애플리케이션**이라고 소개하고 있다.

### `.yml`, `.yaml`
Docker Compose에 대해 알아보기 전에 알아두어야 할 것이 있다. 

![img2](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/YAML_Logo.svg/1200px-YAML_Logo.svg.png)

앞서 `docker-compose.yml`에 다중 컨테이너에 내릴 명령어를 설정할 수 있다고 피력하였다. 

그렇다면, `.yml` 파일은 무엇인가? 

`.yml`, `.yaml` 확장자가 붙은 파일은 Yet Another Markup Language 라고 하는 일종의 마크업 언어의 한 형태이다.

마치 파이썬 처럼 콜론과 들여쓰기를 통해 계층을 형성하고, 특정 객체, 설정 값 등을 쉽게 작성할 수 있다.

직관적으로 이해를 하기 위해 아래의 예를 살펴보자.
```yaml
car:
  name: "bus"
  color: "red"
  door: 4
  capability:
    max_weight: "4T"
    human: 10
  customers:
    - name: "Alice"
      age: 14
    - name: "Ban"
      age: 16
    - name: "Yang"
      age: 26
```

해당 형태의 `.yaml`은 아래와 같은 `JSON` 형식으로도 표현이 가능하다.

```json
{
  "car": {
    "name": "bus",
    "color": "red",
    "door": 4,
    "capability": {
      "max_weight": "4T"
    }
  }
}
```

이처럼 `.yml` 은 계층적인 형태의 자료, 기존의 `JSON`, `XML`등의 포맷을 사용하여 데이터를 표현할 때 사용하기 용이한 파일 형식이다.


### `docker-compose.yml`
그럼 이제 `docker-compose.yml`을 만들고, 우리가 사용할 컨테이너를 명시해보자.

#### `services`
먼저 우리가 정의하는 컨테이너 각각에 대한 명세는 `service`라는 단위로 정의된다.

`.yml` 포맷을 빌려 설명하면 이런 형식이 될 것이다.
```yaml
services:
  container_1:
    ...
  container_2:
    ...
```


#### `image`
가져올 이미지를 명세하는 부분이다.

다양한 방식으로 원하는 이미지를 가져올 수 있다.

```yaml
# 이미지 명
image: redis
# 이미지 명: 태그명
image: redis:5
# 이미지 명@sha256: IMAGE ID
image: redis@sha256:0ed5d5928d4737458944eb604cc8509e245c3e19d02ad83935398bc4b991aac7
# 저장소명/이미지명
image: library/redis
# 레지스트리명/저장소명/이미지명
image: docker.io/library/redis
# 개인 레지스트리 주소:포트/이미지명
image: my_private.registry:5000/redis
```

#### `build`
`Dockerfile`을 통해 컨테이너를 생성하고자 할 때 사용한다.

```yaml
services:
  frontend:
    image: awesome/webapp
    build: ./webapp # 하위 단계를 명세하지 않는다면  context 역할

  backend:
    image: awesome/database
    build:
      context: backend # Dockerfile을 탐색할 경로
      dockerfile: ../backend.Dockerfile # 파일 이름이 Dockerfile이 아닌 경우 파일명을 명시

  custom:
    build: ~/custom # 홈 디렉토리 표시 "~"를 사용할 수도 있음. 
```

1. `awesome/webapp` 이미지는  Compose 파일 상위 폴더 내의 `./webapp` 하위 디렉토리를 docker 빌드 컨텍스트로 사용하여 빌드된다. 
이 폴더 내에 `Dockerfile`이 없으면 오류가 발생한다.
2. `awesome/database` 이미지는  Compose 파일 상위 폴더 내의 `./backend` 하위 디렉토리를 사용하여 빌드된다. 
`backend.Dockerfile` 파일은 빌드 단계를 정의하는 데 사용되며, 이 파일(`backend.Dockerfile`)은 컨텍스트 경로(`./backend`)를 기준으로 정의된다. 
즉, 이 샘플의 `..`경우 Compose 파일 상위 폴더로 해석되므로 `backend.Dockerfile` 형제 `Dockerfile`도 검색 대상이 된다.
3. `custom` 서비스는 사용자의 `HOME` 디렉토리의 `custom` 디렉토리를 `context`로 사용하여 빌드된다.

#### `image`와 `build`가 동시에 있는 경우
`image`는 명시한 이미지를 바탕으로 컨테이너를 생성하는 것이라 하였고, `build`는 `Dockerfile`을 가지고 컨테이너를 생성하는 것이라고 하였다.

그러나 `Dockerfile`에서도 `FROM` 키워드를 통해 이미지를 가져올 수 있으므로 해당 속성이 충돌이되지 않을까? 걱정할 수 있다.

Docker 공식 문서에서도 [이에 대한 섹션](https://docs.docker.com/compose/compose-file/build/#consistency-with-image) 을 찾아볼 수 있는데,
우리의 걱정대로 해당 부분은 어떤 이미지가 사용될 지 보장할 수 없다고 명세하고 있다.

단 사용자의 별도 지시가 없는 이상 먼저 `image`에 정의한 이미지를 가져온 다음 레지스트리에서 이미지를 찾을 수 없는 경우 `Dockerfile`에서 가져온 이미지를 빌드한다고 명시하고 있다.

#### `depends-on`
여러 서비스를 `docker-compose.yml`에 정의할 때, 특정 서비스가 구동된 후 해당 서비스가 구동되어야 한다면, `depends_on: 서비스명`을 통해 명세할 수 있다.
```yaml
services:
  seviceA:
    ...
    depends_on: serviceB
    
  serviceB:
    ...
```

#### `entrypoint`
[Dockerfile](/docs/docker/04.dockerfile)에서 다루었던 `ENTRYPOINT`와 동일한 역할을 수행한다.

즉, Docker 컨테이너가 실행할 때 초기 명령어를 정의하는 부분이다.
> 이전 챕터에서 다루었듯, 해당 명령어는 단 한번만 선언이 가능하기 때문에 만약 `build`옵션을 통해 Dockerfile에서도 `ENTRYPOINT`를 명시하고 있는 경우 둘 중 하나(혹은 둘 다)를 지워야 한다.

> 많은 사례에서 주로 초기에 어떤 쉘을 쓸 지에 대한 정의 같은 부분을 사용하는 편인 것 같다.

```yaml
entrypoint: /code/entrypoint.sh
```

#### `labels`
[Dockerfile](/docs/docker/04.dockerfile/)의 `LABEL`부분에서 알아 보았듯 컨테이너에 메타데이터를 추가할 수 있는 항목이다.

### `environment`
컨테이너에서 사용할 환경 변수를 정의할 때 사용한다.

두 가지 방식을 사용할 수 있다.

1. Map 방식
```yaml
environment:
  RACK_ENV: development
  SHOW: "true"
  USER_INPUT: "hello"
```

2. Array 방식
```yaml
environment:
  - RACK_ENV=development
  - SHOW=true
  - USER_INPUT=hello
```

#### `env_file`
환경변수를 직접 정의하는 것이 아닌 파일로 정의할 경우 해당 옵션을 사용한다.

```yaml
env_file: some_env.env
```

```
# some_env.env
RACK_ENV=development
VAR="quoted"
```

해당 방식을 사용할 경우 환경 변수를 파일의 형태로 관리할 수 있기 때문에 관리를 더 용이하게 할 수 있다는 장점이 있다.

#### `command`
`Dockerfile`의 `CMD` 부분에서 알아보았던 것처럼 해당 서비스를 담당하는 컨테이너에게 내릴 명령을 정의하는 부분이다.
```yaml
command: ls -al
```
필자는 백엔드 개발자이므로, 백엔드 개발자 입장에서 두 커맨드(`Dockerfile`:`CMD`, `docker-compose.yml`:`command`)의 차이점을 기술해보겠다. 

`Dockerfile`의 `CMD`는 주로 `pip install`, `gradle build`와 같이 서버를 구성하는 기본 요소를 설치하는 명령을 주로 사용된다. 
> 말 그대로 컨테이너를 구동할 수 있는 형태를 만든다고 생각하면 된다 _(그렇지만 꼭 따라야 하는 것은 아니다.)_

`docker-compose.yml`의 `command`는 주로 서버를 배포는 명령어(예: `... run serve`)와 같이 서비스를 구동시키는 명령을 주로 사용한다.

#### `volumes`
`volumes`는 사용자가 생성해놓은 Docker Volume이나, Host Path와 Container Path를 연결하는 것을 정의하거나, 볼륨 자체를 선언하는 데에 사용된다.

##### volume의 명세
`volumes`의 하위 엘리먼트를 정의하는 방식은 축약 문법과, 일반 문법 두가지가 혼재한다.

일반적으로 축약문법을 사용하나 경우나 사용자의 기호에 따라 일반문법도 사용할 수 있다.
1. 일반 문법 요소

|Element| Description|
|:--------:|---------------|
|`type`|Docker Volume를 사용(`volume`)할 것인지, Host OS path와 바인딩(`bind`)할 것인지 명세한다.|
|`source`|Volume name or ID 값, 혹은 바인딩할 Host OS의 Path를 명세한다.|
|`target`|Container의 Path를 입력한다.|
|`read_only`| 읽기 전용으로 지정할 경우 설정한다.

```yaml
    ...
    volumes:
      - type: volume
        source: db-data
        target: /data
    ...
```

2. 축약 문법

`VOLUME:CONTAINER_PATH:ACCESS_MODE` 형태로 지정한다.
> `ACCESS_MODE`는 디폴트로 `rw`로 설정된다. 

```yaml
services:
  service_1:
    image: some/image
    # Docker Volume과 Container Path를 연결하기
    volumes:
      - db-data:/etc/data

  service_2:
    image: some/image
    # 호스트 OS의 Path와 Container Path를 연결하기
    volumes:
      - .:/var/lib/backup/data
      - 
  service_3:
    image: some/image
    # 호스트 OS의 Path와 Container Path를 연결하고 Container Path를 읽기 전용으로 설정하기
    volumes:
      - .:/var/lib/backup/data:ro
```

#### Volume 정의하기
`volumes`를 통해 Volume을 정의하고 싶다면 `volumes`를 `docker-compose.yml`의 최상위 엘리먼트로 두면 된다.
```yaml
# Docker Volume 정의
volumes:
  db-data:
```

### `ports`
Docker CLI의 `run`과, `create`에서 사용되는 `-p` 옵션과 동일하게 작동한다.
즉 Host OS의 Port와 Container Path의 Port를 매핑한다.

```yaml 
    ...
    ports:
      - "8000:8000"
    ...
```

위처럼 설정하면, Host OS의 `8000`번 포트로 들어오는 모든 요청은 Container의 `8000`번 포트로 대신 전달될 것이다.

## Docker Compose CLI
이제 컨테이너를 생성하는 일만 남았다. 

`docker-compose up` 명령어를 사용하면 명령한 디렉토리에서 `docker-compose.yml` 파일을 찾아 자동 실행한다.

새롭게 나온 Docker Compose V2 에서는 `docker compose` 키워드를 사용해서 실행할 것을 명시하고 있기에, V2를 사용한다면 이 점을 염두해두자.

`-d` 옵션을 붙이면 해당 서비스가 백그라운드 모드에서 실행된다. (일반적으로 많이 사용된다.)

`-f [COMPOSE_FILE_NAME]` 옵션을 통해 `docker-compose.yml`외의 특정 파일을 통해 Docker Compose를 실행시킬 수 있다.

`docker-compose start [SERVICE_NAME]`을 사용하면 services안에 있는 특정 서비스를 실행시킬 수 있다.

반대로 `docker-compose stop [SERVICE_NAME]` 명령은 특정 서비스를 종료시키는 명령어이다.

## Reference
* [Docker 공식문서 - Compose file Reference](https://docs.docker.com/compose/compose-file/)
* [Docker 공식문서 - Docker Compose CLI Reference](https://docs.docker.com/compose/reference/)
