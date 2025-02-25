---
title: Comment désigner automatiquement un assignee et un reviewer dans une PR (Pull Request)
type: blog
date: 2024-05-23
comments: true
translated: true
---

![image](/images/github_action/pr-auto-assign-assignee-reviewer-1716454592138.png)

Dans le développement en entreprise, il arrive que certaines petites tâches soient ennuyeuses.

Par exemple, il peut y avoir une règle selon laquelle il faut attribuer un label spécifique ou désigner un Assignee et un Reviewer lors de la création d'une PR. Ce sont des tâches apparemment simples mais fastidieuses et faciles à oublier...

C'était la même chose lorsque j'ai rejoint l'entreprise. Il était fastidieux de savoir quel label appliquer et quel Reviewer désigner.

## Action d'assignement automatique
En vérité, la fonctionnalité de Github ne permet pas d'automatiser ces tâches. Cependant, en utilisant les événements de Github Actions, on peut cibler l'ouverture d'une PR pour exécuter une action spécifique.

Il est toujours possible de développer l'action soi-même, mais il existe déjà des implémentations disponibles. Utiliser ces actions peut être pratique pour désigner un Assignee et un Reviewer.

Dans cet exemple, nous allons utiliser [Auto Assign Action](https://github.com/kentaro-m/auto-assign-action) disponible sur le marketplace de Github Actions.

![image](/images/github_action/pr-auto-assign-assignee-reviewer-1716454564478.png)

Selon les spécifications, vous pouvez désigner l'Assignee et le Reviewer par groupe.

Cela peut être utile si un dépôt est géré par plusieurs équipes.

Vous pouvez également définir les labels ou mots-clés à inclure ou ignorer. Ainsi, vous pouvez ignorer les PRs qui ne nécessitent pas Auto Assign Action (par exemple, les PR de release, les PR de test, etc.).

## Mode d'emploi
Pour utiliser cette action, vous devez préparer deux fichiers: un fichier yaml de configuration pour l'action et un fichier yaml pour le Workflow Github Action.

```yaml{filename=".github/auto_assign.yml"}
# Configuration automatique de l'affectation des Reviewers
addReviewers: true

# Définir l'Assignee comme l'auteur
addAssignees: author

# Liste des utilisateurs à ajouter comme Reviewers
reviewers:
  - YangTaeyoung # Mon nom
  - {Nom_Github_du_Colleague_1}
  - {Nom_Github_du_Colleague_2}
  - {Nom_Github_du_Colleague_3 ...}

# Nombre de Reviewers à ajouter
# Mettre à 0 pour ajouter tous les Reviewers du groupe (par défaut: 0)
numberOfReviewers: 0

# Ne pas ajouter de Reviewers si les mots-clés suivants sont présents dans la Pull Request
skipKeywords:
  - exclude-review # Configurer les mots-clés pour exclure les revues
```

En dehors de ces paramètres, vous pouvez aussi exploiter diverses conditions pour l'affectation automatique.

Le Workflow doit être configuré ainsi:

```yaml{filename=".github/workflows/auto_assign.yml"}
name: 'Assignation Automatique'
on:
  pull_request:
    types: [opened, ready_for_review]
    
jobs:
  add-reviews:
    runs-on: ubuntu-latest
    permissions: # Configuration des permissions
      contents: read
      pull-requests: write
    steps:
      - uses: kentaro-m/auto-assign-action@v2.0.0
        with:
          configuration-path: '.github/auto_assign.yml' # Nécessaire seulement si vous utilisez un autre fichier que .github/auto_assign.yml
```

Ici, `opened` signifie lorsque la PR est ouverte et `ready_for_review` lorsque la PR qui était à l'état de brouillon passe à l'état ouvert.

Une différence notable dans l'exemple du dépôt est dans `permission`. En cas d'affichage d'un avertissement "Warning: Resource not accessible by integration" lors de l'exécution de l'action, si vous configurez ces autorisations, l'avertissement disparaît et l'Assignee et le Reviewer sont attribués automatiquement. 
```yaml
    permissions: # Configuration des permissions
      contents: read
      pull-requests: write
```

Ajouter cette action peut provoquer de petits cris de joie de vos collègues. 😁

![image](/images/github_action/pr-auto-assign-assignee-reviewer-1716458343634.png)
