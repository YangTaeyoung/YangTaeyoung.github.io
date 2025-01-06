---
title: (Github Actions) Self-Hosted Runner 실패 시 Github Runner로 대신 실행하기
type: blog
date: 2024-10-21
comments: true
---

![Image](/images/github_action/self-hosted-online-checker-1729507848686.png)

최근 회사에서 기존에 사용하고 있던 Jenkins CI/CD를 Github Actions으로 전환하면서, Self-Hosted Runner를 사용하게 되었다.

## Self-Hosted Runner?
[Self-Hosted Runner](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/adding-self-hosted-runners)는 이름에서 알 수 있듯이, 자체 호스팅 된 러너를 의미한다. Github Actions을 실행할 때, Github에서 제공하는 Runner를 사용하는 것이 아니라, 사용자가 직접 호스팅한 머신을 사용하는 것이다.

사용자의 컴퓨터를 직접 사용하는 것이기 때문에, 환경적인 제약이나, 캐시 등으로 인한 문제가 종종 발생할 수는 있지만, Github Runner에 비해 빠르고, (전기세를 제외하면) 무료로 사용할 수 있다는 장점이 있다.

### Self-Hosted Runner를 사용하는 이유

현재 Jenkins에 있던 부분이 가장 문제가 되었던 것은 테스트 시 소요되는 시간이었다. 나름대로 테스트 시간을 줄이기 위해 기존에 있던 코드를 리펙토링 해서 30분에서 10분정도로 3분의 1정도로 줄였지만, 점점 늘어나는 테스트 코드와 Repository 테스트를 위해 [Testcontainer](https://testcontainers.com/)를 도입하면서, 어쩔 수 없이 실행 시간이 19분으로 늘어나게 되었다.

문제는 이런 테스트 과정이, PR을 올릴 때 뿐 아니라, 배포 시에도 포함되어 있기 때문에, 배포 시간은 장장 30분에 달할 만큼 역시 길어지게 되었다.

그래서, 이런 문제를 해결하기 위해 Self-Hosted Runner를 사용하기로 결정했다.

기존에 회사에 있는 장비를 사용하기도 좋고, 젠킨스의 경우 AWS EC2 인스턴스를 사용하고 있었는데, EC2 인스턴스 대비 저렴하면서(전기세), 훨씬 성능이 좋다는 것에 있었다. (또한 세팅 역시 편하다)
> 회사에 남는 장비가 없다면 전혀 다른 얘기일 것이다. 우리 회사는 기본적으로 빌드 러너에 사용할 만한 남는 머신이 있었기에 이런 선택을 했다. 실무에서는 Github에서 제공하는 높은 스펙의 러너를 사용하는 것과 컴퓨터 구매 비용을 비교해보는 것이 선행되어야 할 것이다.

물론 Jenkins에 Self-Hosted Runner를 다는 방법도 있지만, 고정적인 머신의 개수를 지정해야 하는 등의 제약이 있었고, 동적으로 늘리고 줄일 수 있는 Github Actions을 선택하게 되었다.

### 문제점
문제는 Self-Hosted Runner가 항상 정상동작을 하지 않는다는 점에 있다. 물론, Github Runner도 그런 부분이 있겠지만, 회사에서 직접 관리하는 머신이니 만큼, 랜선 노후화 등으로 인해 종종 머신이 죽어버리는 경우가 종종 발생한다.

그럴 때마다 무슨 일이 있는지도 모르는 머신을 다시 점검하고 살리는 것은 꽤나 번거로운 일이다.
> Organization Runner 라면 해당 프로젝트 뿐 아니라 전체적인 프로젝트에 영향을 미칠 수 있기 때문에 대기 시간과 시간으로 인한 손해는 더 클 것이다.

그래서, 이런 문제를 해결하기 위해, Self-Hosted Runner가 죽어있을 때, Github Runner로 대신 실행하도록 하는 Fail over 방법을 찾아보았다.

## 난관
문제는 Github Actions은 공식적으로 Self-Hosted Runner가 모종의 이유로 오프라인 상태일 때 Github Runner로 대신 실행하는 기능을 제공하지 않는다는 것이다.
> 러너 그룹을 여러개 묶어서 동시에 실행할 수 있는 기능은 지원한다. 단, 결국 동시 실행일 뿐이기에 많이 사용한다면, 사용하지도 않은 러너에 대한 비용을 지불해야 할 것이다. (특히나 기본 러너는 오래 걸리기에, 시간으로 인한 비용도 비쌀 것이다.)

## 해결책
없으면 잇몸으로 때우라고 했다. 앞단에서 러너의 상태 직접 체크를 한 후 라우팅한다면 어떨까? 라는 아이디어를 바탕으로 액션을 구성했다.

플로우를 그려보면 다음과 같다.

![image](/images/github_action/self-hosted-online-checker-1729507068273.png)

`ubuntu-latest`는 Github Runner를 의미하고, `self-hosted`는 Self-Hosted Runner를 의미한다.

상태 체크는 Github API에서 제공하는 러너 정보를 토대로 체크하도록 구성했다.

이를 코드로 보면 다음과 같다.

```yaml
name: Route Runner

on:
  pull_request:
    branches: [ '*' ]

jobs:
  check_self_hosted:
    runs-on: ubuntu-latest
    outputs:
      found: ${{ steps.check.outputs.found }}
    steps:
      - name: Self-Hosted Runner is online?
        id: check
        uses: YangTaeyoung/self-hosted-runner-online-checker@v1.0.5
        with:
          runner-labels: 'self-hosted'
          GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}

  call_self_hosted_runner:
    name: Call self-hosted Runner runner for test
    if: ${{ success() && needs.check_self_hosted.outputs.found == 'success' }}
    needs: check_self_hosted
    uses: ./.github/workflows/test-ci.yml
    with:
      runner: self-hosted
   
  call_github_hosted_runner:
    name: Call Github Runner runner for test
    needs: check_self_hosted
    if: ${{ success() && needs.check_self_hosted.outputs.found == 'failure'}}
    uses: ./.github/workflows/test-ci.yml
    with:
      runner: ubuntu-latest
```

각 테스트를 실행로직은 Self-Hosted, Github Runner에 따라 큰 차이는 없기 때문에 Reusable Workflow로 만들어서 사용하도록 했다.

첫 `job`인 `check_self_hosted`에서는 Self-Hosted Runner가 온라인 상태인지 체크하고, 결과를 해당 `job`의 `output`인 `found`에 저장한다.

그리고, `call_self_hosted_runner`에서는 Self-Hosted Runner가 온라인 상태이면, Self-Hosted Runner로 테스트를 실행하고, 그렇지 않다면 Github Runner로 테스트를 실행하도록 했다.

이렇게 하면, Self-Hosted Runner가 죽어있을 때, Github Runner로 대신 실행하도록 할 수 있다.

![image](/images/github_action/self-hosted-online-checker-1729507626121.png)

![image](/images/github_action/self-hosted-online-checker-1729507642587.png)

## 결론
해당 작업을 통해 천재지변이나 랜선 노후화, 정전 등 러너가 죽어있을 때, Github Runner로 대신 실행하도록 하는 방법을 찾아보았다.

물론 Runner 고유의 에러 등은 사실 어쩔 수 없는 부분이라 해당 액션은 online 상태만 체크하도록 구성했지만, 근본적으로 러너가 살아 있을 때에 대한 모니터링이나, 장애 상황을 대비한 대응은 필요할 것이다.
> 이런 관리비용에도 Self-Hosted를 쓰는 이유는 압도적인 성능과 비용 때문이 아닐까 싶다.