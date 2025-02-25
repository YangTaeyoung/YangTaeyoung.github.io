---
layout: post
title: Quand un développeur junior commence avec les conventions de codage
date: 2024-05-20
comments: true
translated: true
---

![image](/images/code_guide/convention-1716212794001.png)


Lorsque je suis entré dans ma première entreprise, j'avais beaucoup de frustrations. Surtout en voyant des codes avec des `if` et des `for` imbriqués, des noms de variables étranges, etc.

Bien sûr, en travaillant, on peut facilement attribuer ces problèmes à un manque de compétences personnelles, mais plus l'expérience s'accumule, plus on découvre que des solutions rapides, des projets s'écartant de la conception initiale, etc., conduisent souvent à un code désordonné même en développant.

Les conventions de codage lors de la collaboration aident dans ces situations car elles permettent d'améliorer considérablement la qualité du code en peu de temps grâce à des directives rigoureuses. (Surtout si une culture de revue de code existe, elle peut s'installer de manière positive.)

Dans cet article, je vais partager mes réflexions sur ce qu'il faut considérer lors de l'introduction d'une convention de codage à travers une expérience courte, et comment un développeur junior peut proposer et appliquer une convention de codage dans une entreprise.

## Pourquoi les conventions de codage sont-elles nécessaires?
Les conventions de codage **prennent tout leur sens lorsque l'on travaille à deux au moins**.

Dans un développement en solo, on est responsable de chaque partie et avec ses propres règles, on n'a pas vraiment besoin d'une convention de codage.

Cependant, pour des développements à deux personnes ou plus, ou pour des projets en cours avec plusieurs développeurs, les différents styles de code des participants peuvent devenir une source de confusion.

Les conventions de codage imposent des règles directement au code et peuvent maintenir la qualité du code au-dessus d'un certain niveau minimum. Plus les participants en sont familiers, plus le code semble écrit par une seule personne, garantissant cohérence et prévisibilité.

Cependant, du fait qu'elles imposent des règles au code, il est nécessaire de convaincre les membres de l'équipe et d'expliquer pourquoi elles sont nécessaires. Cet article décrira comment j'ai abordé ces questions.

## Obstacles lors de l'adoption de conventions de codage
Tout le monde ne travaille pas dans de grandes entreprises. Même dans les startups ou les entreprises de taille moyenne, il est rare de voir des développements menés avec des conventions de codage systématiques. Voici pourquoi cela est difficile :

### 1. Les startups initiales ne veulent pas forcément
Pour une startup n'ayant pas encore généré de revenus, élaborer et maintenir des conventions de codage est souvent perçu comme une question de coût.

Je suis en partie d'accord avec cela. Même si des documents de conventions de codage existent, si la gestion de ces conventions est négligée lors de la mise à jour de versions de langage ou de l'introduction de nouveaux outils, leur utilité s'estompera.

Les startups pensent souvent qu'une ligne de code et une fonctionnalité sont plus importantes que la création de tels documents. À cause du coût élevé de gestion des conventions, il y a certaines restrictions à considérer.

Par exemple, lorsqu'une entreprise utilisant JSP passe à Spring, la réécriture des documents de convention peut entraîner des coûts élevés. Si des conventions de codage ont accompagné ces changements, les frais supplémentaires augmentent inévitablement.

Cependant, même pour les startups initiales, à mesure qu'elles grandissent et embauchent plus de développeurs, divers styles personnels peuvent se mélanger dans le code. Un code de ce type devient difficile à maintenir et même des noms simples comme "create" ou "get" peuvent devenir opaques quant à leurs intentions.

Lorsque cela persiste longtemps, ou lorsque les responsables de la maintenance quittent l'entreprise, la difficulté de maintenance peut grandement augmenter. Dans ces cas, il est bon d'introduire certaines conventions obligatoires même pour une startup initiale.


### 2. Les conventions doivent être acceptées par tous
En tant que développeur junior, j'ai réalisé que même si une méthode pouvait me plaire, si les autres ne l'appréciaient pas, il était difficile de la transformer en convention de codage.

Même si l'on passe des nuits à créer une convention, si les développeurs ne l'adoptent pas, cela n'a servi qu'à dépenser des forces.

Ainsi, dès la naissance des conventions, une concertation avec les collègues développeurs est nécessaire et il est important de les convaincre de leur utilité.

Voici un exemple de mon expérience de convaincu des conventions de codage.

J'ai failli effacer toutes les données étiquetées en oubliant d'appliquer des filtrages dans le Service Layer au niveau du Repository. _(Bien sûr, ce n’était pas en production.)_

J'ai ensuite proposé d'ajouter des validations pour éviter les modifications ou suppressions sans condition dans le Repository, mais ces oppositions ont émergé :
1. N'est-ce pas un coût supplémentaire d'implémenter ces validations ?
   - C'était vrai. Ajouter des validations dans tous les niveaux de données augmenterait le temps de développement et de test.
2. Le Repository ne gère-t-il pas le business logic si nous ajoutons des validations ?
   - Initialement, nous avons défini que le Repository Layer ne doit pas gérer de logique métier sauf pour des cas spécifiques. Cependant, ajouter des validations signifie qu'il gère une partie du business logic. Certains ont même suggéré que cette logique devrait être dans le Service Layer.

Après ces remarques, la portée des validations fut limitée aux données essentielles, et cette proposition de convention de codage fut acceptée.

### 3. Les conventions doivent être maintenues
Une fois les conventions établies, il faut les maintenir. Plus elles sont détaillées, plus les contenus deviennent précis, mais elles doivent être réévaluées chaque fois que des avancées technologiques ou des réformes sont faites. Ceci est une tâche pénible pour l'entreprise, l'équipe et le responsable des conventions.

Des ressources dédiées sont nécessaires pour les maintenir et il faut délibérer soigneusement sur leur portée et leurs contenus.

## Pourquoi les conventions restent indispensables
Malgré tout, des conventions de codage bien définies stimulent la performance du développement.

Leur rigueur permet de guider même les nouveaux juniors après un premier retour de code sévère(?), leur indiquant comment coder.

Des conventions bien faites permettent une rédaction de code efficace, favorisant une communauté où le code est maitrisé par tous.

Grâce aux conventions, même si un développeur est en congé ou quitte l'entreprise, il est possible de modifier rapidement un code source de bug. Une simple convention permet de prévoir la fonction d'un code à elle seule.

## Introduction des conventions de codage
Pour mettre en œuvre des conventions, voici quelques astuces utiles.

### Chercher des conventions références
S'inspirer de conventions de référence telles que celles de Google ou d'Airbnb pour rédiger un document adapté à l'entreprise.

Étant développeur backend, j'avais basé nos conventions sur [les conventions de nommage de méthode de Google Cloud](https://cloud.google.com/apis/design/naming_convention?hl=ko#method_names). 
> Une fois la référence trouvée, il devient plus facile de convaincre le reste de l'équipe. Si même des géants de la tech comme Google conforment leurs codes à ces normes, pourquoi ne pas le faire aussi?

### Utiliser les Discussions Github
GitHub Discussions est une fonctionnalité communautaire. J'ai proposé des conventions à travers cette fonction et, via des débats et des votes, avons obtenu un consensus de conventions. Différentes propositions ont été examinées à l'aide de votes, commentaires et étiquettes.

![image](/images/code_guide/convention-1716212280924.png)
> Exemple de discussion

Petit inconvénient, la discussion est liée au repo, mais l'Organisation Discussion est utilisée pour l'ensemble de l'organisation et peut servir à cet effet.

### Utiliser la revue de code
La revue de code est un autre canal pour concevoir des conventions de codage. Parmi les conventions apparues en examen de code, on trouve :
1. Utiliser le pattern Early Return
2. Ajouter une ligne après une déclaration de variable
3. Mettre des commentaires pour les appels de données au-delà de trois fois dans un layer
4. Passer via DTO lors de la transmission inter-layer

D'autres conventions ont intégré nos projets grâce à la revue de code.

### Ne pas désespérer après un rejet
Même si votre suggestion est rejetée, ce n'est pas la fin du monde.

Des problèmes liés à des conventions refusées peuvent ressurgir, entraînant leur révision ou au moins la recherche de meilleures solutions.

Ainsi, ne désespérez jamais suite à un rejet. Retrouvez des moyens variés pour poursuivre l'effort.

Dans le cas où, après rejet, le problème ne survient plus, cela signifie souvent que cette convention aurait été excessive et aurait entravé la productivité de l'équipe.

Les conventions de codage sont contraignantes mais efficaces ou nuisibles selon leurs applications.

### Se rappeler que les conventions sont coûteuses
En conclusion, les conventions devraient toujours être l'option ultime.

Pour toutes les raisons abordées, elles sont coûteuses. Pourtant, des outils automatiques, des outils de développement, des linters, des formateurs peuvent résoudre le problème plus efficacement. Il faut envisager ces solutions premières si possible.