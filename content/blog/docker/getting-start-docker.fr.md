---
title: "[Docker] Commencer avec Docker : create, exec, start, run, commit"
type: blog
date: 2022-07-12
weight: 2
comments: true
translated: true
---

# Commencer avec Docker
Découvrez progressivement le concept de Docker et commençons à l'utiliser.

## Installation de Docker
Suivez [ce lien](https://docs.docker.com/get-docker/) pour installer Docker sur votre système d'exploitation.

## Obtenir une image Docker
Pour utiliser Docker, vous pouvez essayer de nombreuses images disponibles sur [Docker Hub](https://hub.docker.com). Jetons un coup d'œil à l'image Python.

![img_3.png](/images/docker/img_3.png)
> ▲ Rechercher `python` sur Docker Hub

Ouvrez le terminal et entrez `docker pull python` pour obtenir la dernière image de Python.

![img_4.png](/images/docker/img_4.png)
> Si votre service nécessite une version spécifique de Python, vous pouvez installer une version spécifique en cherchant l'étiquette.
_Exemple : `docker pull python:3.8.13`_

---
# État du conteneur Docker
Pour comprendre les commandes, il est nécessaire de savoir dans quel état se trouvent les conteneurs Docker.

Les conteneurs Docker, comme les processus ordinaires, peuvent avoir plusieurs états.

Voici une description de chaque état :
### 1. Created
Cet état est attribué lorsqu'un conteneur a été créé mais n'a jamais été utilisé.

Il ne consomme ni le CPU ni la mémoire du système hôte.

### 2. Running
Cet état signifie que le conteneur est en cours d'exécution.
Cet état indique que les processus à l'intérieur du conteneur s'exécutent indépendamment de l'environnement du système hôte.

### 3. Restarting
Cet état signifie également que le conteneur est en cours de redémarrage.

Vous pouvez définir une action de redémarrage via l'option `--restart=[RESTART_POLICY]` de la commande `docker run`.
* `RESTART_POLICY`
    * `no`: ne pas redémarrer (`default`)
    * `on-failure`: redémarrer si le conteneur ne se termine pas normalement (code 0)
    * `always`: toujours redémarrer lorsque le processus se termine
    * `unless-stopped`: redémarrer le conteneur à moins qu'il ne soit explicitement arrêté ou que Docker lui-même ne soit arrêté ou redémarré.

### 4. Exited
Cet état est attribué lorsque le processus interne s'est terminé. Comme dans l'état Created, il ne consomme ni CPU ni mémoire.

> Les raisons courantes pour lesquelles un conteneur passe à l'état Exited sont :
1. Le processus interne est terminé.
2. Une exception s'est produite alors que le processus interne était en cours d'exécution.
3. Terminaison intentionnelle via la commande `docker stop`.
4. Aucune console interactive configurée pour le conteneur exécutant `bash`.

### 5. Paused
Indique que tous les processus sont suspendus indéfiniment. Vous pouvez suspendre un conteneur spécifique à l'aide de la commande `docker pause`.

### 6. Dead
Cet état apparaît lorsque vous tentez de supprimer un conteneur mais qu'une ressource spécifique est utilisée par un processus externe.

Vous ne pouvez pas redémarrer un conteneur dans cet état, vous pouvez uniquement le supprimer.

---
# Création d'un conteneur : `create`
Vous pouvez créer un conteneur à l'aide de la commande `create` basée sur l'image reçue.

## Utilisation
La commande s'utilise comme suit :
```shell
$ docker create [OPTIONS] IMAGE [COMMAND] [ARG...]
```

## Options fréquemment utilisées
Si vous souhaitez voir toutes les options de la commande `create` de Docker, consultez [cette page](https://docs.docker.com/engine/reference/commandline/create/).

### `--name [CONTAINER_NAME]`
Utilisé pour nommer le conteneur à exécuter.
```shell
$ docker ps -a

CONTAINER ID   IMAGE                    COMMAND                  CREATED              STATUS                  PORTS                    NAMES
d4a0d00c26f9   docker/getting-started   "/docker-entrypoint.…"   21 seconds ago       Created                                          hello
000e821c8396   docker/getting-started   "/docker-entrypoint.…"   About a minute ago   Up About a minute       0.0.0.0:80->80/tcp       admiring_jemison
```
Pour voir tous les conteneurs créés par docker, entrez `docker ps -a`.
Le nom du conteneur apparaît dans la colonne la plus à droite. Le conteneur nommé `hello` a un nom de conteneur.

Un conteneur nommé aura l'image de son nom lors de la construction ultérieure.

### `--publish, -p [HOST_PORT]:[CONTAINER_PORT]`
Cette option nécessite une compréhension de base du port forwarding.

Le port forwarding dans Docker signifie rediriger les requêtes destinées au port de l'hôte vers le port du conteneur.
Si vous configurez `-p 80:8000`, les requêtes sur le port 80 de l'hôte sont redirigées vers le port 8000 du conteneur.
> Le port 80 est utilisé pour Internet, donc dans une telle configuration, l'Internet ne fonctionnera pas.

### `--tty, -t`
Active le mode TTY. Comme lorsqu'une connexion SSH réussie entraîne l'exécution automatique du terminal par défaut, cette option permet d'ouvrir un terminal et de garder le conteneur en cours d'exécution.

Le terminal requiert une entrée au clavier par défaut, il est donc généralement utilisé avec l'option `-i` ci-dessus.

### `--interactive, -i`
Active l'entrée standard (`STDIN`) même si le conteneur n'est pas connecté (`attach`).

### `--volume, -v [VOLUME_NAME]:[REMOTE_PATH]`
Attaché un `docker volume` au chemin d'un `container`.

> Pour le moment, pensez simplement que cela signifie _'connecter le stockage'._
>
> Cela nécessite une compréhension du Docker Volume, que nous verrons plus en détail avec une comparaison ultérieure.

### `--workdir, -w [WORKDIR_PATH]`
Spécifie le répertoire dans lequel s'exécute le processus interne du conteneur.
Le répertoire de travail configuré devient le point d'entrée initial.

### `--env, -e [KEY=VALUE]`
Spécifie des variables d'environnement pour le conteneur. Il est généralement utilisé pour transmettre des paramètres ou des mots de passe au conteneur.

Toutes les langues offrent des fonctions permettant d'accéder à la variable d'environnement de l'OS, donc en utilisant cette option, on peut cacher les configurations de manière appropriée lors de la distribution.

### Combinaison d'options
Dans le cas d'options avec un seul hyphen (`-`), plusieurs options peuvent être combinées.
```shell
# Example
$ docker run --name test -it debian
```
---

# Démarrer un conteneur : `start`
Un conteneur créé n'est pas encore en cours d'exécution.
Pour exécuter un conteneur, utilisez cette commande.
## Utilisation
```shell
docker start [OPTION] CONTAINER_NAME_OR_ID
```

--- 
# Passer des commandes à un conteneur en cours d'exécution : `exec`
Avec `exec`, vous pouvez passer des commandes à un conteneur en cours d'exécution.

Il est souvent utilisé pour lancer le terminal du conteneur en cours d'exécution.
> _(Cela peut être utilisé à la manière de SSH.)_

Ce qui est particulier, c'est que les commandes exécutées via `exec` ne perturbent pas l'exécution du processus principal.

## Utilisation
La commande s'utilise comme suit :
```shell
$ docker exec [OPTIONS] CONTAINER COMMAND [ARG...]
```

## Options fréquemment utilisées
Si vous souhaitez voir toutes les options de la commande `exec` de Docker, consultez [cette page](https://docs.docker.com/engine/reference/commandline/exec/).

### `--detach , -d`
Cette option envoie la commande au conteneur en arrière-plan.

### `--interactive, -i`
Active l'entrée standard (`STDIN`) même si le conteneur n'est pas connecté (`attach`).

### `--tty, -t`
Active le mode TTY. Comme lorsque la connexion SSH est réussie et l'exécution d'un terminal par défaut, cette option permet de garder le terminal ouvert lors de l'exécution d'un conteneur.

Le terminal requiert une entrée au clavier par défaut, il est donc généralement utilisé avec l'option `-i` ci-dessus.

### `--workdir, -w [WORKDIR_PATH]`
Spécifie le répertoire dans lequel s'exécute le processus interne du conteneur.
Le répertoire de travail configuré devient le point d'entrée initial.

### `--env, -e [KEY=VALUE]`
Spécifie des variables d'environnement pour le conteneur. Il est souvent utilisé pour transmettre des paramètres ou mots de passe au conteneur.

Toutes les langues offrent des fonctions permettant d'accéder à la variable d'environnement de l'OS, donc en utilisant cette option, on peut cacher les configurations de manière appropriée lors de la distribution.

### Combinaison d'options
Dans le cas d'options avec un seul hyphen (`-`), plusieurs options peuvent être combinées.
```shell
# Example
$ docker exec -it test /bin/bash
```
---
# Créer et exécuter un conteneur : `run`
Vous pouvez exécuter une image reçue avec la commande `run`.
> Plus précisément, la commande `run` crée (`create`) et exécute (`start`) le conteneur.

## Utilisation
La commande s'utilise comme suit :
```shell
$ docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
```

## Options fréquemment utilisées
Si vous souhaitez voir toutes les options de la commande `run` de Docker, consultez [cette page](https://docs.docker.com/engine/reference/commandline/run/).

Les sections précédentes (`create`, `start`) traitaient des commandes de création et d'exécution et décrivaient fréquemment les options utilisées.

En principe, `run` est une commande qui combine `create` et `start`, de sorte que toutes les options de chaque commande peuvent être utilisées.

### `--detach, -d`
Cette option exécute le conteneur comme un processus d'arrière-plan sur le système hôte et renvoie l'ID du conteneur en cours d'exécution.

### Combinaison d'options
Dans le cas d'options avec un seul hyphen (`-`), plusieurs options peuvent être combinées.
```shell
# Example
$ docker run --name test -it debian
```
---
# Devenir une image depuis un conteneur : `commit`
C'est bien d'utiliser le conteneur que vous avez configuré. Maintenant, votre service peut fonctionner de manière indépendante.

Mais vous n'avez pas encore résolu le problème décrit dans le premier chapitre.

Lorsque quelqu'un vient pour prendre le relais, il peut utiliser votre conteneur, mais fondamentalement, le conteneur n'est pas exploitable sous forme de distribution.

La commande `commit` transforme un conteneur en cours d'exécution en une **image**.

Elle devient ainsi **accessible à tous**.

La commande pour transformer un conteneur en image est la suivante, et le conteneur résultant est stocké dans vos images locales.

## Utilisation
De base, utilisez cette commande comme suit :
```shell
$ docker commit [OPTION] CONTAINER_NAME_OR_ID IMAGE_NAME
```
Ensuite, regardez vos `image` pour voir que l'image nouvellement créée est là, stockée localement.
```shell
$ docker commit test test
95221529517f...
$ docker images
REPOSITORY               TAG       IMAGE ID       CREATED          SIZE
test                     latest    95221529517f   3 seconds ago    118MB
```

## Question
Bien que l'image soit stockée localement, peut-on considérer qu'elle est `partagée`?

> Mon image n'a pas encore été transmise à d'autres.

Des commandes comme `docker export`, `docker save` peuvent transformer une image ou un conteneur en format `tar` à transmettre, mais utilisons une méthode plus intelligente.
> Par le biais d'un repository Docker.
## Repository Docker
En tant que développeur, vous avez probablement déjà entendu parler du terme `repository`.

Certains l'ont peut-être vu dans l'`Annotation` de Spring lors de la mise en œuvre de leur site Web avec Spring, et la plupart des développeurs l'ont probablement utilisé pour gérer les versions de leur code sur Github, Gitlab, etc.

Qu'il s'agisse d'un local qui ne concerne que vous ou d'un Remote pour le partage, un `repository` désigne souvent un stockage.

Docker a créé la possibilité de partager votre propre repository, à la manière de Github.

Pour ceux qui ont déjà deviné, le nom de ce repository est en fait [Docker Hub](https://hub.docker.com).

## Créer votre propre repository
Créer votre propre repository n'est pas très différent de ce que vous savez faire sur Github.

![img_5.png](/images/docker/img_5.png)

D'abord, cliquez sur `Create a Repository` sur Docker Hub



![img_6.png](/images/docker/img_6.png)

Ensuite, remplissez les spécifications de votre repository.

Vous pouvez configurer l'accès à votre repository en le définissant comme public (`Public`) pour tous ou privé (`Private`) pour être accessible uniquement à ceux que vous autorisez.

![img_7.png](/images/docker/img_7.png)

Une fois le repository créé, vous pouvez `push` à l'aide des commandes comme indiqué ci-dessus.
> Si vous avez utilisé Github, ce verbe `push` vous semble familier. En effet, c'est exactement d'où vous pensez qu'il vient.

### Tag
Sur l'image, vous pouvez voir un champ de saisie pour le `tag`.

Il est généralement généré au moment du commit, et il est courant d'y inscrire la version.

Au début, vous avez utilisé une telle commande `docker pull python:3.8` pour récupérer une image contenant une version spécifique de Python.<br>
**La chaîne de caractères (`:`) derrière représente un tag**.

## Utilisation
Bien que l'utilisation ait été indiquée ci-dessus, cela concerne la méthode locale.
Selon la documentation officielle de Docker, l'utilisation de `commit` est la suivante :
```
$ docker commit [OPTIONS] CONTAINER [REPOSITORY[:TAG]]
```
> En effet, le nom de l'image est mappé avec le nom du repository.

Suggéré par le mot `commit`, il se comprend que **ce ne soit pas encore distribué**.
> Ce qui correspond toujours à avant.

## Options disponibles

### `--message, -m [MESSAGE]`
Similaire aux messages de commit Git normaux.

Cette option permet d'insérer un message au moment de créer le commit.

### `--author, -a [AUTHOR]`
Écrit les détails de l'auteur de l'image.

### `--change, -c`
Si vous générez un commit en fonction d'un conteneur généré par `Dockerfile`, cette option est utilisée.
> Le Dockerfile sera examiné dans le prochain chapitre.

## Commande similaire : `build`
Pour créer une image, il existe une autre commande `build` en plus de la commande `commit` que nous venons de voir.
Cependant, comme elle nécessite une compréhension de `Dockerfile`, nous la considérerons dans le prochain chapitre.

# Partager une image créée avec son Repository : `push`
C'est désormais la dernière étape pour `push` une image sur votre repository.

## Utilisation
La commande s'utilise comme suit :
```shell
$ docker push [OPTIONS] NAME[:TAG]
```

Où `NAME[:TAG]` correspond à `[REPOSITORY[:TAG]]` utilisé pour créer `commit`.

```shell
$ docker push xodud9632/test-repo:ver1
The push refers to repository [docker.io/xodud9632/test-repo]
27d8bf01e7ea: Mounted from library/debian
ver1: digest: sha256:ef143c422f108a12a93c202078d2d9e8c2966e9479b74f6662af9e32bb05ad73 size: 529
```
Lorsque vous l'appliquez, des messages comme ci-dessus apparaissent,

![img_8.png](/images/docker/img_8.png)

et vous pouvez confirmer que le repository a bien été mis à jour.

### Erreur : `repository does not exist or may require 'docker login'`

Si vous recevez le message d'erreur ci-dessus, cela signifie que vous n'êtes pas connecté au Docker CLI.

```shell
$ docker login
```

Entrez la commande ci-dessus, puis entrez votre identifiant et mot de passe pour vous connecter. Vous constaterez que cela fonctionne correctement.

# Références
* **Documentation officielle Docker**
    * [Commande run](https://docs.docker.com/engine/reference/commandline/run/)
    * [Commande create](https://docs.docker.com/engine/reference/commandline/create/)
    * [Commande exec](https://docs.docker.com/engine/reference/commandline/exec/)
    * [Commande start](https://docs.docker.com/engine/reference/commandline/start/)
    * [Commande push](https://docs.docker.com/engine/reference/commandline/push/)
    * [Commande commit](https://docs.docker.com/engine/reference/commandline/commit/)
* **Blogs**
    * [LainyZine - Comment utiliser docker exec](https://www.lainyzine.com/ko/article/docker-exec-executing-command-to-running-container/)
    * [JACOB - Introduction à Docker 4 - Créer une image Docker](https://code-masterjung.tistory.com/133)
    * [Nirsa - \[Docker CE\] Erreur de connexion au dépôt Docker](https://nirsa.tistory.com/46?category=868315)
    * [alice - \[Étude Docker\] 5. Révision des commandes Docker fréquemment utilisées - 1](https://blog.naver.com/alice_k106/220359633558)