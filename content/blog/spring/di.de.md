---
title: Lass uns über Dependency Injection (DI) sprechen
type: blog
date: 2022-02-24
comments: true
translated: true
---

In diesem Beitrag werden wir uns mit dem Konzept der Dependency Injection (DI) beschäftigen, einem der wichtigsten Konzepte im Spring Framework.

DI ist eines der entscheidenden Konzepte von Spring und kommt auch in Vorstellungsgesprächen häufig vor, daher ist es gut, es zu kennen.

Zuerst wollen wir uns mit der Abhängigkeit beschäftigen.

## Abhängigkeit

Wenn das Objekt A vom Objekt B abhängig ist, hat es eine enge Beziehung zur Komposition.

Schauen wir uns das einmal im Code an.

```java{filename=Korean.java}
class Korean {
    int score; // Fachnote
    string content; // Fachinhalt
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

In der Klasse `Student` wird die `Korean` Klasse, die die Punktzahl `score` und den Inhalt `content` des Faches enthält, eingebunden.
Man kann von einer Kompositionsbeziehung sprechen, aber man könnte auch sagen:

**"`Student` ist von `Korean` abhängig."**

Aber welches Problem könnte dadurch entstehen?

Was passiert, wenn `Korean` aus `Student` entfernt wird und `Math` hinzugefügt werden muss?

Leider müsste der Entwickler die Member-Variablen löschen und neue hinzufügen, wie unten gezeigt.

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
        // korean = new Korean();
        math = new Math();
    }
}
```

### Ist das nicht zu umständlich?
So etwas bringt Probleme mit sich. Jedes Mal müssten die Member-Variablen und der Konstruktor kommentiert, geändert und hinzugefügt werden, was zeitraubend sein kann.

### Abstrahierung durch Interface
Um es etwas einfacher zu machen, könnte man eine fachübergreifende Interface-Lösung anwenden. So könnte es aussehen:

```java{filename=Subject.java}
public interface Subject {
}
```

```java{filename=Korean.java}
class Korean implements Subject {
    int score; // Fachnote
    string content; // Fachinhalt
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

Es wird einfacher, da man nur eine Member-Variable deklarieren muss. Allerdings muss man im Konstruktor der `Student`-Klasse immer noch eine Klasse auswählen, die das `Subject` Interface implementiert. Es ist praktischer geworden, aber immer noch nicht optimal.

## Dependency Injection

Welche Lösungen gibt es, um das oben genannte Problem zu lösen? Man könnte den Konstruktor jedes Mal kommentieren, aber bei zukünftigen Wartungsarbeiten würde das den Entwickler mit zu vielen Problemen belasten. Es gäbe zu viele Dinge zu ändern.

Um das zu beheben, kam die Dependency Injection auf: eine Methode, Objekte von außen in den Konstruktor zu injizieren.

```java{filename=Student.java}
// Student.java
class Student{
    private Subject subject;
    
    public Student(Subject subject){
        this.subject = subject;
    }
}
```

```java
class SomeClass {
    // Dependency Injection
    Student student = new Student(new Korean());
}
```

Wie sieht es aus? Es ist eine einfache Implementierung, aber der Code wird dadurch viel klarer. Das Interface wird lediglich eingebracht, die eigentliche `Korean` Instanz wird extern irgendwo anders injiziert.

## Zusammenfassung
Dependency Injection funktioniert so, dass man eine Member-Variable über eine Interface-Variable deklariert und beim Gebrauch von außen Objekte einfügt, die dieses Interface implementieren.

## Fazit
In diesem Beitrag haben wir uns mit Dependency Injection auseinandergesetzt. In Zukunft werden wir betrachten, wie Dependency Injection praktisch im Spring Framework umgesetzt wird.