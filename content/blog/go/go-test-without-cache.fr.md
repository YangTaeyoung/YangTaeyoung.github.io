---
title: Tester sans cache dans Golang
type: blog
date: 2025-02-14
comments: true
translated: true
---
![image](/images/go/go-test-without-cache-1739518633592.png)

Lorsque vous testez en Golang, la vitesse des tests devient très rapide à partir de la deuxième exécution.

**1ère exécution**
```shell
ok      github.com/my/package/test    126.752s
```
**2ème exécution**
```shell
ok      github.com/my/package/test    (cached)
```
Lors de la première exécution, cela a pris plus de 2 minutes, mais lors de la deuxième exécution, le test s'est terminé très rapidement, sans même avoir le temps de mesurer le temps.

En fait, ce n'est pas un changement de performance, mais parce que **les résultats des tests sont réutilisés à partir du cache si le code n'a pas changé**.

## Test d'intégration
Tout d'abord, un test d'intégration signifie tester plusieurs composants ensemble, en tant qu'un seul bloc.

Contrairement aux tests unitaires qui utilisent principalement le mock, les tests d'intégration traitent principalement des composants réels, ce qui les rend plus lents.

Cependant, dans les serveurs API, ces tests d'intégration sont souvent utilisés car ils permettent de tester les actions de l'utilisateur final de la manière la plus réaliste possible.

Dans les tests d'intégration, il arrive parfois qu'il soit nécessaire d'exclure cette partie liée au cache.

### Pourquoi tester sans cache dans les tests d'intégration
Ce n'est pas le cas pour tous les tests d'intégration. En fait, si le test garantit l'idempotence, l'utilisation du cache n'est pas problématique.

Si vous n'utilisez pas de services externes, et que ces éléments sont également exclus des tests, le cache peut être utilisé. (Dans ce cas, il devrait même être utilisé pour réduire le temps de test autant que possible)

Cependant, si l'utilisation de services externes est fréquente, si le test ne garantit pas l'idempotence (comme si les résultats changent chaque fois), et s'il y a beaucoup de modifications nécessaires en raison des changements dans les services externes, 
il est préférable d'exécuter le test à chaque fois plutôt que de faire confiance aux résultats mis en cache.

## Tester sans cache
Pour en revenir au sujet, la méthode pour ne pas utiliser le cache est très simple. Il suffit d'utiliser le flag `-count 1` dans la commande go test.
```shell
go test -count 1 -v ./...
```

Avec cette méthode, vous pouvez exécuter les tests à chaque fois, sans utiliser le cache.

### Pourquoi `-count 1` ?
`-count 1` n'est en fait pas une commande pour activer ou désactiver le cache. Il spécifie simplement le nombre de fois que le test doit être exécuté.

De plus, selon la [documentation officielle](https://pkg.go.dev/cmd/go#hdr-Testing_flags), la valeur par défaut est aussi 1, donc en principe, le même comportement devrait se produire même si vous omettez cette option.
```
-count n
    Run each test, benchmark, and fuzz seed n times (default 1).
    If -cpu is set, run n times for each GOMAXPROCS value.
    Examples are always run once. -count does not apply to
    fuzz tests matched by -fuzz.
```

Cependant, cette option ne fonctionne pas de la même manière.

Que ce soit intentionnel ou non, la documentation officielle indique que `-count 1` est le moyen idiomatique de désactiver explicitement le cache :
> _"The idiomatic way to disable test caching explicitly is to use -count=1."_ 

## Conclusion
En fait, décider de l'utilisation du cache par une option comme `-count 1` me semble être une erreur de conception.
> En général, les gens pensent qu'il n'est pas nécessaire de spécifier la valeur par défaut de l'option.

On pourrait presque considérer cela comme un bug, alors je ne comprends pas pourquoi Go continue d'utiliser cette méthode. Il aurait été plus clair d'avoir un flag du type `-no-cache`... ?