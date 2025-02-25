---
translated: true
title: Empêchons la perte de configurations selon les environnements
type: blog
date: 2025-01-03
comments: true
---
## Pourquoi est-il difficile de gérer les configurations ?
L'un des problèmes récurrents ressentis à chaque déploiement est celui des configurations.

Dans notre entreprise, nous utilisons Spring Boot et, pour gérer les différences de fichiers de configuration selon les environnements de déploiement, nous nous appuyons sur Spring Cloud Config.

En général, Spring utilise le fichier application.yml pour gérer les configurations, et le problème fondamental réside dans la synchronisation de ce fichier de configuration.

![image](/images/trouble-shooting/config-differ-check-1735855932407.png)

Dans notre entreprise, le déploiement s'effectue dans l'ordre suivant : dev, qa, stage et production, avec des fichiers de configuration distincts pour chaque environnement.

Le problème survient lorsqu'une configuration manque : un nouveau déploiement peut être nécessaire ou les modifications pourraient ne pas être appliquées en production si le fichier de configuration est incomplet.

## 1. Instaurer des revues de déploiement
![image](/images/trouble-shooting/config-differ-check-1735856331653.png)

Pour résoudre ce problème, la première idée fut de prévoir des créneaux de revue avant le déploiement.

Le problème est que cela consomme du temps pour tout le monde, et vu le coût élevé, nous avons opté pour une revue des parties liées à l'infrastructure ou aux configurations ajoutées avant la mise en production.

La vérification par plusieurs personnes permet de s'assurer qu'aucune configuration n'est oubliée, ce qui est efficace mais prolonge le temps de revue, car chaque ajout doit être examiné en détail.

## 2. Créer une action de comparaison des fichiers de configuration
La deuxième méthode, appliquée récemment, consiste à développer un bot de comparaison des fichiers de configuration.

Cependant, les outils de comparaison YAML disponibles sur le marché comparent toutes les valeurs, ce qui n'est pas idéal lorsque des valeurs diffèrent selon l'environnement.

Voici la méthode envisagée :

1. Lire les fichiers de configuration de chaque environnement et n'extraire que les clés.
2. Vérifier les différences de types, de clés inexistantes dans certains fichiers, ou les écarts d'index dans les tableaux.
3. Émettre un rapport en commentaire pour le PR de fusion de chaque branche d'environnement lorsqu'une modification est détectée.

Ainsi, on pense pouvoir suivre précisément les configurations manquantes par environnement.

### Conception
![image](/images/trouble-shooting/config-differ-check-1735857073333.png)

Bien que globalement clair, voici une vue d'ensemble de la structure.
[yaml-diff-reporter](https://github.com/YangTaeyoung/yaml-diff-reporter) est un outil CLI, développé pour parse et comparer deux fichiers de configuration YAML, pouvant exporter le rapport en console ou fichier.
> Un guide est fourni, si d'autres souhaitent l'utiliser pour le même type de problème. Le mode peut être spécifié pour un simple usage de comparaison de fichiers.

### Création de l'action
```yaml
name: Comparaison des fichiers de configuration

on:
  pull_request:
    branches: [ qa, stg, prod ]
```

Nous avons quatre environnements, comme mentionné. Les fusions se font habituellement dans dev pendant le développement, avec des PR pour 'qa', 'stg', et 'prod' uniquement lors des déploiements.

```yaml
jobs:
  config-check:
    permissions:
      contents: read
      pull-requests: write
      issues: write
env:
  MERGE_FROM: ${{ github.event.pull_request.base.ref == 'qa' && 'dev' || (github.event.pull_request.base.ref == 'stg' && 'qa' || 'stg') }}
  MERGE_TO: ${{ github.event.pull_request.base.ref }}
```
Nos serveurs étant dans un dépôt privé, nous avons donné l'autorisation au bot token de commenter les PR.
Selon l'environnement, les comparaisons se font entre dev et qa, ou qa et stg, de sorte que MERGE_FROM et MERGE_TO sont configurés pour comparer avec l'environnement précédemment déployé.

```yaml
runs-on: ubuntu-latest
steps:
  - name: Installation de Go
    uses: actions/setup-go@v5
    with:
      go-version: '1.23'
  - name: Installation du CLI yaml-diff-reporter
    run: go install github.com/YangTaeyoung/yaml-diff-reporter@v1.0.0
```
L'installation de Go se fait pour installer `yaml-diff-reporter`. Soit dit en passant, Go permet d'installer des CLI avec une simple commande.

```yaml
  - name: Téléchargement des fichiers de configuration
    uses: AcmeSoftwareLLC/github-downloader@v1
    with:
      git-pat: ${{ secrets.GH_TOKEN }}
      repo: # Dépôt Cloud Config 
      ref: # Branche du dépôt Cloud Config
      includes: |
        {chemin des fichiers application yaml}/${{ env.MERGE_FROM }}/application.yml:${{ env.MERGE_FROM }}.yml
        {chemin des fichiers application yaml}/${{ env.MERGE_TO }}/application.yml:${{ env.MERGE_TO }}.yml
```
Les fichiers sont téléchargeables depuis un chemin Github Repository déjà établi. Le choix du downloader est libre, celui-ci est pour l'exemple.

```yaml
  - name: Comparaison des fichiers de configuration
    id: compare
    run: |
      DIFF_RESULT=$(yaml-diff-reporter -l ${{ env.MERGE_FROM }}.yml -r ${{ env.MERGE_TO }}.yml \
      -la ${{ env.MERGE_FROM }} -ra ${{ env.MERGE_TO }} \
      -M type -M key -M index \ # Mode de comparaison sans considérer les valeurs
      -I  # Ignorer certaines clés
      -lang ko # Langue du rapport (supports ko/en uniquement)
      -f markdown) # Format du rapport (markdown, json, texte simple)

      echo "diff_result<<EOF" >> $GITHUB_OUTPUT
      echo "${DIFF_RESULT}" >> $GITHUB_OUTPUT
      echo "EOF" >> $GITHUB_OUTPUT
```

Les fichiers téléchargés sont comparés avec la CLI, le résultat étant stocké sous la variable `diff_result` pour le step actuel.
> L'usage d'EOF est dû au rapport en format multi-lignes.<br>
> Pour un rapport en ligne unique, on utiliserait `echo "diff_result=${DIFF_RESULT}"`.

```yaml
  - name: Rédaction du Commentaire PR avec le Résultat
    if: always()
    uses: thollander/actions-comment-pull-request@v3
    with:
      message: |
        # Résultat de la comparaison des fichiers de configuration
        ${{ steps.compare.outputs.diff_result == 'Aucune différence trouvée' && '![pass-badge](https://img.shields.io/badge/check-passed-green)' || '![fail-badge](https://img.shields.io/badge/check-failed-red)' }}

        ${{ steps.compare.outputs.diff_result }}

        ## Référence de Fichier
        - [${{ env.MERGE_FROM }}.yml](Chemin du fichier Github)
        - [${{ env.MERGE_TO }}.yml](Chemin du fichier Github)
        

  - name: Gestion des Échecs (si différences)
    if: steps.compare.outputs.diff_result != 'Aucune différence trouvée'
    run: exit 1
```

Un commentaire de PR est rédigé avec le résultat. Si ce dernier est négatif, l'action échoue et empêche la fusion de la PR.
Pour seulement publier le rapport, utiliser `${{ steps.compare.outputs.diff_result }}` suffit, mais j'ai ajouté une touche esthétique personnelle.

## Résultats
![image](/images/trouble-shooting/config-differ-check-1735858672464.png)

Bien que certaines informations soient masquées pour des raisons de confidentialité, on constate que le commentaire PR est clair et met en évidence les clés problématiques pour faciliter l'analyse.

## Inconvénients
Cette méthode a bien sûr ses limites. Elle ne compare que les clés nouvellement ajoutées et ne détecte pas les modifications ou suppressions de valeurs existantes, via une comparaison seulement sur la base de clés, types et index.

Comme il n'existe pas de solution miracle, nous réalisons chaque jour combien il est vital pour un développeur de persévérer, d'améliorer, et de rechercher sans cesse de meilleures solutions.
