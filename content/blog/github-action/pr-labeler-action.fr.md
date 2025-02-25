---
title: Définir automatiquement des étiquettes en fonction des titres de PR(Pull Request) et d'issues sur Github
type: blog
date: 2024-05-27
comments: true
translated: true
---

En examinant le projet de l'entreprise, j'ai trouvé une action très utile à partager.

C'est une action qui définit automatiquement des étiquettes en fonction du titre des PR.

Habituellement, des étiquettes sont ajoutées aux issues ou PR de Github pour faciliter la classification, ce qui aide à suivre l'historique ou à filtrer plus facilement quels types d'issues ou de PR existent.
~~(Cela rend les issues ou les PR plus jolies aussi.)~~

Dans l'entreprise, ajouter des étiquettes manuellement à chaque fois peut entraîner des oublis ou des erreurs. Ci-dessous, je vais introduire l'action qui définit automatiquement les étiquettes selon le titre des PR et issues.

![image](/images/github_action/pr-labeler-action-1716800204381.png)

## Action PR Labeler
![image](/images/github_action/pr-labeler-action-1716800340299.png)

Pour ajouter des étiquettes automatiquement, nous allons utiliser [Auto Labeler](https://github.com/jimschubert/labeler-action).

Cette action est répertoriée sur le marché de Github et a pour fonction de définir automatiquement des étiquettes en fonction du titre des PR et issues.

La méthode d'utilisation est très simple.

Tout d'abord, créez `.github/workflow/labeler.yml` et rédigez-le comme suit. Le nom de fichier, le name, etc., peuvent être définis selon vos préférences.
```yaml{filename=".github/workflows/labeler.yml"}
name: Community
on:
  issues:
    types: [opened, edited, milestoned]
  pull_request_target:
    types: [opened]

jobs:

  labeler:
    runs-on: ubuntu-latest

    steps:
      - name: Check Labels
        id: labeler
        uses: jimschubert/labeler-action@v2
        with:
          GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
```

Comme il s'agit d'un fichier de workflow, lorsque vous le poussez, une action nommée `Community` est créée.

Ensuite, créez le fichier de configuration détaillé `.github/labeler.yml` et rédigez-le comme suit.
```yaml{filename=".github/labeler.yml"}
enable:
  issues: false
  prs: true

labels:
  'bug':
    include:
      - '\bfix\b'
  'enhancement':
    include:
      - '\bfeat\b'
  'documentation':
    include:
      - '\bdocs\b'
  'release':
    include:
      - '\brelease\b'
  'refactoring':
    include:
      - '\brefactor\b'
  'test':
    include:
      - '\btest\b'
```

Dans mon cas, pour ajouter des étiquettes uniquement aux PR, j'ai configuré `issues` dans `enable` à `false`.

Dans `labels`, le nom de l'étiquette et les conditions pour l'appliquer sont définis.

Comme vous pouvez le voir dans le fichier de configuration ci-dessus, des étiquettes telles que `bug`, `enhancement`, `documentation`, `release`, `refactoring`, `test` ont été définies.

Comme le titre par défaut du PR est généré à partir du message de commit, j'ai configuré les conventions des messages de commit de Github pour être directement capturées dans les étiquettes.

Ainsi, lorsque vous créez un PR ou une issue, vous pouvez voir que les étiquettes sont automatiquement définies.