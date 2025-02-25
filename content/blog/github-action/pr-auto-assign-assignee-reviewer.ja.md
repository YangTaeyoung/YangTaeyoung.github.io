---
title: PR(Pull Request)に自動でassigneeとreviewerを指定する方法
type: blog
date: 2024-05-23
comments: true
translated: true
---

![image](/images/github_action/pr-auto-assign-assignee-reviewer-1716454592138.png)

会社で開発をしていると、些細なことが面倒に感じることがあります。

例えば特定のラベルを付けるルールがあったり、PRを提出する際に特定のAssigneeやReviewerを指定しなければならない場合など、代表的な例としては簡単だけれど面倒で忘れやすい…？そんなことだったように思います。

会社に初めて入った時もそうでしたが、この部分にはどのラベルを付けるべきか、Reviewerに誰を指定するべきかといった部分がややこしかったようです。

## Auto Assign Action
実はGithubの機能ではこれらを自動で指定することはできません。しかし、Github Actionsのイベントを利用すれば、PRがオープンされる際をターゲットに特定のアクションを実行させることができます。

実際に実行するアクションは自作することもできますが、既にその機能を実装しているものがあり、それを使用すれば便利にAssigneeとReviewerを指定できます。

この例では、Github Actionsマーケットプレイスにある[Auto Assign Action](https://github.com/kentaro-m/auto-assign-action)を使用します。

![image](/images/github_action/pr-auto-assign-assignee-reviewer-1716454564478.png)

仕様を見ると、Assignee、Reviewerをグループごとに指定して割り当てることもできます。

一つのリポジトリを複数のチームで管理している場合、便利に使うことができるでしょう。

また、include、ignoreするラベルやキーワードを定義できるため、Auto Assign Actionを必要としないPR（例：リリースPR、テストPRなど）は無視させることができます。

## 使用法
このアクションを使用するためには、アクションを設定する設定yaml、およびGithub Actionsを使用するためのGithub Workflow yamlファイル合計2つのファイルを準備する必要があります。

```yaml{filename=".github/auto_assign.yml"}
# Reviewer自動割り当て設定
addReviewers: true

# AssigneeをAuthorに設定
addAssignees: author

# Reviewer追加するユーザーリスト
reviewers:
  - YangTaeyoung # 自分の名前
  - {チームメンバー_Github_Username_1}
  - {チームメンバー_Github_Username_2}
  - {チームメンバー_Github_Username_3 ...}

# 追加するレビューアの人数
# 0に設定するとグループ内のすべてのレビューアを追加します（デフォルト：0）
numberOfReviewers: 0

# Pull Requestに以下のキーワードが含まれている場合、レビューア追加プロセスをスキップします
skipKeywords:
  - exclude-review # レビューを除外するキーワード設定
```

これ以外にも様々な条件下で自動割り当てを行うことができます。

ワークフローは次のように構成します。

```yaml{filename=".github/workflows/auto_assign.yml"}
name: 'Auto Assign'
on:
  pull_request:
    types: [opened, ready_for_review]

jobs:
  add-reviews:
    runs-on: ubuntu-latest
    permissions: # 権限設定
      contents: read
      pull-requests: write
    steps:
      - uses: kentaro-m/auto-assign-action@v2.0.0
        with:
          configuration-path: '.github/auto_assign.yml' # .github/auto_assign.yml以外を使用する場合のみ必要
```

ここで`opened`はPRがオープンされた時、`ready_for_review`はDraft状態だったPRがOpen状態に変更された時を意味します。

ここでリポの例とは異なる部分は下記の`permission`で、アクション実行時に`Warning: Resource not accessible by integration`という警告が表示され、Reviewer、Assigneeが割り当てられない場合にこの権限を設定しておくと警告が消え、自動的に割り当てられるのを見ることができます。
```yaml
    permissions: # 権限設定
      contents: read
      pull-requests: write
```

このアクションを付けておくと、チームメンバーから喜びの声を聞くことができるかもしれません。 😁

![image](/images/github_action/pr-auto-assign-assignee-reviewer-1716458343634.png)