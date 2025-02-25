---
layout: post
title: Découvrons les styles de casse (Camel Case? Pascal Case? Kebab Case?)
date: 2022-04-14
comments: true
translated: true
---

Aujourd'hui, je vais parler d'un article que j'ai également posté dans l'entreprise.

Il y a des choses que j'aimerais guider pour ceux qui commencent le codage, et je prévois de rassembler ces aspects et de poster sous le tag `Code Guide` !

## Style de codage

Si vous développez seul, il n'y a aucun problème. De nos jours, presque tous les langages prennent en charge l'encodage UTF-8, vous pouvez donc même écrire du coréen dans votre code.

Surtout, pour ce qui est des noms de `variables`, `fonctions`, `classes`, etc., que vous pouvez nommer librement, il n'y a théoriquement aucun problème à les nommer en chinois ou en coréen.

## Alors pourquoi la plupart des codes sont-ils écrits uniquement en anglais?

Cela peut sembler un peu hors sujet, mais il existe des modules ou des fonctions qui ne fonctionnent qu'en anglais.

En particulier, dans le cas de langages plus anciens comme le `C++`, pour prendre en charge le coréen, un module d'analyse est parfois nécessaire pour convertir le coréen en un caractère compréhensible par l'anglais ou le système d'exploitation.

Mais le point le plus important est **d'harmoniser le style de codage parmi les développeurs travaillant en collaboration**.

Si une personne définit des noms de variables en coréen, une autre en anglais, et une autre en chinois, mais pour faire la même tâche, cela sera extrêmement déroutant pour un nouveau membre de l'équipe qui voit ce code pour la première fois.

C'est pour cela que des règles ont été établies chez les développeurs sur comment nommer et définir le code, appelées guides de codage ou conventions.

C'était une longue digression. Passons au vif du sujet !

## Styles de casse

Pensez aux styles de casse comme à des règles de nommage.

Quand vous nommez des variables, fonctions, ou classes, vous suivez ces règles. Cela a beaucoup à voir avec les espaces.

Beaucoup de langages incluent les espaces comme élément syntaxique, et il faut réfléchir à la manière de les remplacer par d'autres caractères.

_▼ Une image amusante illustrant les différents styles de casse_
![image](https://user-images.githubusercontent.com/59782504/163414665-0c9bf7d7-8e04-4fb3-bdf9-400db3c5959a.png)

Il existe de nombreux styles de casse, mais quatre sont principalement utilisés :

```python
camelCase # Camel Case
PascalCase # Pascal Case
snake_case # Snake Case
kebab-case # Kebab Case
```

Comme vous l'avez deviné, oui, le code que j'ai écrit ci-dessus illustre les principales caractéristiques de chaque style.

## Camel Case

Le Camel Case est inspiré par la forme des chameaux à une seule bosse. Au lieu d'un espace, la lettre suivant cet espace devient une majuscule. Bien que l'on distingue parfois le Lower camel case et le Upper camel case, le Upper camel case est généralement appelé Pascal case.

_▼ Exemple de Camel Case_
```python
todayDate = "2022-04-14";
```

Comme ci-dessus, vous pouvez écrire `todayDate` au lieu de `today date`.

Selon les Java code style guides de Google, cette méthode est utilisée pour nommer les méthodes, variables, etc., dans `Java` et les langages basés sur Java comme `Kotlin`.

(Lien de référence : https://google.github.io/styleguide/javaguide.html#s5-naming)

## Pascal Case

Le Pascal Case est aussi appelé Upper camel case. C'est un nom hérité des langages Pascal, où toutes les premières lettres étaient des majuscules.

_▼ Exemple de Pascal Case_
```python
TodayDate = "2022-04-14"
```

Cette méthode est couramment utilisée dans le code de nommage des classes en `Python`, des structures en `C`, et des classes en `C++`, ainsi que des classes et interfaces en `Java`.

De plus, en regardant le guide de code `PEP8` de Python, vous pouvez voir que ce style est utilisé pour le nommage des classes Python.

_Sur la page suivante, bien que le Pascal Case soit appelé Camel Case, ne vous méprenez pas, il s'agit du Upper camel case expliqué plus tôt._
https://realpython.com/python-pep8/#naming-styles

## Snake Case

Le Snake Case a été nommé ainsi parce que le code ressemble à un serpent.

C'est une méthode où les noms de variables ou de fonctions sont séparés par des underscores `_` au lieu d'espaces.

_▼ Exemple de Snake Case_
```python
today_date = "2022-04-14"
```

Elle est recommandée par la convention de nommage `PEP8` pour les noms de modules, fonctions, méthodes, variables, etc., en Python.

(Lien de référence : https://google.github.io/styleguide/javaguide.html#s5-naming)

Si vous déclarez une variable de manière non conventionnelle, l'IDE PyCharm de `Python` soulignera en rouge le nom en vous suggérant de le renommer pour correspondre à PEP8.

_▼ Exemple de nom de variable incorrect_
```
HelloMyMrYesterday = "2021-01-10"
```

_▼ Alerte dans PyCharm_

![image](https://user-images.githubusercontent.com/59782504/163415564-6536513c-0a1b-46c3-a0e9-b38f73cf139d.png)

### + Un petit conseil

Le `PEP8` offre des règles claires non seulement pour le nommage, mais aussi pour l'indentation, les espaces, etc. La plupart des conventions peuvent être appliquées en utilisant le raccourci de nettoyage de code dans `PyCharm IDE` (`Ctrl` + `Alt` + `L`).

_▼ Pour l'intuition humaine, violons volontairement les règles suivantes_

```python
def func_1():
    return 1
def func_2():
    return 2
```

Dans PyCharm, un soulignement jaune vous invite à corriger le code. Il mentionne même `PEP8` !

![image](https://user-images.githubusercontent.com/59782504/163415681-d8fe6dd6-0179-4936-ade5-9f0c3fb87688.png)

![image](https://user-images.githubusercontent.com/59782504/163415693-44ad9ad7-f00a-41d3-9400-33d10c566459.png)

- Après avoir appuyé sur `Ctrl` + `Alt` + `L` :

```python
def func_1():
    return 1
    
    
def func_2():
    return 2
```
Vous remarquerez que chaque fonction a deux lignes vides et que l'avertissement a disparu.

## Kebab Case

En observant le Camel Case, le Snake Case, et le Kebab Case, on note à quel point les développeurs appréhendent intuitivement le code.
```python
today-date = "2022-04-14"
```
Comme vous pouvez le voir, les lettres sont alignées comme sur une brochette, et les espaces sont remplacés par des tirets (-), c'est ce qu'on appelle le Kebab Case.

Il est souvent utilisé dans les langages de publication comme `CSS`, et plus d'informations peuvent être trouvées dans la convention de nommage `BEM`.
https://en.bem.info/methodology/naming-convention/

## Conclusion

- Aujourd'hui, nous avons exploré les styles de casse, étroitement liés aux conventions et normes de style de codage !
- J'aimerais aussi aborder les conventions de commit, comme celles lors du `Git commit`.
- Si vous avez des questions ou trouvez des erreurs, veuillez laisser un commentaire !