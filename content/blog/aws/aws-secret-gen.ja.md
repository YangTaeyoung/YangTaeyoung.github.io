---
title: AWS Secrets Managerを活用してローカルシークレットをうまく管理する方法
type: blog
date: 2023-09-23
comments: true
translated: true
---

![image](/images/aws/ca97b1f1a197a40a8559e7ec60c76f99.png)

会社でローカルにシークレットを共有するうちに、Slackやカカオトークのようなメッセンジャーを通じてシークレットをやり取りすることがしばしばある。

理由はしばしば次のようになる
1. 変更事項に対処するために既存のローカルシークレットを更新しなければならない場合
2. 新規入社時に初期シークレットを設定しなければならない場合

このような方法は、メッセンジャーという共有チャンネルにシークレットに関する機密情報が残ったり、さまざまなセキュリティ面で良くないと感じた。

# AWS Secret Generator
そこで作った。Golangで制作した簡単なCLIツールで、AWS Secrets Managerに保管されているシークレットを簡単なCLIを通じて取り出し、ローカルにファイルの形で取り込むことができる。

## 使い方
### 準備
- AWS Access Key ID、AWS Secret Access Keyは事前に共有されていることを仮定する。

- AWS Secrets Managerセットアップ
	- まず、Secrets Managerに入り、設定をセットアップする。該当欄で「新しいシークレットを保存」を選択。
		![](../../assets/images/aws/87c03916f4df676c72ea8f2d4df1f931.png)
	- シークレットタイプを選択する。筆者は複数の設定が含まれる複合的な形のconfigをセットアップするシナリオを考慮して他のタイプのシークレットを設定した。（AWSに関連するサービスの特定のシークレットを設定したい場合は、他のタイプのシークレットを選択しても良い。）
		![](../../assets/images/aws/183eaa88819bf03cd18361ee02299a67.png)
	- プレーンテキスト形式をタップし、現在使用しているローカルシークレットのファイルをコピーアンドペーストして生成する。
		- キー・バリュー・ペアを使用してJSON形式で強制する方法ももちろん可能だ。
		- 筆者はyaml形式で「hello: world」のような単純なシークレットを使うと仮定した。
			- 実際にconfigをセットアップする際にはローカルで動作可能なconfigをセットアップする必要がある。
		![](../../assets/images/aws/1d235b2010321e4bf01dfc7af304db56.png)
	- シークレット名、説明を入力する。シークレット名はその後のプロセスでcliプログラムで選択するキー・バリューになるため、よく記憶しておく。
		![](../../assets/images/aws/fe2928dc06e69bdefc2b21bdff858e7b.png)
	- 設定したシークレットを定期的に他のシークレットに置き換えるかどうかに関する部分。筆者は別途この機能を使用しないと仮定したため、設定しなかった。
		![](../../assets/images/aws/303a9ecff2da5bfb442749924e0d12ba.png)
	- 次のステップで保存ボタンを押すとシークレットが生成される。
		  ![](../../assets/images/aws/a9857abe3a02fef5b14cbd61281b8d1a.png)
- 全体的なCLIインストールは次のリポジトリの説明に従う。
	- https://github.com/YangTaeyoung/aws-secret-gen
- aws-secret-genを使用する
	- コマンドラインに次のように入力する。
	```bash
	$ aws-secret-gen -o test-config.yaml{保存するファイルパス}
	```
	- すると次にAWS Access Key IDとSecret Access Key、Regionを設定する画面が表示される。
		- 事前に準備したキーとリージョンを入力する。
		```bash
		>  Enter AWS Access Key ID: {準備したAWS Access Key ID}
		>  Secret AWS Secret Access Key: {準備したAWS Secret Access Key}
		>  Enter AWS Region: {AWS Regionキー: ソウルの場合ap-northeast-2}
	   ```
	- 以降、シークレットリストが表示される。自身が生成したシークレットを取り込む。
	```bash
	Use the arrow keys to navigate: ↓ ↑ → ←
	? Select Secret:
		...
	  ▸ test-config
	```
	- エンターを押すと自身が設定したパスにシークレットがうまく生成されたことを確認できる。
	```bash
	$ cat ./test-config.yaml
	> hello: world
	```