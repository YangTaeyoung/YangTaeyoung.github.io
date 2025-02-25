---
title: Explorons le processus et le thread
type: blog
date: 2024-01-04
comments: true
translated: true
---
## Programme
Pour comprendre les processus, il est essentiel de savoir ce qu'est un programme.

Un programme est un document qui spécifie une procédure ou un ordre de progression et est stocké sur le disque dur d'un ordinateur.

## Processus
Un processus est un programme en cours d'exécution, chargé en mémoire depuis le disque, et capable de recevoir une allocation de la CPU.

Un processus est composé des ressources nécessaires à l'exécution d'un programme, telles que les données, la mémoire et les threads.

![image](/images/computer_science/img.png)

### Exemple de ressources du système d'exploitation allouées à un processus
- **Temps CPU**
  - Le temps CPU désigne la durée pendant laquelle le processus utilise réellement le CPU. Il est généralement divisé en temps CPU utilisateur et temps CPU noyau.
    - **Temps CPU utilisateur** : temps d'exécution en mode utilisateur
    - **Temps CPU noyau** : temps d'exécution en mode noyau
      - _Noyau : partie centrale du système d'exploitation qui relie le matériel aux applications._
- **Mémoire**
  - **Code** : zone où le code du programme est stocké
    - Il se réfère au code en cours d'exécution. Ici, le code désigne le code traduit en langage machine par le compilateur, et non pas le code écrit par le programmeur.
  - **Données** : zone où les variables globales sont stockées
    - Les variables globales sont celles qui sont utilisées dans l'ensemble du programme. Elles sont stockées dans la zone de données du programme.
  - **Pile (Stack)** : zone où les variables locales sont stockées
    - Les variables locales sont déclarées dans une fonction, créées lors de l'appel de cette fonction et détruites à la fin de celle-ci. Elles sont stockées dans la zone de pile.
  - **Tas (Heap)** : zone où les variables allouées dynamiquement sont stockées
    Elles désignent les variables pouvant être gérées directement par l'utilisateur. Les variables allouées dynamiquement sont stockées dans la zone du tas.
- **Fichiers et périphériques d'E/S**
  - Pendant son exécution, un processus charge en mémoire les données nécessaires et écrit les résultats d'exécution depuis la mémoire vers un fichier ou un périphérique d'E/S.

### Partage de mémoire entre processus
- Chaque processus utilise un espace de mémoire indépendant qui lui est alloué. Les processus ne peuvent donc pas accéder directement à la mémoire des autres processus.
- Ainsi, des méthodes de communication appropriées doivent être utilisées entre les processus.

#### Méthodes de communication inter-processus
- **Tube (Pipe)**
  - Un tube permet à un processus de recevoir des données d'un autre. La communication via les tubes est unidirectionnelle.
- **File de messages**
  - Une file de messages permet d'envoyer et de recevoir des données sous forme de messages. Elle offre une communication bidirectionnelle.
- **Mémoire partagée**
  - La mémoire partagée utilise un espace mémoire accessible par deux processus. Comme deux processus peuvent y accéder simultanément, des problèmes de synchronisation peuvent survenir.
- **Socket**
  - Les sockets permettent l'échange de données à travers un réseau. Ils supportent la communication bidirectionnelle.
- **Signal**
  - Un signal informe un processus d'un événement survenu. Une fois reçu, le processus traite l'événement.
- **Fichier**
  - Un fichier permet de lire et d'écrire des données stockées sur le disque dur. La communication via les fichiers est bidirectionnelle.

### États du processus
Un processus évolue à travers différents états. Voici les états possibles d'un processus.

- **En exécution**
  - Le processus occupe le CPU et exécute des instructions.
- **Prêt**
  - Le processus n'utilise pas le CPU mais est prêt à être exécuté dès que le CPU est disponible.
- **En attente**
  - Le processus n'utilise pas le CPU et attend un événement, comme une entrée/sortie.
- **Créé**
  - Le processus a été créé et a reçu une allocation mémoire.
- **Terminé**
  - L'exécution du processus est terminée et la mémoire a été libérée.

## Thread
Un thread est une unité de flux d'exécution au sein d'un processus. Il constitue le support réel des tâches effectuées en utilisant les ressources allouées au processus.

![img.png](/images/computer_science/process.png)

### Caractéristiques des threads
- Chacun reçoit une pile séparée au sein du processus, mais partage les zones Code, Données et Tas.
- Chaque thread a ses propres PC et SP dans le processus.
- Chaque thread détient son propre ensemble de registres.

### Avantages des threads
- Réduction de la consommation de ressources système.
  - Les threads partagent les ressources du processus, diminuant les appels système pour allouer ces ressources pour chaque processus.
- Communication simplifiée entre threads.
  - La communication est simple puisque les threads partagent les ressources du processus.
- Le changement de contexte des threads est rapide.
  - Comme les threads partagent les zones Code, Données et Tas, seul leur propre pile est allouée ; cela rend le changement de contexte rapide.
- La création de threads est rapide.
  - Créer un thread est plus rapide que créer un processus car les threads partagent les ressources du processus.
- La terminaison des threads est rapide.
  - Terminer un thread est plus rapide que terminer un processus car les threads partagent les ressources du processus.
- Synchronisation des threads simplifiée.
  - Les threads partagent les ressources du processus, ce qui simplifie leur synchronisation.

## Épilogue
- Lors des entretiens, je n'ai pas su répondre en n'étant pas capable de me remémorer les informations sur le moment ; je publie donc ce poste en guise de regret.
- _Ne pas refaire la même erreur la prochaine fois._