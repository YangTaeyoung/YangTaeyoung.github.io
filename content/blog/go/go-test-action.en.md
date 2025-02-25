---
title: Let's Automatically Run Golang Tests and Generate Reports with Github Actions When Opening a PR
type: blog
date: 2025-02-17
comments: true
translated: true
---

Automating builds or tests for any language, anywhere, is crucial.

Although it's possible to run tests locally and push them, sometimes people push without running tests. Hence, relying less on local tests and more on automation can be beneficial for long-term use and maintenance.

In this post, we'll explore how to create an action for testing in Golang and how to automatically run tests and generate reports when a PR is opened.

The scenario is designed as follows:
1. Set up Go
2. Run Go Tests
3. Generate Test Report
4. Leave a report link as a comment in the PR

## Test Code
### Go Code
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
The code implements a function called `Divide()`. It simply divides `a` by `b`, and since dividing by zero is not allowed, it returns an error.

### Test Code
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
			name: "Divide 10 by 2",
			args: args{
				a: 10,
				b: 2,
			},
			want:    5,
			wantErr: false,
		},
		{
			name: "Divide 10 by 0",
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

You can test locally with `go test -v ./...`, but to perform tests on Github Actions, you'll need to write a yaml file.

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

This code is written and tested by me, so you can use it as is.

Explanation:
```yaml
      - name: Checkout Repository
        uses: actions/checkout@v4
```

This step checks out the repository. It is similar to the `git clone` command performed locally and retrieves the repository code to the action runner's file system.

```yaml
      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: 1.23
```

This step installs Go. You could use `apt-get` to install it, but using Setup actions usually applies action cache, thus speeding up the build process.

```yaml
      - name: Test Report
        id: test-report
        uses: robherley/go-test-action@v0
        with:
          testArguments: '-count 1 -v ./...'
```
You can create an action for generating test reports, but since there is already a good action available, we decided to use it.

I used the [robherley/go-test-action](https://github.com/robherley/go-test-action). This action runs Go tests and logs the report in Summary.

Additionally, I applied `testArguments`, but it's optional. If not specified, `-v ./...` is the default. I used the `count 1` option to prevent caching.
> Refer to previous Go Test cache related [post](/blog/go/go-test-without-cache/).

```yaml
      - name: PR Comment
        if: always() && github.event_name == 'pull_request'
        uses: mshick/add-pr-comment@v2
        with:
          message: |
            ${{ steps.test-report.outcome == 'success' && '![image](https://img.shields.io/badge/testing-success-green)' || '![image](https://img.shields.io/badge/testing-failure-red)' }}
            
            **📃 Report**: https://github.com/${{github.repository}}/actions/runs/${{ github.run_id }}
```
This post leaves a report link as a comment in the PR. Since the comment is left only when a PR is present, the condition `if: always() && github.event_name == 'pull_request'` is applied.
`always()` ensures execution regardless of the success or failure of previous actions. Shields.io is used to display badges for success or failure nicely. (It's nothing major, it's just a decorative icon)

**Success** ![image](https://img.shields.io/badge/testing-success-green)

**Failure** ![image](https://img.shields.io/badge/testing-failure-red)

## Result
Let's look at the actual results created.

### On Success
Check the comments on this [PR](https://github.com/YangTaeyoung/go-test-action/pull/1).

![image](/images/web/go-test-action-1739793455218.png)

Clicking on the report shows the detailed report below.

![image](/images/web/go-test-action-1739793500644.png)

### On Failure
Check the comments on this failed [PR](https://github.com/YangTaeyoung/go-test-action/pull/2).

![image](/images/web/go-test-action-1739793727246.png)

Clicking the link shows the failed report below.
![image](/images/web/go-test-action-1739793754098.png)

## Summary
The report is adequately detailed, and with some customization of PR comments, it can be quite useful.

Of course, there are numerous other actions. Some may send alerts to Slack, or want more varied reports and forms.

In such cases, you may create your actions or modify existing ones slightly for use.

## \+ Setting Github Ruleset
Simply setting up the action isn't enough; there's always a chance it might be merged even if it fails.

![image](/images/web/go-test-action-1739793900804.png)
> The `Merge pull request` button is always clickable.

In such scenarios, using Github's Ruleset is helpful. It can block merges based on the results of certain actions. 

First, navigate to `Repository - Settings - Rules - Rulesets`.

![image](/images/web/go-test-action-1739794029637.png)

Select `New ruleset - New branch ruleset`. (Choose `New tag ruleset` if not using for PRs)

![image](/images/web/go-test-action-1739794083049.png)

Name it as desired and add the target branch for merging under `Target branches`.

![image](/images/web/go-test-action-1739794265367.png)

For me, the target is the `main` branch.

Change the Enforcement Status to Active. This activates the created Ruleset.

![image](/images/web/go-test-action-1739794630084.png)

Choose `Required status checks to pass`.

![image](/images/web/go-test-action-1739794378460.png)

Click the `Add checks +` button and add `Run Go Tests`, which was the Job name.

![image](/images/web/go-test-action-1739794430310.png)

You'll now see the added check on the list. Create the Ruleset by clicking the Create button.

![image](/images/web/go-test-action-1739794445136.png)

Now, unlike before, the `Merge pull request` button is inactive.

![image](/images/web/go-test-action-1739794686030.png)