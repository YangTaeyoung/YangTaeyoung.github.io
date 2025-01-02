---
title: 환경마다 설정값이 누락되는 것을 방지해보자 
type: blog
date: 2025-01-03
comments: true
---
## 설정은 왜 관리하기 어려울까?
매번 배포할 때마다 느꼈던 고질병 중 하나가 바로 설정이다

우리 회사같은 경우는 Spring Boot를 이용하고 있고, 배포 환경마다 설정 파일이 달라져야 하는 부분은 Spring Cloud Config를 이용해서 관리하고 있다.

일반적으로 Spring에서는 application.yml을 통해 설정을 관리하는데, 근본적인 문제는 바로 이 설정파일의 반영이다.

![image](/images/trouble-shooting/config-differ-check-1735855932407.png)

우리 회사의 경우 다음과 같은 순서로 배포가 이루어지는데, 환경이 위처럼 dev, qa, stage, production으로 나누어져있고, 각 환경마다 설정파일이 다르다.

문제는 이 때 한번이라도 설정이 누락되면 재배포가 필요한 상황이 발생하거나, 프로덕션에서 설정파일이 누락되어 있어서 배포한 내용이 반영되지 않는 문제도 야기할 수 있다는 점이다.

## 1. 배포 리뷰 만들기
![image](/images/trouble-shooting/config-differ-check-1735856331653.png)

이런 문제를 해결하기 위해 처음 생각한 방법은 배포 전 리뷰 시간을 갖는 것이다.

문제는 모두의 시간을 일정 정도 소모해야 한다는 점이고, 코스트가 크기 때문에 현재는 Production 배포 전에 추가된 인프라나 설정 관련된 부분을 리뷰하는 방식으로 운영하고 있다.

빠진 설정을 누락하는 것을 보는데 여러 사람이 검토를 하기에 훨씬 효과적이긴 해서 좋은 경험이었다. 하지만 추가된 부분을 하나하나 살펴보는 작업이다보니 리뷰 시간이 길어지는 단점이 있는 것 같다

## 2. 설정파일 비교 액션 만들기
두 번째로 이번에 적용한 방식은 설정파일을 비교하는 봇을 만드는 것이다.

다만 기존에 시중에 풀려있는(?) YAML 비교도구를 사용하면, 값까지 전부 비교하기 때문에 환경별로 다른 값이 있는 것을 가정하여 비교하기에는 적합하지 않았다.

그래서 다음과 같은 방식을 고려했다.

1. 환경별로 설정파일을 읽어와서 Key 값만 추출한다.
2. 타입이 다르거나, 키가 한쪽 파일에는 없는 경우, 배열의 경우 인덱스가 다른 경우 등을 체크한다.
3. 변경 부분이 있는 경우 각 환경 브랜치 머지를 위한 PR에 코멘트로 리포트를 생성한다.

이렇게 하면 환경별로 누락된 설정이 있는지는 확실히 추적이 가능하다고 판단하였다.

### 설계
![image](/images/trouble-shooting/config-differ-check-1735857073333.png)

구조도의 대부분은 이해가 쉽지만, 대략적인 구조는 이렇다.
여기서 [yaml-diff-reporter](https://github.com/YangTaeyoung/yaml-diff-reporter)는 두 YAML 설정파일을 파싱하여 비교하고, 리포트를 콘솔이나 파일로 내보낼 수 있는 CLI 도구인데, 이번에 함께 구현했다.
> 사용법을 함께 명시해두었으니, 비슷한 고민을 하는 분들이 있다면 사용해보시길 바란다. 단순 파일 비교용도로 사용할 수 있도록 플래그를 통해 모드를 지정하도록 구현했다.

### 액션 만들기
```yaml
name: 설정파일 비교

on:
  pull_request:
    branches: [ qa, stg, prod ]
```

우리는 앞서 소개한 대로 4개의 환경이 존재한다. 일반적으로 개발 시에는 dev에 머지가 되고, 배포 시에만 `qa`, `stg`, `prod` 배포용 PR을 올리기 때문에, 이렇게 설정했다.

```yaml
jobs:
  config-check:
    permissions:
      contents: read
      pull-requests: write
      issues: write
env:
  MERGE_FROM: ${{ github.event.pull_request.base.ref == 'qa' && 'dev' || (github.event.pull_request.base.ref == 'stg' && 'qa' || 'stg') }}
  MERGE_TO: ${{ github.event.pull_request.base.ref }}
```
우리서버는 Private Repository이기에 ~~(당연하겠지만)~~ PR 코멘트를 봇 토큰이 쓸 수 있도록 권한을 다음과 같이 부여했다.
또, 환경에 따라 qa인 경우 dev와 비교하고, stg인 경우 qa와 비교하도록 설정하여 직전에 배포했던 환경과 비교하도록 MERGE_FROM, MERGE_TO 환경변수를 설정했다.

```yaml
runs-on: ubuntu-latest
steps:
  - name: Go 설치
    uses: actions/setup-go@v5
    with:
      go-version: '1.23'
  - name: yaml-diff-reporter CLI 설치
    run: go install github.com/YangTaeyoung/yaml-diff-reporter@v1.0.0
```
Go를 설치하고 `yaml-diff-reporter`를 설치하도록 했다. 여담이지만 Go는 단순히 install 명령어 만으로도 CLI를 설치할 수 있어서 편한 것 같다  

```yaml
  - name: Config 파일 다운로드
    uses: AcmeSoftwareLLC/github-downloader@v1
    with:
      git-pat: ${{ secrets.GH_TOKEN }}
      repo: # Cloud Config Repository
      ref: # Cloud Config Repository Branch
      includes: |
        {application yaml 경로}/${{ env.MERGE_FROM }}/application.yml:${{ env.MERGE_FROM }}.yml
        {application yaml 경로}/${{ env.MERGE_TO }}/application.yml:${{ env.MERGE_TO }}.yml
```
이후 지정한 경로에서 파일을 Github Repository에서 다운로드 받는다. 다운로드 액션은 이미 구현되어 있는 것이 많아서 취사선택했을 뿐, 어떤걸 사용해도 좋다.

```yaml
  - name: Config 파일 비교
    id: compare
    run: |
      DIFF_RESULT=$(yaml-diff-reporter -l ${{ env.MERGE_FROM }}.yml -r ${{ env.MERGE_TO }}.yml \
      -la ${{ env.MERGE_FROM }} -ra ${{ env.MERGE_TO }} \
      -M type -M key -M index \ # 모드 지정 (value는 제외) 
      -I  # 무시할 키 지정
      -lang ko # 리포트에 출력될 언어 지정, 언어는 아직 한국어(ko), 영어(en)만 지원한다. 
      -f markdown) # 리포트 포맷 지정 마크다운(markdown), JSON(json), 평문(plain)을 지원한다

      echo "diff_result<<EOF" >> $GITHUB_OUTPUT
      echo "${DIFF_RESULT}" >> $GITHUB_OUTPUT
      echo "EOF" >> $GITHUB_OUTPUT
```

이제 다운로드 받을 파일을 CLI를 통해 비교하고, 결과 값을 `diff_result`라는 변수에 담아 step의 output으로 지정한다. 
> EOF가 먼저 나오는 이유는 보고서가 멀티라인 형식으로 출력되기 때문이다.<br>
> 싱글라인이라면 `echo "diff_result=${DIFF_RESULT}"`와 같이 지정했을 것이다

```yaml
  - name: 결과 PR Comment 작성
    if: always()
    uses: thollander/actions-comment-pull-request@v3
    with:
      message: |
        # Config 파일 비교 결과
        ${{ steps.compare.outputs.diff_result == 'No differences found' && '![pass-badge](https://img.shields.io/badge/check-passed-green)' || '![fail-badge](https://img.shields.io/badge/check-failed-red)' }}

        ${{ steps.compare.outputs.diff_result }}

        ## File Reference
        - [${{ env.MERGE_FROM }}.yml](Github 파일 경로)
        - [${{ env.MERGE_TO }}.yml](Github 파일 경로)
        

  - name: 실패 처리 (Diff 결과가 있을 경우)
    if: steps.compare.outputs.diff_result != 'No differences found'
    run: exit 1
```

이후 결과를 PR 코멘트로 작성하고, 결과가 실패했을 경우에는 PR이 머지되지 않도록 액션 자체가 실패하도록 설정했다.
단순히 리포트만 내보내고 싶으면 `${{ steps.compare.outputs.diff_result }}`만 해도 되지만, 필자는 이것저것 예쁘게 꾸며보고 싶은 생각도 있어서, 이렇게 작성했다.

## 결과
![image](/images/trouble-shooting/config-differ-check-1735858672464.png)

내부 정보가 될 수 있어 모자이크를 씌우긴 했지만, 결과적으로는 이런식으로 어떤 키에 문제가 있는지 PR 코멘트를 작성해서 조금 더 파악하기 쉽게끔 해두었다.

## 단점
물론 이방식도 단점은 명확하다. 새롭게 추가하는 키에 대해서만 비교하기 때문에, **기존에 있던 값이 변경되거나 수정되었을 때는 단순 키, 타입 등의 비교만 갖고는 알 수 없다는 점**이다.

완벽한 은탄환은 존재하지 않듯이, 결국 개발자란 계속 꾸준히 노력하고, 개선하며, 더 나은 방법을 찾아나가는 것이라는 것을 오늘도 느낀다.