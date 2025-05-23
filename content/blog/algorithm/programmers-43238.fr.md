---
title: "[Programmers] Inspection d'entrée (Golang)"
type: blog
date: 2025-05-23
comments: true
translated: true
---

## Problème
[**Problème de Programmers Inspection d'entrée**](https://school.programmers.co.kr/learn/courses/30/lessons/43238)
```
Il y a n personnes qui font la queue pour l'inspection d'entrée. Chaque agent d'inspection a un temps de traitement différent.

Au départ, toutes les barrières d'inspection sont vides. Une seule personne peut être inspectée simultanément à chaque barrière. La personne en tête de la queue peut aller à la barrière d'inspection vide et passer l'inspection. Cependant, si une barrière d'inspection peut traiter plus rapidement, elle peut attendre et aller là-bas pour être inspectée.

Nous voulons minimiser le temps nécessaire pour que tout le monde passe l'inspection.

La fonction solution doit renvoyer le temps minimal nécessaire pour que toutes les personnes soient inspectées, lorsque le nombre de personnes attendant l'inspection n (n) et un tableau times contenant le temps nécessaire pour qu'un agent d'inspection traite une personne sont donnés comme paramètres.
```

## Restrictions
```
- Le nombre de personnes attendant l'inspection est d'au moins 1 et d'au plus 1 000 000 000.
- Le temps nécessaire à chaque agent d'inspection pour traiter une personne est d'au moins 1 minute et d'au plus 1 000 000 000 minutes.
- Le nombre d'agents d'inspection est d'au moins 1 et d'au plus 100 000.
```

## Approche
En général, pour un tel large éventail, il est possible de résoudre le problème par recherche binaire.

Cependant, dans ce cas, le nombre de personnes attendant peut atteindre jusqu'à 1 000 000 000 et le temps d'attente jusqu'à 1 000 000 000 minutes, et même 100 000 agents peuvent exister, ce qui a soulevé des questions sur la manière d'aborder ce problème.

Après avoir longuement réfléchi, je n'étais pas sûr de comment aborder le sujet, alors j'ai demandé un indice à ChatGPT.
~~(En fait, c'est donc un article d'introspection que j'écris)~~ 

### Indice de ChatGPT

![image](/images/algorithm/programmers-43238-1747970726257.png)

En résumé, la réponse suggère d'effectuer une recherche binaire en se basant sur le "temps total minimum nécessaire pour le traitement" qui est la valeur de retour. En divisant le "temps total de traitement" par le "temps de traitement de chaque agent", on obtient le "nombre de personnes traitées", ce qui a été un indice pour mener la recherche binaire en utilisant cet élément.

Dans ce cas, le tableau de 100 000 agents doit être analysé dans tous les cas. Je pensais que cela serait un peu lourd, mais je pense que je devrais aborder le problème en considérant que cela peut être géré.

Ainsi, la recherche binaire est basée sur le "temps total minimum nécessaire pour le traitement". Commençons la recherche binaire.

En général, puisque le résultat d'une recherche binaire est la cible, il peut être bon de réfléchir au résultat en premier dans de tels problèmes.

### Implémentation

D'abord, j'ai écrit la fonction `canHandled()` qui sert de référence pour la recherche binaire. Cette fonction est utilisée pour calculer le "nombre de personnes traitées" basé sur le "temps total minimum nécessaire pour le traitement".

Cette fonction est utilisée pour vérifier les conditions à chaque ramification de la recherche binaire.
```go
func canHandled(times []int, time int64, human int) bool {
	var total int64 = 0
	
    for _, t := range times {
		total += time / int64(t)
	}
    
	return total >= int64(human)
}
```

Ensuite, j'ai écrit le code qui effectue réellement la recherche binaire en utilisant cette fonction.
```go
func solution(n int, times []int) int64 {
    maxTime := int64(1000000000) * int64(n)
    minTime := int64(1)
    answer := int64(0)
    for minTime <= maxTime {
        mid := (minTime + maxTime) / 2
        if canHandled(times, mid, n) {
            maxTime = mid - 1
            answer = mid
        } else {
            minTime = mid + 1
        }
    }
	
    return answer
}
```

Lorsque le résultat de la fonction `canHandled()` est `true`, cela signifie que le "nombre de personnes traitées" est supérieur ou égal à `n`, et par conséquent, nous réduisons `maxTime`.
À l'inverse, si le résultat est `false`, cela implique que le "nombre de personnes traitées" est inférieur à `n`, donc nous augmentons `minTime` pour obtenir plus de personnes à l'étape suivante.

Dans ce cas, nous ne mettons à jour `answer` que lorsque `canHandled()` est `true`, ce qui signifie que le temps de traitement est effectivement possible, donc il n'est pas nécessaire de mettre à jour `answer` lorsque le traitement n'est pas viable.