---
title: "[Docker] Découvrons Docker Compose"
type: blog
date: 2022-07-21
weight: 5
comments: true
translated: true
---
## Les frères, suis-je le seul à être gêné ?
Voilà nos deuxièmes frères. En fait, il y a beaucoup de choses gênantes.

## Utilisation de Docker
Quand avez-vous dit utiliser Docker ?

Cela serait lors de l'utilisation de la technologie centrale de Docker, le conteneur.
> En d'autres termes, c'est pour la réutilisation.

Le `Dockerfile` appris précédemment a automatisé de nombreuses parties nécessaires à la création de conteneurs.

Cependant, `Dockerfile` a aussi ses inconvénients.

Comme traité dans [l'article précédent](/docs/docker/04.dockerfile/), il y avait une limitation quant à l'automatisation de la configuration du système d'exploitation hôte.

Par exemple, le port forwarding du système d'exploitation hôte ou le montage du chemin de volume n'a pas été couvert.

Finalement, de nombreux développeurs ont dû créer un `Dockerfile`, 

connecter les conteneurs créés via `build`, 

et monter le `volume`.

## Docker Compose
![img.png](https://miro.medium.com/max/1000/1*JK4VDnsrF6YnAb2nyhMsdQ.png)

Docker Compose résout les problèmes ci-dessus.

Le contenu qui peut être défini dans le `docker-compose.yml` permet d'effectuer non seulement des tâches telles que le `volume`, `port`, et `env`, mais aussi diverses actions pour définir des conteneurs.

En outre, non seulement on peut définir un seul conteneur, mais il prend en charge également la **définition de conteneurs multiples et l'établissement de relations entre eux**.

La [documentation officielle de Docker](https://docs.docker.com/compose/compose-file/) présente Compose comme une **application basée sur des conteneurs, indépendante de la plateforme**.

### `.yml`, `.yaml`
Avant de découvrir Docker Compose, il y a quelque chose à savoir.

![img2](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/YAML_Logo.svg/1200px-YAML_Logo.svg.png)

J'ai souligné plus tôt qu'il est possible de définir des commandes pour plusieurs conteneurs dans `docker-compose.yml`.

Alors, qu'est-ce qu'un fichier `.yml` ? 

Les fichiers avec l'extension `.yml`, `.yaml` sont une forme de langage de balisage appelé Yet Another Markup Language.

Comme en Python, il forme des hiérarchies par utilisation de deux-points et d'indentations, et permet d'écrire facilement des objets spécifiques, des valeurs de configuration, etc.

Pour comprendre intuitivement, examinons l'exemple ci-dessous.
```yaml
car:
  name: "bus"
  color: "red"
  door: 4
  capability:
    max_weight: "4T"
    human: 10
  customers:
    - name: "Alice"
      age: 14
    - name: "Ban"
      age: 16
    - name: "Yang"
      age: 26
```

Cette forme de `.yaml` peut également être exprimée au format `JSON` comme suit.

```json
{
  "car": {
    "name": "bus",
    "color": "red",
    "door": 4,
    "capability": {
      "max_weight": "4T"
    }
  }
}
```

Ainsi, `.yml` est un format de fichier qui est pratique pour exprimer des données en utilisant des formats existants tels que `JSON`, `XML`.

### `docker-compose.yml`
Maintenant, créons un `docker-compose.yml` et spécifions les conteneurs que nous utiliserons.

#### `services`
La spécification de chaque conteneur que nous définissons se fait dans une unité appelée `service`.

Si l'on emprunte le format `.yml`, cela ressemblera à ceci :
```yaml
services:
  container_1:
    ...
  container_2:
    ...
```

#### `image`
C'est la partie où l'on spécifie l'image à récupérer.

Il est possible d'obtenir l'image désirée de diverses manières.

```yaml
# Nom de l'image
image: redis
# Nom de l'image: Tag
image: redis:5
# Nom de l'image@sha256: ID de l'image
image: redis@sha256:0ed5d5928d4737458944eb604cc8509e245c3e19d02ad83935398bc4b991aac7
# Nom du dépôt/ Nom de l'image
image: library/redis
# Nom du registre/ Nom du dépôt/ Nom de l'image
image: docker.io/library/redis
# Adresse du registre privé:Port/ Nom de l'image
image: my_private.registry:5000/redis
```

#### `build`
On l'utilise lorsqu'on souhaite créer un conteneur en utilisant le `Dockerfile`.

```yaml
services:
  frontend:
    image: awesome/webapp
    build: ./webapp # Rôle de contexte si aucun sous-niveau n'est spécifié

  backend:
    image: awesome/database
    build:
      context: backend # Chemin pour explorer le Dockerfile
      dockerfile: ../backend.Dockerfile # Si le nom de fichier n'est pas Dockerfile, spécifiez le nom du fichier

  custom:
    build: ~/custom # Peut aussi utiliser "~" pour indiquer le répertoire home
```

1. L'image `awesome/webapp` est construite en utilisant le sous-répertoire `./webapp` dans le dossier parent du fichier Compose comme contexte de construction. 
Si le `Dockerfile` n'est pas présent dans ce dossier, une erreur se produit.
2. L'image `awesome/database` est construite en utilisant le sous-répertoire `./backend` dans le dossier parent du fichier Compose. 
Le fichier `backend.Dockerfile` est utilisé pour définir les étapes de construction et ce fichier(`backend.Dockerfile`) est basé sur le chemin de contexte (`./backend`). 
Dans l'exemple, `..` est analysé en tant que dossier parent du fichier Compose, donc le `Dockerfile` frère de `backend.Dockerfile` est également ciblé pour la recherche.
3. Le service `custom` est construit en utilisant le répertoire `custom` dans le répertoire `HOME` de l'utilisateur comme `context`.

#### En cas de présence simultanée de `image` et `build`
On a mentionné que `image` génère un conteneur basé sur l'image spécifiée, et `build` génère un conteneur avec `Dockerfile`.

Cependant, puisque le `Dockerfile` peut également utiliser le mot-clé `FROM` pour obtenir une image, cela pourrait-il entrer en conflit ? On peut se demander.

La documentation officielle de Docker traite aussi [de cette section](https://docs.docker.com/compose/compose-file/build/#consistency-with-image) où elle spécifie, comme on pourrait le penser, qu'elle ne peut garantir quelle image sera utilisée.

Sauf instruction spéciale de l'utilisateur, elle précise d'abord que l'image définie dans `image` est récupérée puis, si elle ne peut être trouvée, on construit celle provenant du `Dockerfile`.

#### `depends-on`
Lors de la définition de plusieurs services dans un `docker-compose.yml`, si un service donné doit être lancé après qu'un autre service soit opérationnel, cela peut être spécifié à l'aide de `depends_on: nom_du_service`.
```yaml
services:
  seviceA:
    ...
    depends_on: serviceB
    
  serviceB:
    ...
```

#### `entrypoint`
Il effectue le même rôle que l'`ENTRYPOINT` traité dans [Dockerfile](/docs/docker/04.dockerfile).

Autrement dit, c'est la partie où l’on définit la commande initiale qui sera exécutée lorsque le conteneur Docker sera lancé.
> Comme traité dans le chapitre précédent, cette commande ne peut être déclarée qu'une seule fois, donc si l'option `build` précise également un `ENTRYPOINT` dans le Dockerfile, l'une d'elles (ou les deux) doit être supprimée.

> Dans de nombreux cas, il semble que cette définition soit utilisée principalement pour choisir quel shell sera utilisé initialement.

```yaml
entrypoint: /code/entrypoint.sh
```

#### `labels`
Comme vu dans la partie `LABEL` du [Dockerfile](/docs/docker/04.dockerfile/), c'est une rubrique qui permet d'ajouter des métadonnées au conteneur.

### `environment`
On l'utilise pour définir les variables d'environnement qui seront utilisées dans le conteneur.

Deux méthodes peuvent être utilisées.

1. Méthode Map
```yaml
environment:
  RACK_ENV: development
  SHOW: "true"
  USER_INPUT: "hello"
```

2. Méthode Array
```yaml
environment:
  - RACK_ENV=development
  - SHOW=true
  - USER_INPUT=hello
```

#### `env_file`
Lorsqu'on souhaite définir les variables d'environnement via un fichier au lieu de les définir directement, on utilise cette option.

```yaml
env_file: some_env.env
```

```
# some_env.env
RACK_ENV=development
VAR="quoted"
```

En utilisant cette méthode, le fait de gérer les variables d'environnement sous forme de fichier permet d'en faciliter la gestion.

#### `command`
Tout comme le `CMD` du `Dockerfile`, c'est la partie où l'on définit la commande à donner au conteneur chargé de ce service.
```yaml
command: ls -al
```
Étant donné que je suis développeur backend, je vais décrire la différence entre les deux commandes (`Dockerfile`: `CMD`, `docker-compose.yml`: `command`) du point de vue d'un développeur backend. 

Le `CMD` du `Dockerfile` est principalement utilisé pour les commandes qui installent les éléments de base de la construction du serveur tels que `pip install`, `gradle build`.
> En gros, pensez à le mettre dans une forme exécutable pour démarrer le conteneur _(mais ce n’est pas nécessairement à suivre.)_

La `command` dans `docker-compose.yml` est principalement utilisée pour les commandes qui déploient le serveur, c’est-à-dire les commandes qui lancent le service (exemple : `... run serve`).

#### `volumes`
`volumes` est utilisé pour définir l'association d'un volume Docker créé par l'utilisateur avec un chemin host path et container path, ou pour déclarer le volume lui-même.

##### Spécification du volume
La manière de définir les éléments inférieurs à `volumes` inclut deux syntaxes : la syntaxe simplifiée et la syntaxe normale.

En général, on utilise la syntaxe simplifiée, mais on peut utiliser la syntaxe normale en fonction des préférences ou des cas particuliers.
1. Éléments de syntaxe normale

|Élément| Description|
|:--------:|---------------|
|`type`|Spécifie s'il faut utiliser un volume Docker  (`volume`) ou lier un chemin de l'hôte (`bind`).|
|`source`|Nom du volume ou ID, ou spécifiez le chemin du système hôte à lier.|
|`target`|Entrez le chemin pour le conteneur.|
|`read_only`| Si défini, désigne que seul la lecture est autorisée.

```yaml
    ...
    volumes:
      - type: volume
        source: db-data
        target: /data
    ...
```

2. Syntaxe simplifiée

On le désigne sous la forme de `VOLUME:CONTAINER_PATH:ACCESS_MODE`.
> `ACCESS_MODE` est défini par défaut à `rw`. 

```yaml
services:
  service_1:
    image: some/image
    # Associer un volume Docker avec un chemin de conteneur
    volumes:
      - db-data:/etc/data

  service_2:
    image: some/image
    # Associer un chemin host path avec un chemin de conteneur
    volumes:
      - .:/var/lib/backup/data
  service_3:
    image: some/image
    # Associer un chemin host avec un chemin de conteneur et mettre le chemin de conteneur en lecture seule
    volumes:
      - .:/var/lib/backup/data:ro
```

#### Définir un volume
Si vous souhaitez définir un volume via `volumes`, placez `volumes` comme élément supérieur dans le `docker-compose.yml`.
```yaml
# Définition d'un volume Docker
volumes:
  db-data:
```

### `ports`
Il fonctionne de la même manière que l'option `-p` utilisée dans `run` et `create` de Docker CLI.
Il mappe le port du système hôte avec le port du chemin de conteneur.

```yaml 
    ...
    ports:
      - "8000:8000"
    ...
```

Avec cette configuration, toutes les demandes entrantes vers le port `8000` du système hôte seront redirigées vers le port `8000` du conteneur.

## Docker Compose CLI
La seule chose qui reste à faire est de créer les conteneurs.

La commande `docker-compose up` recherche automatiquement et exécute le fichier `docker-compose.yml` dans le répertoire désigné.

Avec la nouvelle version de Docker Compose V2, il est suggéré d'exécuter avec le mot-clé `docker compose`, donc si vous utilisez la V2, gardez cela à l'esprit.

Ajouter l'option `-d` permet d'exécuter le service en mode d'arrière-plan. (C'est généralement beaucoup utilisé.)

L'option `-f [COMPOSE_FILE_NAME]` permet d'exécuter Docker Compose via un fichier spécifié autre que `docker-compose.yml`.

En utilisant `docker-compose start [NOM_SERVICE]`, vous pouvez démarrer un service spécifique dans `services`.

Inversement, la commande `docker-compose stop [NOM_SERVICE]` arrête un service spécifique.

## Référence
* [Documentation officielle de Docker - Référence du fichier Compose](https://docs.docker.com/compose/compose-file/)
* [Documentation officielle de Docker - Référence CLI de Docker Compose](https://docs.docker.com/compose/reference/)