---
translated: true
title: Comprenons l'injection de dépendances (Dependency Injection, DI)
type: blog
date: 2022-02-24
comments: true
---
Dans cet article, nous allons aborder l'injection de dépendances (Dependency Injection : DI), l'un des concepts importants du Spring Framework.

DI est l'un des concepts très importants de Spring et c'est aussi un sujet fréquent lors des entretiens d'embauche, il est donc bon de le connaître.

Commençons par comprendre la notion de dépendance.

## Dépendance

Lorsqu'on dit que l'objet A dépend de l'objet B, cela est étroitement lié à une relation de composition.

Regardons un exemple de code.


```java{filename=Korean.java}
class Korean {
    int score; // Score de la matière
    string content; // Contenu de la matière
}
```

```java{filename=Student.java}
class Student {
    private Korean korean;
    public Student() {
        korean = new Korean();
    }
}
```

Dans l'exemple ci-dessus, la classe `Student` inclut la classe `Korean` qui contient le score `score` et le contenu `content` de la matière. Bien que l'on puisse appeler cela une relation de composition,

on peut aussi dire que **"`Student` dépend de `Korean`."**

Mais quel problème cela poserait-il ?

Que se passerait-il si `Korean` devait être retiré et remplacé par `Math` dans la classe `Student` ?

Malheureusement, le développeur devrait supprimer la variable membre et en ajouter une nouvelle, comme suit.

```java{filename=Math.java}
class Math {
    int score;
    string content;
}
```

```java{filename=Student.java}
class Student {
    // private Korean korean;
    private Math math;
    public Student() {
        //korean = new Korean();
        math = new Math();
    }
}
```

### N'est-ce pas trop inconfortable ?
Cela semble problématique. Perdre du temps à commenter, modifier et ajouter des variables membres dans le constructeur à chaque fois n'est pas idéal.

### Abstraction par interface
Pour simplifier le processus, il semble judicieux de créer une interface qui regroupe les matières.
Comme ceci.

```java{filename=Subject.java}
public interface Subject {
}
```

```java{filename=Korean.java}
class Korean implements Subject {
    int score; // Score de la matière
    string content; // Contenu de la matière
}
```

```java{filename=Math.java}
class Math implements Subject {
    int score;
    string content;
}
```

```java{filename=Student.java} 
class Student {
    private Subject subject;
    public Student(){
        subject = new Korean();
        // subject = new Math()
    }
}
```

En ne déclarant qu'une seule variable membre, cela devient un peu plus simple. 
Cependant, le constructeur de la classe `Student` doit toujours choisir une des classes qui implémentent l'interface `Subject`. C'est légèrement plus pratique, mais ça reste insuffisant.



## Injection de dépendances (Dependency Injection)

Quelle solution existe pour résoudre le problème évoqué ci-dessus ?
Voir les constructeurs commentés pourrait aider, mais en cas de maintenance nécessaire, cela alourdirait le travail du développeur. Les éléments à modifier seraient trop nombreux.

L'injection de dépendances résout ce problème. Elle consiste à injecter l'objet par le constructeur depuis l'extérieur.

```java{filename=Student.java}
// Student.java
class Student{
    private Subject subject;
    
    public Student(Subject subject){
        subject = subject;
    }
}
```

```java
class SomeClass {
    // Injection de dépendance
    Student student = new Student(new Korean());
}
```

Qu'en pensez-vous ? Bien que ce soit une implémentation très simple, le code en devient plus concis. L'interface est utilisée et le lieu où l'objet `Korean` est injecté est distinct.

## Résumé
Comme démontré, l'injection de dépendance déclare la variable membre via une interface et utilise un objet qui implémente l'interface injectée depuis l'extérieur.

## Conclusion
Dans cet article, nous avons exploré l'injection de dépendance. La prochaine fois, nous verrons comment l'injection de dépendance est réellement implémentée dans Spring.
