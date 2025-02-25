---
title: (JAVA) Mocking einer Methode innerhalb desselben Service in Spring
type: blog
date: 2024-05-30
comments: true
translated: true
---

In der Regel folgt Spring einer Schichtarchitektur, wobei die Geschäftslogik hauptsächlich im Service behandelt wird.

Je mehr Code im Service vorhanden ist, desto mehr ähnlicher Code gibt es. In solchen Fällen kann es sinnvoll sein, eine separate Schicht für gemeinsame Logik hinzuzufügen, aber oft wird die gemeinsame Methode im Service selbst deklariert und verwendet.

Sehen wir uns folgendes Beispiel an:
```java
@Service
public class SomeService {
    public void methodA() {
        // do something
    }

    public void methodB() {
        methodA();
        // do something
    }
    
    public void methodC() {
        methodA();
        // do something
    }
}
```

In dem obigen Code ist `methodA` eine Methode, die sowohl in `methodB` als auch in `methodC` verwendet wird.

Wenn man Testcode für `methodB()` schreiben muss, dann muss auch Testcode für `methodA()` geschrieben werden. Im schlimmsten Fall, so allgemein ist die **"gemeinsame"** Logik, muss beim Testen von `methodC()` ebenfalls die Logik von `methodA()` getestet werden.

Dies führt dazu, dass der Testcode redundanter wird, obwohl man versucht hat, die Duplizierung zu reduzieren.

## Mocking

Wenn Methoden von Objekten anderer Klassen verwendet werden, kann die Testmethode durch Mocking spezifiziert und der Testcode geschrieben werden. (Denn bei Mocking wird davon ausgegangen, dass die gemockten Methoden bereits getestet wurden, sodass innerhalb der Methoden keine weiteren Tests erforderlich sind.)

Doch Mocking ist nicht immer allmächtig, insbesondere bei Methoden innerhalb derselben Klasse.

Java generiert zur Unterstützung von Mocking Proxy-Objekte und verwendet sie, als wären sie reale Objekte. Es ist jedoch schwierig, die gleiche Klasse sowohl als Mock-Objekt als auch als reales Objekt zu verwenden.

In Sprachen außer Java kann das Testen von Methoden innerhalb derselben Klasse zu Duplizierungen führen, wie zuvor beschrieben.

In Python beispielsweise wird das Testen in solchen Fällen durch Monkey Patching unterstützt, indem einfach der Zeiger der Methode innerhalb derselben Klasse geändert wird.

In meiner früheren Entwicklungserfahrung mit Go haben wir manchmal dedizierte Zeiger für solche gemeinsamen Methoden deklariert und diese zur Testzeit injiziert oder die Logik in separate Schichten aufgeteilt, um Tests zu ermöglichen. (Solange die Schnittstellen unterschiedlich sind, ist Mocking in jeder Sprache kein großes Problem.)

In Java kann man in solchen Fällen Methoden innerhalb derselben Klasse mit `@Spy` mocken.

## `@Spy`

![image](/images/spring/same-class-method-test-1717083827711.png)

Zuerst sollten wir verstehen, was ein Spy-Objekt ist, bevor wir uns der Annotation zuwenden.

Überlegen Sie, was ein Spion tut. In einem Film tut er so, als wäre er auf einer Seite, verhält sich aber in bestimmten Situationen anders, was das Verständnis erleichtert.

**Ein Spy-Objekt kann in bestimmten Fällen auf echte Methoden des Objekts zugreifen und gleichzeitig andere Methoden verhalten sich anders.**

`@Spy` ist eine Annotation, die solche Spy-Objekte erzeugt.

Lassen Sie uns nun den obigen Code mit der `@Spy` Annotation testen.

Wenn Abhängigkeiten für Mocked-Objekte vorhanden sind, verwendet man normalerweise die `@Mock` Annotation für die zu mockenden Objekte und die `@InjectMocks` Annotation für das Objekt, das die Methoden testet.

Ein wichtiger Punkt ist, dass, wenn man sowohl `@Spy` als auch `@InjectMocks` zusammen verwendet, die `@Spy` Annotation vor der `@InjectMocks` Annotation deklariert werden muss.

```java
@Service
public class SomeService {
    @Mock
    SomeDependency someDependency;
    
    @Spy
    @InjectMocks
    SomeService someService;
}
```

Lassen Sie uns nun den Testcode für `methodA()` schreiben.
```java
    @Test
    void testMethodA() {
        // given
        doNothing().when(someService).methodA();
        
        // when
        someService.methodA();
        
        // then
        verify(someService, times(1)).methodA();
    }
```

Auf diese Weise kann man mit der `@Spy` Annotation auch Methoden innerhalb derselben Klasse mocken.

## Testcode bei der Trennung der gemeinsamen Logik-Schicht

Das Mocken von Methoden innerhalb derselben Klasse kann die Lesbarkeit des Testcodes beeinträchtigen. Persönlich denke ich, dass es in solchen Fällen besser ist, eine separate Schicht für die gemeinsame Logik zu verwenden.

Zum Beispiel könnte man `methodA()` in eine separate Klasse auslagern (in diesem Text als `SomeServiceSupport` bezeichnet) und diese Klasse dann in `SomeService` injizieren und verwenden.

```java{filename=SomeServiceSupport.java}
@Component
public class SomeServiceSupport {
    public void methodA() {
        // do something
    }
}
```

```java{filename=SomeService.java}
@Service
@RequiredArgsConstructor
public class SomeService {

    private final SomeServiceSupport someServiceSupport;
    
    public void methodB() {
        someServiceSupport.methodA();
        
        // do something
    }
    
    public void methodC() {
        someServiceSupport.methodA();
        
        // do something
    }
}
```

Durch diese Trennung ist es nicht mehr notwendig, Methoden innerhalb derselben Klasse zu mocken, was die Komplexität und die Abhängigkeiten der Methoden verringert.

```java
    @SpringBootTest
    class SomeServiceTest {
        
            @Mock
            SomeServiceSupport someServiceSupport;
            
            @InjectMocks
            SomeService someService;
            
            @Test
            void testMethodB() {
                // given
                doNothing().when(someServiceSupport).methodA();
                
                // when
                someService.methodB();
                
                // then
                verify(someServiceSupport, times(1)).methodA();
            }
            
            @Test
            void testMethodC() {
                // given
                doNothing().when(someServiceSupport).methodA();
                
                // when
                someService.methodC();
                
                // then
                verify(someServiceSupport, times(1)).methodA();
            }
    }
```

Der Testcode hat sich zwar nicht wesentlich geändert, aber auch ein anderer Entwickler kann leicht erkennen, dass die Schichten getrennt sind, um gemeinsame Logik zu handhaben. Dies ist vorteilhaft für die Wartung.