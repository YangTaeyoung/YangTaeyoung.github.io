---
title: Découvrons le MVC
type: blog
date: 2022-02-22
comments: true
translated: true
---
`MVC` est l'abréviation de `Model`, `View`, `Controller`. C'est l'un des nombreux paradigmes pour structurer les applications web et c'est un modèle représentatif qui divise les composants en trois catégories. Il est célèbre pour son utilisation dans le cadre `Spring Framework` et bien que des différences mineures existent, de nombreux frameworks adoptent un modèle similaire.

## Quels sont les autres frameworks ?
- Un modèle similaire est le modèle `MVT`, qui signifie `Model`, `View`, `Template` utilisé dans le framework basé sur Python `Django`. Bien que leurs rôles correspondent presque à ceux du modèle `MVC`, les critères d'appariement sont différents.

## Différence entre MVC et MVT
  ![image](https://user-images.githubusercontent.com/59782504/155057532-25c9325c-3009-4ee7-8cee-7946530643ec.png)

- En regardant l'image ci-dessus, on peut voir comment la relation entre `MVC` et `MVT` diffère.
- On peut voir que dans `Django`, `View` correspond à `Controller` dans `Spring` !
- De plus, la `View` dans `Spring` est l'équivalent du `Template` dans `Django`.

**Maintenant que nous avons compris la différence par plaisir, allons-nous découvrir ce qu'est réellement le `MVC` ?**

## Modèle, Vue, Contrôleur et Utilisateur

![image](https://user-images.githubusercontent.com/59782504/155059391-11d1e224-cbc0-4eac-bdcc-31e7f255d2e1.png)

Bien qu'un schéma simplifié de la relation entre Modèle, Vue et Contrôleur ressemble à l'image ci-dessus, en réalité, les flèches peuvent pointer dans plusieurs directions.

Ce qui est important ici n'est pas la direction des flèches mais **le flot** que vous devez observer.

### Modèle
Commençons par le Modèle. Le Modèle est un terme pour les objets qui contiennent des données, c'est l'objet qui contient la classe des données réelles à sauvegarder dans la base de données.

En termes simples, **c'est l'ami qui communique avec la base de données.** <br><br>Il doit contenir des informations sur tous les objets où des opérations CRUD se produisent et ne doit pas faire référence à la **View** ou au **Controller**.

### Vue
C'est l'objet qui contient l'interface utilisateur visible par l'utilisateur. Avec l'engouement actuel pour les API RestFul, il est devenu rare que Spring contienne directement du HTML. Les frameworks frontend comme Vue.js et React doivent être considérés comme responsables de la Vue dans Spring MVC.

Il a pour rôle de recevoir d'abord les entrées de l'utilisateur et de les envoyer au Controller.

Il traite des éléments d'entrée utilisateur comme `input`, `checkbox`, `submit` dans le HTML, ainsi que de l'affichage des données récupérées de la base de données.

### Contrôleur
Il reçoit les requêtes de l'utilisateur, traite les données de manière appropriée (Modèle) et appelle la Vue ou dans le cas d'une communication asynchrone, il répond dans le format adéquat (JSON/XML..etc).

## Conclusion
- Aujourd'hui, nous avons découvert simplement le modèle MVC.
- Étant mon premier blog technique, j'ai réalisé combien d'efforts cela prend pour rédiger un seul article.
- Le prochain sujet traitera plus en détails du modèle Spring MVC.