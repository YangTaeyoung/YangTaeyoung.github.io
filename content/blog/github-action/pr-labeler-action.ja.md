---
title: Github PR（プルリクエスト）のタイトル、イシュートタイトルに応じたラベルの自動設定方法
type: blog
date: 2024-05-27
comments: true
translated: true
---

会社のプロジェクトを見ていると、便利に使われているアクションがあり、それについて投稿します。

それは、PRのタイトルに応じてラベルを自動で設定してくれるアクションです。

通常、GithubイシューやPRに分類を簡単にするためにラベルを付けることがありますが、これは後にどのような種類のイシューやPRがあったのか、履歴の追跡やフィルタリングを簡単にするためです。
~~（イシューやPRが見た目も良くなります）~~

会社では手作業で毎回ラベルを付けると抜け漏れがあったり、間違って付けることもあります。以下では、PR、イシュートタイトルに基づいてラベルを自動で設定するアクションを紹介します。

![image](/images/github_action/pr-labeler-action-1716800204381.png)

## PR Labeler Action
![image](/images/github_action/pr-labeler-action-1716800340299.png)

ラベルを自動で付けるために [Auto Labeler](https://github.com/jimschubert/labeler-action) というものを使用します。

このアクションはGithub Marketplaceに登録されており、PR、イシュートタイトルに応じてラベルを自動で設定する機能を備えています。

使い方はとても簡単です。

まず、`.github/workflow/labeler.yml` を作成し、以下のように記述します。ファイル名やnameなどは、自分が設定したいように指定できます。
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

このファイルはWorkflowファイルなので、Pushすると指定した名前である `Community` というアクションが生成されます。

次に、詳細な設定ファイルである `.github/labeler.yml` を作成し、以下のように記述します。
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

私の場合、PRにのみラベルを付けるために `enable` の `issues` を `false` に設定しました。

`labels` にはラベルの名前と、そのラベルを付ける条件を定義します。

上の設定ファイルを見ると、`bug`、`enhancement`、`documentation`、`release`、`refactoring`、`test` というラベルを定義しました。

PRが作成される際、デフォルトのタイトルがcommitメッセージとして生成されるため、githubのcommitメッセージ規約をそのままラベルに反映させるように設定しました。

このようにしてPRやイシューを作成すると、自動的にラベルが設定されることが確認できるでしょう。