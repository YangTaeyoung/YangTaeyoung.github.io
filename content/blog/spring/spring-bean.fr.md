---
translated: true
title: Explorons les Spring Bean
type: blog
date: 2022-02-24
comments: true
---
Aujourd'hui, j'avais l'intention d'expliquer `Spring MVC`, mais avant cela, je vais d'abord vous présenter les connaissances de base que vous devez connaître pour comprendre MVC avec Spring.

## Qu'est-ce qu'un Spring Bean ?
Un `Spring Bean` est un objet géré par le `Spring Container`. Mais c'est étrange. Un objet géré par Spring ? Est-ce un objet défini dans la bibliothèque de Spring ?

La réponse est non. Bien qu'il puisse y avoir des objets définis comme `Bean` dans la bibliothèque, les objets que l'utilisateur écrit mais qui sont gérés par `Spring` sont ceux que nous définissons comme `Bean`. Initialement, l'utilisateur devait gérer les objets, mais lorsque le framework les gère, nous appelons cela une inversion de contrôle, `IOC`.

### Astuce

Bien que les étudiants ne le croient pas, Spring décrit ses objets et ses explications de manière très détaillée et précise. Bien sûr, vous pourriez consulter la documentation de Spring, mais vous pouvez également le faire directement dans le code. Regardons les objets définis par Spring, voulez-vous ?

![image](https://user-images.githubusercontent.com/59782504/155391935-40bfd711-b6bf-47c0-9041-38ab043cb462.png)

La photo ci-dessus est une capture de l'interface de l'annotation Bean de Spring. Vous voyez qu'il y a beaucoup de commentaires. Bien qu'il soit difficile à comprendre au premier abord, vous pouvez voir leurs efforts pour expliquer de manière à faciliter la compréhension à travers le code. Regardons comment ils définissent un Bean dès le départ, voulez-vous ?

![image](https://user-images.githubusercontent.com/59782504/155392187-882448f1-b28f-4756-b5f5-470954696387.png)

Cela signifie que "les méthodes avec cette annotation seront gérées comme un `Bean` par le `Spring Container`".

Voyons maintenant le résumé des commentaires plus bas ?

![image](https://user-images.githubusercontent.com/59782504/155393382-1a946d99-5d13-4f81-a312-a245039f2f60.png)

Il explique que "les méthodes marquées par ce commentaire fonctionnent de manière similaire aux objets définis dans <bean/> dans l'XML utilisé par Spring Lagacy", tout en fournissant des exemples de code ci-dessous.

### Enregistrement d'un Bean

```java
@Bean
public MyBean myBean() {
    // instancier et configurer l'objet MyBean
    return obj;
}
```

Cela montre que l'on peut enregistrer un `bean` en utilisant l'annotation `@Bean` devant la méthode `myBean`.

Il explique également la nomination d'un `Bean`, montrant qu'on peut assigner des alias en les passant en tant que paramètres, et même qu'un seul bean peut avoir plusieurs alias via un tableau.

### Nommage d'alias de Bean

```java
@Bean({"b1", "b2"}) // bean disponible comme 'b1' et 'b2', mais pas 'myBean'
public MyBean myBean() {
   // instancier et configurer l'objet MyBean
   return obj;
}
```

On peut voir dans le code ci-dessus que `@Bean({"b1", "b2"})` indique que le `Bean` sera géré sous les noms b1 et b2.

#### Pourquoi nommer des alias ?

Il y a plusieurs raisons possibles pour nommer des alias, mais la principale est d'éviter la collision de noms entre Spring Beans.

```java
@Bean
@Profile("production")
@Scope("prototype")
public MyBean myBean() {
   // instancier et configurer l'objet MyBean
   return obj;
} 
```

### Propriétés d'un Bean ?

![image](https://user-images.githubusercontent.com/59782504/155396490-29453e82-9160-416d-b053-8750373bc9ca.png)

Le commentaire ci-dessous explique que, à part les alias, le `Bean` n'offre aucune autre propriété. A titre d'exemple, ils mentionnent qu'ils n'offrent pas de propriétés comme `Scope`, `Lazy`, `DependsOn`, et `Primary`, qui doivent être utilisées avec des annotations comme `@Scope`, `@Lazy`, `@DependsOn`, `@Primary` pour fonctionner.
Comme plusieurs attributs sont mentionnés, permettez-moi de vous les expliquer :

#### `@Lazy`

Il existe de nombreux Beans à travers le monde, n'est-ce pas ? Mais parfois, un Bean peut appeler un autre Bean dans lui-même.

![image](https://user-images.githubusercontent.com/59782504/155397939-d440a56d-8dca-4443-aede-dead72bb6b47.png)

Supposons qu'il existe un Bean qui contient des informations étudiantes et qui possède des informations personnelles comme variables membres. Si les informations personnelles sont initialisées en même temps que l'objet est créé, d'autres pourraient facilement y avoir accès, n'est-ce pas ?

Tous les `Beans` suivent par défaut la politique `Eager`, ce qui signifie que les variables inclues sont initialisées en même temps que l'objet est créé. Cependant, un `Bean` annoté avec `@Lazy` n'est pas initialisé dès sa création, mais seulement lorsqu'il est référencé par un autre bean ou explicitement demandé par le `BeanFactory`.

`Bean Factory`: Un conteneur IOC chargé de créer les beans et de définir leurs relations de dépendance.

#### `@Scope`

Explorons maintenant la portée (`Scope`). 
L'annotation `@Scope` définit la portée du `Bean`.

![image](https://user-images.githubusercontent.com/59782504/155399798-b6dc7a08-fb47-40d6-ae3f-a9f5d0633193.png)

Il est expliqué ici que l'annotation `@Scope`, lorsqu'elle est utilisée avec l'annotation `@Component`, indique quelle portée doit être utilisée pour l'instance pourvue du type contenant le commentaire. Cependant, comme nous n'avons pas encore appris sur les `Component`, passons à autre chose pour le moment.

Si elle est utilisée comme une annotation au niveau des méthodes avec `@Bean`, elle indique quel nom de portée doit être utilisé pour l'instance retournée par la méthode.

Les `Beans` sont généralement maintenus sous forme de singleton, ce qui signifie qu'un seul objet est retourné, mais l'annotation `@Scope` permet de modifier cette portée. Il y a un article qui explique cela très bien, vous trouverez le lien ci-dessous (cet article a été utilisé pour référence).

`singleton` – Renvoie un seul bean par conteneur IoC.
`prototype` – Renvoie un nouveau bean à chaque demande.
`request` - Renvoie un bean unique par objet de requête HTTP.
`session` - Renvoie un bean unique par session HTTP.
`globalSession` - Renvoie un bean unique à toutes les sessions.

http://ojc.asia/bbs/board.php?bo_table=LecSpring&wr_id=498

#### `@DependsOn`

Cela signifie qu'il dépend d'autre chose, et c'est exactement cela dans ce contexte. Un `Bean` avec cette annotation sera assuré d'être créé après le `Bean` déclaré dans la valeur. Par exemple, dans `@DependsOn(value="myBean")`, le bean sera créé après `myBean`.

De même, quand le bean est détruit, il est assuré que `myBean` sera détruit avant lui.

#### `@Primary`

Quand vous utilisez le `component-scanning`, un bean annoté avec `@Primary` et `@Bean` sera injecté en priorité parmi les cibles du `component scan`.

Le `Component Scan` est très bien expliqué dans le blog suivant. En bref, au lieu d'enregistrer les classes configurées dans `@Configuration` une par une, vous pouvez les inscrire toutes d'un coup. `@Primary` désigne qu'il doit être le premier inscrit dans ce scan.

Le blog ci-dessous l'explique de manière très détaillée et exhaustive.

Component Scan: https://velog.io/@hyun-jii/%EC%8A%A4%ED%94%84%EB%A7%81-component-scan-%EA%B0%9C%EB%85%90-%EB%B0%8F-%EB%8F%99%EC%9E%91-%EA%B3%BC%EC%A0%95

## Conclusion
- Aujourd'hui, nous avons exploré des concepts autour des Spring Bean. J'espère que chacun a apprécié l'apprentissage du codage.
