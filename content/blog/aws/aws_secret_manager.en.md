---
title: Managing Config Files in AWS Using AWS Secrets Manager
type: blog
date: 2023-03-01
comments: true
translated: true
---
## Introduction

![image](https://user-images.githubusercontent.com/110372475/221461996-0050ebf2-c12b-4409-9b08-9a37f4ef98a0.png)

There is an aspect I haven't paid much attention to, but it's always been a bit inconvenient. It's about storing all the secrets used on the server in a file called `config.yaml`.

I began to question, "Is it really right to store them as source files on GitHub?"

GitHub also offers a feature called GitHub Secrets to manage various secrets used in the repository, but it felt somewhat exposed.

## First Consideration: GitHub Secrets
<img src="https://user-images.githubusercontent.com/110372475/221621596-913cfcac-2838-4fc8-927f-7e878e305699.png" width="700">

- I once considered using the Secrets feature provided by GitHub to obscure all the variables needed during builds.
- However, while this method might be advantageous for hiding certain variables, it can be challenging to determine when these variables are injected later. Additionally, since it only operates within the limited environment of GitHub, a more general approach seemed necessary.

### Objective
While contemplating various thoughts, I decided on three main criteria for a tool to manage secrets:
1. It should have a low barrier to entry and be easy to use so that other team members can immediately use it.
2. It should provide a method for general access so it can be used across multiple services.
3. Over-engineering should be avoided, and it should be able to read and use `config` with minimal changes.

## ChatGPT
- I lacked sufficient knowledge. First, I needed to explore the available alternatives. In the past, I would have turned to the Google deity for help, but this time I used ChatGPT, a great tool for exploration.

  ![image](https://user-images.githubusercontent.com/110372475/221455824-51d03bb1-b435-4f42-bba1-5c8341b33fec.png)

- Vault and key management systems offered by other cloud services caught my eye. Since Acloset extensively uses AWS-provided services internally, the AWS Secrets Manager, which appears to work well with AWS, caught my attention.

  ![image](https://user-images.githubusercontent.com/110372475/221455783-4bc87a38-8595-4e1b-a2ef-9c0f6ceb00ab.png)

- I gained a rough overview and learned about its detailed features.

# AWS Secrets Manager
- Overthinking only delays development! I went ahead and tried using it immediately.

    ![image](https://user-images.githubusercontent.com/110372475/221467919-61627571-0f44-4918-a441-139b1ef247a4.png)

## Steps
- In addition to storing simple key-value pairs, you can configure secrets by entering address and port information for AWS RDS information and other database information.

    ![image](https://user-images.githubusercontent.com/110372475/221456439-08cd0a8c-b1f8-4b98-9f42-d83c84d0a1d7.png)

- Since the purpose is to encrypt the `config.yaml` currently in use in the service, I chose a different type of encryption.

    ![image](https://user-images.githubusercontent.com/110372475/221456728-ea826bf5-3f66-4aa9-9478-1d2d7bf523bc.png)

- While you can generate an encryption using AWS-created key-value pairs as shown above, I chose to click on plain text to input the entire `config.yaml`.

    ![image](https://user-images.githubusercontent.com/110372475/221456850-07141a1d-d107-46f5-a427-175296077547.png)

- While it defaults to `{}`, which suggests only a JSON format is possible, anything is possible in plain text, so I transferred our server's entire `config.yaml`.

    <img width="805" alt="image" src="https://user-images.githubusercontent.com/59782504/222074513-7325db67-a963-4909-85ee-1740500d5b04.png">

- Afterward, you can configure the security password. The security password name becomes the key for accessing the secret from the AWS client, so it's wise to name it thoughtfully. I entered `someapp/config/dev`.

    <img width="629" alt="image" src="https://user-images.githubusercontent.com/59782504/222074935-86ef9875-57c0-43f4-ad2f-b737b5478d87.png">

- This is the last step. Although no rotation is currently set up, it seems like a feature that can be actively utilized when there are environments or keys that require rotation in the future. Save without additional settings.

    ![image](https://user-images.githubusercontent.com/110372475/221457261-341c6d75-f4cb-4893-b6fe-f2eb4f47d51c.png)

### Secret Rotation
- Some secrets are static (e.g., DB information, passwords, emails), but some secrets are dynamic depending on the situation. _For example: API token information of external services_
- AWS Secrets Manager provides a convenient way to easily manage dynamically changing keys for periodic updates/stores through AWS Lambda functions.

# Server
- Now, all configs are in Secrets Manager, but the AWS Access Key ID and AWS Secret Access Key are managed on the server. To determine how to inject them at build time, we decided to use GitHub Secrets.

## Injection Scenario
- The rough secret injection scenario was set as follows:

  <img width="663" alt="image" src="https://user-images.githubusercontent.com/59782504/222076002-ac982043-c9a9-4478-8a7f-860bacb27cc8.png">

## Steps
### Actions
In GitHub Actions, change the arguments during the build.
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
Removed the existing path for injecting the CONFIG_FILE and set up to receive information essential for accessing AWS, including the region, AWS Access Key ID, AWS Secret Access Key, and environmental information _(build target environment: e.g., dev)_.

### Dockerfile
In the Dockerfile, receive the arguments and ensure these keys can be entered into the server through flags.

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
Changed to receive AWS Access Key ID and Secret Access Key instead of the config path and adjusted the flags to receive each environment.
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

Adjusted the dependency injection order so AWS can be created first.
```go
	app := fx.New(
		fx.Provide(
			cli.ParseFlags,

			aws.NewAwsSession, // this!
			aws.NewAwsSecretsManager, // this!

			config.New,
			echoRouter.New,
      // ... (truncated)
```

In `config.New()`, inject the secret manager and `flags` to get the `secretString`, then unmarshal the yaml and return the config.

```go
func New(flags *cli.Flags, secretsManager *secretsmanager.SecretsManager) *Config {
	var (
		config    Config // Config structure to be injected
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
The server is running after a successful connection.

![image](https://user-images.githubusercontent.com/110372475/221461841-cfb5b024-7823-4e33-a977-5dbcd95f869b.png)