---
title: (Github Actions) Self-Hosted Runnerが失敗した場合にGithub Runnerで代わりに実行する
type: blog
date: 2024-10-21
comments: true
translated: true
---

![Image](/images/github_action/self-hosted-online-checker-1729507848686.png)

最近、会社で利用していたJenkins CI/CDをGithub Actionsに転換する際、Self-Hosted Runnerを使用することになりました。

## Self-Hosted Runnerとは？
[Self-Hosted Runner](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/adding-self-hosted-runners)とは、その名の通り、自己ホスティングされたランナーを意味します。Github Actionsを実行するとき、GitHubが提供するRunnerではなく、ユーザーが自らホスティングしたマシンを使用するのです。

ユーザーのコンピュータを直接使用するため、環境的な制約やキャッシュなどの問題が発生することもありますが、GitHub Runnerに比べて速く、（電気代を除けば）無料で使用できるという利点があります。

### Self-Hosted Runnerを使用する理由

現在、Jenkinsで問題になっていたのはテストにかかる時間でした。テスト時間を削減するために既存のコードをリファクタリングして30分から10分程度まで3分の1に短縮しましたが、どんどん増えるテストコードとリポジトリのテストのために[Testcontainer](https://testcontainers.com/)を導入し、やむを得ず実行時間が19分に延びてしまいました。

問題は、これらのテストプロセスが、PRを出すときだけでなく、デプロイ時にも含まれているため、デプロイ時間が30分に達するほど長くなることです。

そこで、こうした問題を解決するためにSelf-Hosted Runnerを使用することに決定しました。

会社にある既存の機器を使うのも良く、Jenkinsの場合、AWS EC2インスタンスを使用していましたが、EC2インスタンス対比で安価で（電気代）、遥かに性能が優れているというメリットがありました。（セッティングも簡単です）
> 会社に余った機材がない場合、まったく別の話になるでしょう。私たちの会社では基本的にビルドランナーに使える余ったマシンがあったためこの選択をしました。実務では、GitHubが提供する高スペックのランナーを使用するのとコンピュータ購入費用を比較することが先行すべきです。

もちろん、JenkinsにSelf-Hosted Runnerをつける方法もありますが、固定的なマシンの数を指定しなければならないなどの制約があり、動的に伸縮できるGithub Actionsを選択しました。

### 問題点
問題はSelf-Hosted Runnerが常に正常動作しないことです。もちろん、GitHub Runnerにもその点はありますが、会社で直接管理するマシンであるため、LANケーブルの老朽化などでしばしばマシンがダウンすることがあります。

その度に何が起こっているのかも分からないマシンを再度点検して持ち直すのはかなり厄介な作業です。
> 組織ランナーの場合、そのプロジェクトだけでなく、全体的なプロジェクトに影響を与える可能性があるため、待ち時間と時間による損失はさらに大きくなるでしょう。

そこで、この問題を解決するために、Self-Hosted Runnerがダウンしている時、Github Runnerで代わりに実行するフォールオーバー方法を探しました。

## 難関
問題は、Github Actionsが公式にはSelf-Hosted Runnerが何らかの理由でオフラインになった場合にGithub Runnerで代わりに実行する機能を提供していないことです。
> ランナーグループをいくつかまとめて同時に実行できる機能はサポートしています。ただ、結局同時実行に過ぎないため、多用すると未使用のランナーに対する費用を支払わなければならないでしょう。（特に基本のランナーは時間がかかるため、時間による費用も高くなるでしょう。）

## 解決策
無ければ歯茎で何とかしろと言うけれど、前面でランナーの状態を直接チェックした後でルーティングするとどうだろう？というアイデアに基づいてアクションを構築しました。

フローは次のようになります。

![image](/images/github_action/self-hosted-online-checker-1729507068273.png)

`ubuntu-latest`はGithub Runnerを意味し、`self-hosted`はSelf-Hosted Runnerを意味します。

状態チェックはGithub APIで提供されるランナー情報をもとにチェックするように構成しました。

コードでは次のようになります。

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

各テストの実行ロジックはSelf-Hosted、Github Runnerによって大きな違いはないため、Reusable Workflowとして作成して使用しました。

最初の`job`である`check_self_hosted`ではSelf-Hosted Runnerがオンライン状態かどうかをチェックし、結果を該当`job`の`output`である`found`に保存します。

そして、`call_self_hosted_runner`ではSelf-Hosted Runnerがオンライン状態であれば、Self-Hosted Runnerでテストを実行し、そうでなければGithub Runnerでテストを実行するようにしました。

これにより、Self-Hosted Runnerがダウンしている時にGithub Runnerで代わりに実行できるようになります。

![image](/images/github_action/self-hosted-online-checker-1729507626121.png)

![image](/images/github_action/self-hosted-online-checker-1729507642587.png)

## 結論
この作業を通じて、天災やLANケーブルの老朽化、停電などでランナーがダウンしている時に、Github Runnerで代わりに実行する方法を探しました。

もちろんランナー固有のエラーなどは実際どうしようもない部分なので、今回のアクションはオンライン状態のみチェックするよう構成しましたが、根本的にランナーが生きている際のモニタリングや障害状況に備えた対応が必要となるでしょう。
> このような管理コストにもSelf-Hostedを使う理由は、圧倒的な性能とコストによる利点のおかげではないでしょうか。