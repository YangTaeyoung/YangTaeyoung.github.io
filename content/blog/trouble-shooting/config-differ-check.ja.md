---
title: 環境ごとに設定値が漏れるのを防ごう
type: blog
date: 2025-01-03
comments: true
translated: true
---
## 設定はなぜ管理しにくいのか？
毎回のデプロイ時に感じていた根本的な問題の一つが設定です。

私たちの会社ではSpring Bootを利用しており、デプロイ環境ごとに設定ファイルが異なる部分はSpring Cloud Configを使って管理しています。

一般的にはSpringではapplication.ymlを通じて設定を管理しますが、根本的な問題はまさにこの設定ファイルの反映です。

![image](/images/trouble-shooting/config-differ-check-1735855932407.png)

我が社の場合は次のような順序でデプロイが行われ、環境が上のようにdev、qa、stage、productionに分かれており、各環境ごとに設定ファイルが異なります。

問題はこの時一度でも設定が漏れると再デプロイが必要な状況が発生するか、プロダクションで設定ファイルが漏れてデプロイされた内容が反映されない問題も引き起こす点です。

## 1. デプロイレビューを作る
![image](/images/trouble-shooting/config-differ-check-1735856331653.png)

このような問題を解決するために最初に考えた方法はデプロイ前にレビュー時間を持つことです。

問題は全員の時間をある程度消費しなければならない点で、コストが大きいため現在はProductionデプロイ前に追加されたインフラや設定に関する部分をレビューする方式で運営しています。

漏れた設定を見つけるのに多くの人が検討するため、より効果的で良い経験でした。しかし、追加された部分を一つ一つ確認する作業なのでレビュー時間が長くなる欠点があるようです。

## 2. 設定ファイル比較アクションを作る
次に今回適用した方法は設定ファイルを比較するボットを作ることです。

ただし、既存の市販されている(?) YAML比較ツールを使用すると、値まで全て比較するため、環境ごとに異なる値があることを前提に比較するには適しませんでした。

そこで、次のような方法を検討しました。

1. 環境ごとに設定ファイルを読み込み、Key値だけを抽出する。
2. タイプが異なる場合や、キーが一方のファイルにない場合、配列の場合インデックスが異なる場合などをチェックする。
3. 変更部分がある場合、各環境ブランチのマージ用PRにコメントとしてレポートを生成する。

こうすることで、環境ごとに漏れている設定があるかどうか確実に追跡することが可能だと判断しました。

### 設計
![image](/images/trouble-shooting/config-differ-check-1735857073333.png)

構造図の大部分は理解しやすいですが、大まかな構造はこのようです。
ここで[yaml-diff-reporter](https://github.com/YangTaeyoung/yaml-diff-reporter)は二つのYAML設定ファイルをパースして比較し、レポートをコンソールやファイルに出力できるCLIツールで、今回一緒に実装しました。
> 使用法を一緒に明示しておいたので、同じような悩みをしている方がいれば使用してみてください。単純ファイル比較用として使用できるようにフラグを通じてモードを指定するように実装しました。

### アクションを作る
```yaml
name: 設定ファイル比較

on:
  pull_request:
    branches: [ qa, stg, prod ]
```

私たちは前述の通り4つの環境が存在します。一般的には開発時にdevにマージされ、デプロイ時にのみ`qa`、`stg`、`prod`デプロイ用PRを上げるため、このように設定しました。

```yaml
jobs:
  config-check:
    permissions:
      contents: read
      pull-requests: write
      issues: write
env:
  MERGE_FROM: ${{ github.event.pull_request.base.ref == 'qa' && 'dev' || (github.event.pull_request.base.ref == 'stg' && 'qa' || 'stg') }}
  MERGE_TO: ${{ github.event.pull_request.base.ref }}
```
当社のサーバーはPrivate Repositoryなので、~~(当然ですが)~~ PRコメントをボットトークンが書き込めるように権限を次のように付与しました。
また、環境に応じてqaの場合はdevと比較し、stgの場合はqaと比較するように直前にデプロイした環境と比較するようにMERGE_FROM、MERGE_TO環境変数を設定しました。

```yaml
runs-on: ubuntu-latest
steps:
  - name: Go 設置
    uses: actions/setup-go@v5
    with:
      go-version: '1.23'
  - name: yaml-diff-reporter CLI 設置
    run: go install github.com/YangTaeyoung/yaml-diff-reporter@v1.0.0
```
Goを設置し`yaml-diff-reporter`をインストールするようにしました。ちなみにGoは単にinstallコマンドのみでもCLIをインストールできるので便利だと思います。

```yaml
  - name: Config ファイル ダウンロード
    uses: AcmeSoftwareLLC/github-downloader@v1
    with:
      git-pat: ${{ secrets.GH_TOKEN }}
      repo: # Cloud Config Repository
      ref: # Cloud Config Repository Branch
      includes: |
        {application yaml 경로}/${{ env.MERGE_FROM }}/application.yml:${{ env.MERGE_FROM }}.yml
        {application yaml 경로}/${{ env.MERGE_TO }}/application.yml:${{ env.MERGE_TO }}.yml
```
以降、指定した経路からファイルをGithub Repositoryからダウンロードします。ダウンロードアクションは既に実装されているものが多いので選択しましたが、どれを使っても良いです。

```yaml
  - name: Config ファイル 比較
    id: compare
    run: |
      DIFF_RESULT=$(yaml-diff-reporter -l ${{ env.MERGE_FROM }}.yml -r ${{ env.MERGE_TO }}.yml \
      -la ${{ env.MERGE_FROM }} -ra ${{ env.MERGE_TO }} \
      -M type -M key -M index \ # モード指定 (valueは除外) 
      -I  # 無視するキー指定
      -lang ko # レポートに出力される言語指定、言語はまだ韓国語(ko)、英語(en)しかサポートされていません。
      -f markdown) # レポートフォーマット指定 markdown, json, plainをサポートしている

      echo "diff_result<<EOF" >> $GITHUB_OUTPUT
      echo "${DIFF_RESULT}" >> $GITHUB_OUTPUT
      echo "EOF" >> $GITHUB_OUTPUT
```

ダウンロードされたファイルをCLIで比較し、結果を`diff_result`という変数に含ませ、stepのoutputとして指定します。
> EOFが先に出てくる理由は、レポートがマルチライン形式で出力されるためです。<br>
> シングルラインであれば`echo "diff_result=${DIFF_RESULT}"`のように指定したでしょう

```yaml
  - name: 結果 PR Comment 作成
    if: always()
    uses: thollander/actions-comment-pull-request@v3
    with:
      message: |
        # Config ファイル 比較結果
        ${{ steps.compare.outputs.diff_result == 'No differences found' && '![pass-badge](https://img.shields.io/badge/check-passed-green)' || '![fail-badge](https://img.shields.io/badge/check-failed-red)' }}

        ${{ steps.compare.outputs.diff_result }}

        ## File Reference
        - [${{ env.MERGE_FROM }}.yml](Github ファイル経路)
        - [${{ env.MERGE_TO }}.yml](Github ファイル経路)
        

  - name: 失敗処理 (Diff 結果がある場合)
    if: steps.compare.outputs.diff_result != 'No differences found'
    run: exit 1
```

その後、結果をPRコメントとして作成し、結果が失敗した場合にはPRがマージされないようにアクション自体が失敗するように設定しました。
単にレポートだけを出したいのであれば`${{ steps.compare.outputs.diff_result }}`だけでも良いですが、私はちょっと見栄えを良くしたい気持ちもあって、このように作成しました。

## 結果
![image](/images/trouble-shooting/config-differ-check-1735858672464.png)

内部情報になる可能性があったため、モザイクをかけましたが、最終的にはこのようにどのキーに問題があるのかPRコメントを作成して、もう少し把握しやすくしておきました。

## 短所
もちろんこの方法でも短所は明確です。新しく追加されるキーについてのみ比較するため、**既存の値が変更されたり修正された時には単純なキー、タイプなどの比較だけではわからないという点**です。

完璧な銀の弾丸は存在しないように、結局開発者は常に努力し、改善しながら、より良い方法を模索していくのだと今日も感じています。