---
title: Erfahren wir mehr über die Autowired-Annotation
type: blog
date: 2022-02-24
comments: true
translated: true
---
Beim letzten Mal haben wir uns mit `DI` in `Spring` beschäftigt.

["Gehe zum Beitrag über Dependency Injection"](/blog/spring/di)

Heute wollen wir uns mit der Annotation `@Autowired` befassen, die eng mit `DI` verbunden ist.

Zunächst einmal ist der Name einer Methode oder Annotation sehr wichtig.

Autowired? Was kommt einem in den Sinn? "Automatisch verbunden", oder?

Was auch immer das bedeutet, schauen wir es uns an.

## `@Autowired?`

Dieser Freund, der "automatisch verbunden" bedeutet, ist dafür verantwortlich, Abhängigkeiten in `Spring` zu injizieren. Man könnte sagen, dass er das Konzept der Dependency Injection tatsächlich umsetzt.

![image](https://user-images.githubusercontent.com/59782504/155427654-874ed5fc-d108-4420-9eec-43f5b546565e.png)

Über den obigen Kommentar können wir die Definition überprüfen.

> Es wird als Annotation angegeben, damit `Konstruktoren`, `Felder`, `Setter-Methoden` oder `Config-Methoden` automatisch durch die Dependency Injection-Funktion von `Spring` verwendet werden können, richtig?

Da wir beim letzten Mal die Definition von Dependency Injection besprochen haben, werde ich die Rolle von `@Autowired` nur kurz erklären.

Beim letzten Mal habe ich erklärt, dass eine separate Klasse, die das `Student`-Objekt verwendet, erforderlich ist, um Dependency Injection durchzuführen.

Wenn wir jedoch dieses Objekt selbst erstellen und verwenden, könnten während des Injektionsprozesses weitere Abhängigkeiten entstehen.

Um solche Probleme zu lösen, sorgt `@Autowired` dafür, dass das `new`-Schlüsselwort nicht mehr benötigt wird.

```java
class StudentService{
  @Autowired
  private StudentRepository studentRepository;
  
  // Methode zum Finden eines Studenten nach seinem Namen
  public Student findByStdName(string name){
    return studentRepository.findByName(name);
  }
}
```

Obwohl viele seltsame Dinge wie `repository`, `findByName()` usw. auftauchen, sollten Sie sich hier auf zwei Dinge konzentrieren:

1. Es existiert eine Member-Variable namens `studentRepository`.
2. Diese Member-Variable wird nicht initialisiert (es wird kein `new` oder ähnliches Schlüsselwort verwendet), jedoch wird eine Member-Funktion aufgerufen.

Das sind die beiden Punkte.

Normalerweise sollte beim Aufruf der Memberfunktion `findByName()` ohne Initialisierung ein `NullPointer`-Fehler ausgegeben werden.

`@Autowired` übernimmt jedoch die Rolle, einen geeigneten Konstruktor für diese Klasse zu finden und `student = new StudentRepository()` auszuführen.

Daher tritt kein Fehler auf.

### `@Autowired` im Konstruktor

Vorhin war der Teil, der Autowired wurde, eine Member-Variable, richtig? Aber ein Konstruktor kann ebenfalls mit `Autowired` versehen werden. Wo kann Abhängigkeit injiziert werden?

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

Das betrifft direkt den Parameterbereich.

Der Konstruktor wird beim Initialisieren eines Objekts aufgerufen. Aber es wäre unschön, jedes Mal Code wie `new StudentService(new StudentRepository())` zu schreiben, nicht wahr?

`StudentService` ist ebenfalls ein Service und hat daher, wie alle Services, die `@Bean`-Annotation. Wenn also Abhängigkeit aus einer anderen Klasse injiziert wird, kann dies nicht im Konstruktor angegeben werden... :sob:

In diesem Fall bewirkt die obige `@Autowired`-Annotation, dass ein Aufruf von `new StudentService()` den gleichen Effekt wie `new StudentService(new StudentRepository())` hat.

Es gibt jedoch eine wichtige Sache, die man beachten sollte: Wenn man mehrere Konstruktoren mit Overloading definiert hat, darf **nur ein Konstruktor `@Autowired` haben!** Merken Sie sich das.

#### TIPP: Auslassung von `@Autowired` im Konstruktor
Wenn es nur einen Konstruktor gibt, kann die Annotation weggelassen werden, da bei der Erstellung sowieso Dependency Injection erfolgen muss.

### `@Autowired` in Methoden

Wenn Sie denken, dass das Gleiche auch für Methoden gilt, weil der Konstruktor ebenfalls eine Methode ist, haben Sie teils Recht und teils Unrecht.

Zwar wird der Parameter ähnlich angewendet, aber ich habe bereits erwähnt, dass Konstruktoren beim Initialisieren eines Objekts aufgerufen werden.

Methoden hingegen sind anders. Der Aufruf hängt vom Entwickler ab, es ist nicht verpflichtend.

Wenn Sie den Fall abdecken möchten, dass die Abhängigkeit bei jedem Aufruf durch `@Autowired` der Methode injiziert wird,

sollten Sie kennzeichnen, dass "die Methode nicht zwingend erforderlich ist, aber **automatisch injiziert werden sollte**", indem Sie die Eigenschaft `required=false` einstellen.
> So wie unten

```java
@Service
class StudentService{

  private StudentRepository studentRepository;
  
  // Wenn eine Methode nicht unbedingt erforderlich ist, aber Abhängigkeit injizieren sollte
  @Autowired(required = false)
  public setStudentRepository(StudentRepository studentRepository){
    this.studentRepository = studentRepository;
  }
}
```

## Zum Abschluss
- Heute haben wir uns mit den verschiedenen Verwendungen der `@Autowired`-Annotation zur automatischen Dependency Injection beschäftigt. Bis zum nächsten Mal!
- Falls etwas falsch ist, lassen Sie es mich bitte wissen!