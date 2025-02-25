---
title: "[Docker] Découvrir Docker"
type: blog
date: 2022-07-11
weight: 1
comments: true
translated: true
---
# Qu'est-ce que Docker ?

![img.png](/images/docker/img_9.png)

Pour citer la définition d'[AWS](https://aws.amazon.com/), Docker est une plateforme logicielle permettant de construire, tester et déployer rapidement des applications.

Docker utilise le concept de conteneur pour alléger les applications tournant sur des systèmes d'exploitation lourds, des machines virtuelles, etc., résolvant ainsi divers problèmes.

Récemment, Docker est utilisé non seulement en local, mais aussi dans divers environnements cloud.

Par exemple, il est possible de déployer des images Docker sur AWS, et d'installer Docker dans Github Actions pour automatiser le déploiement et effectuer des tâches de déploiement simples.

## Quels problèmes résout Docker ?
Lorsque vous configurez votre environnement de développement, vous pouvez rencontrer divers problèmes.

Dans un projet précédent, un de mes coéquipiers a eu des difficultés à installer le module `mysqlclient` pour utiliser `Maria DB` avec `Python`, ce qui a conduit à une série de résolutions de problèmes, révélant à quel point le langage Python est sensible aux versions.

Au démarrage du projet, nous utilisions la version 3.8 de Python, alors que le problème est survenu lorsque mon ami utilisait la version 3.10.

Nous avons découvert que le module `mysqlclient` n'était disponible que jusqu'à la version 3.9 de Python, alors que mon ami utilisait la version 3.10.

De tels problèmes ne sont pas exclusifs à l'environnement linguistique spécifique de Python.

Surtout, lorsque les systèmes d'exploitation diffèrent, ou que leurs versions diffèrent, ces situations peuvent se produire fréquemment. Par exemple, il se peut que :

1. Les développeurs sur Windows utilisent C de VS.
2. Les développeurs sur Linux utilisent le compilateur gcc.

```cpp
#include<stdio.h>
#include<stdlib.h>

int add(int num,...)
{
    int a, b, anw=0;
    int* point=NULL;

    point=&num+1;

    for(a=0;a<=num;a++)
    {
        anw+=point[a];
    }
    return anw;
}
```
Sur VS, la fonction ci-dessus utilise simplement le premier argument num pour additionner les paramètres qui suivent comme des arguments variables. Cependant,

GCC ne supporte pas cette notation, et retourne donc une valeur indésirable.

Bien que les développeurs puissent gérer cela en utilisant des conventions et des fichiers de configuration pour synchroniser leurs environnements de développement, compilateurs, versions, ce n'est pas toujours la meilleure approche.

1. Dans le cas où une nouvelle version présente de bonnes fonctionnalités ou patchs de sécurité, empêchant une mise à jour nécessaire.
> Dans ce cas, tous les développeurs doivent mettre à jour les modules pour synchroniser les versions, ce qui peut être fastidieux.
2. Lors de l'ajout d'un nouveau développeur, il faut configurer l'environnement de développement et résoudre les erreurs de version de A à Z.
> Le coût de la main-d'œuvre des développeurs étant élevé, c'est un gaspillage de ressources.

# Machine Virtuelle (Virtual Machine)
Ne serait-il pas possible de faire cela plus simplement ?

La première alternative proposée pour cela a été la **machine virtuelle**.

En compréhension simple, la virtualisation d'un système d'exploitation pour le faire fonctionner indépendamment sur le CPU. En utilisant une machine virtuelle, vous pouvez créer une image du système d'exploitation avec l'environnement de développement, des modules spécifiques, des versions nécessaires déjà installés pour une gestion facile.

Bien qu'elle semble être la solution ultime, la machine virtuelle présente aussi des **problèmes**.

_**C'est un gaspillage de ressources.**_

Beaucoup de systèmes d'exploitation incluent, outre les outils de développement, leurs propres programmes indépendants. Vous pourriez considérer cela comme exécuter un ordinateur complet à l'intérieur de votre ordinateur.

Il y a un système appelé `HyperVisor`. L'HyperVisor distribue les ressources infra d'un ordinateur à chaque machine virtuelle. Chaque machine virtuelle avec ses ressources dispose d'un système d'exploitation invité (Guest OS).

![img_1.png](/images/docker/img_1.png)

Sur l'image ci-dessus, on remarque qu'un OS est alloué à chaque VM. Ce besoin exacerbe l'utilisation de ressources inutiles, et nous l'avons qualifié de gaspillage de ressources.

# Conteneur
Qu'en est-il des conteneurs ?
Les conteneurs s'exécutent et sont gérés comme des **programmes indépendants** au-dessus de notre OS, c'est-à-dire l'HÔTE.

Chaque conteneur s'exécute indépendamment sous le moteur Docker, éliminant le besoin de créer des systèmes d'exploitation ou de diviser l'infrastructure indépendamment, il est plus extensible et rapide.

![img.png](/images/docker/img_0.png)

Il est également facile de procéder à la migration, sauvegarde, et transmission, car ils sont plus légers que les VM.

**"Les nouveaux développeurs n'ont plus besoin de s'inquiéter que leurs ordinateurs ralentissent en installant plusieurs machines virtuelles."**

_~~Ils peuvent gérer les conteneurs~~_


# Docker
Revenons au sujet principal. Qu'est-ce que Docker ?

Docker est une des plateformes open-source de virtualisation basées sur les conteneurs que nous avons mentionnées. Non seulement pour le système d'exploitation, mais aussi pour la base de données, le compilateur, l'interpréteur, et d'autres infrastructures nécessaires au développement sont déjà fournies sous forme d'images dans Docker.
> _Pour voir à quel point cette infrastructure est impressionnante, jetez un coup d'œil à [Docker Hub](https://hub.docker.com/)_

![img_2.png](/images/docker/img_2.png)

#### Image
Le conteneur Docker encapsule chaque application et fournit les fonctionnalités pour les exécuter.
> C'est ce qui rend puissantes les images Docker. Une image est le résultat de l'emballage d'un conteneur.

#### Volume, Bind
On peut directement `bind` le stockage de l'hôte pour l'utiliser, ou créer un `volume` dans l'espace de stockage virtualisé de Docker (qui en réalité utilise le stockage de l'hôte) pour le partager avec d'autres conteneurs.

Ces fonctionnalités puissantes signifient que vous pouvez refléter en temps réel les modifications dans vos dépôts de développement (Git, SVN, etc.) sans les embarquer directement dans un OS virtualisé, grâce à des liens lâches.

#### Docker Registry
Nous avons déjà indiqué qu'il est possible de télécharger et d'utiliser des images créées via Docker Hub. Le Docker Registry est l'espace de stockage pour ces images, et Docker Hub est le registre public pour les utilisateurs de Docker.

# Référence
- [Concepts de conteneurs et de Docker - geunwoobaek.log](https://velog.io/@geunwoobaek/%EC%BB%A8%ED%85%8C%EC%9D%B4%EB%84%88-%EB%B0%8F-%EB%8F%84%EC%BB%A4-%EA%B0%9C%EB%85%90%EC%A0%95%EB%A6%AC)
- [Documentation officielle de Docker](https://docs.docker.com/get-started/overview/)
- [Guide Docker pour débutants - Qu'est-ce que Docker ? - subicura](https://subicura.com/2017/01/19/docker-guide-for-beginners-1.html)
- [États d’un Conteneur Docker - baeldung](https://www.baeldung.com/ops/docker-container-states)