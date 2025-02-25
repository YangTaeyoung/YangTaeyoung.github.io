---
title: Créer un serveur résistant aux requêtes redondantes avec Singleflight en Golang
type: blog
date: 2025-02-10
comments: true
translated: true
---
Récemment, mon entreprise a fermé et j'ai dû travailler temporairement en freelance.

Heureusement, j'ai rencontré une personne exceptionnelle qui m'a appris plusieurs compétences sur Go et le web, l'une d'elles étant l'amélioration avec le package singleflight.

![image](/images/go/singleflight-1739191305077.png)

## Singleflight?
Traduit littéralement en anglais, cela signifie "vol unique". En réalité, il n'y a pas besoin de le comprendre de manière trop complexe, on peut juste voir cela comme la garantie d'une exécution unique.

Voyons un exemple qui est encore plus simple. Regardons le code ci-dessous :

```go
package main

import (
	"log/slog"
	"time"

)

var counter int

func DoSomething() {
	time.Sleep(5 * time.Second)

	counter++

	slog.Info("result", "counter", counter)
}

func main() {
	for i := 0; i < 10; i++ {
		go DoSomething()
	}

	time.Sleep(10 * time.Second)
}
```

```shell
2025/02/10 20:49:22 INFO result counter=3
2025/02/10 20:49:22 INFO result counter=4
2025/02/10 20:49:22 INFO result counter=10
2025/02/10 20:49:22 INFO result counter=5
2025/02/10 20:49:22 INFO result counter=2
2025/02/10 20:49:22 INFO result counter=6
2025/02/10 20:49:22 INFO result counter=7
2025/02/10 20:49:22 INFO result counter=9
2025/02/10 20:49:22 INFO result counter=1
2025/02/10 20:49:22 INFO result counter=8
```
Comme attendu, étant donné que ce sont des goroutines, l'ordre n'est pas garanti, mais le compteur atteint tout de même 10 à partir de 1.

Dans cet exemple, on suppose que la fonction `DoSomething()` est une fonction lourde (qui prend beaucoup de temps et consomme beaucoup de ressources CPU/Mémoire).

Que se passerait-il si une fonction similaire est sur le serveur et qu'il y a des requêtes redondantes ?
> Très probablement, le serveur crashera.

Dans ce cas, on peut améliorer cela en utilisant le package `singleflight`.

singleflight garantit que seule une fonction est exécutée à la fois et renvoie le même résultat aux requêtes entrées en même temps (lorsque la fonction est exécutée).

### Utiliser Singleflight
Commençons par installer le package singleflight :
```shell
go get -u golang.org/x/sync/singleflight
```

Ensuite, modifions le code comme suit :
```go
package main

import (
	"log/slog"
	"time"

	"golang.org/x/sync/singleflight"
)

var counter int

func DoSomething(group *singleflight.Group) {
	res, err, shared := group.Do("key", func() (interface{}, error) {
		time.Sleep(5 * time.Second)

		counter++
		return counter, nil
	})
	if err != nil {
		slog.Error("error", "err", err)
	}

	slog.Info("result", "res", res, "shared", shared)
}

func main() {
	group := singleflight.Group{}
	for i := 0; i < 10; i++ {
		go DoSomething(&group)
	}

	time.Sleep(10 * time.Second)
}
```
```shell
2025/02/10 20:43:25 INFO result res=1 shared=true
2025/02/10 20:43:25 INFO result res=1 shared=true
2025/02/10 20:43:25 INFO result res=1 shared=true
2025/02/10 20:43:25 INFO result res=1 shared=true
2025/02/10 20:43:25 INFO result res=1 shared=true
2025/02/10 20:43:25 INFO result res=1 shared=true
2025/02/10 20:43:25 INFO result res=1 shared=true
2025/02/10 20:43:25 INFO result res=1 shared=true
2025/02/10 20:43:25 INFO result res=1 shared=true
2025/02/10 20:43:25 INFO result res=1 shared=true
```

Comme nous pouvons le voir ci-dessus, même si c'était un goroutine, `res` vaut 1, ce qui signifie que le compteur n'a augmenté que de 1.
> Parce qu'il n'a été exécuté qu'une seule fois.

L'exécution simultanée est déterminée par le paramètre `"key"`. Comme nous l'avons configuré avec une clé fixe, il garantit qu'une seule exécution est effectuée.

Si vous souhaitez éviter des exécutions redondantes pour une clé spécifique (ex: ID utilisateur), remplacez la valeur `"key"` par le paramètre souhaité.

## Application sur un serveur HTTP
Cela peut également être appliqué à un serveur http.

Nous l'appliquerons simplement en utilisant le package `net/http` comme suit :

```go
package main

import (
	"log"
	"log/slog"
	"net/http"
	"time"

	"golang.org/x/sync/singleflight"
)

func HandleBusyLogic(group *singleflight.Group) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		res, err, _ := group.Do("key", func() (interface{}, error) {
			time.Sleep(5 * time.Second)
			slog.Info("Hello, World!")
			return "Hello, World!", nil
		})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Write([]byte(res.(string)))
	})
}

func main() {

	mux := http.NewServeMux()
	group := singleflight.Group{}
	mux.Handle("GET /", HandleBusyLogic(&group))

	s := &http.Server{
		Addr: "0.0.0.0:8080",
	}

	s.Handler = mux

	slog.Info("Server started", "addr", s.Addr)
	if err := s.ListenAndServe(); err != nil {
		log.Fatalf("ListenAndServe: %v", err)
	}
}
```

Mis à part le handler, c'est fondamentalement pareil. Le groupe est passé en tant que paramètre pour exécuter la fonction `Do`.

Le code client peut être structuré comme suit :
```go
package main

import (
	"io"
	"log/slog"
	"net/http"
	"sync"
)

func main() {
	var wg sync.WaitGroup
	for i := 0; i < 5; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			response, err := http.Get("http://localhost:8080")
			if err != nil {
				slog.Error("failed to get response", "err", err)
				return
			}

			bodyByte, err := io.ReadAll(response.Body)
			if err != nil {
				slog.Error("failed to read body", "err", err)
				return
			}

			slog.Info("response", "body", string(bodyByte))
		}()
	}

	wg.Wait()
}
```

Lorsque vous exécutez cela avec le serveur en marche,

Vous pouvez observer que le log sur le serveur apparaît une seule fois :
```shell
2025/02/10 21:09:31 INFO Server started addr=0.0.0.0:8080
2025/02/10 21:10:17 INFO Hello, World!
```

Et le client reçoit la même réponse 5 fois comme demandé :
```shell
2025/02/10 21:10:17 INFO response body="Hello, World!"
2025/02/10 21:10:17 INFO response body="Hello, World!"
2025/02/10 21:10:17 INFO response body="Hello, World!"
2025/02/10 21:10:17 INFO response body="Hello, World!"
2025/02/10 21:10:17 INFO response body="Hello, World!"
```

Ainsi, utiliser le package singleflight vous permet de créer un serveur résistant aux requêtes redondantes.

Cependant, vous pourriez vous demander :

## Pourquoi ne pas utiliser un cache ?
En effet. Comme nous l'avons vu dans le [post précédent](/blog/spring/spring-redis-cache/), si la requête est la même, un cache efficace peut également résoudre un grand nombre de requêtes.

Cependant, leurs rôles diffèrent légèrement.

### Cache

Dans le cas du cache, l'exécution unique n'est pas garantie, il est donc vulnérable avant la mise en cache ou lorsque l'expiration provoque un cache miss.

Dans la plupart des cas où cela est ajouté, il s'agit de travaux lourds ou à charge intense qui peuvent être encore plus critiques face à des requêtes simultanées.

À l'inverse, en situation de Cache Hit, il peut répondre plus rapidement que singleflight.

![image](/images/go/singleflight-1739189940786.png)

### Singleflight 

En revanche, singleflight garantit qu'une seule fonction est exécutée à la fois. Par conséquent, même en cas de cache miss, il limite le nombre de fonctions exécutées à une seule, réduisant ainsi la charge du serveur au minimum.

Cependant, ce n'est pas un cache, donc une fois la fonction exécutée, elle doit être réexécutée. Par conséquent, en termes de temps total, cela peut être plus lent qu'un cache.

Par conséquent, utiliser à la fois Singleflight et un cache pourrait être la meilleure solution.

## Verrouillage
En dehors de SingleFlight, il est également possible d'utiliser d'autres méthodes de verrouillage externes. Notamment dans les situations multi-conteneurs où un seul conteneur doit fonctionner, cette méthode peut être utile.

Dans ces cas, il peut être un peu difficile de copier et de fournir le résultat. (Ce n'est pas impossible. Il existe des moyens comme attendre jusqu'à l'obtention du verrou et fournir des réponses mises en cache accessibles par d'autres conteneurs).

Cependant, dans la plupart des situations générales, il n'est pas souvent nécessaire de verrouiller de manière stricte, et des outils légers comme singleflight peuvent suffire.

## Pourquoi ne pas utiliser une Queue ?
Comme nous l'avons vu précédemment avec l'[EDA](/blog/web/eda/), l'utilisation d'une Queue permet de traiter des événements séquentiellement. Bien que ce soit également une bonne méthode pour réduire la charge, leur utilité est différente.

Les Queues sont plus adaptées pour traiter des requêtes différentes. Par exemple, regrouper toutes les requêtes envoyées à un service externe et les traiter dans une seule file.

À l'inverse, Singleflight est plus adapté pour traiter des requêtes identiques. Il est idéal pour traiter des demandes supposées similaires, comme les méta-données serveur ou les requêtes de crawling.


### Conclusion
Bien que ce package soit dans x, il est étonnant que Golang le fournisse directement. Je n'ai jamais vu ce type de fonctionnalité standard dans d'autres langues, et cela m'impressionne que Golang soit attentif à ces détails.

En le structurant comme un middleware, cela pourrait être utilisé conjointement avec presque toutes les API qui utilisent le cache. (Cela pourrait être particulièrement efficace pour les tâches qui prennent du temps).

Si vous cherchez un moyen de réduire la complexité tout en diminuant la charge du serveur, essayez d'utiliser Singleflight !

## Références
- https://pkg.go.dev/golang.org/x/sync/singleflight
- https://velog.io/@divan/singleflight%EB%A5%BC-%ED%99%9C%EC%9A%A9%ED%95%9C-%EC%B5%9C%EC%A0%81%ED%99%94
- https://www.codingexplorations.com/blog/understanding-singleflight-in-golang-a-solution-for-eliminating-redundant-work