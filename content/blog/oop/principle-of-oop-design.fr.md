---
title: Découvrons les principes SOLID de conception orientée objet.
type: blog
date: 2022-02-25
comments: true
translated: true
---

La publication d'aujourd'hui concerne un sujet intéressant que j'ai découvert en étudiant pour l'examen d'analyste du traitement de l'information.

Il s'agit des principes de conception orientée objet, souvent abrégés par l'acronyme `SOLID`.

Ces principes ne sont pas seulement fondamentaux pour de nombreux langages orientés objet, mais également essentiels pour le cadre web `Spring`, ce qui les rend très bénéfiques à connaître pour les programmeurs.

~~C'est aussi un bon sujet lors d'un entretien~~

## 1. Principe de responsabilité unique (SRP, Single Responsibility Principle)

Lors de la conception d'une classe, le principe stipule qu'une **classe doit avoir une seule responsabilité**.

Bien que le terme responsabilité puisse sembler vague, il est plus facile de le comprendre comme étant le périmètre impacté par les modifications ou les mises à jour d'une fonctionnalité.

Le terme responsabilité est souvent employé de manière courante dans le sens de _"qui doit être responsable de rectifier cette erreur?"_.

Le principe de responsabilité unique signifie qu'une classe chargée d'une responsabilité **doit porter cet unique fardeau**.
> Pour les programmeurs, le terme `classe` est familier, c'est une **collection d'attributs ou de comportements identiques d'un objet**.

Ce principe devient problématique lorsqu'une classe est responsable de plus d'une responsabilité.

> Prenons un exemple.

Lorsqu'une classe `Véhicule` contient à la fois les informations de `vente` et les `principes de fonctionnement`, toute modification du `prix du véhicule` impactera inévitablement les classes se référant aux `principes de fonctionnement du véhicule`.

De plus, si une classe utilise le principe de fonctionnement, elle sera inutilement chargée d'informations non pertinentes comme les `informations de vente`.

**Ce n'est pas une bonne conception selon n'importe quel critère.**

Pour éviter ces problèmes, **SRP** précise qu'une classe doit avoir **une seule responsabilité**.

## 2. Principe d'ouverture-fermeture (OCP, Open Close Principle)

Le principe d'ouverture-fermeture (ou `OCP`) souligne que les classes, modules ou méthodes du logiciel doivent être **ouverts à l'extension mais fermés à la modification**.

Pour illustrer ce principe, prenons l'exemple de l'écriture d'un contenu (`content`) dans un fichier (`file`).

_Le code ci-dessous est donné à titre d'exemple et n'est pas fonctionnel._
```java
void fileOneWrite(String content){
  File file = new File("./one.txt");
  file.write(content);
}
```

Imaginons une fonction qui écrit une chaîne de caractères transmise en paramètre dans la fonction membre `File`, le contenu sera écrit dans le fichier `one.txt`. Mais comment faire si l'on souhaite aussi écrire dans `two.txt` ?

```java
void fileOneWrite(String content){
  File file = new File("./one.txt");
  file.write(content);
}
void fileTwoWrite(String content){
  File file = new File("./two.txt");
  file.write(content);
}
void fileThreeWrite(String content){
  File file = new File("./three.txt");
  file.write(content);
}
```
**Il faut soit ajouter une méthode pour définir une nouvelle fonction, soit modifier la fonction existante.**

Cependant, en concevant en tenant compte du principe d'ouverture-fermeture, nous pourrions concevoir une solution comme celle-ci :

```java
void fileWrite(String filePath, String content){
  File file = new File(filePath);
  file.write(content);
}
```

Utiliser **une interface, une hiérarchie d'héritage, ou des paramètres comme dans cet exemple** afin d'ouvrir la voie à l'extension et de fermer la porte aux possibles modifications, c'est ça le `OCP`.

## 3. Principe de substitution de Liskov (LSP, Liskov Substitution Principle)

Les objets d'un programme doivent pouvoir être remplacés par des instances de leurs sous-types sans altérer la justesse de ce programme.

Cela a une forte relation avec la **polymorphie**.

```java
void sell(Item item){
  // Logique de vente
}
```

Si une fonction telle que ci-dessus existe, alors il ne devrait pas y avoir de problème à appeler par exemple `sell(apple)` pour une instance d'un sous-type implémentant l'interface ou héritant de la classe `Item`.

## 4. Principe de ségrégation des interfaces (ISP, Interface Segregation Principle)

**Les clients ne devraient pas être obligés à dépendre d'interfaces qu'ils n'utilisent pas.**

En d'autres termes, **les clients ne doivent dépendre que des méthodes qu'ils utilisent.**

En abordant cela sous un autre angle, si une interface utilisée par plusieurs clients contient des méthodes non utilisées par certains, il convient d'envisager la création d'une nouvelle interface séparée pour ces méthodes.

Par exemple, si la `guitare électrique Fender` et la `guitare acoustique Samick` partagent l'interface `guitare`, mais que l'interface guitare inclut une méthode `brancher ampli()` spécifique à la `Fender`, alors le client `guitare Samick` devra implémenter **une méthode `brancher ampli()` qu'il ne concerne pas.**

Afin de prévenir ces inefficacités, il serait plus approprié de diviser l'interface `guitare` en interfaces distinctes comme `guitare acoustique` et `guitare électrique`.

## 5. Principe d'inversion de dépendance (DIP, Dependency Inversion Principle)

Ce principe spécifie un modèle particulier de séparation des modules de logiciel.

### Ce principe contient les éléments suivants :
1. Les modules de haut niveau ne doivent pas dépendre des modules de bas niveau. Les deux doivent dépendre des abstractions.
2. Les abstractions ne doivent pas dépendre des détails. Les détails devraient dépendre des abstractions.

Ce principe fournit une ligne directrice fondamentale de la conception orientée objet, en indiquant que les objets de haut et de bas niveau doivent dépendre des abstractions.

Ce concept peut sembler abstrait, voyons un exemple concret.

<img width="337" alt="image" src="https://user-images.githubusercontent.com/59782504/155655942-d10562d9-147e-4465-a802-9c0e49b3cb99.png">

J'utilise un clavier mécanique, voiçi pourquoi je suis un objet `qui dépend d'un objet incluant un clavier mécanique`.
Cependant, est-ce que j'utilise toujours un clavier mécanique? Non, je pourrais également utiliser un `clavier d'ordinateur portable` ou un `clavier à membrane` selon la situation.
Il serait préférable de dépendre de l'interface généralisée `clavier`, comme illustré ci-dessous.

<img width="524" alt="image" src="https://user-images.githubusercontent.com/59782504/155656312-650f4ef5-33fa-4f84-9e8b-f199192d92ae.png">

## Conclusion
- Nous avons exploré aujourd'hui les cinq principes de conception orientée objet SOLID.  
- Bien qu'ils puissent sembler complexes à comprendre, ces conceptions sont essentielles en programmation. Il est donc conseillé de les assimiler progressivement plutôt que de tenter de les mémoriser.  
- Nous nous retrouvons dans le prochain article !
