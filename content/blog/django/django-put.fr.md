---
title: Analyse des données via PUT dans une vue de classe
type: blog
date: 2022-04-12
comments: true
translated: true
---

## Request n'a pas d'attribut 'data'
Je vais aborder un problème survenu alors que la vue initialement conçue de manière fonctionnelle a été réorganisée en vue sous forme de classe dans l'entreprise.

Avec Django, certaines choses peuvent sembler étonnantes, surtout lorsqu'il s'agit de recevoir des données via le `REST Framework`.

Dans mon cas, j'ai rencontré l'erreur `AttributeError: request has no attribute 'data'`.

Jetons un coup d'œil à la classe que j'ai implémentée.

```python
# urls.py
urlpatterns = [
  path('my_url/', views.MyView.as_view())
]

# views.py 
class MyView(View)
  def put(self, request):
    my_data = request.data
    # my business logic
    
```

Bien sûr, en `JavaScript`, nous envoyions correctement les données à `myapp/my_url/`. Cependant, la variable `request.data` ne se créait pas.

Ceux qui ont appris le `Django Rest Framework` remarqueront que ce code semble bizarre.

Je le sais aussi. En règle générale, on implémente un `Serializer` et on analyse les données `JSON` via cette classe, n'est-ce pas ?

Cependant, dans ma situation, ce n'était pas envisageable.

Il n'y avait pas de modèle sur lequel se baser, et la plupart des fonctions liées aux modèles exécutaient des requêtes brutes directement sur la base de données, ce qui rendait difficile une configuration indépendante de `Serializer`.

Le `Serializer` recevait des données au préalable par rapport au modèle, et je pensais que cela pourrait générer de nouveaux risques lors d'une nouvelle création de modèle.

Bref ! Revenons au code. En fin de compte, le code ci-dessus ne recevait pas correctement les données, et après avoir senti le problème, j'ai fais du débogage via PyCharm IDE.

En conclusion, il n'existait pas de variable membre `data` dans `request`.

C'est étrange, n'est-ce pas ? Quand j'avais conçu cela avec une `Function View` et non une `Class View`, `request.data` était correctement reçu.

Bien sûr, pour les données entrantes par `GET` et `POST`, il existe des variables membres internes comme `request.POST`, `request.GET` qui analysent les données de manière distincte, mais il est vraiment étrange qu'il n'y ait rien de tel pour `PUT` et `DELETE`.

```python
# urls.py
urlpatterns = [
  path('my_url/', views.my_view)
]

# views.py 
  def my_view(self, request):
    my_data = request.data
    # my business logic
    
```
J'ai recherché via Google avec le mot-clé `class view django put` et j'ai réussi à trouver la page suivante.

Voyons voir la solution proposée par le blog.

Le reste du contenu provient de ce [blog](https://thihara.github.io/Django-Req-Parsing/).


## `request.POST` diffère du POST de REST.

En parcourant ce blog, on peut trouver [cette conversation](https://groups.google.com/g/django-developers/c/dxI4qVzrBY4/m/m_9IiNk_p7UJ) entre développeurs sur un groupe Google.

De cette conversation, on apprend que `request.POST` de `Django` n'a pas été conçu pour REST, mais pour recevoir les données provenant de `HTML` via des `form` ayant `method="post"`.

La plupart des formulaires transmettent des données au format POST avec un `Content Type` défini sur `multipart/form-data`, ce qui diffère de l'encodage `JSON`.

`Django` avertit que `request.POST` suppose de traiter ce type de données et peut souvent provoquer des erreurs inattendues.

Même si l'on envoie des données au format `JSON` via le `REST framework`, `request.POST` reçoit correctement les données ; toutefois, comme c'est toujours encodé via un `form`, il est conseillé d'ignorer ces données.

Bien que technique, cela signifie qu'il n'existe rien comme `request.PUT` ou `request.DELETE` dans `request`.

## Alors comment procéder ?

Sur le web que nous utilisons, il n'y a pas encore de `Serializer` mis en œuvre de manière appropriée via un modèle, et comme l'objectif est de créer avec une Class View, il serait très pratique de recevoir les données dans un format `request.PUT` similaire aux formats `request.POST`, `request.GET`.

Pour cela, lors de la transmission du `request` via une fonction à un middleware, nous pouvons le recevoir en préalable et ajouter une variable `PUT` en tant qu'attribut de `request`.

En anticipant les cas où `POST` ou `PUT` transporte un `content-type` en `application/json`, créons également un attribut `JSON` !

## Solution

Si vous avez un dossier de modules communs, créez-y (ou créez un nouveau dossier) un fichier nommé `parsing_middleware.py` (vous pouvez choisir un autre nom si vous préférez). 

Créez un dossier `middleware` pour distinguer les modules dans le dossier de modules communs `COMMON`, et créez un fichier `parsing_middleware.py` à l'intérieur.

```python
# COMMON/middleware/parsing_middleware.py

import json

from django.http import HttpResponseBadRequest
from django.utils.deprecation import MiddlewareMixin


class PutParsingMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.method == "PUT" and request.content_type != "application/json":
            if hasattr(request, '_post'):
                del request._post
                del request._files
            try:
                request.method = "POST"
                request._load_post_and_files()
                request.method = "PUT"
            except AttributeError as e:
                request.META['REQUEST_METHOD'] = 'POST'
                request._load_post_and_files()
                request.META['REQUEST_METHOD'] = 'PUT'

            request.PUT = request.POST


class JSONParsingMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if (request.method == "PUT" or request.method == "POST") and request.content_type == "application/json":
            try:
                request.JSON = json.loads(request.body)
            except ValueError as ve:
                return HttpResponseBadRequest("impossible de parser les données JSON. Erreur : {0}".format(ve))
```

Ensuite, configurez `settings.py` pour utiliser ce middleware.

```python
# my_project_name/settings.py
MIDDLEWARE = [
...
  # Ajout du middleware pour le parsing de PUT et JSON
  'COMMON.middleware.parsing_middleware.PutParsingMiddleware',
  'COMMON.middleware.parsing_middleware.JSONParsingMiddleware',
...
]
```

## Réflexions futures

Je parlerai plus tard de comment résoudre les problèmes qui surviennent lors de l'amélioration des requêtes brutes en les basant sur le modèle Django, mais il semble que le problème réside dans la structure projetée par Django.

En explorant de nombreuses références, même la documentation Django recommande une structure où `views.py` et `models.py` ne peuvent qu'être volumineux.

Exemple de bonnes pratiques suggéré par Django :

![image](https://user-images.githubusercontent.com/59782504/163424387-9d327726-249a-4212-9089-053b6ef04825.png)

Bien que ce soit raisonnable en `python`, je ne suis pas sûr que ce soit la meilleure ou la structure idéale qui soit, mais beaucoup de problèmes me viennent à l'esprit.

`Django` place la logique métier et le contrôle dans `views.py`, les modèles liés à la base de données dans `models`, et inclut les pages `HTML` avec `CSS`, `JS` dans `template`, mais plus vous ajoutez de fonctionnalités à une application, plus les dépendances des fichiers augmentent.

Toutefois, si vous séparez arbitrairement `views.py`, cela pourrait engendrer des références circulaires et accroître les dépendances, entraînant des problèmes en chaîne.

Les modules doivent être conçus indépendamment, en adéquation avec le modèle orienté objet. Mais à la différence de `Spring`, `Django` ne possède pas de conteneur `IOC` (Inversion of Control) pour gérer les dépendances.

Réfléchir à la manière de concevoir des modules indépendants et de créer de bons services sera une future tâche.

L'automatisation de la documentation pour le transfert de connaissances est également une tâche importante.

Je publierai ultérieurement sur mes réflexions et comment j'ai résolu ces problèmes !

## Pour conclure

- Aujourd'hui, j'ai discuté de la manière de résoudre un problème survenu lorsque j'ai transformé une vue fonctionnelle en vue de classe. Bien que tout le monde ne vive pas la même situation que moi, j'espère que ce post vous a aidé à résoudre des problèmes similaires.
- Je suis toujours reconnaissant pour les critiques constructives et les commentaires bienveillants.
- Merci !