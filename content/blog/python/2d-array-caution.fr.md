---
title: Points à prendre en compte lors de l'initialisation des éléments d'un tableau 2D avec les mêmes valeurs
type: blog
date: 2022-03-02
comments: true
translated: true
---

Ce post est un message de réflexion ㅠㅠ

Je souhaite corriger les erreurs que j'ai commises lors de mon dernier test de codage !

## Définition du problème

Il s'agit d'un problème d'initialisation et de modification des éléments d'un tableau.

Pour initialiser un tableau 2D avec les mêmes éléments en Python, j'ai procédé comme suit :

```python
two_arr = [[False] * 2] * 5
```

Après cela, lorsque vous regardez le résultat de la sortie :

```python
[
  [False, False], 
  [False, False], 
  [False, False], 
  [False, False], 
  [False, False]
]
```

Cela semble bien initialisé selon mon intention en tant que liste de `False` de forme 2*5.

**Bien initialisé comme je le voulais !**

Mais maintenant, tentons de changer un élément du tableau :

```python
two_arr[0][0] = True
```

Je m'attendais à ce que le premier élément du tableau, `False`, devienne `True`, comme suit :

```python
[
  [True, False], 
  [False, False], 
  [False, False], 
  [False, False], 
  [False, False]
]
```

Cependant, lorsque vous regardez le résultat réel :

```python
[
  [True, False], 
  [True, False], 
  [True, False], 
  [True, False], 
  [True, False]
]
```

Bien que j'aie modifié `[0][0]`, le même changement s'est produit pour le premier élément de chaque sous-liste. Que se passe-t-il ?

## Solution

Le problème réside dans l'opération de multiplication (`*`) utilisée lors de la déclaration de tableaux Python avec des éléments identiques.

Lorsque vous copiez un élément spécifique à l'aide de l'opérateur multiplication, comme dans le cas d'un tableau 1D, c'est-à-dire `[False] * 2`, cela fonctionne correctement en copiant la valeur `False` deux fois dans la liste puisqu'il s'agit d'une valeur et non d'une copie d'une "liste". Le résultat est donc une liste comme `[False, False]`.

Cependant, le problème survient lors du deuxième passage. La copie d'un tableau déclaré avec `[[False] * 2] * 5` pose problème.

Une liste instanciée comme `[[False] * 2]` est une "adresse" et non une "valeur".

Comprenez-vous ? En fin de compte, c'est comme si je demandais cinq copies de l'adresse du tableau `[False, False]`.

En d'autres termes, les adresses de chaque ligne partagent leurs éléments, de sorte que même le changement d'une seule partie d'une ligne affecte toutes les lignes, donnant l'apparence qu'elles ont toutes changé.

Par conséquent, pour initialiser le tableau comme souhaité, vous devez l'initialiser directement à l'aide d'une boucle `for`. Comme `[False, False]` est appelé à différents moments pendant que la boucle `for` tourne, différentes adresses sont attribuées à chaque élément.

Pour le résoudre, vous pouvez ajouter les éléments à l'aide de la fonction `append()`, comme suit :

```python
two_arr = []
for _ in range(5):
  two_arr.append([False] * 2)
```

Pour un code plus propre, vous pouvez également utiliser une compréhension de liste (`list comprehension`) :

```python
two_arr = [[False] * 2 for _ in range(5)]
```

Enfin, en comparant la sortie, vous pouvez vérifier qu'elle fonctionne bien comme prévu.

## Résultat

```python
[
    [True, False], 
    [False, False], 
    [False, False], 
    [False, False], 
    [False, False]
]
```

## En guise de conclusion

- Ce test de codage m'a rappelé l'importance de vérifier à nouveau même les choses que je pense connaître. Bien que j'aie implémenté tout le code logique important, il est étonnant que c'est là que l'erreur est survenue.. :(
- Les variables de liste sont des objets et ont donc des adresses contrairement aux variables de type primitif. Si vous lisez ce post, souvenez-vous de cela pour éviter de commettre la même erreur que moi !