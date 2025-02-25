---
title: Gérer les fichiers de configuration sur AWS avec AWS Secrets Manager
type: blog
date: 2023-03-01
comments: true
translated: true
---

## Introduction

![image](https://user-images.githubusercontent.com/110372475/221461996-0050ebf2-c12b-4409-9b08-9a37f4ef98a0.png)

Il y a un aspect que nous avons tendance à négliger mais qui s'avère souvent gênant : c'est le stockage de tous les secrets utilisés par le serveur dans un fichier nommé `config.yaml`.

Je me suis posé la question : "Est-ce vraiment correct de conserver ce fichier en tant que source sur Github ?"

Github offre une fonctionnalité de gestion des secrets pour les dépôts, mais on ressent une certaine exposition peu sécurisée.

## Première pensée : les secrets GitHub
<img src="https://user-images.githubusercontent.com/110372475/221621596-913cfcac-2838-4fc8-927f-7e878e305699.png" width="700" >

- J'ai déjà pensé à utiliser la fonctionnalité de secrets de Github pour masquer toutes les variables nécessaires à la build.
- Cependant, cette méthode est peut-être avantageuse pour masquer certaines variables, mais il est difficile de comprendre quand ces variables sont injectées, et comme cela fonctionne uniquement dans l'environnement limité de Github, il semblait nécessaire de trouver quelque chose de plus général.

### Objectif 
Au cours de mes réflexions pour gérer les secrets, j'ai défini trois critères :
1. La barrière d'entrée doit être basse et facile à utiliser afin que d'autres membres de l'équipe puissent les voir et les utiliser immédiatement.
2. La méthode doit être suffisamment générale pour être utilisable par différents services.
3. Éviter le sur-engineering et lire/consommer le `config` avec un minimum de modifications.

## ChatGPT
- Je manquais de connaissances pertinentes. J'ai d'abord cherché quelles alternatives existaient. Auparavant, j'aurais demandé de l'aide à Google, mais j'ai utilisé ChatGPT, un bon outil d'exploration.

  ![image](https://user-images.githubusercontent.com/110372475/221455824-51d03bb1-b435-4f42-bba1-5c8341b33fec.png)

- Les systèmes de gestion de clés fournis par Vault et d'autres services cloud ont attiré mon attention. Comme Acloset utilise de nombreux services fournis par AWS, j'ai prêté attention à **AWS Secrets Manager** qui s'intègre bien avec AWS.

  ![image](https://user-images.githubusercontent.com/110372475/221455783-4bc87a38-8595-4e1b-a2ef-9c0f6ceb00ab.png)

- J'ai rapidement pris connaissance des principales fonctionnalités.

# AWS Secrets Manager
- Plutôt que de perdre du temps à réfléchir, j'ai immédiatement testé.

    ![image](https://user-images.githubusercontent.com/110372475/221467919-61627571-0f44-4918-a441-139b1ef247a4.png)

## Étapes
- En plus de stocker des clés et des valeurs simples, il est possible de configurer les secrets en saisissant des informations d'adresse et de port pour AWS RDS et d'autres bases de données.
  
    ![image](https://user-images.githubusercontent.com/110372475/221456439-08cd0a8c-b1f8-4b98-9f42-d83c84d0a1d7.png)
    
- Puisque l'objectif est de crypter l'actuel `config.yaml` utilisé dans le service, j'ai exploré d'autres options de secrets de sécurité.
    
    ![image](https://user-images.githubusercontent.com/110372475/221456728-ea826bf5-3f66-4aa9-9478-1d2d7bf523bc.png)
    
- Bien qu'il soit possible de générer des secrets via les paires clé-valeur AWS, j'ai cliqué sur texte brut car je voulais saisir le `config.yaml` entier.
    
    ![image](https://user-images.githubusercontent.com/110372475/221456850-07141a1d-d107-46f5-a427-175296077547.png)

- Même si la valeur par défaut est `{}` et que cela peut être interprété comme ne prenant en charge que le format JSON, c'est plutôt **tout texte** qui est possible, donc j'ai transféré l'intégralité du `config.yaml` de notre serveur.
    
    <img width="805" alt="image" src="https://user-images.githubusercontent.com/59782504/222074513-7325db67-a963-4909-85ee-1740500d5b04.png">

- La prochaine étape est la configuration du secret. Comme le nom du secret devient une clé pour accéder au secret via le client AWS, il est sage de choisir un bon nom. J'ai choisi `someapp/config/dev`.

    <img width="629" alt="image" src="https://user-images.githubusercontent.com/59782504/222074935-86ef9875-57c0-43f4-ad2f-b737b5478d87.png">

    
- C'est la dernière étape. Bien que je n'ai pas configuré de rotation pour l'instant, il semble y avoir une fonctionnalité utile qui pourrait être exploitée lorsque la rotation ou l'utilisation de clés nécessitant une rotation est nécessaire. Cliquez sur enregistrer sans configurer.
    
    ![image](https://user-images.githubusercontent.com/110372475/221457261-341c6d75-f4cb-4893-b6fe-f2eb4f47d51c.png)

### Rotation des secrets
- Bien qu'il existe des secrets permanents (informations sur les bases de données, mots de passe, e-mails, etc.), il existe aussi des secrets dynamiques. _Ex) information de jeton d'API pour des services externes_
- AWS Secrets Manager fournit un moyen simple et pratique de gérer les clés dynamiques par le biais de fonctions AWS Lambda, permettant de les rafraîchir/enregistrer périodiquement.

# Serveur
- Maintenant que les configurations sont toutes gérées par SecretManager, les AWS Access Key ID et AWS Secret Access Key sont gérés par le serveur. En réfléchissant à la manière de les injecter au moment de la compilation, j'ai opté pour les secrets GitHub.

## Scénario d'injection
- Le scénario d'injection de secret est défini comme suit.

  <img width="663" alt="image" src="https://user-images.githubusercontent.com/59782504/222076002-ac982043-c9a9-4478-8a7f-860bacb27cc8.png">

   
## Étapes
### Actions
Modifiez les arguments dans GitHub Actions lors de la build.
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
Supprimez la partie qui injecte l'ancien chemin de `CONFIG_FILE` et assurez-vous de recevoir l'information nécessaire pour accéder à AWS (Région, AWS Access Key ID, AWS Secret Access Key, information de l'environnement _(environnement de build: `ex: dev`)_).

### Dockerfile
Dans le Dockerfile, recevez ces arguments pour permettre au serveur d'y accéder via des flags.

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

### Serveur 
Au lieu d'injecter le chemin de configuration, faites en sorte qu'il reçoive AWS Access Key ID et Secret Access Key, et ajustez le flag pour recevoir chaque environnement.
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

Ajustez l'ordre d'injection des dépendances pour qu'AWS soit créé en premier.
```go
	app := fx.New(
		fx.Provide(
			cli.ParseFlags,

			aws.NewAwsSession, // this!
			aws.NewAwsSecretsManager, // this!

			config.New,
			echoRouter.New,
      // ... (interruption)
```

Dans `config.New()`, recevez `secretManager` et `flags` pour obtenir `secretString`, puis Unmarshal en yaml avant de retourner le Config.

```go
func New(flags *cli.Flags, secretsManager *secretsmanager.SecretsManager) *Config {
	var (
		config    Config // structure config à recevoir
		configKey = fmt.Sprintf(SecretManagerConfigKey, flags.Environment) // "someapp/config/dev"
	)

	result, err := secretsManager.GetSecretValue(&secretsmanager.GetSecretValueInput{
		SecretId:     aws.String(configKey),
		VersionStage: aws.String(versionStage),
	})
	if err != nil {
		log.New().Fatalf("err cannot get config from secretsManager key: %v", configKey)
	}

	if err = yaml.Unmarshal([]byte(*result.SecretString), &config); err != nil {
		log.New().Fatalf("err unmarshal yaml from secretString err: %v", err)
	}

	return &config
}
```

# Résultat
Voici la vue normale de la connexion terminée et du serveur fonctionnant correctement.

![image](https://user-images.githubusercontent.com/110372475/221461841-cfb5b024-7823-4e33-a977-5dbcd95f869b.png)