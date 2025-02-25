---
title: "[Docker] Découvrons le Dockerfile."
type: blog
date: 2022-07-13
weight: 3
comments: true
translated: true
---
## 😡 Les gars... suis-je le seul à être dérangé ?
Si vous avez brièvement essayé l'interface de ligne de commande de Docker, vous avez probablement découvert à quel point il peut être inconfortable de créer et gérer des conteneurs.

Je veux que ce soit facile, mais à chaque fois que je crée un conteneur, je dois entrer une multitude de commandes.

Un problème encore plus grand est que lorsque vous construisez une image, sa taille peut devenir immense.

Elle ne sera peut-être pas gigantesque, mais elle peut varier de 100MB à plus de 1-2GB.

![img.png](https://blog.kakaocdn.net/dn/dg7HAJ/btq0ZLhsh0x/RXZPbihsD3h9ou7NviGfM1/img.png)

Pour une entreprise qui gère de nombreux conteneurs, ce genre de problème peut être catastrophique.

En dehors de la taille, le temps nécessaire pour transmettre et télécharger ces images peut être très long.

## 📄 Dockerfile

Pour cette raison, Docker propose une nouvelle méthode pour créer des conteneurs.

L'idée principale est de **partager des scripts qui créent les images** plutôt que de partager des images déjà créées.

### 🚫 Ne vous répétez pas

De toute façon, il faut le faire au moins une fois. ~~L'automatiser, c'est peut-être pour l'avenir avec l'IA..?~~
> _Mais il suffira de le faire une seule fois._

Ceci étant une fonction interne de Docker, c'est beaucoup plus simple que de créer des commandes et de les sauvegarder sous forme de fichier texte, et c'est également plus formel et structuré.

Enfin, puisque le `Dockerfile` reste en fin de compte un fichier texte, il n'occupe pas beaucoup de place lors de son stockage.

Embrassons maintenant le sujet principal.

### Alors comment l'exécuter ?
Une fois que vous avez créé un `Dockerfile`, l'image est chargée selon la spécification du fichier et les commandes sont exécutées.

Quand le conteneur est affiché dans Docker, l'image est stockée localement sur l'ordinateur de l'utilisateur.

Ce processus s'appelle `build`, qui est différent de `commit`, utilisé pour transformer un conteneur en une image.

### `build [BUILD_PATH]`

La commande `build` crée un conteneur basé sur le `Dockerfile` situé sous le chemin spécifié.

Cette commande est exécutée de manière récursive, il est donc déconseillé de l'exécuter sur le répertoire racine absolu.

```shell
$ docker build / # (X)
```
De manière générale, comme le `Dockerfile` est mis dans le répertoire racine du projet, la commande suivante est souvent utilisée comme une expression communautaire.
```shell
$ docker build .
```

### Option `-f [DOCKER_FILE_PATH]`

Traditionnellement, le `Dockerfile` se trouve dans le chemin racine du projet à construire, mais grâce à l'option `-f`, vous pouvez connecter un autre chemin au `Dockerfile`.

```shell
$ docker build -f /path/to/a/Dockerfile .
```
> Cela fait comme si le `Dockerfile` était actuellement dans le répertoire courant (`.`).

#### Option `-t`

Lorsque la construction réussit, vous pouvez spécifier le repository et le tag où la nouvelle image doit être stockée à l'aide de l'option `-t`.

```shell
$ docker build -t shykes/myapp .
```

Si vous devez placer la même image dans plusieurs repositories ou stocker plusieurs tags, vous pouvez spécifier plusieurs `-t` pour construire la même image.

```shell
$ docker build -t shykes/myapp:1.0.2 -t shykes/myapp:latest .
```

## Créer un `Dockerfile`
La création d'un `Dockerfile` est simple : il suffit de faire un `Dockerfile`.

Voyons maintenant les nombreuses configurations pour écrire un `Dockerfile`.

#### `ARG`
Une déclaration utilisée pour maximiser la réutilisabilité des variables dans un `Dockerfile`.

```dockerfile
# Usage de la définition
ARG [KEY]=[valeur]

# Usage de l'appel
${[KEY]}

# Exemple
ARG  CODE_VERSION=latest
FROM base:${CODE_VERSION}
CMD  /code/run-app

FROM extras:${CODE_VERSION}
CMD  /code/run-extras
```

#### `FROM`
```dockerfile
# - Utilisation
FROM [--platform=<platform>] <image> [AS <name>]
# ou
FROM [--platform=<platform>] <image>[:<tag>] [AS <name>]
# ou
FROM [--platform=<platform>] <image>[@<digest>] [AS <name>]
```
Ceci spécifie l'image de base avec laquelle travailler.

Dans la partie `IMAGE` des commandes `run` et `create` du chapitre précédent, vous voyez généralement ce qui est inscrit ici. Synonyme, le système cherche d'abord l'image localement, et si elle n'est pas trouvée, elle est récupérée depuis [Docker Hub](https://hub.docker.com).
> Remarque : vous ne pouvez pas accéder à un repository pour lequel vous n'avez pas les droits, ou si le nom de l'image est incorrectement écrit.

#### `WORKDIR`
Spécifie le chemin sur lequel travailler à l'intérieur du conteneur. Il joue le même rôle que les options `-w`, `--workdir` vues dans les commandes `run`, `create` du chapitre précédent.

Les commandes suivantes `COMMANDS` s'exécuteront dans le `WORKDIR` défini, et si aucune partie n'est indiquée, il sera par défaut configuré en tant que répertoire personnel (`~`).

#### `RUN [COMMAND]`

Contrairement à la commande `run` du chapitre précédent, cette instruction appartient à la partie `COMMANDS`, et vous pouvez entrer divers ordres sur le conteneur par ce mot-clé.

**Cette commande opère indépendamment des commandes de base de l'image (semblable à la manière dont on entrerait une commande`exec`).**

Le `RUN` soutient deux formats d'entrée.

```dockerfile
# Méthode 1
RUN <commande>
# Méthode 2
RUN ["exécutable", "param1", "param2"]
```

La `Méthode 2` peut paraître difficile, mais elle ne fait que séparer la commande par des espaces.

Ainsi les deux commandes ci-après accomplissent exactement la même tâche.

```dockerfile
RUN ["/bin/bash", "-c", "echo hello"]
```

```dockerfile
RUN /bin/bash -c "echo hello"
```

#### Prudence
Quand vous souhaitez effectuer une commande en format de liste, vous entrez parfois un chemin via le caractère anti-slash (`\`).

La commande finale est exécutée en format `JSON`, et le caractère anti-slash n'est pas reconnu dans `JSON`. En fait, sous `Windows`, où (`\`) est utilisé comme délimiteur, vous devez le taper deux fois pour qu'il fasse une évasion.

```dockerfile
RUN ["c:\windows\system32\tasklist.exe"] # (X)
RUN ["c:\\windows\\system32\\tasklist.exe"] # (O)
```

#### `ENTRYPOINT`
Exécute un script ou une commande lorsque le conteneur démarre.

Ce fichier effectue ces opérations lorsque vous démarrez un conteneur ou lorsque vous en créez un et l'exécutez simultanément (`run`).

Par contre, il ne s'exécute pas si le conteneur reçoit simplement une commande (`exec`).

De plus, une règle est que `ENTRYPOINT` ne peut être déclaré qu'une seule fois dans un `Dockerfile`.

#### `CMD`
Elle endosse un rôle similaire à `RUN`, mais elle s'exécute par défaut en l'absence de `COMMAND` lors de l'exécution de `docker run`.

```dockerfile
# Méthode 1
CMD ["exécutable","param1","param2"] # forme exec, recommandée
# Méthode 2
CMD ["param1","param2"]
# Méthode 3
CMD commande param1 param2
```

Dans la méthode 1, on peut omettre l'exécutable mais un `ENTRYPOINT` doit être défini.

#### `ENV`
Elle définit les variables d'environnement du conteneur et correspond au rôle de l'option `-e` vue précédemment.

```dockerfile
# Utilisation
ENV [KEY]=[VALUE]

# Exemple
ENV abc=hello
ENV abc=bye def=$abc
ENV ghi=$abc
```

#### `LABEL`
Utilisé pour ajouter des métadonnées au conteneur.
```dockerfile
# Utilisation
LABEL <cle>=<valeur> <cle>=<valeur> <cle>=<valeur> ...
```
Les paires clé-valeur sont stockées, et peuvent être formulées comme suit :
```dockerfile
LABEL "com.example.vendor"="ACME Incorporated"
LABEL com.example.label-with-value="foo"
LABEL version="1.0"
LABEL description="Ceci illustre que les valeurs de labels peuvent s'étendre sur de multiples lignes."
LABEL multi.label1="value1" \
      multi.label2="value2" \
      other="value3"
```

Si vous souhaitez consulter les métadonnées, vous pouvez vérifier celles d'une image donnée (`myimage`) avec la commande suivante :
```shell
$ docker image inspect --format='' myimage
{
  "com.example.vendor": "ACME Incorporated",
  "com.example.label-with-value": "foo",
  "version": "1.0",
  "description": "Ceci illustre que les valeurs de labels peuvent s'étendre sur de multiples lignes.",
  "multi.label1": "value1",
  "multi.label2": "value2",
  "other": "value3"
}
```

#### `EXPOSE [PORT]/[PROTOCOL]`
`EXPOSE` indique quel port sera en écoute.

Mais par `Dockerfile`, cela ne signifie pas que le port est transféré par l'hôte.

Cela spécifie simplement à quel `PORT` l'hôte envoie des données vers un `Container`.

Ainsi, le fichier `Dockerfile` seul ne peut automatiser l'option `-p`.

`[PROTOCOL]` spécifie quel protocole sera utilisé pour le transfert de données.

Vous pouvez choisir entre `tcp` et `udp`. La valeur par défaut est `tcp`, recommandé sauf cas particulier.
> TCP garantit la fiabilité pendant la transmission des paquets.

#### `COPY [OPTION] [HOST_PATH] [CONTAINER_PATH]`
Commande pour copier des fichiers de `HOST_PATH` à `CONTAINER_PATH`.

`HOST_PATH` peut inclure un chemin ainsi que le nom de fichier, et supporter l'utilisation d'`?` _(un seul caractère)_,  `*` _(plusieurs caractères)_ comme caractères génériques.
#### Chemin relatif
Si vous entrez un chemin relatif dans chaque `PATH`, la référence se fait par l'emplacement du fichier pour `HOST_PATH`, et pour `CONTAINER_PATH`, se réfère au `WORKDIR`.

#### Exemple de caractère générique
* `home*` : tous les fichiers et chemins commençant par `home`
* `*home*` : tous les fichiers et chemins contenant `home`
* `?home` : tous les fichiers et chemins ayant un seul caractère devant `home` (ex : `1home`, `ahome`)

#### `--chown`
L'option `--chown` permet de déterminer le propriétaire de `CONTAINER_PATH`.

Elle est exécutée via la commande réelle `chown`, donc n'est possible que sur des conteneurs basés Linux.

#### `ADD [HOST_PATH] [CONTAINER_PATH]`
`ADD` fonctionne de manière très similaire à `COPY`.

Les options et contenus de `COPY` s’appliquent de manière rétroactive, avec quelques fonctionnalités supplémentaires.
1. En cas de fichier compressé (`.tar`, `.tar.gz`) à copier, le fichier est décompressé avant la copie.
2. Vous pouvez désigner les fichiers à copier depuis un emplacement distant par wget.
> Notez que les fichiers distants ont des permissions `600` (seul le propriétaire peut lire).

## Tous les options peuvent-être automatisés ?
À ce stade, le lecteur peut se poser des questions.

Le `Dockerfile` documente-t-il complètement le processus de creation d'un `CONTAINER`?

**La réponse est clairement non.**

Un `Dockerfile` sert à spécifier le conteneur, mais n'automatise pas les options de création du conteneur.

Un exemple est l'option `-p` des commandes `create`, `run`.

L'option `-p` nécessite la spécification des ports sur l'hôte et le conteneur, mais `EXPOSE` ne spécifie que les ports ouverts du conteneur.

Il y a beaucoup d'autres options pour l'hôte que le `Dockerfile` ne peut couvrir.

C'est parce que la commande `build` spécifie seulement les conteneurs, et non l'hôte.

Naturellement cette limite a donné lieu à l'utilisation de Docker Compose, qui sera abordé dans un post futur.

## Fichier Docker Ignore
Si vous avez déjà utilisé `git`, vous avez probablement rencontré un fichier `.gitignore`.

Naturellement, le fichier `.dockerignore` remplit un rôle similaire.

Alors qu'un fichier `.gitignore` signifie la plupart du temps déterminer ce qui ne sera pas ajouté au commit, ici, les répertoires de fichiers qui ne doivent pas être copiés depuis l'hôte via `ADD` ou `COPY` y sont définis.

```dockerignore
# Commentaire
*/temp*
*/*/temp*
temp?
```

## Références
* [Documentation officielle de Docker - Référence Dockerfile](https://docs.docker.com/engine/reference/builder/)
* [스뎅 - [Docker] RUN vs CMD vs ENTRYPOINT in Dockerfile](https://blog.leocat.kr/notes/2017/01/08/docker-run-vs-cmd-vs-entrypoint)
* [Jae-Hong Lee 가장 빨리 만나는 Docker 7장 - 6. ENTRYPOINT](http://pyrasis.com/book/DockerForTheReallyImpatient/Chapter07/06)
* [박개벙 - Dockerfile의 ADD와 COPY의 차이](https://parkgaebung.tistory.com/44)
