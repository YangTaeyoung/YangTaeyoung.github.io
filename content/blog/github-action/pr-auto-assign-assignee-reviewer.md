---
title: PR(Pull Request)에 자동으로 assignee와 reviewer를 지정하는 방법
type: blog
date: 2024-05-23
comments: true
---

![image](/images/github_action/pr-auto-assign-assignee-reviewer-1716454592138.png)

회사에서 개발을 하다보면, 사소한 것이 귀찮을 때가 있다.

예를 들어 특정 라벨을 달아야하는 룰이 있다거나, PR을 올릴 때 특정 Assignee 와 Reviewer 를 지정해야 하는 경우가 대표적으로 쉽지만 귀찮고 빼먹기 쉬운...? 그런 일이었던 것 같다.

회사에 처음 들어왔을 때도 그랬는데, 이 부분엔 어떤 라벨을 붙여야 하고, Reviewer 로 누굴 지정해야 하고 이런 부분이 번거로웠던 것 같다.

## Auto Assign Action
사실 Github 의 기능으로는 이런 것들을 자동으로 지정해주진 않는다. 하지만 Github Actions 의 이벤트를 이용하면 PR이 오픈될 때를 타깃으로 특정 액션이 수행되도록 할 수 있다.

실제 수행하는 액션은 직접 구현할 수도 있지만 이미 해당 기능을 구현해놓은 것이 있어 해당 액션을 사용하면 편리하게 Assignee 와 Reviewer 를 지정할 수 있다.

해당 예제에서는 Github Actions 마켓 플레이스에 있는 [Auto Assign Action](https://github.com/kentaro-m/auto-assign-action) 을 이용할 것이다.

![image](/images/github_action/pr-auto-assign-assignee-reviewer-1716454564478.png)

명세를 보면, Assignee, Reviewer 를 그룹별로 지정하여 지정할 수도 있다. 

한 Repository를 여러 팀에서 관리하는 경우 용이하게 사용할 수 있을 것 같다.

또한 include, ignore 할 라벨이나, 키워드를 정의할 수 있기 때문에 Auto Assign Action을 필요로 하지 않는 PR (예: 릴리즈 PR, 테스트 PR 등)은 무시하게 할 수 있다.

## 사용법
해당 액션을 사용하기 위해서는 액션을 설정하는 설정 yaml, 및 Github Actions 을 사용하기 위한 Github Workflow yaml 파일 총 2개의 파일을 준비해야 한다.

```yaml{filename=".github/auto_assign.yml"}
# Reviewer 자동 할당 설정
addReviewers: true

# Assignee를 Author로 설정
addAssignees: author

# Reviewer 추가할 사용자 목록
reviewers:
  - YangTaeyoung # 내 이름
  - {팀원_Github_Username_1}
  - {팀원_Github_Username_2}
  - {팀원_Github_Username_3 ...}

  
# 추가할 리뷰어 수
# 0으로 설정하면 그룹 내 모든 리뷰어를 추가합니다 (기본값: 0)
numberOfReviewers: 0

# Pull Request에 아래 키워드가 포함되어 있으면 리뷰어 추가 프로세스를 건너뜁니다
skipKeywords:
  - exclude-review # 리뷰를 제외할 키워드 설정
```

해당 파라미터 말고도 다양한 조건하에서 자동 할당을 할 수 있다.

워크플로우는 다음과 같이 구성하면 된다.

```yaml{filename=".github/workflows/auto_assign.yml"}
name: 'Auto Assign'
on:
  pull_request:
    types: [opened, ready_for_review]
    
jobs:
  add-reviews:
    runs-on: ubuntu-latest
    permissions: # 권한 설정
      contents: read
      pull-requests: write
    steps:
      - uses: kentaro-m/auto-assign-action@v2.0.0
        with:
          configuration-path: '.github/auto_assign.yml' # Only needed if you use something other than .github/auto_assign.yml
```

여기서 `opened`는 PR이 오픈되었을 때, `ready_for_review`는 Draft 상태였던 PR이 Open 상태로 변경되었을 때를 의미한다.

여기서 레포에서 예제와 다른 부분은 아래 `permission`인데 액션 실행 시 `Warning: Resource not accessible by integration`이라는 경고 출력 후 Reviewer, Assignee가 할당되지 않을 때 해당 권한을 설정해두면 경고가 사라지며, 자동으로 할당되는 것을 볼 수 있다.
```yaml
    permissions: # 권한 설정
      contents: read
      pull-requests: write
```

해당 액션을 달아주면 팀원들의 작은 환호를 들을 수 있다. 😁

![image](/images/github_action/pr-auto-assign-assignee-reviewer-1716458343634.png)