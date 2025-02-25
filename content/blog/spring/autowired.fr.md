---
title: Découvrons l'annotation Autowired
type: blog
date: 2022-02-24
comments: true
translated: true
---

La dernière fois, nous avons exploré le `DI` de `Spring`, n'est-ce pas ?

[Aller voir l'article sur "l'injection de dépendance"](/blog/spring/di)

Aujourd'hui, nous allons découvrir l'annotation `@Autowired` qui est étroitement liée au `DI`.

Tout d'abord, que ce soit un nom de méthode ou d'annotation, cela revêt un sens très important.

Autowired ? Quelle impression est-ce que ça vous donne ? Quelque chose comme "connecté automatiquement", non ?

Je ne sais pas exactement ce que c'est, mais voyons cela ensemble.

## `@Autowired?`

Cet outil indiquant qu'il est connecté automatiquement joue le rôle d'injecter des dépendances dans `Spring`. Il réalise effectivement ce que nous avons appris conceptuellement sur l'injection de dépendances.

![image](https://user-images.githubusercontent.com/59782504/155427654-874ed5fc-d108-4420-9eec-43f5b546565e.png)

Passons en revue la définition via le commentaire ci-dessus.

> Il est spécifié que c'est une annotation permettant d'utiliser automatiquement le `constructeur`, le `champ`, le `Setter` ou la méthode `Config` grâce à la fonctionnalité d'injection de dépendances de `Spring`.

Comme nous avons déjà expliqué la définition de l'injection de dépendance la dernière fois, je vais expliquer brièvement uniquement le rôle de `@Autowired`.

La dernière fois, j'ai expliqué qu'il fallait avoir une classe distincte qui utilise l'objet `Student` pour réaliser l'injection de dépendance.

Cependant, si nous créons et utilisons l'objet nous-mêmes, une autre dépendance pourrait survenir lors du processus d'injection, n'est-ce pas ?

Pour résoudre ce genre de problème, `@Autowired` élimine la nécessité d'utiliser le mot-clé `new`.

```java
class StudentService{
  @Autowired
  private StudentRepository studentRepository;
  
  // Méthode pour trouver un étudiant par son nom
  public Student findByStdName(String name){
    return studentRepository.findByName(name);
  }
}
```

Bien qu'il y ait beaucoup de choses étranges ici (`repository`, `findByName()` etc.), vous n'avez besoin de vous concentrer que sur deux d'entre elles :

1. Il existe un champ membre appelé `studentRepository`.
2. On appelle une fonction membre sans initialiser ce champ (`new` ou autre).

Ce sont les deux points importants.

En temps normal, appelleriez-vous une fonction membre comme `findByName()` sans initialiser le champ ? Vous devriez obtenir une erreur `NullPointer`.

`@Autowired` remplit le rôle de rechercher le constructeur approprié de la classe et fait `student = new StudentRepository()`.

Ainsi, aucune erreur ne se produit.

### `@Autowired` dans le constructeur

Tout à l'heure, la partie Autowired était un champ membre, n'est-ce pas ? On peut aussi Auto-wirer un constructeur, mais d'où peut-on injecter des dépendances ?
```java
@Service
class StudentService{

  private StudentRepository studentRepository;
  
  @Autowired
  public StudentService(StudentRepository studentRepository){
    this.studentRepository = studentRepository;
  }
}
```

C'est tout de suite dans la partie paramètres.

Le constructeur est appelé chaque fois que vous initialisez un objet. Mais imaginez si chaque création devait ressembler à `new StudentService(new StudentRepository())`, ce serait moche, non ?

`StudentService` est aussi un service, et le service possède également une annotation `@Bean`, donc vous ne pouvez pas le spécifier dans le constructeur si vous l'injectez depuis une autre classe... 😢

Dans ce cas, l'annotation `@Autowired` ci-dessus garantit que même si vous ne faites que `new StudentService()`, cela a le même effet que `new StudentService(new StudentRepository())`.

Cependant, il est important de noter que si vous définissez plusieurs constructeurs grâce à la surcharge, **le constructeur avec `@Autowired` doit être unique**. N'oubliez pas !

#### TIP: Omettre `@Autowired` dans le constructeur

S'il n'y a qu'un seul constructeur, vous pouvez omettre `@Autowired` car l'injection de dépendance doit de toute façon avoir lieu au moment de la création.

### `@Autowired` dans une méthode

Vous pourriez penser que le fonctionnement est similaire pour les méthodes, car le constructeur n'est aussi qu'une sorte de méthode. C'est à moitié vrai et à moitié faux.

Bien que l'application sur les paramètres soit similaire, rappelez-vous, le constructeur est appelé chaque fois qu'un objet est initialisé.

Mais pour les méthodes, c'est différent. Leur appel dépend du développeur, ce n'est pas obligatoire.

Avec `@Autowired` dans une méthode, si vous voulez supposer que la dépendance est accordée chaque fois que la méthode est appelée, vous devez indiquer dans l'attribut (`required=false`) que "La méthode n'est pas essentielle, mais il serait bien qu'elle soit injectée automatiquement."

> Comme ceci

```java
@Service
class StudentService{

  private StudentRepository studentRepository;
  
  // Méthode non essentielle mais où l'injection de dépendance est souhaitée
  @Autowired(required = false)
  public void setStudentRepository(StudentRepository studentRepository){
    this.studentRepository = studentRepository;
  }
}
```

## En conclusion
- Aujourd'hui, nous avons exploré les différentes utilisations de l'annotation `@Autowired` pour l'injection automatique de dépendances. À bientôt pour une autre session !
- Si vous trouvez des erreurs, n'hésitez pas à les signaler !!!