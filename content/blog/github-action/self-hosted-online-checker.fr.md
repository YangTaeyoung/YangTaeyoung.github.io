---
title: Exécution alternative avec Github Runner en cas d'échec du Runner Auto-Hébergé (Github Actions)
type: blog
date: 2024-10-21
comments: true
translated: true
---

![Image](/images/github_action/self-hosted-online-checker-1729507848686.png)

Dernièrement, dans notre entreprise, nous avons décidé de passer de Jenkins CI/CD à Github Actions, et nous avons commencé à utiliser le Runner Auto-Hébergé.

## Qu'est-ce qu'un Runner Auto-Hébergé ?
Un [Runner Auto-Hébergé](https://docs.github.com/fr/actions/hosting-your-own-runners/managing-self-hosted-runners/adding-self-hosted-runners) signifie, comme son nom l'indique, un runner hébergé par l'utilisateur lui-même. Lors de l’exécution des Github Actions, au lieu d'utiliser les runners fournis par Github, on utilise une machine hébergée par l'utilisateur.

Puisque l'on utilise directement l'ordinateur de l'utilisateur, des problèmes dus à des contraintes environnementales ou à des caches peuvent survenir, mais il est plus rapide et (à l'exception de la facture d'électricité) il est gratuit par rapport au Github Runner.

### Pourquoi utiliser un Runner Auto-Hébergé

Le principal problème avec notre Jenkins était le temps nécessaire pour les tests. Bien que nous ayons réduit le temps de test de 30 minutes à environ 10 minutes en refactorant le code existant, l'introduction croissante du code de test et l'utilisation de [Testcontainer](https://testcontainers.com/) pour nos tests de repository ont inévitablement rallongé le temps d'exécution à 19 minutes.

Le problème est que ce processus de test est inclus non seulement lors de la création d'une PR mais aussi lors du déploiement, ce qui a également allongé le temps de déploiement à environ 30 minutes.

Pour résoudre ce problème, nous avons décidé d'utiliser un Runner Auto-Hébergé.

Il est facile d'utiliser les équipements existants de l'entreprise, et dans notre cas, nous utilisions des instances AWS EC2 pour Jenkins. Cependant, par rapport aux EC2, c'est moins cher (électricité) et les performances sont bien meilleures. (Et la configuration est également facile)
> Si l'entreprise ne dispose pas de matériel supplémentaire, ce serait une tout autre histoire. Notre entreprise avait des machines disponibles pour servir de runners, c’est pourquoi nous avons fait ce choix. En pratique, comparer le coût d'achat d'un ordinateur avec l'utilisation de runners à haute spécification fournis par Github doit être effectué d'abord.

Bien sûr, il existe un moyen d'utiliser un Runner Auto-Hébergé sur Jenkins, mais il y avait des contraintes telles que la nécessité de spécifier un nombre fixe de machines, nous avons donc opté pour Github Actions qui permet une évolutivité dynamique.

### Problème
Le problème est que le Runner Auto-Hébergé ne fonctionne pas toujours normalement. Bien sûr, cela peut également être le cas avec les Github Runners, mais comme il s'agit de machines gérées directement par l'entreprise, il arrive souvent que les machines tombent en panne en raison du vieillissement des câbles réseau, etc.

Chaque fois que cela se produit, c'est assez ennuyeux de devoir inspecter et relancer une machine dont on ignore l'état.
> Pour un Organization Runner, cela peut affecter non seulement le projet concerné mais tous les projets en général, amplifiant ainsi les pertes de temps et les délais d'attente.

Pour résoudre ce problème, nous avons envisagé une méthode de failover qui exécute les tâches avec un Github Runner quand le Runner Auto-Hébergé est hors-service.

## Problème
Le problème est que Github Actions ne propose pas officiellement la fonctionnalité permettant d'exécuter le Github Runner quand le Runner Auto-Hébergé est hors-service pour une raison quelconque.
> Il existe une fonction permettant de regrouper plusieurs runners pour une exécution simultanée, mais il s'agit simplement d'exécution simultanée, et si elle est utilisée abondamment, on devra payer pour les runners non utilisés. (Surtout, les basic runners prennent beaucoup de temps, donc cela peut coûter cher en termes de temps.)

## Solution
On dit qu’il faut faire avec les moyens du bord en cas de besoin. Nous avons donc eu l'idée de concevoir une action qui vérifie directement l'état du runner en amont puis effectue le routage.

Voici le flux :

![image](/images/github_action/self-hosted-online-checker-1729507068273.png)

`ubuntu-latest` désigne le Github Runner, et `self-hosted` désigne le Runner Auto-Hébergé.

La vérification de l'état est configurée pour se baser sur les informations de runner fournies par l'API de Github.

Voici comment cela se traduit en code :

```yaml
name: Route Runner

on:
  pull_request:
    branches: [ '*' ]

jobs:
  check_self_hosted:
    runs-on: ubuntu-latest
    outputs:
      found: ${{ steps.check.outputs.found }}
    steps:
      - name: Self-Hosted Runner is online?
        id: check
        uses: YangTaeyoung/self-hosted-runner-online-checker@v1.0.5
        with:
          runner-labels: 'self-hosted'
          GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}

  call_self_hosted_runner:
    name: Call self-hosted Runner runner for test
    if: ${{ success() && needs.check_self_hosted.outputs.found == 'success' }}
    needs: check_self_hosted
    uses: ./.github/workflows/test-ci.yml
    with:
      runner: self-hosted
   
  call_github_hosted_runner:
    name: Call Github Runner runner for test
    needs: check_self_hosted
    if: ${{ success() && needs.check_self_hosted.outputs.found == 'failure'}}
    uses: ./.github/workflows/test-ci.yml
    with:
      runner: ubuntu-latest
```

Étant donné que la logique d’exécution des tests est essentiellement la même pour les Runners Auto-Hébergés et Github, nous avons configuré un Workflow Réutilisable.

Dans le premier `job`, `check_self_hosted`, nous vérifions si le Runner Auto-Hébergé est en ligne et stockons le résultat dans la sortie `found` de ce `job`.

Ensuite, `call_self_hosted_runner` exécute le test avec le Runner Auto-Hébergé s'il est en ligne, sinon le teste est exécuté avec un Github Runner.

Cela permet d'exécuter le Github Runner comme alternative en cas de dysfonctionnement du Runner Auto-Hébergé.

![image](/images/github_action/self-hosted-online-checker-1729507626121.png)

![image](/images/github_action/self-hosted-online-checker-1729507642587.png)

## Conclusion
Nous avons exploré des méthodes pour exécuter à la place un Github Runner lors de catastrophes naturelles, de vieillissement des câbles ou de coupures de courant et quand les runners sont hors-service.

Bien sûr, les erreurs propres aux Runners sont inévitables, et cette action vérifie uniquement l'état en ligne. Cependant, une surveillance fondamentale du bon fonctionnement des runners et des mesures contre les pannes imprévues sont nécessaires.
> La raison pour laquelle on utilise un Runner Auto-Hébergé malgré ces coûts de gestion est probablement due à ses performances exceptionnelles et à son coût avantageux.