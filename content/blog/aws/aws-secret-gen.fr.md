---
title: Comment gérer efficacement les secrets locaux avec AWS Secrets Manager
type: blog
date: 2023-09-23
comments: true
translated: true
---

![image](/images/aws/ca97b1f1a197a40a8559e7ec60c76f99.png)

Dans l'entreprise, il arrive souvent de partager des secrets localement via des messagers comme Slack ou KakaoTalk.

Les raisons sont souvent les suivantes :
1. Lorsqu'il est nécessaire de mettre à jour le secret local existant en raison de changements.
2. Lors de l'arrivée d'un nouvel employé, il est nécessaire de configurer les secrets initiaux.

Cette méthode laisse des informations sensibles sur les secrets dans le canal de partage que représente le messager, ce qui n'est pas idéal d'un point de vue sécuritaire.

# AWS Secret Generator
C'est pourquoi j'ai créé un outil simple en CLI utilisant Golang, qui permet de récupérer les secrets stockés dans AWS Secrets Manager via une interface CLI simple et de les sauvegarder sous forme de fichier localement.

## Utilisation
### Prérequis
- On suppose que l'AWS Access Key ID et l'AWS Secret Access Key ont été préalablement partagés.

- Configuration d'AWS Secrets Manager
	- Tout d'abord, allez dans Secrets Manager et configurez les paramètres. Dans le champ, sélectionnez `Enregistrer un nouveau secret`.
		![](../../assets/images/aws/87c03916f4df676c72ea8f2d4df1f931.png)
	- Sélectionnez le type de secret. J'ai configuré un type de sécurité différent, en envisageant un scénario où l'on configure un fichier config complexe incluant divers paramètres. (Si vous souhaitez configurer un secret spécifique lié à un service AWS, il est possible de choisir un autre type de sécurité.)
		![](../../assets/images/aws/183eaa88819bf03cd18361ee02299a67.png)
	- Sélectionnez le format texte brut et copiez-collez le fichier des secrets locaux que vous utilisez actuellement pour générer.
		- Il est bien sûr possible de forcer un format JSON à l'aide de paires clé-valeur.
		- J'ai supposé que j'utilisais des secrets simples comme `hello: world` en format yaml.
			- Lors de la configuration réelle, vous devez configurer un fichier fonctionnel localement.
		![](../../assets/images/aws/1d235b2010321e4bf01dfc7af304db56.png)
	- Entrez le nom et la description du secret. Le nom du secret deviendra la clé que vous sélectionnerez dans le programme CLI ultérieurement, alors n'oubliez pas de le retenir.
		![](../../assets/images/aws/fe2928dc06e69bdefc2b21bdff858e7b.png)
	- Cette section concerne le fait de remplacer périodiquement les secrets configurés par d'autres secrets. Je n'ai pas utilisé cette fonctionnalité, donc je ne l'ai pas configurée.
		![](../../assets/images/aws/303a9ecff2da5bfb442749924e0d12ba.png)
	- Cliquez sur le bouton d'enregistrement à l'étape suivante pour générer les secrets.
		  ![](../../assets/images/aws/a9857abe3a02fef5b14cbd61281b8d1a.png)
- Suivez les instructions dans le dépôt GitHub suivant pour l'installation générale du CLI.
	- https://github.com/YangTaeyoung/aws-secret-gen
- Utilisation de aws-secret-gen
	- Tapez la commande suivante dans la ligne de commande.
	```bash
	$ aws-secret-gen -o test-config.yaml{chemin d'enregistrement du fichier}
	```
	- Une fenêtre s'ouvrira pour configurer l'AWS Access Key ID, Secret Access Key et Region.
		- Entrez la clé et la région préalablement préparées.
		```bash
		>  Enter AWS Access Key ID: {AWS Access Key ID préparé}
		>  Secret AWS Secret Access Key: {AWS Secret Access Key préparé}
		>  Enter AWS Region: {clé de région AWS: ap-northeast-2 si Séoul}
	   ```
	- Une liste de secrets s'affichera ensuite. Récupérez le secret que vous avez créé.
	```bash
	Use the arrow keys to navigate: ↓ ↑ → ←
	? Select Secret:
		...
	  ▸ test-config
	```
	- Appuyez sur Entrée pour confirmer que le secret a été correctement généré à l'emplacement que vous avez configuré.
	```bash
	$ cat ./test-config.yaml
	> hello: world
	```
