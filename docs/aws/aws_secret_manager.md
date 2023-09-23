---
layout: post
title: AWS Secrets Manager를 사용하여 Config파일을 AWS에서 관리하기
parent: <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
  <path fill="#252f3e" d="M13.527,21.529c0,0.597,0.064,1.08,0.176,1.435c0.128,0.355,0.287,0.742,0.511,1.161 c0.08,0.129,0.112,0.258,0.112,0.371c0,0.161-0.096,0.322-0.303,0.484l-1.006,0.677c-0.144,0.097-0.287,0.145-0.415,0.145 c-0.16,0-0.319-0.081-0.479-0.226c-0.224-0.242-0.415-0.5-0.575-0.758c-0.16-0.274-0.319-0.58-0.495-0.951 c-1.245,1.483-2.81,2.225-4.694,2.225c-1.341,0-2.411-0.387-3.193-1.161s-1.181-1.806-1.181-3.096c0-1.37,0.479-2.483,1.453-3.321 s2.267-1.258,3.911-1.258c0.543,0,1.102,0.048,1.692,0.129s1.197,0.21,1.836,0.355v-1.177c0-1.225-0.255-2.08-0.75-2.58 c-0.511-0.5-1.373-0.742-2.602-0.742c-0.559,0-1.133,0.064-1.724,0.21c-0.591,0.145-1.165,0.322-1.724,0.548 c-0.255,0.113-0.447,0.177-0.559,0.21c-0.112,0.032-0.192,0.048-0.255,0.048c-0.224,0-0.335-0.161-0.335-0.5v-0.79 c0-0.258,0.032-0.451,0.112-0.564c0.08-0.113,0.224-0.226,0.447-0.339c0.559-0.29,1.229-0.532,2.012-0.726 c0.782-0.21,1.612-0.306,2.49-0.306c1.9,0,3.289,0.435,4.183,1.306c0.878,0.871,1.325,2.193,1.325,3.966v5.224H13.527z M7.045,23.979c0.527,0,1.07-0.097,1.644-0.29c0.575-0.193,1.086-0.548,1.517-1.032c0.255-0.306,0.447-0.645,0.543-1.032 c0.096-0.387,0.16-0.855,0.16-1.403v-0.677c-0.463-0.113-0.958-0.21-1.469-0.274c-0.511-0.064-1.006-0.097-1.501-0.097 c-1.07,0-1.852,0.21-2.379,0.645s-0.782,1.048-0.782,1.854c0,0.758,0.192,1.322,0.591,1.709 C5.752,23.786,6.311,23.979,7.045,23.979z M19.865,25.721c-0.287,0-0.479-0.048-0.607-0.161c-0.128-0.097-0.239-0.322-0.335-0.629 l-3.752-12.463c-0.096-0.322-0.144-0.532-0.144-0.645c0-0.258,0.128-0.403,0.383-0.403h1.565c0.303,0,0.511,0.048,0.623,0.161 c0.128,0.097,0.223,0.322,0.319,0.629l2.682,10.674l2.49-10.674c0.08-0.322,0.176-0.532,0.303-0.629 c0.128-0.097,0.351-0.161,0.639-0.161h1.277c0.303,0,0.511,0.048,0.639,0.161c0.128,0.097,0.239,0.322,0.303,0.629l2.522,10.803 l2.762-10.803c0.096-0.322,0.208-0.532,0.319-0.629c0.128-0.097,0.335-0.161,0.623-0.161h1.485c0.255,0,0.399,0.129,0.399,0.403 c0,0.081-0.016,0.161-0.032,0.258s-0.048,0.226-0.112,0.403l-3.847,12.463c-0.096,0.322-0.208,0.532-0.335,0.629 s-0.335,0.161-0.607,0.161h-1.373c-0.303,0-0.511-0.048-0.639-0.161c-0.128-0.113-0.239-0.322-0.303-0.645l-2.474-10.4 L22.18,24.915c-0.08,0.322-0.176,0.532-0.303,0.645c-0.128,0.113-0.351,0.161-0.639,0.161H19.865z M40.379,26.156 c-0.83,0-1.66-0.097-2.458-0.29c-0.798-0.193-1.421-0.403-1.836-0.645c-0.255-0.145-0.431-0.306-0.495-0.451 c-0.064-0.145-0.096-0.306-0.096-0.451v-0.822c0-0.339,0.128-0.5,0.367-0.5c0.096,0,0.192,0.016,0.287,0.048 c0.096,0.032,0.239,0.097,0.399,0.161c0.543,0.242,1.133,0.435,1.756,0.564c0.639,0.129,1.261,0.193,1.9,0.193 c1.006,0,1.788-0.177,2.331-0.532c0.543-0.355,0.83-0.871,0.83-1.532c0-0.451-0.144-0.822-0.431-1.129 c-0.287-0.306-0.83-0.58-1.612-0.838l-2.315-0.726c-1.165-0.371-2.027-0.919-2.554-1.645c-0.527-0.709-0.798-1.499-0.798-2.338 c0-0.677,0.144-1.274,0.431-1.79s0.671-0.967,1.149-1.322c0.479-0.371,1.022-0.645,1.66-0.838C39.533,11.081,40.203,11,40.906,11 c0.351,0,0.718,0.016,1.07,0.064c0.367,0.048,0.702,0.113,1.038,0.177c0.319,0.081,0.623,0.161,0.91,0.258s0.511,0.193,0.671,0.29 c0.224,0.129,0.383,0.258,0.479,0.403c0.096,0.129,0.144,0.306,0.144,0.532v0.758c0,0.339-0.128,0.516-0.367,0.516 c-0.128,0-0.335-0.064-0.607-0.193c-0.91-0.419-1.932-0.629-3.065-0.629c-0.91,0-1.628,0.145-2.123,0.451 c-0.495,0.306-0.75,0.774-0.75,1.435c0,0.451,0.16,0.838,0.479,1.145c0.319,0.306,0.91,0.613,1.756,0.887l2.267,0.726 c1.149,0.371,1.98,0.887,2.474,1.548s0.734,1.419,0.734,2.257c0,0.693-0.144,1.322-0.415,1.87 c-0.287,0.548-0.671,1.032-1.165,1.419c-0.495,0.403-1.086,0.693-1.772,0.903C41.943,26.043,41.193,26.156,40.379,26.156z"></path><path fill="#f90" d="M43.396,33.992c-5.252,3.918-12.883,5.998-19.445,5.998c-9.195,0-17.481-3.434-23.739-9.142 c-0.495-0.451-0.048-1.064,0.543-0.709c6.769,3.966,15.118,6.369,23.755,6.369c5.827,0,12.229-1.225,18.119-3.741 C43.508,32.364,44.258,33.347,43.396,33.992z M45.583,31.477c-0.671-0.871-4.438-0.419-6.146-0.21 c-0.511,0.064-0.591-0.387-0.128-0.726c3.001-2.128,7.934-1.516,8.509-0.806c0.575,0.726-0.16,5.708-2.969,8.094 c-0.431,0.371-0.846,0.177-0.655-0.306C44.833,35.927,46.254,32.331,45.583,31.477z"></path>
  </svg> AWS
date: 2023-03-01
---
## Table of contents
{: .no_toc .text-delta }

1. TOC
   {:toc}
--- 
# 도입

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
Github Action에서 Build시 아규먼트를 변경합니다.
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

