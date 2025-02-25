---
title: (JAVA) Mocking des méthodes dans le même service Spring
type: blog
date: 2024-05-30
comments: true
translated: true
---

Généralement, Spring suit une architecture en couches, où le service gère principalement la logique métier. 

Plus il y a de code dans le service, plus il y a de chances qu'il y ait du code similaire. Dans certains cas, on peut choisir d'ajouter une couche séparée pour gérer la logique commune, mais souvent, on déclare et traite ces méthodes communes au sein du même service.

Par exemple, considérons le code suivant :
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

Dans le code ci-dessus, `methodA` est une méthode utilisée de manière commune dans `methodB` et `methodC`.

Si vous devez écrire du code de test pour `methodB()`, vous devrez également écrire du code de test pour `methodA()`. Dans le pire des cas, vous pourriez également avoir à tester la logique de `methodA()` même lorsque vous testez `methodC()`.

Alors même que nous essayons de réduire la duplication, la situation peut conduire à plus de duplication dans le code de test.

## Mocking

Lorsque vous utilisez une méthode d'un objet d'une autre classe, vous pouvez spécifier le comportement simulé de la méthode via le mocking, et écrire du code de test. (Car on suppose que la méthode simulée a déjà été testée, rendant tout test supplémentaire de cette méthode inutile.)

Cependant, le mocking n'est pas une panacée, surtout pour les méthodes de la même classe.

En effet, généralement en Java, un objet proxy est créé pour le mocking, et cet objet proxy est utilisé comme s'il s'agissait de l'objet réel. Cependant, utiliser la même classe à la fois comme un objet simulé et comme un objet réel est une tâche difficile.

Dans la plupart des langages de programmation, à l'exception de Java, tester des méthodes dans la même classe peut conduire à de la duplication, comme mentionné précédemment.

En Python, par exemple, on peut modifier le pointeur de la méthode elle-même pour effectuer des tests, via le Monkey Patching.

Lorsque je développais en Go, j'ai utilisé une méthode où je déclarais les pointeurs des méthodes communes séparément et les injectais lors des tests, ou je séparais la logique commune dans une couche nécessitant des tests, comme déjà évoqué. (Si les interfaces sont différentes, le mocking n'est pas compliqué dans tout langage.)

En Java, pour ces cas particuliers, nous pouvons utiliser `@Spy` pour simuler des méthodes dans la même classe.

## `@Spy`
![image](/images/spring/same-class-method-test-1717083827711.png)

Tout d'abord, explorons ce qu'est un objet Spy avant d'approfondir l'annotation.

Pensez à ce qu'est un espion dans les films : il se comporte comme s'il faisait partie d'un camp, mais agit différemment dans certaines situations.

**Un objet Spy est un objet qui peut appeler des méthodes réelles dans certaines situations, tout en permettant le changement de comportement de certaines méthodes dans d'autres**.

L'annotation `@Spy` est utilisée pour créer de tels objets Spy.

Testons maintenant le code ci-dessus en utilisant l'annotation `@Spy`.

Quand il existe une dépendance distincte à simuler, on utilise généralement l'annotation `@Mock` pour l'objet à simuler, et l'annotation `@InjectMocks` pour l'objet qui reçoit la dépendance (où se trouve la méthode à tester).

Notez que si nous utilisons `@Spy` en même temps, `@Spy` doit être déclaré avant `@InjectMocks`.

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

Écrivons maintenant le code de test pour `methodA()`.
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

Ainsi, même les méthodes dans la même classe peuvent être simulées en utilisant l'annotation `@Spy`.

## Séparation de la couche de logique commune lors des tests

Cependant, simuler des méthodes dans la même classe peut nuire à la lisibilité du code de test. Je pense personnellement qu'il serait préférable de créer une couche distincte pour les logiques communes dans de tels cas.

Par exemple, `methodA()` peut être séparée dans une autre classe (ci-après nommée `SomeServiceSupport`), et `SomeService` peut l'utiliser en l'injectant.

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

Cette séparation évite le besoin de simuler des méthodes dans la même classe, et réduit les corrélations complexes entre les méthodes lors des tests avec l'annotation `@Spy`.

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

Dans ce code spécifique, le code de test n'est pas essentiellement différent. Cependant, même de l'extérieur, il est évident pour d'autres développeurs que la couche séparée traite les logiques communes, ce qui facilite la maintenance.