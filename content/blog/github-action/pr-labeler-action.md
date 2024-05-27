---
title: Github PR(Pull Request) 제목, 이슈 제목에 따라 라벨 자동 설정하기
type: blog
date: 2024-05-27
comments: true
---

회사의 프로젝트를 살펴보다 유용하게 사용되고 있는 액션이 있어 포스팅한다.

바로 PR 제목에 따라 라벨을 자동으로 설정해주는 액션이다.

보통 Github 이슈나, PR에 분류를 편하게 하기 위해 라벨을 붙이곤 하는데, 이는 추후 어떤 종류에 이슈나 PR이 있었는지 히스토리 추적이나, 필터링을 쉽게 하기 위함이다.
~~(이슈나 PR이 예뻐보이기도 한다.)~~

회사에서는 수기로 매번 라벨을 달다 보면, 누락되거나, 잘못 붙일 수도 있다. 아래에서는 PR, 이슈 제목에 따라 라벨을 자동으로 설정해주는 액션을 소개한다.

![image](/images/github_action/pr-labeler-action-1716800204381.png)

## PR Labeler Action
![image](/images/github_action/pr-labeler-action-1716800340299.png)

라벨을 자동으로 달기 위해서 [Auto Labeler](https://github.com/jimschubert/labeler-action) 라는 을 사용할 것이다.

해당 액션은 Github Marketplace에 등록되어 있으며, PR, 이슈 제목에 따라 라벨을 자동으로 설정해주는 기능을 갖추고 있다.

사용 방법은 아주 단순하다

먼저 `.github/workflow/labeler.yml` 을 생성하고 아래와 같이 작성한다. 파일명, name 등은 본인이 설정하고 싶은데로 지정하면 된다.
```yaml{filename=".github/workflows/labeler.yml"}
name: Community
on:
  issues:
    types: [opened, edited, milestoned]
  pull_request_target:
    types: [opened]

jobs:

  labeler:
    runs-on: ubuntu-latest

    steps:
      - name: Check Labels
        id: labeler
        uses: jimschubert/labeler-action@v2
        with:
          GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
```

해당 파일은 Workflow 파일이기 때문에 Push 하게 되면 내가 지정한 이름 `Community` 라는 액션이 생성된다.

이제 세부적인 설정 파일인 `.github/labeler.yml` 을 생성하고 아래와 같이 작성한다.
```yaml{filename=".github/labeler.yml"}
enable:
  issues: false
  prs: true

labels:
  'bug':
    include:
      - '\bfix\b'
  'enhancement':
    include:
      - '\bfeat\b'
  'documentation':
    include:
      - '\bdocs\b'
  'release':
    include:
      - '\brelease\b'
  'refactoring':
    include:
      - '\brefactor\b'
  'test':
    include:
      - '\btest\b'
```

필자의 경우 PR에만 라벨을 붙이기 위해 `enable` 의 `issues` 를 `false` 로 설정하였다.

`labels` 에는 라벨의 이름과, 해당 라벨을 붙일 조건을 정의한다.

위의 설정 파일을 보면, `bug`, `enhancement`, `documentation`, `release`, `refactoring`, `test` 라는 라벨을 정의하였다.

PR이 만들어 질때 기본 제목이 commit 메시지로 생성되기 때문에 github commit message convention 을 그대로 라벨에 녹이고자 설정하였다.

이렇게 하고 PR을 생성하거나 이슈를 생성하면 자동으로 라벨이 설정되는 것을 알 수 있다.
