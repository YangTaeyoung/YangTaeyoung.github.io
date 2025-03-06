---
title: Utiliser l'IA pour traduire tous les articles sur Hugo (feat. Comment mon blog a commencé à supporter 5 langues)
type: blog
date: 2025-03-06
comments: true
translated: true
---

## Objectif

Avec les récents progrès de l'IA, j'ai commencé à utiliser Gemini dans mon travail. En voyant comment il gère si bien les données non structurées, je me suis souvenu des tâches laborieuses que j'avais faites auparavant.

Cela dit, j'ai quelque chose que j'ai ressenti comme un devoir depuis longtemps : la traduction de mon blog. J'avais entendu dire qu'après une traduction, le nombre de lecteurs d'un blog augmente considérablement. Autrefois, j'avais pensé utiliser l'API Google Translate pour traduire, mais j'ai cédé à la paresse et je l'ai laissé tomber.

Le domaine de la traduction par IA ayant considérablement amélioré sa qualité, j'ai décidé de profiter de cette occasion pour lancer un projet de traduction de tous mes articles. Cet article vise à présenter les raisons qui m'ont poussé à traduire mon blog, comment cela a été mis en œuvre et quelles fonctionnalités il offre.


### CLI ou service web ?
En fait, j'avais d'abord pensé à créer un service web. Il s'agirait d'une fonctionnalité permettant de télécharger un dossier pour recevoir automatiquement un fichier traduit.

Cependant, cela nécessiterait de maintenir un serveur séparé et de gérer les paramètres, ce qui présente de nombreux inconvénients.

Finalement, j'ai opté pour une interface en ligne de commande (CLI) car j'ai trouvé qu'elle était plus facile à mettre en œuvre en utilisant Golang (ayant déjà de l'expérience avec plusieurs mises en œuvre), et elle s'intègre facilement dans des environnements comme Github Actions, offrant de nombreux avantages.
> Un jour, je devrais aussi le lancer via Github Actions. (Je devrais peut-être le publier dans un dépôt d'archive...)

## Début du projet de traduction
J'ai donné un nom au projet de manière un peu aléatoire. Comme c'est un service qui traduit des blogs réalisés avec Hugo, je l'ai appelé [`hugo-ai-translator`](https://github.com/YangTaeyoung/hugo-ai-translator), mais en y réfléchissant maintenant, peut-être qu'un meilleur nom davantage lié à Go aurait été souhaitable… (Je pense à des noms comme hugo-trans, transify, etc., mais je trouve que le nom actuel est suffisamment clair.)
> Si vous avez des suggestions, faites-le moi savoir… Je suis toujours ouvert aux idées.

J'ai d'abord examiné la structure des dossiers de Hugo.

Bien que chaque structure de dossier soit différente, la plupart des blogs Hugo commencent par placer des fichiers `.md` dans un dossier nommé `content`.

La plupart ont une structure comme celle-ci :

```
/content
    /some
        index.md
    _index.md
```

Pour supporter le `multilingual`, la structure des dossiers doit évoluer comme suit :
> En fait, cela varie en fonction des thèmes. J'ai vérifié environ deux cas, donc si la structure de votre blog Hugo ne peut pas être englobée par les règles que je décrirai ci-dessous, j'espère que vous laisserez un commentaire.

### Cas 1. Inclure des locales dans le nom de fichier
Il y a des cas où l'on maintient la structure des dossiers d'origine tout en incluant la locale dans le nom de fichier. Dans ce cas, la structure sera la suivante :

```
/content
    /some
        index.md
        index.ko.md
        index.en.md
    _index.md
    _index.ko.md
    _index.en.md
```
### Cas 2. Séparer par dossier selon la locale
Il existe également des cas où les dossiers sont séparés selon la locale. Dans ce cas, la structure sera :

```
/content
    /ko
        /some
            index.md
        _index.md
    /en
        /some
            index.md
        _index.md
```

## Établir des règles

Il s'est avéré que partie prompt était plutôt facile (~~"Il suffit de demander 'Traduis ceci en anglais'"~~), mais le plus difficile était de définir comment effectuer la traduction automatique et comment enregistrer les fichiers traduits de manière conforme aux règles.

Premièrement, il fallait établir les règles concernant les fichiers qui allaient être enregistrés.

Que faut-il pour un fichier enregistré ?

J'ai transformé la structure d'arbre de fichiers que j'avais définie pour en faire une règle plus facile à gérer.
### Cas 1. Inclure des locales dans le nom de fichier
```
/content/some/index.md
/content/some/index.ko.md
/content/some/index.en.md
/content/_index.md
/content/_index.ko.md
/content/_index.en.md
```

### Cas 2. Séparer par dossier selon la locale
```
/content/ko/some/index.md
/content/en/some/index.md
/content/ko/_index.md
/content/en/_index.md
```

En les mettant en parallèle, il devient possible de constater une certaine régularité dans leurs éléments.

1. Tous commencent dans le dossier /content. -> en d'autres termes, le chemin du dossier /content doit être la référence.
2. Le code de langue doit y figurer. -> `ko`, `en`, etc.
3. Le nom de fichier doit y figurer. -> `index`, `_index`, etc.
4. Le contenu -> le chemin jusqu'au nom du fichier doit y figurer. -> `/some`, etc.

En me basant là-dessus, j'ai organisé les éléments nécessaires à créer des règles :
- {language}: code de langue
- {fileName}: nom de fichier
- {origin}: chemin depuis content jusqu'à avant le nom de fichier

Ce que j'ai fait par la suite, c'est définir une règle de `target_path_rule` basée sur ces règles.

Cela donne une idée de comment définir cela :
Dans le cas 1, cela donne:
```
{origin}/{fileName}.{language}.md --> /some/index.ko.md
```

Dans le cas 2, cela donne :
```
/{language}/{origin}/{fileName}.md --> /ko/some/index.md
```

## Problème de retraduction des fichiers déjà traduits

Lorsque j'ai réussi la première fois, j'ai ressenti une grande satisfaction, mais lorsque j'ai tenté de traduire une deuxième fois, cela tentait de retraduire des fichiers déjà traduits.  

Je ne ciblais que les fichiers .md, et il n'y avait pas de logique pour filtrer les fichiers déjà traduits.

**Comment filtrer les fichiers déjà traduits** est devenu le plus grand problème.

Je pouvais les définir dans `ignore_rules`, mais à chaque ajout d'une langue, devoir spécifier de telles règles deviendrait un véritable cauchemar.  

Je voulais simplement qu'un clic sur le CLI suffise à faire la traduction.

### Essai 1. Ajouter un fichier d'historique
J'ai d'abord pensé à créer un fichier `history.log` pour enregistrer les fichiers déjà traduits et les filtrer.

Lors du chargement initial de la configuration, je lisais `history.log` et le transformais en liste, tandis que je filtrais les fichiers candidats en fonction de cette liste.

Cela donnerait le schéma suivant :

![image](./hugo-ai-translator-1741274971017.png)

Cependant, cette méthode posait deux problèmes.

1. Si quelqu'un accédait depuis un autre ordinateur, le `history.log` ne serait pas là.
2. Le fait que le fichier log soit impliqué dans la logique métier était incommode.


### Essai 2. Enregistrer l'état de traduction dans le Front matter
Il existe le concept de Front matter dans Markdown. La plupart des articles de blog l'utilisent facilement.

Un exemple serait:
```markdown
---
title: "Hello World"
date: 2025-03-06
--- 

# Hello World ~
Hello Everyone! my first post!
```

Ici, `title`, `date`, etc. sont des éléments du Front matter. Ils peuvent être définis en toml, yaml, json, mais dans les blogs, la gestion par yaml front matter est plus pratique et donc plus courante.

L'idée était de consigner l'état de traduction dans le Front matter de la manière suivante :
```markdown
---
title: "Hello World"
date: 2025-03-06
translated: true
---
```

De cette façon, lorsque le fichier est lu, il suffit de lire le Front matter et de ne filtrer que les fichiers dont `translated` est true, ce qui est vraiment adapté pour un clic.  

Cela s'exprime ainsi dans un schéma :

![image](./hugo-ai-translator-1741275557807.png)

Cette méthode est non seulement beaucoup plus propre que l'utilisation de `history.log`, mais également parce que les fichiers traduits sont gérés par Git, l'avantage est que même si l'on accède depuis un autre ordinateur, ils pourront être filtrés.

## Problème de qualité de traduction

Bien que j'ai résolu le problème de filtrage des fichiers déjà traduits, le problème de qualité de traduction demeurait.

Au départ, lors du choix du modèle, j'ai pensé que le gpt-3.5-turbo serait le moins cher, mais tandis que la traduction en anglais était assez bonne, pour des langues comme le japonais ou le chinois, la qualité était presque née.

Pensant que cela venait peut-être du prompt, j'ai même ajouté des phrases telles que :

**"Traduis-le mieux, s'il te plaît"**

Le résultat restait le même.

Au début, j'avais envisagé d'ajouter un "esclave AI" pour évaluer la qualité en l'agentifiant comme ça mais (https://github.com/YangTaeyoung/hugo-ai-translator/issues/1), le problème a été résolu en passant au modèle `GPT-4o`.
> On m'avait déjà dit auparavant de réfléchir à ce qui pourrait être un manque de financement si les problèmes persistaient.

Au final, le modèle gpt-4o-mini était suffisant pour des traductions de qualité.

## Problème de codage de blocs
En traduisant en Markdown, il y avait un bug où des caractères de blocs de code étaient inclus dans la sortie.
Ex : ` ```markdown ``` `

Au début, j'ai essayé de les enlever manuellement.  
```go
content := res.Choices[0].Message.Content
content = strings.Trim(content, " ")
content = strings.TrimPrefix(content, "```
")
content = strings.TrimPrefix(content, "```markdown\n")
content = strings.TrimSuffix(content, "\n")
content = strings.Trim(content, "```")
```

Cependant, il y avait des cas où cela ne fonctionnait pas parfaitement, et j'ai demandé à des amis, ils m'ont dit qu'en utilisant un schéma, je pourrais formater de manière uniforme, donc j'ai directement appliqué cette méthode et cela a fonctionné.

J'ai ainsi écrit une fonction pour créer le schéma comme suit :
```go
package translator

import "github.com/invopop/jsonschema"

type TranslateResponse struct {
    Markdown string `json:"markdown" jsonschema_description:"translated result"}`
}

func GenerateSchema[T any]() interface{} {
    reflector := jsonschema.Reflector{
        AllowAdditionalProperties: false,
        DoNotReference:            true,
    }
    var v T
    schema := reflector.Reflect(v)
    return schema
}

var TranslateMarkdownSchema = GenerateSchema[TranslateResponse]
```

Et il suffit d'appeler cela comme suit :
```go
schemaParam := openai.ResponseFormatJSONSchemaJSONSchemaParam{
    Name:        openai.F("markdown"),
    Description: openai.F("translated markdown"),
    Schema:      openai.F(TranslateMarkdownSchema()),
    Strict:      openai.Bool(true),
}

res, err = t.client.Chat.Completions.New(gctx, openai.ChatCompletionNewParams{
    // ...
    ResponseFormat: openai.F[openai.ChatCompletionNewParamsResponseFormatUnion] (
            openai.ResponseFormatJSONSchemaParam{
            Type:       openai.F(openai.ResponseFormatJSONSchemaTypeJSONSchema),
            JSONSchema: openai.F(schemaParam), // ici
        }),
    Model: openai.F(t.cfg.Model),
})
```

## Comment utiliser

Après beaucoup de péripéties, 

En fait, je me suis demandé si je devais détailler la méthode d'utilisation, mais je pense qu'il est préférable de transmettre rapidement les points clés et de se référer à  [README.md du dépôt](https://github.com/YangTaeyoung/hugo-ai-translator) pour plus de détails.

En conclusion, mes fichiers `.md` plein de détails apparaissent maintenant dans une structure de dossiers élégante comme ça :

![image](./hugo-ai-translator-1741276057201.png)


### Démarrage rapide
Le fichier de configuration est sauvegardé dans `~/.hugo-ai-translator/config.yaml`.

```yaml
openai:
    model: gpt-4o-mini
    api_key: {your-openai-api-key}
translator:
    content_dir: {content-dir-path} # ex. ~/dev/personal/YangTaeyoung.github.io/content
    source:
        source_language: ko
        ignore_rules: []
    target:
        target_languages:
            - en
            - ja
            - fr
            - de
        target_path_rule: '{origin}/{fileName}.{language}.md'
```

Est-ce que vous devez comprendre cette structure? Je pensais fournir une commande de type AWS CLI qui permettrait deconfigurer facilement.

Vous pouvez utiliser la commande suivante pour un réglage simple :
```shell
hugo-ai-translator configure
```

Si vos règles de fichier sont les mêmes que les miennes, (si c'est [le cas 1](#cas-1-inclure-des-locales-dans-le-nom-de-fichier)), il suffit de remplacer `{your-openai-api-key}` par votre clé API OpenAI et de configurer seulement `content_dir`, puis cela pourra être exécuté immédiatement.

### Cliquez !
Une fois que votre fichier de configuration est complet, cliquez dessus :
```shell
hugo-ai-translator
```


## Problèmes restants
Ce projet n'est pas encore terminé.

### 1. Problèmes de performance

Lorsque je lance la traduction, cela ralentit énormément. Au départ, j'ai essayé de faire tout cela dans des goroutines, mais cela a dépassé la limite de taux de l'API OpenAI ; maintenant, j'alloue des goroutines uniquement par unité de langue.  

[Je considère actuellement d'utiliser un pool de travailleurs ou de directement gérer la limite de taux avec le paquet rate.](https://github.com/YangTaeyoung/hugo-ai-translator/issues/13) (retrier est également une option).

### 2. [Cas 2](#cas-2-séparer-par-dossier-selon-la-locale) non inclus
Le cas 2 n'est pas encore inclus, car la langue source est incluse dans le chemin. La mise en œuvre actuelle suppose des chemins qui n'incluent pas la langue source.

Il est donc difficile d'indiquer qu'un code de langue source est d'origine s'il est présent au milieu.

Je vais peut-être préparer un chemin préventif conforme à `target-path-rule` avant de déduire le fichier candidat pour indiquer qu'il s'agit d'un original si ce chemin y est inclus.

### 3. Copier des fichiers statiques
Cela fait également partie du problème du cas 2, où il existe des cas où des fichiers statiques doivent être copiés 
Exemple :
```
/static
    /ko
        /some
            index.md
            image.png
```

Dans ce cas, même si j'ai traduit le md et l'ai enregistré selon la règle, les fichiers d'images ne sont pas déplacés.  

Je pense ajouter une option `static_copy` pour choisir si les fichiers statiques doivent être copiés.

## Références
- [OpenAI](https://openai.com)
- [Open AI Models](https://platform.openai.com/docs/models)