---
title: "[Docker] Explorons le stockage Docker : Volume vs Bind Mount"
type: blog
date: 2022-07-15
weight: 4
comments: true
translated: true
---
# Stockage Docker
Dans ce chapitre, nous allons examiner le stockage Docker.

Le stockage, comme son nom l'indique, signifie simplement un espace de stockage, mais avec l'utilisation de conteneurs, cela peut sembler un peu plus complexe que l'utilisation traditionnelle.

Cela est dû au fait que le stockage est une partie très importante du développement, et que de nombreuses personnes préfèrent encore un environnement de développement basé sur un OS hôte local plutôt que sur un conteneur.
> Certains pensent qu'il est préférable de "dockeriser" uniquement les serveurs en production, mais je crois qu'on peut vraiment réaliser le potentiel de Docker même dans un environnement de développement local.

![image](https://user-images.githubusercontent.com/59782504/179159615-2387ae9e-5beb-40c2-8b9d-f2bfed8d9a12.png)

Voici une illustration du stockage utilisé dans Docker.

# Bind Mount
Un `bind mount` consiste à "lier" le système de fichiers du `Host OS` avec celui du `conteneur`, permettant au **conteneur d'agir comme si les fichiers du `Host OS` étaient à l'intérieur**.

Il fonctionne réellement de cette manière et peut être comparé à la commande `ln` dans Linux.

Grâce à cette commande, vous pouvez non seulement connecter le système de fichiers du Host OS, mais aussi définir un espace de travail commun entre plusieurs conteneurs.

Cependant, cette méthode présente des inconvénients.

Comme prévu, elle est très influencée par le `Host OS`.
> En particulier avec le système de fichiers Windows, où les chemins commencent généralement par des lettres comme `C:\`, `D:\`, ce qui nécessite de configurer les chemins différemment des systèmes Unix ou Linux, entraînant ainsi des complications.

~~Windows est toujours une source de problèmes en développement.~~

## `-v, --volume`
Dans le chapitre précédent, nous avons examiné des commandes utiles disponibles dans `docker`, telles que `create`, `run`, `exec`, et les options associées. Parmi celles-ci, l'option permettant de faire un `bind mount` est celle-ci.

```shell
$ docker [create|run|exec...] ... -v [HOST_PATH]:[CONTAINER_PATH] ...
```
Cette commande permet de connecter le `Storage` du `HOST_OS` avec celui du `CONTENEUR`.

## `--mount`
La syntaxe et l'utilisation de cette commande sont similaires et fonctionnent presque de la même manière, à la différence près qu'elle ne s'exécute pas si `[HOST_PATH]` est absent et renvoie une exception.
L'option `-v`, quant à elle, **génère automatiquement des chemins de point de terminaison**.
```shell
# Example
# $(pwd): Correspond au chemin du répertoire de travail actuel.
# Lors de l'utilisation de --mount
$ docker run -d \
  -it \
  --name devtest \
  --mount type=bind,source="$(pwd)"/target,target=/app \
  nginx:latest
  
# Lors de l'utilisation de -v
 $ docker run -d \
  -it \
  --name devtest \
  -v "$(pwd)"/target:/app \
  nginx:latest
```
### Paramètre
> Les paramètres utilisés avec l'option `--mount` sont les suivants :

|Param|Description|
|:-------:|--------------------------------------|
|`type`|Choix entre [`volume`\|`bind`] pour déterminer si un `volume` ou un `bind mount` sera utilisé.|
|`source`|`HOST_PATH`|
|`target`|`CONTAINER_PATH`|

# Volume Docker
Selon la [documentation officielle Docker](https://docs.docker.com/storage/volumes/), le volume Docker est défini comme le **mécanisme principal pour préserver les données générées et utilisées par les conteneurs**.

Un concept similaire est le `bind mount`, déjà examiné dans ce document.

Cependant, la grande différence est que ce concept n'utilise pas directement le système de fichiers du `Host OS`, mais utilise le `Storage` géré par `Docker`.

Cela permet de partager l'espace de stockage entre conteneurs, indépendamment de l'OS.

Mais la véritable utilité est plutôt de **partager les fichiers d'un volume entre plusieurs conteneurs**, ce qui est particulièrement approprié dans certains cas.
> Par exemple, pour les fichiers de configuration spécifique qui n'ont pas besoin d'être mis à jour en temps réel.

## Avantages
La [documentation officielle Docker](https://docs.docker.com/storage/volumes/) décrit les avantages suivants des volumes Docker par rapport aux bind mounts :

1. Les volumes sont plus faciles à sauvegarder ou à migrer que les bind mounts.
2. Vous pouvez gérer les volumes à l'aide des commandes Docker CLI ou de l'API Docker.
3. Les volumes fonctionnent à la fois sur les conteneurs Linux et Windows.
4. Les volumes peuvent être partagés plus en toute sécurité entre plusieurs conteneurs.
5. Les pilotes de volume vous permettent de stocker les volumes sur un hôte distant ou avec un fournisseur de cloud, offrant la possibilité de chiffrer le contenu des volumes ou d'ajouter d'autres fonctionnalités.
6. Le contenu d'un nouveau volume peut être pré-rempli par le conteneur.
7. Les volumes sur Docker Desktop offrent de bien meilleures performances que les bind mounts sur les hôtes Mac et Windows.

## Création

Créons maintenant un volume Docker :
```shell
$ docker volume create my-vol
```
Avec cette commande, vous pouvez facilement créer un Volume.
```shell
$ docker volume inspect my-vol
[
    {
        "CreatedAt": "2022-07-18T23:53:04Z",
        "Driver": "local",
        "Labels": {},
        "Mountpoint": "/var/lib/docker/volumes/my-vol/_data",
        "Name": "my-vol",
        "Options": {},
        "Scope": "local"
    }
]
```
La commande `docker volume inspect [VOL_NAME]` permet de consulter les détails d'un volume existant.
## Suppression
```shell
$ docker volume rm my-vol
```
Avec cette simple commande, vous pouvez supprimer le Volume créé.
# Références
* [Documentation officielle Docker - Aperçu du Stockage](https://docs.docker.com/storage/)
