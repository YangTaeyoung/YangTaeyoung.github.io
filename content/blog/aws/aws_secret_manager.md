---
title: AWS Secrets Manager를 사용하여 Config파일을 AWS에서 관리하기
type: blog
date: 2023-03-01
comments: true
---
## 도입

![image](https://user-images.githubusercontent.com/110372475/221461996-0050ebf2-c12b-4409-9b08-9a37f4ef98a0.png)

신경쓰지 못했지만, 매번 불편했던 부분이 있습니다. 서버에서 사용하는 모든 Secret을 `config.yaml`이라는 파일 내에서 보관하고 있는 것인데요. 

"과연 Github에서 이렇게 소스로 보관해도 맞는것일까?" 라고 의문이 들었습니다.

Github 에서도 레포지토리에서 사용하는 다양한 Secret을 관리할 수 있도록 Github Secrets 기능을 제공하는데, 뭔가 무방비하게 노출된 느낌을 받았습니다.

## 첫번째 생각 Github Secrets
<img src="https://user-images.githubusercontent.com/110372475/221621596-913cfcac-2838-4fc8-927f-7e878e305699.png" width="700" >

- 빌드시 필요한 모든 변수를 Github에서 제공하는 Secrets기능을 활용하여 모두 가려보는 건 어떨까 생각해본 적도 있습니다.
- 다만 해당 방법은 특정 변수를 가리는 것에는 유리할 지는 몰라도, 나중에 이 변수가 어떨 때 주입 되는 지 파악하기 힘들고, Github이라는 한정된 환경 내에서만 동작하기 때문에 조금 더 General하게 사용할 필요가 있어보였습니다.

### 목적 
여러가지 생각을 하던 도중 Secret을 관리하는 도구로써 다음과 같이 3가지 정도를 기준으로 정했습니다.
1. 다른 팀원들이 보고 바로 사용할 수 있게끔 진입장벽이 낮고 사용이 쉬워야 한다.
2. 여러 서비스에서 사용할 수 있도록 General하게 접근 가능하도록 방식을 제공하여야 한다.
3. Over engineering을 피하고 최소한의 변경으로 `config`를 읽어들이고 사용할 수 있어야 한다.

## ChatGPT
- 알고 있는 지식이 부족했습니다. 우선 어떤 대안이 있는지를 찾아보아야 했습니다. 이전 같았다면 Google 신께 도움을 요청했겠지만, 탐색에 좋은 도구인 ChatGPT를 활용해 보았습니다.

  ![image](https://user-images.githubusercontent.com/110372475/221455824-51d03bb1-b435-4f42-bba1-5c8341b33fec.png)

- Vault와 다른 클라우드 서비스에서 제공하는 키 관리 시스템들이 눈에 띕니다. Acloset 내부에서는 AWS가 제공하는 서비스를 다량 사용하고 있으므로, 뭔가 AWS와 궁합이 잘 맞는 **AWS Secret Manager** 를 눈여겨 보도록 하였습니다.

  ![image](https://user-images.githubusercontent.com/110372475/221455783-4bc87a38-8595-4e1b-a2ef-9c0f6ceb00ab.png)

- 개략적으로 개요와 세부 기능을 알게 되었습니다.
 
# AWS Secrets Manager
- 고민은 개발을 늦출 뿐! 바로 사용해보았습니다.

    ![image](https://user-images.githubusercontent.com/110372475/221467919-61627571-0f44-4918-a441-139b1ef247a4.png)

## Steps
- 단순 Key Value의 저장 뿐 아니라, AWS RDS 정보 및 다른 데이터 베이스 정보까지도 주소와 포트 정보를 입력하면 Secret를 구성할 수 있었습니다.
  
    ![image](https://user-images.githubusercontent.com/110372475/221456439-08cd0a8c-b1f8-4b98-9f42-d83c84d0a1d7.png)
    
- 우선 현재 서비스에서 사용중인 `config.yaml`을 암호화하는 것이 목적이므로, 다른 유형의 보안 암호를 선택해보았습니다.
    
    ![image](https://user-images.githubusercontent.com/110372475/221456728-ea826bf5-3f66-4aa9-9478-1d2d7bf523bc.png)
    
- 위처럼 AWS가 만든 키, 값 페어를 통해서도 암호를 생성할 수 있지만 `config.yaml` 전체를 입력하고 싶어서 일반 텍스트를 클릭해보겠습니다.
    
    ![image](https://user-images.githubusercontent.com/110372475/221456850-07141a1d-d107-46f5-a427-175296077547.png)

- 기본값이 `{}`으로 입력되어있어 json포맷만 가능하다고 생각할 수 있지만 **텍스트라면 무엇이든 가능**하기 때문에 저는 저희 서버의 `config.yaml`을 전부 옮겨보았습니다.
    
    <img width="805" alt="image" src="https://user-images.githubusercontent.com/59782504/222074513-7325db67-a963-4909-85ee-1740500d5b04.png">

- 이후 보안 암호에 대해 설정하는 것이 나옵니다. 특히 보안 암호 이름은 AWS 클라이언트에서 해당 시크릿에 접근하기 위한 키가 되므로, 현명하게 짓는 것이 좋습니다. 저는 `someapp/config/dev`로 입력해보았습니다.

    <img width="629" alt="image" src="https://user-images.githubusercontent.com/59782504/222074935-86ef9875-57c0-43f4-ad2f-b737b5478d87.png">

    
- 마지막 단계입니다. 현재는 따로 로테이션 설정을 하진 않지만, 추후 로테이션 환경이나, 로테이션이 필요한 키들이 있을 때 적극 활용해 보면 좋을 것 같은 기능이 보입니다. 따로 설정하지 않고 저장을 눌러 세이브 합니다.
    
    ![image](https://user-images.githubusercontent.com/110372475/221457261-341c6d75-f4cb-4893-b6fe-f2eb4f47d51c.png)

### Secret Rotation
- Secret과 같은 경우 고정적인 Secret도 존재하지만 (DB 정보, 비밀번호, 이메일 등등) 유동적인 Secret도 경우에 따라 존재합니다. _예) 외부 서비스의 API 토큰 정보_
- AWS Secrets Manger에서는 유동적으로 변경되는 키를 주기적으로 갱신/저장하기 위해 AWS 람다 함수를 통해 쉽게 관리할 수 있도록 편리한 방식을 제공하고 있습니다.

# Server
- 이제 Config들은 모두 SecretManager에 있지만, AWS Access Key ID와 AWS Secret Access Key는 서버에서 관리하고 있습니다. 어떻게 빌드타임에 주입할 수 있을지를 고민하다 Github Secret을 사용하도록 하였습니다.

## 주입 시니리오
- 개략적인 Secret 주입 시나리오는 다음과 같이 설정했습니다. 

  <img width="663" alt="image" src="https://user-images.githubusercontent.com/59782504/222076002-ac982043-c9a9-4478-8a7f-860bacb27cc8.png">

   
## Steps
### Actions
Github Actions에서 Build시 아규먼트를 변경합니다.
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
기존의 CONFIG_FILE 의 경로를 주입하는 부분을 제거하고 AWS에 접근하기 위해 필요한 정보 Region, AWS Access Key ID, AWS Secret Access Key, Environment 정보 _(빌드하고자 하는 환경:  `예: dev`)_ 를 받도록 하였습니다.

### Dockerfile
Dockerfile에서는 해당 아규먼트를 받아 flag를 통해 서버에 해당 키들이 들어갈 수 있도록 합니다.

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

### Server 
config 경로를 주입받는 것이 아니라 AWS Access Key ID와 Secret Access Key를 주입받도록 변경하고, 각 환경을 주입받도록 flag를 수정합니다.
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

Dependency Injection 순서도 AWS가 먼저 생성될 수 있도록 순서를 조정합니다
```go
	app := fx.New(
		fx.Provide(
			cli.ParseFlags,

			aws.NewAwsSession, // this!
			aws.NewAwsSecretsManager, // this!

			config.New,
			echoRouter.New,
      // ... (중략)
```

`config.New()`에서는 secretManager와 `flags`를 주입받아 `secretString`을 얻어내고 yaml로 Unmarshal 후 Config를 반환하도록 합니다.

```go
func New(flags *cli.Flags, secretsManager *secretsmanager.SecretsManager) *Config {
	var (
		config    Config // 주입받을 config 구조체
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

# Result
정상적으로 커넥션을 마치고 서버가 구동된 모습입니다. 

![image](https://user-images.githubusercontent.com/110372475/221461841-cfb5b024-7823-4e33-a977-5dbcd95f869b.png)

