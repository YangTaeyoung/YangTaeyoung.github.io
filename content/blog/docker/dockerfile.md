---
title: "[Docker] Dockerfile을 알아보자."
type: blog
date: 2022-07-13
weight: 3
comments: true
---
## 😡 형냐들.. 나만 불편해?
앞서서 Docker의 CLI를 잠깐 맛보았다면, 컨테이너를 생성하고, 만드는 일이 굉장히 불편한 일이라는 것을 알 수 있다.

나는 편하게 하고 싶어서 컨테이너를 만들때마다 수많은 커맨드를 입력해야한다.

사실 그것보다 더 큰 문제가 있다면, 이미지로 빌드하는 순간, 용량이 무지막지하게 커질 수 있다는 사실이다.

엄청 크진 않겠지만, 적어도 100MB부터, 1~2GB가 넘어가는 것까지 다양하다.

![img.png](https://blog.kakaocdn.net/dn/dg7HAJ/btq0ZLhsh0x/RXZPbihsD3h9ou7NviGfM1/img.png)

수많은 컨테이너를 관리하는 회사라면, 이런 사항은 더욱 재앙처럼 다가올 수 있다.

용량이야 그렇다 쳐도, 이미지를 전달하고, 이걸 내려받는데 걸리는 시간만 굉장히 오랜 시간이 걸리게 될 것이다.

## 📄 Dockerfile

그래서 Docker에서는 새롭게 컨테이너를 만드는 방식을 제안한다. 

이미 만들어진 이미지가 아니라, **이미지를 만드는 스크립트를 공유하도록 하는 것이 골자**이다.

### 🚫 Don't Repeat Yourself

어차피 한번은 짜야한다. ~~이걸 자동화하는 것은 향후 AI가 하려나..?~~
> _근데 한번만 짜면 된다._

이는 Docker의 내부 기능이기 때문에 명령어를 짜서 텍스트 파일로 저장하는 것보다 훨씬 간단하며, 형식적이고, 구조적이다.

또한 결론적으로 `Dockerfile`도 결국 텍스트 파일이기 때문에, 보관 시 용량을 크게 잡아먹지 않는다.

잡설이 길었다. 이제 본론이다.

### 그럼 어떻게 실행시켜?
`Dockerfile`을 만들면, 파일의 명세대로 이미지를 불러와, 명령을 수행한다.

컨테이너가 Docker에 띄워지면, 해당 이미지는 사용자의 로컬에 저장된다.

해당 과정을 `build`라고 부르며, 컨테이너를 이미지로 만드는 `commit`와는 차이가 있다.

### `build [BUILD_PATH]`

`build` 명령어는 명시한 경로의 하위에 있는 `Dockerfile`을 기반하여 컨테이너를 만드는 명령어이다.

이는 해당 명령어는 재귀적으로 수행하기 때문에, 절대 루트 디렉토리를 경로로 삼아선 안된다.

```shell
$ docker build / # (X)
```
일반적으로 프로젝트 루트 디렉토리에 `Dockerfile`을 위치시키기 때문에, 아래의 명령어가 관용구처럼 활용된다.
```shell
$ docker build .
```

### `-f [DOCKER_FILE_PATH]` 옵션

전통적으로 `Dockerfile`은 빌드할 프로젝트 루트 경로에 위치하나 `-f` 옵션을 통해 루트 경로와 `Dockerfile`의 경로가 달라도 이를 연결시켜줄 수 있다.

```shell
$ docker build -f /path/to/a/Dockerfile .
```
> 이는 `Dockerfile`이 마치 현재 디렉토리(`.`)에 있는 것처럼 행동하도록 한다.

#### `-t` 옵션

빌드가 성공하면 새 이미지를 저장할 리포지토리와 태그를 `-t` 옵션을 통해 지정할 수 있다.

```shell
$ docker build -t shykes/myapp .
```

여러 저장소에 같은 이미지를 두거나, 여러 태그를 저장해야 한다면, 여러 개의 `-t`를 지정하여 같은 이미지로 빌드할 수 있다.
```shell
$ docker build -t shykes/myapp:1.0.2 -t shykes/myapp:latest .
```

## `Dockerfile` 만들기
`Dockerfile`을 만드는 방식은 간단하다. `Dockerfile`을 만들면 된다.

이제 `Dockerfile`을 작성하기 위해 방대한 설정을 알아보자

#### `ARG`
`Dockerfile` 내에서 변수의 재 사용성을 극대화시키기 위해 사용하는 변수 선언문이다.

```dockerfile
# Usage of Definition
ARG [KEY]=[value]

# Usage of Call
${[KEY]}

# Example
ARG  CODE_VERSION=latest
FROM base:${CODE_VERSION}
CMD  /code/run-app

FROM extras:${CODE_VERSION}
CMD  /code/run-extras
```

#### `FROM`
```dockerfile
# - Usage
FROM [--platform=<platform>] <image> [AS <name>]
# or
FROM [--platform=<platform>] <image>[:<tag>] [AS <name>]
# or 
FROM [--platform=<platform>] <image>[@<digest>] [AS <name>]
```
작업할 기반 이미지를 표기한다. 

이전 챕터의 `run`, `create` 명령어에서 살펴보았던 `IMAGE` 부분에 적을 내용을 기입한다고 보면 되며
해당 부분에 적힌 이미지는 먼저 로컬에서 찾아보고, 찾은 후 없다면, [Docker Hub](https://hub.docker.com) 에서 이미지를 찾아 가져온다.
> 물론 접근 권한이 없는 Repository에 접근하거나, 이미지 명을 잘못 적은 경우 가져오지 못한다.

#### `WORKDIR`
컨테이너 내부에서 작업할 경로를 명시한다.
이전 챕터의 `run`, `create` 명령어에서 살펴보았던 `-w`, `--workdir` 과 동일한 역할을 한다고 보면 된다.

이후 `COMMAND`의 경우 `WORKDIR`에서 실행되며, 해당 부분을 명시하지 않을경우 홈 디렉토리(`~`)로 설정된다.

#### `RUN [COMMAND]`

이전 챕터의 `run` 명령어와는 다른 녀석이다.
오히려 `COMMAND`부분에 속하며, 컨테이너 상에서의 다양한 명령어를 해당 키워드를 통해 입력할 수 있다.

**해당 명령은 이미지의 기본 명령과는 독립적으로 (마치 `exec`에 입력한 명령어처럼) 동작한다.**

`RUN`은 2가지의 입력 형식을 지원한다.

```dockerfile
# Method 1
RUN <command>
# Method 2
RUN ["executable", "param1", "param2"]
```

`Method 2` 방식이 어려워 보이나, 단지 명령어를 띄워쓰기를 통해 구분해 놓은 것에 불구하다

예를 들어 아래 2가지의 커맨드는 완벽히 동일한 동작을 수행한다.

```dockerfile
RUN ["/bin/bash", "-c", "echo hello"]
```

```dockerfile
RUN /bin/bash -c "echo hello"
```

#### Caution
리스트 형식으로 명령을 실행하고자 할 때 백슬래쉬 문자(`\`)를 통해 경로를 입력하는 경우가 있다.

실제 명령어는 `JSON`방식으로 실행되는데 백슬레쉬 문자는 `JSON`에서 인정하는 문자가 아니기 떄문이며, 특히 `Windows`에서는 (`\`)가 구분 기호로 사용되는데, 그 경우 백슬래쉬(`\`)를 두 번 입력하여 이스케이프 시켜주어야 한다.

```dockerfile
RUN ["c:\windows\system32\tasklist.exe"] # (X)
RUN ["c:\\windows\\system32\\tasklist.exe"] # (O)
```

#### `ENTRYPOINT`
컨테이너가 실행되었을 때 스크립트나 명령어를 실행한다.

해당 파일을 컨테이너로 만들었을 때, 컨테이너를 시작하거나(`start`), 생성과 실행을 동시에 할 때(`run`) 할 때 수행된다고 생각하면 된다.

실행 중인 컨테이너에 단지 명령어만 보낼 때(`exec`)에는 수행되지 않는다.

또 다른 특징 중 하나는 `ENTRYPOINT`는 `Dockerfile`에서 단 한 번만 선언할 수 있다는 것이다.


#### `CMD`
`RUN`과 비슷한 역할을 수행하나, `docker run` 실행시 별도 `COMMAND`가 없을 때 기본적으로 수행되는 `COMMAND`라는 점에서 차이가 있다.

```dockerfile
# Method 1
CMD ["executable","param1","param2"] # exec shape, recommanded
# Method 2
CMD ["param1","param2"]
# Method 3
CMD command param1 param2
```
Method 1에서 excutable을 생략할 수 있는데, 이 경우 ENTRYPOINT가 정의되어 있어야 한다.

#### `ENV`
컨테이너의 환경변수를 지정하는 역할을 수행하며, `run`, `create` 명령어에서 살펴보았던 `-e` 옵션과 역할이 동일하다.

```dockerfile
# Usage
ENV [KEY]=[VALUE]

# Example
ENV abc=hello
ENV abc=bye def=$abc
ENV ghi=$abc
```

#### `LABEL` 
컨테이너의 메타데이터를 넣고자 할 때 사용한다.
```dockerfile
# Usage
LABEL <key>=<value> <key>=<value> <key>=<value> ...
```
key-value pair로 저장되며, 예를 들어 아래와 같이 작성할 수 있다.
```dockerfile
LABEL "com.example.vendor"="ACME Incorporated"
LABEL com.example.label-with-value="foo"
LABEL version="1.0"
LABEL description="This text illustrates \ # 멀티 라인은 백슬래쉬(\) 구분자를 통해 입력할 수 있다.
that label-values can span multiple lines."
LABEL multi.label1="value1" \
      multi.label2="value2" \
      other="value3"
```

만약 메타데이터를 보고 싶다면 아래와 같은 명령어를 통해 특정 이미지(`myimage`)의 메타데이터를 확인해볼 수 있다.
```shell
$ docker image inspect --format='' myimage
{
  "com.example.vendor": "ACME Incorporated",
  "com.example.label-with-value": "foo",
  "version": "1.0",
  "description": "This text illustrates that label-values can span multiple lines.",
  "multi.label1": "value1",
  "multi.label2": "value2",
  "other": "value3"
}
```

#### `EXPOSE [PORT]/[PROTOCOL]`
`EXPOSE`는 어떤 포트를 수신 대기할 것인지에 대한 명시를 하는 부분이다.

하지만 `Dockerfile` 이는 호스트의 포워딩 했다는 의미가 아니다.

그저 호스트에서 `Container`로 데이터를 보낼 때 어떤 `PORT`로 보낼 지 지정하는 것이다.

따라서 `-p` 옵션은 `Dockerfile` 하나만으로는 자동화 할 수 없다.

`[PROTOCOL]`은 데이터 전송을 어떤 프로토콜을 사용할 지에 대한 명세이다.

`tcp`, `udp` 중 하나를 고르면 된다. 디폴트 값은 `tcp`로 지정되어 있고, 특별한 경우가 아니라면 바꾸는 것을 권장하지 않는다.
> TCP는 패킷 전송 간에 신뢰성을 보장하기 떄문이다.

#### `COPY [OPTION] [HOST_PATH] [CONTAINER_PATH]`
`HOST_PATH`에 있는 파일들을 `CONTAINER_PATH`로 복사하는 명령어이다.
`HOST_PATH`는 경로 뿐 아니라 파일명도 포함할 수 있으며, `?` _(한 글자)_,  `*` _(여러 글자)_ 등의 와일드 카드 역시 사용할 수 있다.
#### 상대경로
각 `PATH`에 상대경로를 입력할 경우 `HOST_PATH`는 파일의 위치가 기준이 되며, `CONTAINER`는 `WORKDIR`이 기준이된다.

#### 와일드 카드 예
* `home*`: `home`으로 시작하는 모든 파일 및 경로
* `*home*`: `home`이 포함된 모든 파일 및 경로
* `?home`: `home` 앞에 한 글자가 있는 모든 파일 및 경로 (예: `1home`, `ahome`)

#### `--chown`
`--chown`옵션을 통해 `CONTAINER_PATH`의 소유자를 결정할 수 있다.

내부적으로 실제 `chown` 명령어를 통해 조작하기 때문에 Linux 기반의 컨테이너에서만 실행이 가능하다.


#### `ADD [HOST_PATH] [CONTAINER_PATH]`
`ADD`는 `COPY`와 거의 동일한 기능을 수행한다고 보면 된다.

`COPY`의 옵션과 내용을 소급 적용하며, `ADD`만의 추가적인 기능이 몇 있다.
1. 복사하려는 대상이 압축 파일(`.tar`, `.tar.gz`)일 경우 해당 파일의 압축을 해제하여 복사한다.
2. wget 등을 통하여 원격지의 파일을 복사대상으로 지정할 수 있다.
> 단 원격지의 파일은 `600`권한(사용자만 읽기 가능)을 갖습니다.

## 옵션을 자동화 한다?
이쯤되면 이 글을 보는 사람이 의심을 가져야 할 부분이 있다.

과연 `Dockerfile`은 `CONTAINER`의 제작 과정을 전부 명세했다고 할 수 있는가?

**정답은 물론 아니다.**

`Dockerfile`이 컨테이너를 명세하기는 하지만, 컨테이너를 생성하는 옵션을 자동화하는 목적은 아니다.

`create`, `run` 명령어에서 사용하는 `-p` 옵션만 봐도 그렇다. 

`-p` 옵션은 Host OS의 포트와 Container의 포트를 명세해야 하나, `EXPOSE`는 단순히 컨테이너의 개방 포트만을 명세할 뿐이다.

이외의 Host OS의 많은 옵션들을 `Dockerfile`이 처리하지 못한다.

이는 `build`가 컨테이너에 대한 명세이며, Host에 대한 명세가 아니기 때문이다.

당연히 이러한 불편함은, 이후 포스팅할 Docker Compose가 나오는 계기가 되었다.

## Docker Ignore File
`git`을 사용해 본 경험이 있다면 `.gitignore`를 한 번 쯤은 써본 경험이 있을 것이다.

`.dockerignore` 파일도 당연히 비슷한 역할을 수행한다.

`.gitignore` 파일은 커밋이 돼지 않을 파일을 설정하는 것이 대부분인데, 여기서는, `ADD`나 `COPY`를 통해 Host OS에서 복사되면 안되는 파일이나 폴더의 경로를 정의한다.

```dockerignore
# 주석
*/temp*
*/*/temp*
temp?
```

## Reference
* [Docker 공식문서 - Dockerfile reference](https://docs.docker.com/engine/reference/builder/)
* [스뎅 - [Docker] RUN vs CMD vs ENTRYPOINT in Dockerfile](https://blog.leocat.kr/notes/2017/01/08/docker-run-vs-cmd-vs-entrypoint)
* [Jae-Hong Lee 가장 빨리 만나는 Docker 7장 - 6. ENTRYPOINT](http://pyrasis.com/book/DockerForTheReallyImpatient/Chapter07/06)
* [박개벙 - Dockerfile의 ADD와 COPY의 차이](https://parkgaebung.tistory.com/44)
