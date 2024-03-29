---
title: "[Docker] Docker 시작하기 create, exec, start, run, commit"
type: blog
date: 2022-07-12
weight: 2
comments: true
---

# Docker 시작
이제 도커의 개념을 하나하나 확인해보면서 Docker를 시작해보도록 하자

## Docker 설치
[링크](https://docs.docker.com/get-docker/) 를 따라 들어가 자신의 운영체제에 맞는 Docker를 설치하자

## Docker 이미지 가져오기
Docker를 실행하기 위해서 [Docker Hub](https://hub.docker.com)에서 제공하는 많은 이미지를 사용해볼 수 있다.
시험삼아 Python 이미지를 살펴보자

![img_3.png](/images/docker/img_3.png)
> ▲ Docker Hub에서 `python`을 검색한 모습

터미널을 열고 `docker pull python`을 입력하면 최신의 파이썬 이미지를 받을 수 있다.

![img_4.png](/images/docker/img_4.png)
> 만약 자신의 서비스가 특정 버전의 파이썬을 요구할 경우 태그를 찾아 특정 버전의 파이썬을 설치할 수도 있다.
_예) `docker pull python:3.8.13`_

---
# Docker Container Status
하기 명령어를 알기 위해서는 Docker 컨테이너의 상태를 이해할 필요가 있다.

Docker 컨테이너는 일반적인 프로세스와 마찬가지로 여러가지 상태 값을 가진다.

각 상태 값에 대한 설명은 아래와 같다.
### 1. Created
컨테이너가 생성된 후 한 번도 사용되지 않았을 경우, 해당 상태가 할당된다.

Host OS의 CPU나 메모리를 소비하지 않는다.

### 2. Running
말 그대로 컨테이너를 실행 중인 상태를 뜻한다.
해당 상태는 컨테이너 속 프로세스가 환경(Host OS)와는 독립적으로 실행 중임을 의미한다.

### 3. Restarting
이 상태 역시, 말 그대로 컨테이너가 재시작 중임을 뜻한다.

`docker run` 명령어에서 옵션 `--restart=[RESTART_POLICY]`를 통해 재시작 시 액션을 정의할 수 있다.
* `RESTART_POLICY`
    * `no`: 재시작 안함(`default`)
    * `on-failure`: 컨테이너가 정상종료(0번 코드로 종료)가 아닐 시 재시작
    * `always`: 프로세스 종료 시 항상 재시작
    * `unless-stopped`: 명시적으로 중지되거나, Docker 자체가 중지, 또는 재시작 되지 않는 이상 컨테이너를 재시작함.

### 4. Exited
내부 프로세스가 종료되었을 때 해당 상태로 변경된다. Created 상태와 마찬가지로 CPU, 메모리를 소비하지 않는다.

> 일반적으로 컨테이너가 Exited 상태가 되는 이유는 다음과 같다.
1. 내부 프로세스가 완료됨.
2. 내부 프로세스가 실행 중에 예외가 발생함.
3. `docker`의 `stop` 명령어를 통해 의도적으로 종료됨.
4. `bash`를 실행하는 컨테이너에 대화형 터미널이 설정되지 않음.

### 5. Paused
무기한동안 모든 프로세스가 일시 중단된 상태를 나타낸다.
`docker pause` 명령어를 통해 Docker의 특정 컨테이너를 일시중지 할 수 있다.

### 6. Dead
해당 상태는 컨테이너를 지우려고 시도하였으나, 특정 자원이 외부 프로세스에서 이용 중일 경우 나타나는 상태이다.

해당 상태의 컨테이너는 재시작할 수 없으며, 오직 지우는 액션만 가능하다.

---
# 컨테이너의 생성: `create`
받은 이미지를 기반으로 `create` 명령어를 이용해 컨테이너를 `생성`할 수 있다.

## Usage
사용 방식은 다음과 같다.
```shell
$ docker create [OPTIONS] IMAGE [COMMAND] [ARG...]
```

## 자주 사용되는 옵션
Docker의 `create` 명령어의 모든 옵션을 보고 싶다면 [이 페이지](https://docs.docker.com/engine/reference/commandline/create/) 를 참고하자

### `--name [CONTAINER_NAME]`
실행될 컨테이너의 이름을 지을 때 사용한다.
```shell
$ docker ps -a

CONTAINER ID   IMAGE                    COMMAND                  CREATED              STATUS                  PORTS                    NAMES
d4a0d00c26f9   docker/getting-started   "/docker-entrypoint.…"   21 seconds ago       Created                                          hello
000e821c8396   docker/getting-started   "/docker-entrypoint.…"   About a minute ago   Up About a minute       0.0.0.0:80->80/tcp       admiring_jemison
```
docker로 생성된 모든 컨테이너를 보려면 `docker ps -a`를 입력하면 된다.
컨테이너의 이름은 가장 우측 컬럼에 표시되며, `name`을 `hello`로 지정한 컨테이너는 컨테이너의 이름을 갖고 있다.

이름이 설정된 컨테이너의 경우 추후 빌드할 때 이미지 명이 컨테이너명으로 설정된다.

### `--publish, -p [HOST_PORT]:[CONTAINER_PORT]`
해당 옵션은 포트포워딩에 대한 기본적인 이해가 필요하다.

Docker 내에서의 포트 포워딩은 Host OS의 Port로 들어오는 request를 Container의 Port가 대체하여 받는다는 것을 의미한다.
만약 `-p 80:8000`으로 설정하였다면, 호스트 OS의 80포트에 대한 요청을 컨테이너의 8000 포트로 넘긴다.
> 80포트는 인터넷 포트이기 때문에 위와 같이 구성하면 인터넷이 되지 않는다.

### `--tty, -t`
TTY 모드를 활성화한다. SSH 연결이 성공하면 저절로 디폴트로 설정된 터미널이 실행되는 것처럼, 해당 옵션을 설정하면 터미널이 열린 채로 컨테이너를 실행시킬 수 있다.

터미널은 기본적으로 키보드 입력이 필요하므로, 일반적으로 상기 `-i` 옵션과 함께 사용된다.

### `--interactive, -i`
컨테이너와 연결(`attach`)되어 있지 않더라도 표준 입력(`STDIN`)을 활성화한다.

### `--volume, -v [VOLUME_NAME]:[REMOTE_PATH]`
`docker volume`을 `container`의 경로에 `bind`한다.

> 지금은 그냥 _'저장소를 연결하는구나~'_ 라고 생각하자.
>
> 이는 Docker Volume에 대한 이해가 필요하기 때문이며, 비슷한 개념을 추후 비교 학습을 통해 알아볼 것이기 떄문이다.

### `--workdir, -w [WORKDIR_PATH]`
컨테이너 속 프로세스가 실행될 디렉토리를 지정한다.
설정된 Working Directory는 초기 진입점이 된다.

### `--env, -e [KEY=VALUE]`
컨테이너에 환경 변수를 지정한다. 보통 설정 값이나 비밀번호 등을 컨테이너로 전달할 때 사용된다.

거의 모든 언어에 OS 환경 변수에 접근할 수 있는 함수가 지정되어있기 때문에, 해당 옵션을 사용하면, 적절하게 설정값을 감추어 배포할 수 있다.

### 옵션의 조합
하이푼(`-`)을 하나만 사용하는 옵션의 경우 여러개의 옵션을 혼합하여 사용할 수 있다.
```shell
# Example
$ docker run --name test -it debian
```
---

# 컨테이너 시작하기: `start`
만들어진 컨테이너는 아직 실행된 상태가 아니다.
컨테이너를 실행시키기 위해서는 해당 명령어를 사용하면 된다.
## Usage
```shell
docker start [OPTION] CONTAINER_NAME_OR_ID
```

--- 
# 실행 중인 컨테이너에 명령하기: `exec`
`exec`를 활용하면 실행 중인 컨테이너에 명령을 전달할 수 있다.

주로 실행중인 컨테이너의 터미널을 실행하기 위해 사용한다.
> _(이를 이용하면 마치 SSH처럼 활용할 수도 있다.)_

특징적인 점이 있다면, `exec`를 통해 실행된 명령어는 기본적으로 메인 프로세스의 진행에 영향을 끼치지 않는다는 점이다.

## Usage
사용 방식은 다음과 같다.
```shell
$ docker exec [OPTIONS] CONTAINER COMMAND [ARG...]
```

## 자주 사용되는 옵션
Docker의 `exec` 명령어의 모든 옵션을 보고 싶다면 [이 페이지](https://docs.docker.com/engine/reference/commandline/exec/) 를 참고하자

### `--detach , -d`
컨테이너에 명령을 백그라운드로 전달한다.

### `--interactive, -i`
컨테이너와 연결(`attach`)되어 있지 않더라도 표준 입력(`STDIN`)을 활성화한다.

### `--tty, -t`
TTY 모드를 활성화한다. SSH 연결이 성공하면 저절로 디폴트로 설정된 터미널이 실행되는 것처럼, 해당 옵션을 설정하면 터미널이 열린 채로 컨테이너를 실행시킬 수 있다.

터미널은 기본적으로 키보드 입력이 필요하므로, 일반적으로 상기 `-i` 옵션과 함께 사용된다.

### `--workdir, -w [WORKDIR_PATH]`
컨테이너 속 프로세스가 실행될 디렉토리를 지정한다.
설정된 Working Directory는 초기 진입점이 된다.

### `--env, -e [KEY=VALUE]`
컨테이너에 환경 변수를 지정한다. 보통 설정 값이나 비밀번호 등을 컨테이너로 전달할 때 사용된다.

거의 모든 언어에 OS 환경 변수에 접근할 수 있는 함수가 지정되어있기 때문에, 해당 옵션을 사용하면, 적절하게 설정값을 감추어 배포할 수 있다.

### 옵션의 조합
하이푼(`-`)을 하나만 사용하는 옵션의 경우 여러개의 옵션을 혼합하여 사용할 수 있다.
```shell
# Example
$ docker exec -it test /bin/bash
```
---
# 컨테이너의 생성과 실행: `run`
받은 이미지는 `run` 명령어를 통해 실행시킬 수 있다.
> 정확히 `run` 명령어는 컨테이너를 생성(`create`)하고, 해당 컨테이너를 실행(`start`)시킨다.

## Usage
사용 방식은 다음과 같다.
```shell
$ docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
```

## 자주 사용되는 옵션
Docker의 `run` 명령어의 모든 옵션을 보고 싶다면 [이 페이지](https://docs.docker.com/engine/reference/commandline/run/) 를 참고하자

이전 섹터(`create`, `start`)는 생성, 실행에 대한 명령어를 다루며 자주 사용되는 옵션을 명세하였다.

기본적으로 `run`은 `create`와, `start`을 한번에 하는 명령어이므로, 각 명령어에서 사용하는 옵션을 모두 사용할 수 있다.


### `--detach, -d`
해당 옵션이 설정된 컨테이너는 Host OS에서 백그라운드 프로세스로 실행되며, 실행되고 있는 컨테이너 ID를 반환한다.

### 옵션의 조합
하이푼(`-`)을 하나만 사용하는 옵션의 경우 여러개의 옵션을 혼합하여 사용할 수 있다.
```shell
# Example
$ docker run --name test -it debian
```
---
# 컨테이너에서 이미지로: `commit`
내가 설정한 대로 컨테이너를 운용한 것은 좋다. 이제 나의 서비스는 독립적으로 동작할 수 있게 되었을 것이다.

근데 챕터 1에서 설명했던 문제점은 아직 해결하지 못하고 있다.

인수인계를 받을 사람이 오면 나의 컨테이너를 사용하는데, 근본적으로 컨테이너는 실행되고 있을 뿐, **컨테이너 자체는 배포 가능한 형태가 아니다.**

`commit` 명령어는 실행 중인 **컨테이너를 이미지의 형태로 변환**한다.

**누구나 사용 가능한 형태**가 되는 것이다.

기본적으로 컨테이너에서 이미지로 변환하는 명령어는 다음과 같으며, 해당 컨테이너는 본인의 Local Images에 저장된다.

## Usage
아래와 같이 기본적으로 사용할 수 있다
```shell
$ docker commit [OPTION] CONTAINER_NAME_OR_ID IMAGE_NAME
```
이후 `image`를 조회해보면 내가 새롭게 만든 이미지가 로컬에 저장되어 있음을 알 수 있다.
```shell
$ docker commit test test
95221529517f...
$ docker images
REPOSITORY               TAG       IMAGE ID       CREATED          SIZE
test                     latest    95221529517f   3 seconds ago    118MB
```

## 의문점
로컬에 이미지를 저장한 것은 맞다. 하지만 이것을 `공유`했다고 볼 수 있는가?

> 아직 내 이미지는 다른 이에게 전달되지 않았다.

`docker export`, `docker save` 등의 명령어를 통해서 이미지나 컨테이너를 `tar`형식으로 만들어 전달하는 방식도 있겠지만, 조금 더 스마트하게 사용해보자.
> Docker Repository를 통해서 말이다.
## Docker Repository
개발자라면 한번쯤 `Repository` 라는 말을 들어보았을 것이다.

Spring을 이용하여 웹을 구현해 본 누군가는 Spring의 `Annotation`에서 보았을 수도 있고, 아마 대부분의 개발자는 Github, Gitlab 등 본인 소스의 형상관리를 위해 사용해보았을 것이다.

어느 곳이든 `Repository`는 저장소의 의미로서 사용된다. 저장소라는 의미는 물론 본인만 사용하는 Local이 대상이 될 수 있으나, Remote. 즉 공유를 위한 `Repository`일 수도 있을 것이다.

Docker는 마치 Github처럼 직접 만든 레파지토리를 공유할 수 있도록 만들어 두었다.

아마 눈치가 빠른 사람은 이미 알아챘겠지만,

맞다. 예상한대로 이 Repository의 이름은 [Docker Hub](https://hub.docker.com)다.

## 본인의 Repository 만들기
본인의 Repository를 만드는 방식은 Github과 크게 다르지 않다.

![img_5.png](/images/docker/img_5.png)

먼저 Docker Hub에서 `Create a Repository`를 눌러보자



![img_6.png](/images/docker/img_6.png)

이후 화면에서는 본인 Repository에 대한 명세를 입력하면 된다.

Visibility를 통해 Github과 마찬가지로 모두에게 공개(`Public`)할 Repository로 설정할 수도 있고, 허용한 사람만 접근(`Private`)하게 할 수도 있다

![img_7.png](/images/docker/img_7.png)

Repository를 생성하고 나면 옆에 위와 같은 명령어를 통해 `push`가 가능함을 알려준다.
> Github을 사용해 보았다면 `push`라는 키워드가 익숙할 것이다. 결론은 여러분이 생각한 것이 맞다. 그 `push`이다.

### Tag
사진에서 태그명을 적으라는 것을 알 수 있다.

이것은 보통 커밋 시점에 생성되며, 일반적으로 버전을 기입하는 것이 일반적이다.

첫 부분에서 `docker pull python:3.8`과 같은 명령어를 통해 특정 파이썬 버전이 포함된 이미지를 가져왔듯,<br>
**콜론(`:`)뒤에 붙는 문자열(ex. `3.8`)은 태그명**을 나타낸다.

## Usage
위에 사용 방식을 명시하였으나, 이는 로컬에 한정된 방법이다.
Docker 공식 문서에 따르면 `commit`의 사용 방법은 다음과 같다.
```
$ docker commit [OPTIONS] CONTAINER [REPOSITORY[:TAG]]
```
> 그렇다. 결국 이미지 명이 Repository명에 매칭되는 것이다.

`commit`이라는 말에서 감을 잡았다면, **물론 아직 배포되지 않았음**을 알 수 있다.
> 정확히 이전과 일치한다.

## 사용 가능한 옵션

### `--message, -m [MESSAGE]`
일반적인 Git Commit Message와 유사하다.

해당 옵션은 생성한 커밋 시점에 메시지를 삽입할 수 있도록 한다.

### `--author, -a [AUTHOR]`
이미지 작성자의 기록을 남긴다.

### `--change, -c`
`Dockerfile`을 통해 컨테이너를 생성하고, 커밋을 생성할 경우 해당 옵션을 사용한다.
> Dockerfile은 다음 챕터에서 알아본다.

## 유사한 명령어: `build`
이미지를 만드는 방법은 방금 알아본 컨테이너에서 스냅샷을 만드는 `commit` 명령어 외에도, `build`라는 명령어가 추가적으로 존재한다.
그러나 `Dockerfile`에 대한 이해가 필요하기 때문에 `Dockerfile`은 다음 챕터에서 알아보기로 한다.

# 생성한 이미지를 Repository에 공유하기: `push`
이젠 마지막 단계이다. 만들어 놓은 이미지를 나의 Repository에 `push`하는 것이다.

## Usage
사용 방식은 아래와 같다.
```shell
$ docker push [OPTIONS] NAME[:TAG]
```

여기서 `NAME[:TAG]`는 `commit`에서 생성할 때 사용했던 `[REPOSITORY[:TAG]]`와 일치한다.


```shell
$ docker push xodud9632/test-repo:ver1
The push refers to repository [docker.io/xodud9632/test-repo]
27d8bf01e7ea: Mounted from library/debian
ver1: digest: sha256:ef143c422f108a12a93c202078d2d9e8c2966e9479b74f6662af9e32bb05ad73 size: 529
```
실제로 적용해보면 위와 같은 메시지가 나타나며,

![img_8.png](/images/docker/img_8.png)

Repository에도 잘 적용되었음을 알 수 있다.

### Error: `repository does not exist or may require 'docker login'`

상기 메시지로 오류가 날 경우 Docker CLI에 로그인이 되지 않았다는 의미이다.

```shell
$ docker login
```

위의 명령어를 입력하고, 아이디와 비밀번호를 입력하여 로그인 하면, 문제없이 잘 수행됨을 알 수 있다.

# Reference
* **Docker 공식 문서**
    * [run 명령어](https://docs.docker.com/engine/reference/commandline/run/)
    * [create 명령어](https://docs.docker.com/engine/reference/commandline/create/)
    * [exec 명령어](https://docs.docker.com/engine/reference/commandline/exec/)
    * [start 명령어](https://docs.docker.com/engine/reference/commandline/start/)
    * [push 명령어](https://docs.docker.com/engine/reference/commandline/push/)
    * [commit 명령어](https://docs.docker.com/engine/reference/commandline/commit/)
* **블로그**
    * [LainyZine - docker exec 사용법](https://www.lainyzine.com/ko/article/docker-exec-executing-command-to-running-container/)
    * [제이콥(JACOB) - 도커 입문하기 4 - 도커 이미지 만들기](https://code-masterjung.tistory.com/133)
    * [Nirsa - \[Docker CE\] 도커 저장소 로그인 에러](https://nirsa.tistory.com/46?category=868315)
    * [alice - \[Docker Study\] 5. 자주 쓰이는 도커 명령어 복습 - 1](https://blog.naver.com/alice_k106/220359633558)