---
title: AWS Secrets Managerを使用してConfigファイルをAWSで管理する
type: blog
date: 2023-03-01
comments: true
translated: true
---
## 導入

![image](https://user-images.githubusercontent.com/110372475/221461996-0050ebf2-c12b-4409-9b08-9a37f4ef98a0.png)

気にかけていなかったが、毎回不便だった部分があります。サーバーで使用するすべてのシークレットを`config.yaml`というファイル内で保管していたのです。

「果たしてGithubでこのようにソースで保管してもよいのだろうか？」と疑問に思いました。

Githubでも、リポジトリで使用するさまざまなシークレットを管理できるようにGithub Secrets機能を提供していますが、何か無防備に露出された感じを受けました。

## 最初の考え Github Secrets
<img src="https://user-images.githubusercontent.com/110372475/221621596-913cfcac-2838-4fc8-927f-7e878e305699.png" width="700" >

- ビルド時に必要なすべての変数をGithubが提供するSecrets機能を活用してすべて隠してみるのはどうかと考えたこともあります。
- ただし、この方法は特定の変数を隠すのには有利かもしれませんが、後でこの変数がどのようなときに注入されるのか把握しにくく、Githubという限られた環境内でしか動作しないため、もう少し一般的に使用する必要があるように思われました。

### 目的
さまざまな考えをしているうちに、シークレットを管理するツールとして以下のように3つ程度の基準を設けました。
1. 他のチームメンバーが見てすぐに使えるように敷居が低く、使いやすくなければならない。
2. 複数のサービスで使用できるように一般的にアクセス可能な方式を提供する必要がある。
3. オーバーエンジニアリングを避け、最低限の変更で`config`を読み込んで使用できなければならない。

## ChatGPT
- 知識が不足していました。まずはどのような代案があるのかを探してみる必要がありました。以前であればGoogleに助けを求めていたでしょうが、探索に良いツールであるChatGPTを活用してみました。

  ![image](https://user-images.githubusercontent.com/110372475/221455824-51d03bb1-b435-4f42-bba1-5c8341b33fec.png)

- Vaultや他のクラウドサービスが提供するキー管理システムが目を引きます。Acloset内部ではAWSが提供するサービスを大量に使用しているため、何かAWSと相性が良い**AWS Secrets Manager**に注目することにしました。

  ![image](https://user-images.githubusercontent.com/110372475/221455783-4bc87a38-8595-4e1b-a2ef-9c0f6ceb00ab.png)

- 概略と詳細機能を知ることができました。

# AWS Secrets Manager
- 悩んでいると開発が遅れるだけ！さっそく使ってみました。

    ![image](https://user-images.githubusercontent.com/110372475/221467919-61627571-0f44-4918-a441-139b1ef247a4.png)

## ステップ
- 単純なキー・バリューの保存だけでなく、AWS RDS情報や他のデータベース情報までアドレスとポート情報を入力するとシークレットを構成できました。

    ![image](https://user-images.githubusercontent.com/110372475/221456439-08cd0a8c-b1f8-4b98-9f42-d83c84d0a1d7.png)
    
- まず現在のサービスで使用中の`config.yaml`を暗号化することが目的なので、他のタイプのセキュリティパスワードを選んでみました。
    
    ![image](https://user-images.githubusercontent.com/110372475/221456728-ea826bf5-3f66-4aa9-9478-1d2d7bf523bc.png)
    
- 上記のようにAWSが作成したキー、バリューペアでもパスワードを生成することができますが、`config.yaml`全体を入力したいため、プレーンテキストをクリックしてみます。
    
    ![image](https://user-images.githubusercontent.com/110372475/221456850-07141a1d-d107-46f5-a427-175296077547.png)

- デフォルトが`{}`として入力されているため、jsonフォーマットのみ可能と考えられますが、**テキストであれば何でも可能**なので、私は私たちのサーバーの`config.yaml`をすべて移してみました。
    
    <img width="805" alt="image" src="https://user-images.githubusercontent.com/59782504/222074513-7325db67-a963-4909-85ee-1740500d5b04.png">

- その後、セキュリティパスワードについて設定することができます。特にセキュリティパスワード名はAWSクライアントで該当するシークレットにアクセスするキーになるので、賢明につけることが望ましいです。私は`someapp/config/dev`と入力してみました。

    <img width="629" alt="image" src="https://user-images.githubusercontent.com/59782504/222074935-86ef9875-57c0-43f4-ad2f-b737b5478d87.png">

    
- 最後の段階です。現在は特別にローテーション設定をしていませんが、今後ローテーション環境やローテーションが必要なキーがあるときに積極的に活用すべきだと思わされる機能が見えます。特別に設定せず、保存をクリックして保存します。
    
    ![image](https://user-images.githubusercontent.com/110372475/221457261-341c6d75-f4cb-4893-b6fe-f2eb4f47d51c.png)

### シークレットのローテーション
- シークレットの場合、固定的なシークレットも存在しますが（DB情報、パスワード、メールなど）、流動的なシークレットも場合によっては存在します。 _例）外部サービスのAPIトークン情報_
- AWS Secrets Managerでは流動的に変更されるキーを定期的に更新/保存するために、AWS Lambda関数を通じて容易に管理できるよう便利な方式を提供しています。

# サーバー
- 現在はすべてのConfigがSecretManagerにありますが、AWS Access Key IDとAWS Secret Access Keyはサーバーで管理しています。どのようにビルドタイムに注入できるかを考え、Github Secretを使用するようにしました。

## 注入シナリオ
- 大まかなシークレット注入シナリオは次のように設定しました。 

  <img width="663" alt="image" src="https://user-images.githubusercontent.com/59782504/222076002-ac982043-c9a9-4478-8a7f-860bacb27cc8.png">

   
## ステップ
### アクション
Github Actionsでビルド時に引数を変更します。
```yaml
      - name: Build and push
        uses: docker/build-push-action@v2
        with:
          context: .
          push: true
	  {% raw %}
          tags: ${{ env.ECR_REGISTRY }}/${{ env.ECR_REPOSITORY }}:${{ env.IMAGE_TAG }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            ARG_ENVIRONMENT=${{ env.ENVIRONMENT }}
            ARG_AWS_REGION=${{ env.AWS_REGION }}
            ARG_AWS_ACCESS_KEY_ID=${{ secrets.AWS_ACCESS_KEY_ID }}
            ARG_AWS_SECRET_ACCESS_KEY=${{ secrets.AWS_SECRET_ACCESS_KEY }}
	  {% endraw %}
```
既存のCONFIG_FILEのパスを注入する部分を削除し、AWSにアクセスするために必要な情報のリージョン、AWSアクセスキーID、AWSシークレットアクセスキー、環境情報 _(ビルドしようとする環境: `例: dev`)_ を受け取るようにしました。

### Dockerfile
Dockerfileでは該当引数を受け取り、フラグを通じてサーバーに該当キーが入ることができるようにします。

```dockerfile
ARG ARG_ENVIRONMENT
ARG ARG_AWS_ACCESS_KEY_ID
ARG ARG_AWS_SECRET_ACCESS_KEY
ARG ARG_AWS_REGION

ENV ENVIRONMENT=$ARG_ENVIRONMENT
ENV AWS_ACCESS_KEY_ID=$ARG_AWS_ACCESS_KEY_ID
ENV AWS_SECRET_ACCESS_KEY=$ARG_AWS_SECRET_ACCESS_KEY
ENV AWS_REGION=$ARG_AWS_REGION

CMD ["sh", "-c", "/app/someapp \
    --aws-access-key-id $AWS_ACCESS_KEY_ID \
    --aws-secret-access-key $AWS_SECRET_ACCESS_KEY \
    --aws-region $AWS_REGION \
    --environment $ENVIRONMENT \
```

### サーバー 
configパスを注入するのではなく、AWSアクセスキーIDとシークレットアクセスキーを注入するように変更し、各環境を注入するようにフラグを修正します。
```go
func ParseFlags() *Flags {
	flags := &Flags{}
	flag.StringVar(&flags.AWSAccessKeyID, "aws-access-key-id", "", "aws access key id")
	flag.StringVar(&flags.AWSSecretAccessKey, "aws-secret-access-key", "", "aws secret access key")
	flag.StringVar(&flags.AWSRegion, "aws-region", "", "aws region")
	flag.StringVar(&flags.Environment, "environment", "", "environment")
	flag.Parse()
	return flags
}
```

依存性注入の順序をAWSが先に生成されるように順序を調整します
```go
	app := fx.New(
		fx.Provide(
			cli.ParseFlags,

			aws.NewAwsSession, // this!
			aws.NewAwsSecretsManager, // this!

			config.New,
			echoRouter.New,
      // ... (中略)
```

`config.New()`ではsecretManagerと`flags`を注入されて`secretString`を得た上でyamlでUnmarshalしConfigを返すようにします。

```go
func New(flags *cli.Flags, secretsManager *secretsmanager.SecretsManager) *Config {
	var (
		config    Config // 注入されるconfig構造体
		configKey = fmt.Sprintf(SecretManagerConfigKey, flags.Environment) // "someapp/config/dev"
	)

	result, err := secretsManager.GetSecretValue(&secretsmanager.GetSecretValueInput{
		SecretId:     aws.String(configKey),
		VersionStage: aws.String(versionStage),
	})
	if err != nil {
		log.New().Fatalf("err can not get config from secretsManager key: %v", configKey)
	}

	if err = yaml.Unmarshal([]byte(*result.SecretString), &config); err != nil {
		log.New().Fatalf("err unmarshal yaml from secretString err: %v", err)
	}

	return &config
}
```

# 結果
正常に接続を完了しサーバーが起動した様子です。 

![image](https://user-images.githubusercontent.com/110372475/221461841-cfb5b024-7823-4e33-a977-5dbcd95f869b.png)