---
title: "[Docker] Docker Storage에 대해 알아보자: Volume vs Bind Mount"
type: blog
date: 2022-07-15
weight: 4
comments: true
---
# Docker Storage
이번 챕터에서는 Docker Storage에 대해 짚고 넘어갈 것이다.

Storage는 이름에서 느껴지는 것처럼 단순히 저장공간을 의미하지만, 컨테이너를 사용한다면, 기존에 사용하는 것보다는 조금 더 어렵게 느껴질 수 있다.

이는 개발에 있어 Storage라는 녀석이 굉장히 중요한 부분이며, 아직 굉장히 많은 사람이 컨테이너 기반 개발 환경 보다, Host OS기반 `local` 개발 환경을 채택하는 이유이기도 하다.
> 혹자는 실제 배포되는 서버에서만 `dockerize`를 하는 것이 좋다는 사람도 있으나, 필자는 `local` 개발환경에도 Docker를 적용했을 때, 그 진가를 볼 수 있다고 생각한다.

![image](https://user-images.githubusercontent.com/59782504/179159615-2387ae9e-5beb-40c2-8b9d-f2bfed8d9a12.png)

위는 Docker에서 사용하는 Storage를 그림으로 설명한 것이다.

# Bind Mount
`bind mount`는 `Host OS`의 File System(이하 FS)과, `Container`의 FS를 `linking`하는 것으로, **컨테이너 내부에 마치 `Host OS`의 파일이 있는 것처럼 동작**시킬 수 있다.

실제로 그런 방식으로 동작하며, 리눅스 명령어 중에서는 `ln`명령어와 유사하다고 볼 수 있겠다.

해당 명령어를 통하면, 단순히 Host OS의 FS를 연결시키는 용도 뿐 아니라, 컨테이너 끼리 같은 작업공간을 가르키게 한다던지에 대한 작업을 진행해볼 수 있을 것이다.

그런데 해당 방식에는 문제점이 있다.

당연하게도, `Host OS`의 영향을 많이 받는다는 것이다.
> 특히 Windows의 File System의 경우 `C:\`, `D:\`와 같이 시작하는 것이 일반적이기 때문에 설정할 때 Unix, Linux계열의 경로와는 다르게 세팅해주어야 하는 번거로움이 존재한다.

~~개발할 때의 윈도우는 항상 말썽이다.~~

## `-v,  --volume`
앞선 챕터에서는 `create, run, exec` 등 `docker`에서 사용가능한 유용한 명령어들과 함께 옵션들을 함께 살펴보았다.
이중 `bind mount`를 할 수 있는 옵션은 바로 해당 옵션이라 할 수 있겠다.

```shell
$ docker [create|run|exec...] ... -v [HOST_PATH]:[CONTAINER_PATH] ...
```
위와 같이 사용할 수 있으며, 해당 명령어를 통해 `HOST_OS`의 `Storage`와 `CONTAINER`의 `Storage`를 연결할 수 있다.

## `--mount`
사용법과 용도가 비슷한 명령어이고 거의 동일하게 동작하나, 다른점이 있다면 `[HOST_PATH]`가 없는 경우 실행되지 않고 예외를 반환한다는 점이다.
`-v` 옵션과 같은 경우는 **엔드포인트 경로를 자동으로 생성**한다.
```shell
# Example
# $(pwd): 현재 작업 디렉토리 경로를 뜻한다.
# -- mount 사용 시
$ docker run -d \
  -it \
  --name devtest \
  --mount type=bind,source="$(pwd)"/target,target=/app \
  nginx:latest
  
# -v 사용 시
 $ docker run -d \
  -it \
  --name devtest \
  -v "$(pwd)"/target:/app \
  nginx:latest
```
### Parameter
> `--mount` 옵션에서 사용하는 파라미터는 다음과 같다.

|Param|Description|
|:-------:|--------------------------------------|
|`type`|\[`volume`\|`bind`\] `volume`을 사용할 것인지, `bind mount`를 사용할 것인지 여부|
|`source`|`HOST_PATH`|
|`target`|`CONTAINER_PATH`|

# Docker Volume
[Docker 공식문서](https://docs.docker.com/storage/volumes/)에 따르면 Docker Volume는 **컨테이너에서 생성하고 사용하는 데이터를 유지하기 위한 기본 메커니즘이라고 정의**하고 있다.

유사한 개념으로 앞서 살펴본 `bind mount`가 있다.

다만 해당 개념은 `Host OS`의 FS을 직접 사용하는 것이 아니라, `Docker`가 관리하는 `Storage`라는 점에서 차이가 있다.

즉 OS와 상관 없이 저장공간을 컨테이너끼리 공유할 수 있다.

하지만 정확한 용도는 `Host OS` 와 연결한다기 보다는, **여러 컨테이너에서 해당 Volume의 파일을 공유해야 할 경우에 사용한다고 하는 것이 더욱 적합**할 것이다.
> 예를 들어 특정 설정 파일 같은 것이 될 수 있다. 변경 시 실시간으로 반영되지 않아도 되는 것들에 대해 유용하다고 볼 수 있다.

## 장점
[Docker 공식문서](https://docs.docker.com/storage/volumes/)에서는 Docker Volume는 앞서 설명했던 bind mount에 비해 아래와 같은 장점이 존재한다고 설명한다.

1. 볼륨은 바인드 마운트보다 백업 또는 마이그레이션이 더 쉽다.
2. Docker CLI 명령 또는 Docker API를 사용하여 볼륨을 관리할 수 있다.
3. 볼륨은 Linux 및 Windows 컨테이너에서 모두 작동한다.
4. 여러 컨테이너 간에 볼륨을 더 안전하게 공유할 수 있다.
5. 볼륨 드라이버를 사용하면 원격 호스트 또는 클라우드 공급자에 볼륨을 저장하여 볼륨의 내용을 암호화하거나 다른 기능을 추가할 수 있다.
6. 새 볼륨의 콘텐츠는 컨테이너에 의해 미리 채워질 수 있다.
7. Docker Desktop의 볼륨은 Mac 및 Windows 호스트의 바인드 마운트보다 성능이 훨씬 높다.

## 생성

이제 Docker Volume을 만들어 보자
```shell
$ docker volume create my-vol
```
위 명령어를 통해 간단하게 Volume을 만들 수 있다.
```shell
$ docker volume inspect my-vol
[
    {
        "CreatedAt": "2022-07-18T23:53:04Z",
        "Driver": "local",
        "Labels": {},
        "Mountpoint": "/var/lib/docker/volumes/my-vol/_data",
        "Name": "my-vol",
        "Options": {},
        "Scope": "local"
    }
]
```
`docker volume inspect [VOL_NAME]` 명령어는 존재하는 볼륨의 상세 내역을 조회한다.
## 삭제
```shell
$ docker volume rm my-vol
```
간단한 명령어를 통해 만든 Volume를 삭제할 수 있다.
# Reference
* [Docker 공식문서 - Storage Overview](https://docs.docker.com/storage/)