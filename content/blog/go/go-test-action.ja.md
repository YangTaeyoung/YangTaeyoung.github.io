---
translated: true
title: PRを作成する際にGithub Actionsを介してGolangテストを自動で実行し、レポートを生成してみよう
type: blog
date: 2025-02-17
comments: true
---

どこでも、どんな言語でも、テストのためにビルドやテストを自動化することは非常に重要といえます。

もちろんローカルで直接テストを実行してアップロードするようにすることもできますが、人が作業する際にはテストを実行せずにアップロードする場合も時々あるため、ローカルに依存しすぎるよりは、自動化をしておくと、長く使うためにも良く、保守にも費用が少なくて済むでしょう。

この記事では、Golangでテストのためのアクションを作成し、PRを作成する際に自動でテストを実行し、レポートを生成する方法について紹介します。

シナリオは以下のように設計しました。
1. Goのセットアップ
2. Go Testの実行
3. テストレポートの生成
4. PRにコメントとしてレポートのリンクを残す

## テストコード
### Goコード
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
このコードは `Divide()` という関数を実装したものです。単純に `a`を`b`で割る関数で、0で割ることは許可されていないため、エラーを返すようにしました。

### テストコード
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
			name: "10を2で割る",
			args: args{
				a: 10,
				b: 2,
			},
			want:    5,
			wantErr: false,
		},
		{
			name: "10を0で割る",
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

`go test -v ./...` でローカルでテストすることもできますが、Github Actionsでテストが実行されるためにはyamlファイルの記述が必要です。

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

筆者が作成しテストまで完了したコードなので、そのままコピーして使用しても問題ありません。

説明は以下の通りです。
```yaml
      - name: Checkout Repository
        uses: actions/checkout@v4
```

このステップはリポジトリをチェックアウトするステップです。ローカルで行う `git clone` コマンドと似たようなもので、アクションランナーのファイルシステムにそのリポジトリのコードを持ってくるものだと見てください。

```yaml
      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: 1.23
```

このステップはGoをインストールするステップです。もちろん直接apt-getを通じてインストールしてもかまいませんが、このようなSetupアクション系は一般的にアクションキャッシュを適用するため、ビルド速度をより速くする利点があります。

```yaml
      - name: Test Report
        id: test-report
        uses: robherley/go-test-action@v0
        with:
          testArguments: '-count 1 -v ./...'
```
テストレポートを生成するために自作のアクションを作成することもできますが、既に出来上がっている良いアクションがあるのでそれを活用してみました。

筆者は [robherley/go-test-action](https://github.com/robherley/go-test-action) を使用しました。このアクションはGoテストを実行しながら、レポートをSummaryに残すアクションです。

追加的に `testArguments` を適用しましたが、この部分は書いても書かなくてもかまいません。書かない場合、デフォルトで `-v ./...` が付くと考えてください。
筆者はキャッシュがされないようにするために `count 1` オプションを適用しました。
> 関連内容は以前のGo Testキャッシュに関する [記事](/blog/go/go-test-without-cache/)を参照してください。

```yaml
      - name: PR Comment
        if: always() && github.event_name == 'pull_request'
        uses: mshick/add-pr-comment@v2
        with:
          message: |
            ${{ steps.test-report.outcome == 'success' && '![image](https://img.shields.io/badge/testing-success-green)' || '![image](https://img.shields.io/badge/testing-failure-red)' }}
            
            **📃 Report**: https://github.com/${{github.repository}}/actions/runs/${{ github.run_id }}
```
その後、このアクションを通じてPRにレポートリンクを残すアクションです。PRが必要であるため、コメントが残されることになるので、`if: always() && github.event_name == 'pull_request'` 条件を設けました。
`always()` は前のアクションが成功か失敗かに関係なく実行されるようにします。そして [shield.io](https://shields.io/) を利用して成功、失敗に応じたバッジで美しく表示されるようにしました。（大したことではなく、このようなアイコンを付けるものです）

**成功** ![image](https://img.shields.io/badge/testing-success-green)

**失敗** ![image](https://img.shields.io/badge/testing-failure-red)

## 結果
では、実際に作成した結果を見てみましょう。

### 成功時
この [PR](https://github.com/YangTaeyoung/go-test-action/pull/1) に入ってみると、次のようにコメントが付いています。

![image](/images/web/go-test-action-1739793455218.png)

そしてレポートをクリックすると、詳細なレポートを次のように見ることができます。

![image](/images/web/go-test-action-1739793500644.png)

### 失敗時
次のテストが失敗した [PR](https://github.com/YangTaeyoung/go-test-action/pull/2) に入ってみると、次のようにコメントが付いています。

![image](/images/web/go-test-action-1739793727246.png)

そしてリンクをクリックすると、次のように失敗したレポートを見ることができます。
![image](/images/web/go-test-action-1739793754098.png)

## 総合
レポートも適切で、PRコメントだけ少しカスタマイズすればかなり有用な状態で使用できると思います。

もちろん、これ以外にもさまざまなアクションがあります。ある人はSlackに通知を送ることもあるでしょうし、より多様なレポート、さまざまな形を求める場合もあるでしょう。

そのような場合には、自分でアクションを作ってみてもよいし、既に作られたアクションを少しずつ改良しながら使用してもよいでしょう。

## \+ GithubのRuleset設定
アクションだけを設定しておくと、実際には不安な部分もあります。失敗してもマージする機能が有効になる可能性があるためです。

![image](/images/web/go-test-action-1739793900804.png)
> いつでも `Merge pull request` ボタンをクリックすることができます。

このような場合にはGithubのRulesetを利用すると良いです。特定のアクションの結果に応じてマージを防ぐことができるからです。

まずアクションがある `Repository - Settings - Rules - Rulesets` に入ります。

![image](/images/web/go-test-action-1739794029637.png)

そして `New ruleset - New branch ruleset` を選択します。（PRオープン時に使用しない場合は `New tag ruleset` を選んでもかまいません）

![image](/images/web/go-test-action-1739794083049.png)

名前は任意で設定し、`Target branches` でマージターゲットになるブランチを追加します。

![image](/images/web/go-test-action-1739794265367.png)

筆者は `main` ブランチがターゲットなので `main` を追加しました。

そしてEnforcement StatusをActiveに変更します。このステータスを有効にしなければ、設定したRulesetがアクティブになりません。

![image](/images/web/go-test-action-1739794630084.png)

その後、`Required status checks to pass` を選択します。

![image](/images/web/go-test-action-1739794378460.png)

`Add checks +` ボタンをクリックして、ジョブの名前だったRun Go Testsを追加します。

![image](/images/web/go-test-action-1739794430310.png)

すると、次のようにリストに追加されたチェックが表示されます。これでCreateボタンを押してRulesetを作成すれば完了です。

![image](/images/web/go-test-action-1739794445136.png)

すると、次のように先ほどとは異なり、`Merge pull request` ボタンが無効化されていることがわかります。

![image](/images/web/go-test-action-1739794686030.png)
