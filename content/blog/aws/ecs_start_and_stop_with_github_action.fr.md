---
title: Démarrer et arrêter automatiquement un service AWS ECS à l'aide de Github Actions
type: blog
date: 2023-10-18
comments: true
translated: true
---

Après avoir déployé [Plog](https://github.com/project-555) ("Projet de création de blog pour développeurs") via AWS ECS, je voulais contrôler de manière flexible les coûts de maintenance du serveur.  

~~_(Le projet a été lancé à des fins d'apprentissage, ce n'est donc pas un service que je maintiens pour gagner de l'argent... Je dois économiser... )_~~   

Bien que les coûts d'ECS ne soient pas énormes, je pensais qu'il n'était pas nécessaire de continuer à les engendrer de manière inutile. Cependant, je voulais que les membres de l'équipe puissent toujours utiliser le serveur API comme portfolio lors de leur embauche ou changement d'emploi, en activant et désactivant le serveur comme nécessaire.  

## Comment arrêter un service ECS ?

En réalité, c'est très simple. Vous devez régler le nombre de tâches souhaitées pour le service ECS à 0. À l'inverse, pour démarrer un service, définissez le nombre de tâches souhaitées au nombre de conteneurs désirés.  
> Notez que cette méthode n'explique pas comment déployer un service. Elle se rapporte à l'arrêt et au démarrage des conteneurs existants.

### AWS CLI

Autrefois, j'avais envisagé d'automatiser les commandes [AWS CLI](https://aws.amazon.com/coa/cli/). Bien que je connaissais la méthode, j'ai finalement utilisé Github Actions pour les raisons suivantes :  
1. Les membres de l'équipe de front-end n'étaient pas très familiers avec AWS.  
2. Pour utiliser les commandes AWS Client, vous avez besoin d'une clé d'accès AWS et d'une clé secrète, qu'il n'est pas très élégant de partager avec les membres de l'équipe.

#### Étapes  
1. Partagez l'ID clé d'accès AWS et la clé secrète AWS avec les membres de l'équipe, puis installez [AWS CLI](https://aws.amazon.com/coa/cli/).  
2. Finalisez la configuration en utilisant AWS Configure pour entrer l'ID clé d'accès et la clé secrète.  
    ```bash  
    $ aws configure  
    > AWS Access Key ID [None]: {AWS_ACCESS_KEY_ID}  
    > AWS Secret Access Key [None]: {AWS_SECRET_ACCESS_KEY}  
    > Default region name [None]: {AWS_REGION}  
    > Default output format [None]: {AWS_OUTPUT_FORMAT}  
    ```  
3. Utilisez AWS Client pour démarrer et arrêter le service ECS.  
    ```bash  
    $ aws ecs update-service --cluster plog-cluster --service plog-service --desired-count 0 # Arrêter le service  
    $ aws ecs update-service --cluster plog-cluster --service plog-service --desired-count nombre de tâches souhaité # Démarrer le service  
    ```  

## Github Actions  

Github Actions est un service CI/CD proposé par Github. Diverses actions fournies par Github permettent de mettre en place un CI/CD.  

Un des avantages puissants de ce service est Github Secrets, un système de gestion des clés secrètes proposé par Github. Lors du déploiement avec Github Actions, vous pouvez utiliser les clés secrètes enregistrées dans Github Secrets.  

Grâce à cette fonctionnalité, il est possible d'enregistrer les clés d'accès AWS et les clés secrètes dans Github Secrets sans les saisir directement, et de les utiliser dans Github Actions.  

### Étapes  
1. Enregistrez les clés d'accès AWS et les clés secrètes dans Github Secrets.  
    a. Dans Repository Github > Settings > Secrets > New repository secret, enregistrez `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`. Comme l'adresse ECR inclut `AWS_ACCOUNT_ID` dans le déploiement ECS, j'ai également ajouté `AWS_ACCOUNT_ID`.  
   ![image](/images/aws/ecs_start_and_stop_with_github_action-1697561976275.png)  

   ![image](/images/aws/ecs_start_and_stop_with_github_action-1697561871820.png)  

2. Créez le fichier de workflow pour démarrer le service ECS `project-root/.github/workflows/start-ecs.yaml`  
   ```yaml  
   name: Start ECS Service  
   
   on:  
     workflow_dispatch:  
   
   env:  
     ECS_CLUSTER: Nom du cluster ECS créé  
     ECS_SERVICE: Nom du service ECS créé  
   
   jobs:  
     start-plog:  
       runs-on: ubuntu-latest  
   
       steps:  
         - name: Checkout  
           uses: actions/checkout@v2  
   
         - name: Start ECS Service  
           run: |  
             aws ecs update-service --cluster ${% raw %}{{ env.ECS_CLUSTER }}{% endraw %} --service ${% raw %}{{ env.ECS_SERVICE }}{% endraw %} --desired-count 1  
           env:  
             AWS_ACCESS_KEY_ID: ${% raw %}{{ secrets.AWS_ACCESS_KEY_ID }}{% endraw %}  
             AWS_SECRET_ACCESS_KEY: ${% raw %}{{ secrets.AWS_SECRET_ACCESS_KEY }}{% endraw %}  
             AWS_DEFAULT_REGION: "Région AWS"  
   ```  
3. Créez le fichier de workflow pour arrêter le service ECS `project-root/.github/workflows/stop-ecs.yaml`  
   ```yaml  
   name: Stop ECS Service  
   
   on:  
      workflow_dispatch:  
   
   env:  
     ECS_CLUSTER: Nom du cluster ECS créé  
     ECS_SERVICE: Nom du service ECS créé  
   
   jobs:  
      stop-plog:  
         runs-on: ubuntu-latest  
   
         steps:  
            - name: Checkout  
              uses: actions/checkout@v2  
   
            - name: Stop ECS Service  
              run: |  
                 aws ecs update-service --cluster ${% raw %}{{ env.ECS_CLUSTER }}{% endraw %} --service ${% raw %}{{ env.ECS_SERVICE }}{% endraw %} --desired-count 0  
              env:  
                 AWS_ACCESS_KEY_ID: ${% raw %}{{ secrets.AWS_ACCESS_KEY_ID }}{% endraw %}  
                 AWS_SECRET_ACCESS_KEY: ${% raw %}{{ secrets.AWS_SECRET_ACCESS_KEY }}{% endraw %}  
                 AWS_DEFAULT_REGION: "Région AWS"  
   ```  

Les deux actions sont semblables, excepté pour le `desired-count`. Le `desired-count` signifie le nombre de tâches souhaité. En réglant sur `0`, le service est arrêté, et en réglant sur `1`, le service démarre.  

Sur l'image ci-dessous, une seule partie a été modifiée. ECS ajuste le nombre de conteneurs en fonction du nombre de tâches spécifiées.  

![image](/images/aws/ecs_start_and_stop_with_github_action-1697562816389.png)  

Chaque fichier `yaml` est configuré avec `on` défini sur `workflow_dispatch` pour exécuter manuellement les Github Actions.  

![image](/images/aws/ecs_start_and_stop_with_github_action-1697562773679.png)  

Le `name` correct permet de rendre l'action plus lisible dans la liste d'actions.  

![image](/images/aws/ecs_start_and_stop_with_github_action-1697562727292.png)  

## Résumé  
Nous avons exploré comment démarrer et arrêter un service ECS via Github Actions. Quant au déploiement d'AWS ECS via Github Actions, nous y reviendrons ultérieurement.  

![image](/images/aws/ecs_start_and_stop_with_github_action-1697562898329.png)  