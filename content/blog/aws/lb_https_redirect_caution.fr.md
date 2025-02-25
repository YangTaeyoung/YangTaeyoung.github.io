---
title: Si un 405 (Method Not Allowed) continue d'apparaître lors de l'utilisation d'AWS Load Balancer
type: blog
date: 2023-11-23
comments: true
translated: true
---

Dans le serveur API de l'entreprise, j'ai eu à créer une API liée aux webhooks, et j'ai donc créé un point de terminaison webhook pour recevoir des requêtes POST.

Cependant, bien que le serveur émetteur envoie clairement une requête sous forme de POST, les journaux du serveur récepteur affichaient un 405 (Method Not Allowed).

![image](/images/aws/lb_https_redirect_caution-1700742951722.png)

## Cause

Lors de l'utilisation d'AWS Load Balancer, il existe une fonctionnalité qui redirige les requêtes HTTP vers HTTPS.

![image](/images/aws/lb_https_redirect_caution-1700743047350.png)

Généralement, c'est configuré comme illustré ci-dessus. Dans ce cas, comme la redirection est effectuée avec un 301 (Moved Permanently), une requête POST envoyée par HTTP est convertie en requête GET lors de la redirection vers HTTPS.

Le serveur étant derrière le Load Balancer, il n'y a pas de point de terminaison pour recevoir les requêtes GET, d'où l'apparition du 405 (Method Not Allowed).

Voici comment cela se présente sous forme de diagramme.

![image](/images/aws/lb_https_redirect_caution-1700744557719.png)

### Principe de redirection
Une redirection classique survient lorsque le client (navigateur web, etc.) reçoit une réponse de redirection telle qu'un 301 (Moved Permanently) du serveur. Le client renvoie alors une nouvelle requête à l'adresse contenue dans l'en-tête Location de la réponse de redirection.

Dans le cas d'une redirection, les informations telles que la requête initiale, la méthode HTTP, etc., ne sont généralement pas conservées, entraînant ainsi une nouvelle requête GET et la perte du corps de la requête précédente.

## Méthode de résolution
La solution est très simple. Il suffit d'envoyer directement la requête en HTTPS pour éviter la redirection dès le départ.

La fonctionnalité fournie par le Load Balancer, comme dans ce cas, est utilisée pour rediriger les communications lors de l'échange de pages statiques (par exemple, une requête avec un content-type tel que `text/html`) via le protocole HTTPS. Alors pour un serveur REST API, il suffit de spécifier le `https` dans l'URL au lieu de `http` pour envoyer les requêtes.

### Référence
- [https://webstone.tistory.com/65](https://webstone.tistory.com/65)