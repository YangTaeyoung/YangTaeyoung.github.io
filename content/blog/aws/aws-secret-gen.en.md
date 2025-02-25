---
title: How to Efficiently Manage Local Secrets Using AWS Secrets Manager
type: blog
date: 2023-09-23
comments: true
translated: true
---

![image](/images/aws/ca97b1f1a197a40a8559e7ec60c76f99.png)

When sharing secrets locally within a company, it's common to exchange them via messengers like Slack or KakaoTalk.

The reasons often include:
1. The need to update existing local secrets due to changes
2. Setting up initial secrets for new hires

This method leaves sensitive secret information on shared channels like messengers and isn't optimal from various security perspectives.

# AWS Secret Generator
So, I created a simple CLI tool using Golang. It pulls secrets stored in AWS Secrets Manager through a straightforward CLI interface and can fetch them as files locally.

## Usage
### Preparation
- It is assumed that AWS Access Key ID and AWS Secret Access Key are shared in advance.

- AWS Secrets Manager Setup
  - First, go to Secrets Manager and set up the configurations. In that section, select 'Store a new secret.'
    ![](../../assets/images/aws/87c03916f4df676c72ea8f2d4df1f931.png)
  - Choose the type of secret. Considering scenarios like setting up a complex config with various settings, I set up a different type of secret. (If you want to set up a specific secret related to AWS services, you can choose another type of secret.)
    ![](../../assets/images/aws/183eaa88819bf03cd18361ee02299a67.png)
  - Click on the plain text format tab, copy and paste your current local secrets file to create it.
    - You can also force it into JSON format using key-value pairs.
    - I assumed using simple secrets like `hello: world` in yaml format.
      - When setting up the actual config, ensure it is operable from local settings.
    ![](../../assets/images/aws/1d235b2010321e4bf01dfc7af304db56.png)
  - Input the secret name and description. The secret name becomes the key you'll select in the subsequent cli program process, so remember it well.
    ![](../../assets/images/aws/fe2928dc06e69bdefc2b21bdff858e7b.png)
  - Decide if you will periodically rotate the set secrets with other secrets. I assumed not using this feature, so it was not set.
    ![](../../assets/images/aws/303a9ecff2da5bfb442749924e0d12ba.png)
  - Your secret will be generated when you click the save button in the next step.
    ![](../../assets/images/aws/a9857abe3a02fef5b14cbd61281b8d1a.png)
- Follow the instructions in the repository below for the overall CLI installation.
  - https://github.com/YangTaeyoung/aws-secret-gen
- Using aws-secret-gen
  - Enter the following in the command line:
  ```bash
  $ aws-secret-gen -o test-config.yaml{file path to save}
  ```
  - Then a window will appear to set AWS Access Key ID, Secret Access Key, and Region.
    - Enter the prepared keys and region.
    ```bash
    >  Enter AWS Access Key ID: {prepared AWS Access Key ID}
    >  Secret AWS Secret Access Key: {prepared AWS Secret Access Key}
    >  Enter AWS Region: {AWS Region key: if Seoul, ap-northeast-2}
    ```
  - A list of secrets will then appear. Fetch the secret you created.
  ```bash
  Use the arrow keys to navigate: ↓ ↑ → ←
  ? Select Secret:
    ...
    ▸ test-config
  ```
  - Press enter, and you can confirm that the secret has been successfully created at your specified path.
  ```bash
  $ cat ./test-config.yaml
  > hello: world
  ```