---
title: REST?, RESTful?, REST API? C'est quoi au juste?
type: blog
date: 2022-02-28
comments: true
translated: true
---

Bonjour ! Dans ce post, nous allons découvrir REST, qui est largement utilisé sur le web. REST a été introduit dans une thèse de doctorat par Roy Fielding en 2000.

REST signifie "Representation State Transfer" et est une forme d'architecture logicielle pour les systèmes hypermédia.

# Hyper Média?

Un terme inconnu, n'est-ce pas ? Qu'est-ce que l'hypermédia ?<br>
L'hypermédia désigne une **structure de réseau qui relie de manière organique plusieurs informations comme du texte, des formes, des animations et des images vidéo, en utilisant des nœuds et des liens.** <br><br>
Sa caractéristique est la **capacité à relier et à extraire de manière interactive des informations connexes par l'utilisation de fonctions de lien !** **L'essentiel est que l'information est reliée par des liens!**

# Alors, qu'est-ce que REST?

REST signifie tout ce qui différencie une ressource par son nom (représentation de la ressource: `Representation`) et échange l'état de la ressource (`State`) selon ce nom.

Ainsi dit, c'est très compliqué. Essayons de l'exprimer plus simplement.

![image](https://user-images.githubusercontent.com/59782504/155932531-4587a4ea-b9de-4625-a9ad-90adb1bd9e69.png)

Les ressources sont tout ce que l'on voit en naviguant sur Internet. **On peut appeler ressource tout ce qu'un service offre, comme des textes, des vidéos, des images, etc.**

Que signifie la **représentation de la ressource**? On peut dire que c'est **attribuer un nom à la ressource**.

Pour consulter des informations sur Internet, il faut leur attribuer un nom.

Pensez à ce que vous voulez exprimer une information comme suit.

![image](https://user-images.githubusercontent.com/59782504/155925520-e33b36c9-8d2b-49a2-b0bc-5346d0ab6db6.png)

- Voici une image de lion. Mais comment le réseau peut-il afficher l'image de lion stockée dans une base de données ?

<img width="541" alt="image" src="https://user-images.githubusercontent.com/59782504/155926067-7a1994ac-ad25-420e-91a4-7ff537605da1.png">

- Comme l'image suivante, le navigateur Internet appelle l'image du lion par le nom de la ressource. 
- Comme vous pouvez le voir sur l'image, c'est en fait par le lien qui contient la ressource que l'on demande cette ressource.

`Ainsi, spécifier le nom de la ressource` et `échanger la ressource par ce nom` est ce qu’on appelle la `représentation de la ressource` :)

Mais le travail effectué sur Internet n’est pas seulement l’obtention (`GET`) d'images de lions, non ?

# Méthode REST

REST offre principalement quatre `méthodes` pour traiter plusieurs requêtes via le protocole HTTP.

1. `GET`: Un protocole centré sur **l'obtention des informations**. Lorsque vous vous connectez sur Naver, vos informations s'affichent dans votre profil, n'est-ce pas ? Naver vous demande vos informations de profil (Request) lors de la connexion et du chargement de la page principale, et le service renvoie ces informations.<br>
2. `POST`: Un protocole centré sur **la création d'informations**. Si vous vous inscrivez, les informations enregistrées dans votre navigateur seront envoyées au service via la méthode POST pour être enregistrées dans la base de données.<br>
3. `PUT`: Un protocole axé sur **la modification des informations**. Si vous modifiez votre profil sur Naver, les informations modifiées sont envoyées au service via ce protocole.<br>
4. `DELETE`: Un protocole centré sur **la suppression des informations**. Il est utilisé lorsque vous demandez au service de supprimer un enregistrement dans la base de données, comme une demande de désinscription ou la suppression d'un post.<br>

# Comment sont échangées les données réelles ? (État de la ressource : State)

Dans le concept de REST, l'essentiel réside dans la façon d'échanger les ressources.

Les données réelles sont échangées sous forme de fichiers avec le format `XML` ou `JSON`. Par exemple, la photo de lion évoquée précédemment peut être exprimée en `JSON` comme ceci.

```json
{
  "pic_name": "lion",
  "link": "https://cdn.example.com/img/lion.png"
}
```
_▲ Exemple de JSON_

```xml
<?xml version="1.0"?>
<pic>
    <pic_name>lion</pic_name>
    <link>"https://cdn.example.com/img/lion.png"</link>
</pic>
```
_▲ Exemple de XML_

Ainsi, les valeurs contenant l'état de la ressource sont renvoyées à l'utilisateur, et le client via cette réponse peut affecter le lien de l'image du lion dans une balise appropriée (par exemple : balise `img`) afin de montrer finalement les informations du lion à l’utilisateur.

# Les 6 contraintes de REST

Les développeurs peuvent mettre en œuvre le protocole de REST en respectant les conditions suivantes.

1. **Interface uniforme** (Uniform Interface) : Le principe est que **l'interface doit être séparée de manière cohérente**.
   - Ce n'est pas une forme dépendante d'un framework ou d'un programme particulier. Les services implémentés selon REST peuvent échanger des ressources via le protocole `HTTP`.
2. **Sans état** (Stateless) : C'est un principe selon lequel dans chaque requête, **le contexte du client ne doit pas être stocké sur le serveur**.
   - Cela signifie que les requêtes précédentes ne doivent absolument pas influencer les requêtes actuelles. 
   - Par exemple, avec la connexion. 
   - Avant REST et encore dans de nombreux services aujourd'hui, les informations d'authentification de l'utilisateur sont gérées et stockées sur le serveur sous la forme de sessions.
   - Cependant, un service intégralement implémenté en REST devrait permettre à l'utilisateur (client) de gérer lui-même ses informations d'authentification.
   - Généralement, les informations de connexion sont encryptées sous forme de `JWT Token` dans l'en-tête et, lors de chaque requête exigeant une authentification, les informations d'authentification sont envoyées dans l'en-tête.
3. **Cacheable** : REST a un grand avantage en **utilisant tel quel le protocole web standard `HTTP`**.
   - Cela signifie que l'on peut utiliser la fonction de `mise en cache` de `HTTP`. `La mise en cache` désigne **la technologie consistant à stocker et à fournir une copie de la ressource donnée lors des requêtes**.
   - Si chaque requête demandait une ressource au serveur, cela présenterait une charge importante pour ce dernier.
   - Pour cela, lorsque des fichiers ou requêtes ont déjà été reçus, le protocole `HTTP` les stocke en tant que fichiers cache et, s'il s'agit de ressources demandées déjà existantes, il les renvoie sans solliciter le serveur.
4. **Systèmes à couches** (Layered System): Le client n'adresse pas directement une requête au service. Le service doit préparer un serveur API pour les utilisateurs, et le client peut alors requérir des ressources (`Request`) et recevoir des réponses (`Response`) via le serveur `API`.
   - En général, ce que l'on appelle `Controller` dans `Spring` et `View` dans `Django` est la partie qui communique avec le client.
   - + En supplément, le `Serveur API` ne fait que réaliser la logique métier, et de plus, des fonctions additionnelles telles que l'authentification et le équilibrage de charge peuvent être mises en œuvre en front. 
5. **Code à la demande** (Code On Demand): Le client doit recevoir et exécuter les scripts du serveur comme une contrainte, bien que cela ne soit pas absolument nécessaire.
6. **Architecture Client-Serveur**: La partie possédant la ressource est le `Serveur`, et la partie effectuant la demande est le `Client`.
   - `Serveur`: Responsable de la fourniture d'`API`, du traitement de la logique métier, et du stockage
   - `Client`: Fait des requêtes d'informations nécessaires au serveur et est responsable, en outre, de la gestion de l'authentification des utilisateurs ou des sessions

# REST API

REST API désigne une interface implémentée de manière à ce que le client puisse envoyer des requêtes et utiliser celles-ci, basée sur l'architecture `REST` mentionnée plus haut.

Voyons un exemple d'`API` que j'avais implémenté dans mes projets !

<img width="250" alt="image" src="https://user-images.githubusercontent.com/59782504/155930373-280d5db5-6273-4384-a533-5cedbed5ea26.png">

Comme illustré ci-dessus, l'`API` doit spécifier l'URI de la requête, l'état des ressources reçues par l'URI (`JSON`), la `méthode de requête`, etc. Le développeur du client configure ce dernier de façon à ce que les données à l'intérieur du `JSON` ou `XML` soient convenablement montrées à l'utilisateur.

# RESTful

`RESTful` est un terme utilisé pour désigner un service web qui met en œuvre l'architecture `REST`. Si un service web a implémenté une `REST API`, alors ce service peut être appelé `RESTful`.

## Objectif

Il s'agit de concevoir une API intuitive et facile à utiliser pour tous.

# En conclusion
- Cette fois, nous avons exploré `REST`, `REST API`, et `RESTful`, qui sont des architectures largement utilisées sur le web.
- Si vous trouvez des explications incomplètes ou erronées, n'hésitez pas à me le signaler. Je m'efforcerai d'apporter des corrections immédiatement !

## Références
* [https://gmlwjd9405.github.io/2018/09/21/rest-and-restful.html](https://gmlwjd9405.github.io/2018/09/21/rest-and-restful.html)
* [https://developer.mozilla.org/ko/docs/Web/HTTP/Caching](https://developer.mozilla.org/ko/docs/Web/HTTP/Caching)
* [https://fr.wikipedia.org/wiki/REST](https://fr.wikipedia.org/wiki/REST)
* [https://blog.daum.net/hsyang112/7](https://blog.daum.net/hsyang112/7)