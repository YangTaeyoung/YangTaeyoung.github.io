---
title: PR을 열 때 Github Actions를 통해 Golang 테스트를 자동으로 실행하고, 리포트를 생성해보자
type: blog
date: 2025-02-17
comments: true
---

어디든, 어떤 언어든 테스트를 위해 빌드나 테스트를 자동화하는 것은 매우 중요하다 볼 수 있다.

물론 로컬에서 직접 테스트를 수행하고 올리도록 할 수 있지만, 사람이 작업할 때는 테스트를 실행하지 않고 올리는 경우도 종종 있기에 너무 로컬에 의지하기 보단, 
자동화를 해두면, 오래오래 사용하기에도 좋고, 유지보수에도 비용이 적게 들어갈 수 있다.

해당 글에서는 Golang에서 Test를 위한 액션을 만들어보고, PR을 열 때 자동으로 테스트를 실행하고, 리포트를 생성하는 방법에 대해 알아본다.

시나리오는 아래와 같이 설계했다.
1. Go 셋업
2. Go Test 실행
3. Test 리포트 생성
4. PR에 코멘트로 리포트의 링크를 남기기

## 테스트 코드
### Go 코드
```go{filename="math.go"}
package math

import "errors"

var (
	ErrDivideByZero = errors.New("cannot divide by zero")
)

func Divide(a, b int) (int, error) {
	if b == 0 {
		return 0, ErrDivideByZero
	}
	return a / b, nil
}
```
해당 코드는 `Divide()` 라는 함수를 구현한 것이다. 단순히 `a`를 `b`로 나누는 함수이며, 0으로 나누는 것은 허용하지 않으므로, 에러를 반환하도록 했다.

### Test 코드
```go{filename="math.go"}
package math

import "testing"

func TestDivide(t *testing.T) {
	type args struct {
		a int
		b int
	}
	tests := []struct {
		name    string
		args    args
		want    int
		wantErr bool
	}{
		{
			name: "10 나누기 2",
			args: args{
				a: 10,
				b: 2,
			},
			want:    5,
			wantErr: false,
		},
		{
			name: "10 나누기 0",
			args: args{
				a: 10,
				b: 0,
			},
			want:    0,
			wantErr: true,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Divide(tt.args.a, tt.args.b)
			if (err != nil) != tt.wantErr {
				t.Errorf("Divide() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("Divide() got = %v, want %v", got, tt.want)
			}
		})
	}
}
```

`go test -v ./...` 으로 로컬에서 테스트 할 수도 있지만, Github Actions에서 테스트가 수행되기 위해서는 yaml파일에 대한 작성이 필요하다

## Github Actions
```yaml{filename=".github/workflows/go-test.yml"}
name: Go Test and Coverage

on:
  pull_request:
    types: [ opened, synchronize, reopened ]
  workflow_dispatch:

jobs:
  test:
    name: Run Go Tests
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: 1.23


      - name: Test Report
        id: test-report
        uses: robherley/go-test-action@v0
        with:
          testArguments: ${{ github.event_name == 'pull_request' && '-short -v ./...' || '-count 1 -v ./...' }}

      - name: PR Comment
        if: always() && github.event_name == 'pull_request'
        uses: mshick/add-pr-comment@v2
        with:
          message: |
            ${{ steps.test-report.outcome == 'success' && '![image](https://img.shields.io/badge/testing-success-green)' || '![image](https://img.shields.io/badge/testing-failure-red)' }}
            
            **📃 Report**: https://github.com/${{github.repository}}/actions/runs/${{ github.run_id }}
```

필자가 작성하고 테스트까지 모두 마친 코드로 해당 코드를 바로 복붙해서 사용해도 무방하다

설명하자면 아래와 같다.
```yaml
      - name: Checkout Repository
        uses: actions/checkout@v4
```

위 스탭은 해당 레포지토리를 체크아웃하는 스탭이다. 로컬에서 수행하는 `git clone` 명령어와 비슷하다고 보면 되는데 액션 러너의 파일 시스템에 해당 레포지토리의 코드를 가져온다고 보면 된다.

```yaml
      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: 1.23
```

위 스탭은 Go를 설치하는 스탭이다. 물론 직접 apt-get을 통해 설치해도 무방하지만, 이런 Setup 액션류는 일반적으로 액션 캐시를 적용해주기에, 빌드 속도를 보다 높일 수 있는 장점이 있다.

```yaml
      - name: Test Report
        id: test-report
        uses: robherley/go-test-action@v0
        with:
          testArguments: '-count 1 -v ./...'
```
테스트 리포트 생성을 위해 직접 액션을 만들어도 되지만, 이미 만들어져있는 좋은 액션이 있기에 이를 활용해보기로 했다.

필자는 [robherley/go-test-action](https://github.com/robherley/go-test-action)을 사용했다. 해당 액션은 Go 테스트를 실행하면서, 리포트를 Summary에 남기는 액션이다.

추가적으로 `testArguments`를 적용하였는데 해당 부분은 적어도 되고 안적어도 된다. 안적는 경우 디폴트로 `-v ./...`이 붙는다고 보면 된다.
필자는 캐시가 되지 않도록 하기 위해 `count 1` 옵션을 적용했다.
> 관련 내용은 이전 Go Test 캐시 관련 [포스팅](/blog/go/go-test-without-cache/)을 참조하자.

```yaml
      - name: PR Comment
        if: always() && github.event_name == 'pull_request'
        uses: mshick/add-pr-comment@v2
        with:
          message: |
            ${{ steps.test-report.outcome == 'success' && '![image](https://img.shields.io/badge/testing-success-green)' || '![image](https://img.shields.io/badge/testing-failure-red)' }}
            
            **📃 Report**: https://github.com/${{github.repository}}/actions/runs/${{ github.run_id }}
```
이후 포스팅을 통해 PR에 리포트 링크를 남기는 액션이다. PR이 있어야 덧글이 남겨질 것이므로, `if: always() && github.event_name == 'pull_request'` 조건을 걸어주었다.
`always()`는 앞선 액션이 성공이냐, 실패이냐에 상관없이 실행하게 한다. 그리고 [shield.io](https://shields.io/)를 이용해 성공, 실패에 따른 뱃지로 예쁘게 표시되게끔 했다. (대단한 건 아니고, 이런 아이콘을 붙여주는 것이다)

**성공** ![image](https://img.shields.io/badge/testing-success-green)

**실패** ![image](https://img.shields.io/badge/testing-failure-red)

## 결과
이제 실제로 생성한 결과를 살펴보자

### 성공 시
이 [PR](https://github.com/YangTaeyoung/go-test-action/pull/1)에 들어가보면 다음과 같이 코멘트가 달려있다.

![image](/images/web/go-test-action-1739793455218.png)

그리고 리포트를 클릭해보면 상세 리포트를 다음과 같이 볼 수 있다.

![image](/images/web/go-test-action-1739793500644.png)

### 실패 시
다음 테스트가 실패한 [PR](https://github.com/YangTaeyoung/go-test-action/pull/2)에 들어가보면 다음과 같이 코멘트가 달려있다.

![image](/images/web/go-test-action-1739793727246.png)

그리고 링크를 클릭하면 다음과 같이 실패한 리포트를 볼 수 있다.
![image](/images/web/go-test-action-1739793754098.png)

## 종합
리포트도 적절한 편이고, PR코멘트만 조금 커스텀해주면 꽤나 유용한 상태로 사용할 수 있을 것 같다.

물론 이외에도 다양한 액션들이 있다. 혹자는 Slack에 알림을 가게 할 수도 있을 것이고, 보다 다양한 리포트, 다양한 형태를 원하는 경우도 있을 것이다.

이런 경우에는 직접 액션을 만들어봐도 좋고, 이미 만들어진 액션을 조금씩 수정해가면서 사용해도 좋을 것이다.

## \+ Github Ruleset 설정
액션만 설정해선 사실 불안한 부분도 있다. 실패했더라도 머지하는 기능은 활성화 될 수 있기 때문이다.

![image](/images/web/go-test-action-1739793900804.png)
> 언제든 `Merge pull request` 버튼을 딸깍할 수 있다.

이런 경우에는 Github의 Ruleset을 활용하면 좋다. 특정 액션의 결과에 따라 Merge를 막을 수 있기 때문이다. 

먼저 액션이 있는 `Repository - Settings - Rules - Rulesets`를 들어간다.

![image](/images/web/go-test-action-1739794029637.png)

그리고 `New ruleset - New branch ruleset`을 선택한다. (PR 오픈때 사용할게 아니라면 `New tag ruleset`을 선택해도 무방하다)

![image](/images/web/go-test-action-1739794083049.png)

이름은 원하는 대로 설정하고, `Target branches`에서 머지 타겟이 될 브런치를 추가한다.

![image](/images/web/go-test-action-1739794265367.png)

필자는 `main` 브런치가 타겟이므로 `main`을 추가했다.

그리고 Enforcement Status를 Active로 변경한다. 해당 상태를 활성화해야 생성한 Ruleset이 활성화된다.

![image](/images/web/go-test-action-1739794630084.png)

그리고 아래에서 `Required status checks to pass`를 선택한다.

![image](/images/web/go-test-action-1739794378460.png)

`Add checks +`버튼을 클릭하고 Job의 이름이었던 Run Go Tests를 추가한다.

![image](/images/web/go-test-action-1739794430310.png)

그럼 다음과 같이 리스트에 추가한 체크가 보인다. 이제 Create 버튼을 통해 Ruleset을 생성하면 된다.

![image](/images/web/go-test-action-1739794445136.png)

그럼 다음과 같이 아까와는 다르게 `Merge pull request` 버튼이 비활성화된 것을 볼 수 있다.

![image](/images/web/go-test-action-1739794686030.png)
