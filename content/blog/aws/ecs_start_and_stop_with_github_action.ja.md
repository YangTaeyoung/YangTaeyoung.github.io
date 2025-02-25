---
title: AWS ECSサービスをGithub Actionsで自動的に開始および終了する
type: blog
date: 2023-10-18
comments: true
translated: true
---
AWS ECSでデプロイした[Plog](https://github.com/project-555)（「開発者のためのブログ制作プロジェクト」）を終了するにあたり、サーバーメンテナンスの費用を可変的にコントロールしたいと思いました。

~~_(勉強目的で始めたものであり、お金を稼ぐために維持しているサービスではないので... 節約しないといけないですね...)_~~

ECSの費用は大したものではありませんが、それでも無駄に維持する必要はないと考えました。ただ、チームメンバーがいつでも転職や就職時にポートフォリオとして活用できるように、APIサーバーを上げたり下げたりすることを企画しようと思います。

## ECSサービスの終了はどうするのか？
実は非常に簡単です。ECSサービスの希望するタスク数を0に設定すればよいのです。逆に開始する場合は、希望するタスク数を希望するコンテナ数に設定すればよいのです。
> 注意すべき点は、この方法が決してデプロイする方法を意味するわけではないということです。すでに生成されたコンテナを終了し、再起動することを意味します。

### AWS CLI
以前は[AWS CLI](https://aws.amazon.com/pare/cli/)のコマンドを自動化して使用しようとしていました。方法もわかっていましたが、結局はGithub Actionを利用することにしました。
理由は次の通りです。
1. フロントチームメンバーはAWSにあまり慣れていませんでした。
2. AWSクライアントのコマンドを使用するにはAWSアクセスキーとシークレットキーを使用する必要がありますが、これらをチームメンバー間で共有して使用することはあまり優雅に見えませんでした。

#### 手順
1. AWSアクセスキーIDとAWSシークレットアクセスキーをチームメンバー間で共有した後、[AWS CLI](https://aws.amazon.com/pare/cli/)をインストールします。
2. AWS Configureを介して、アクセスキーとシークレットキーを入力して設定を完了させます。
    ```bash
    $ aws configure
    > AWS Access Key ID [None]: {AWS_ACCESS_KEY_ID}
    > AWS Secret Access Key [None]: {AWS_SECRET_ACCESS_KEY}
    > Default region name [None]: {AWS_REGION}
    > Default output format [None]: {AWS_OUTPUT_FORMAT}
    ```
3. AWSクライアントを介してECSサービスを開始および終了します。
    ```bash
    $ aws ecs update-service --cluster plog-cluster --service plog-service --desired-count 0 # サービス終了
    $ aws ecs update-service --cluster plog-cluster --service plog-service --desired-count 希望のタスク数 # サービス開始
    ```

## Github Actions
Github ActionsはGithubが提供するCI/CDサービスです。Githubが提供するさまざまなアクションを通じてCI/CDを構成することができます。

強力な利点の一つはGithub Secretsで、Githubが提供する秘密キー管理システムです。Github Actionsを通じてデプロイするとき、Github Secretsに保存された秘密キーを使用することができます。

この機能を通じて前述のAWSアクセスキーとシークレットキーを直接入力せず、Github Secretsを介して登録し、Github Actionsで活用することができました。

### 手順
1. Github SecretsにAWSアクセスキーとシークレットキーを登録します。
   a. Githubリポジトリ > 設定 > Secrets > New repository secretで`AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`を登録します。筆者はECSデプロイ時にECRアドレスが`AWS_ACCOUNT_ID`を含んでいるため、`AWS_ACCOUNT_ID`を追加で登録しました。
   ![image](/images/aws/ecs_start_and_stop_with_github_action-1697561976275.png)

   ![image](/images/aws/ecs_start_and_stop_with_github_action-1697561871820.png)

2. ECSサービス開始ワークフローファイル`project-root/.github/workflows/start-ecs.yaml`を作成します。
   ```yaml
   name: Start ECS Service
   
   on:
     workflow_dispatch:
   
   env:
     ECS_CLUSTER: 作成したECSクラスター名
     ECS_SERVICE: 作成したECSサービス名
   
   jobs:
     start-plog:
       runs-on: ubuntu-latest
   
       steps:
         - name: Checkout
           uses: actions/checkout@v2
   
         - name: Start ECS Service
           run: |
             aws ecs update-service --cluster ${% raw %}{{ env.ECS_CLUSTER }}{% endraw %} --service ${% raw %}{{ env.ECS_SERVICE }}{% endraw %} --desired-count 1
           env:
             AWS_ACCESS_KEY_ID: ${% raw %}{{ secrets.AWS_ACCESS_KEY_ID }}{% endraw %}
             AWS_SECRET_ACCESS_KEY: ${% raw %}{{ secrets.AWS_SECRET_ACCESS_KEY }}{% endraw %}
             AWS_DEFAULT_REGION: "AWSリージョン"
   ```
3. ECSサービス終了ワークフローファイル`project-root/.github/workflows/stop-ecs.yaml`を作成します。
   ```yaml
   name: Stop ECS Service
   
   on:
      workflow_dispatch:
   
   env:
     ECS_CLUSTER: 作成したECSクラスター名
     ECS_SERVICE: 作成したECSサービス名
   
   jobs:
      stop-plog:
         runs-on: ubuntu-latest
   
         steps:
            - name: Checkout
              uses: actions/checkout@v2
   
            - name: Stop ECS Service
              run: |
                 aws ecs update-service --cluster ${% raw %}{{ env.ECS_CLUSTER }}{% endraw %} --service ${% raw %}{{ env.ECS_SERVICE }}{% endraw %} --desired-count 0
              env:
                 AWS_ACCESS_KEY_ID: ${% raw %}{{ secrets.AWS_ACCESS_KEY_ID }}{% endraw %}
                 AWS_SECRET_ACCESS_KEY: ${% raw %}{{ secrets.AWS_SECRET_ACCESS_KEY }}{% endraw %}
                 AWS_DEFAULT_REGION: "AWSリージョン"
   ```

どちらのアクションも`desired-count`を除けば同じです。`desired-count`は希望するタスク数を意味します。`0`に設定するとサービスが終了し、`1`に設定するとサービスが開始されます。

下の写真で1つ必要な部分が変更されると考えればよいでしょう。ECSは指定したタスク数に応じてコンテナ数を調整します。

![image](/images/aws/ecs_start_and_stop_with_github_action-1697562816389.png)

各`yaml`ファイルで`on`を`workflow_dispatch`に設定した理由はGithub Actionsを手動で実行するためです。

![image](/images/aws/ecs_start_and_stop_with_github_action-1697562773679.png)

`name`は適切に設定すればアクションリストで見やすくなります。

![image](/images/aws/ecs_start_and_stop_with_github_action-1697562727292.png)

## Summary
Github Actionを通じてECSサービスを開始および終了する方法を知ることができました。Github Actionsを通じてAWS ECSをデプロイする方法は後日扱う予定です。

![image](/images/aws/ecs_start_and_stop_with_github_action-1697562898329.png)