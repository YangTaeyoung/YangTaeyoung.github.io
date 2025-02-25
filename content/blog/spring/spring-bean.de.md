---
title: Einführung in Spring Beans
type: blog
date: 2022-02-24
comments: true
translated: true
---
Heute dachte ich daran, über `Spring MVC` zu sprechen. Bevor wir jedoch in das MVC-Konzept einsteigen, möchte ich einige grundlegende Kenntnisse über Spring erläutern, die für das Verständnis des MVC unerlässlich sind.

## Was ist ein Spring Bean?
Ein `Spring Bean` bezeichnet ein Objekt, das vom `Spring Container` verwaltet wird. Aber halt, was bedeutet das genau? Ein Objekt, das von Spring verwaltet wird? Handelt es sich hierbei um ein Objekt, das in der Bibliothek von Spring definiert ist?

Um die Frage zu beantworten: Nein, nicht unbedingt. Zwar kann es Objekte geben, die in der Bibliothek als `Bean` definiert sind, doch bezieht sich der Begriff `Bean` auf Objekte, die vom Benutzer erstellt, aber von Spring verwaltet werden. Ursprünglich musste der Benutzer Objekte selbst verwalten, aber beim Einsatz von Rahmenwerken spricht man von "Inversion of Control" (`IOC`).

### Tipp

Viele, die lernen, glauben es vielleicht nicht, aber Spring erklärt sehr detailliert und genau seine eigenen Objekte und Beschreibungen. Man kann zwar die Dokumentation von Spring betrachten, aber oft sieht man direkt im Code die Bemühungen um verständliche Erklärungen. Schauen wir uns doch mal die von Spring definierten Objekte an:

![image](https://user-images.githubusercontent.com/59782504/155391935-40bfd711-b6bf-47c0-9041-38ab043cb462.png)

Auf dem Bild oben sieht man die Schnittstelle der Bean-Annotation von Spring. Wenn man genau hinsieht, findet man viele Kommentare. Auf den ersten Blick mag das schwer verständlich sein, aber es ist erkennbar, dass man sich darum bemüht hat, die Materie verständlich zu machen. Lassen Sie uns sehen, wie sie ganz oben beschrieben wird.

![image](https://user-images.githubusercontent.com/59782504/155392187-882448f1-b28f-4756-b5f5-470954696387.png)

„Die Methode, die durch diese Annotation gekennzeichnet ist, wird vom `Spring Container` als `Bean` verwaltet.“

Nun sehen wir uns mal die Zusammenfassung der Kommentare weiter unten an.

![image](https://user-images.githubusercontent.com/59782504/155393382-1a946d99-5d13-4f81-a312-a245039f2f60.png)

„Die Methode, die mit diesem Kommentar versehen ist, verhält sich in XML von Spring Legacy ähnlich einem Objekt, das als <bean/> definiert wurde.“ und bietet weitere Codebeispiele zur Illustration an.

### Bean-Registrierung

```java
@Bean
public MyBean myBean() {
    // instantiate and configure MyBean obj
    return obj;
}
```

Auf diese Weise kann man mit der `@Bean`-Annotation vor der `myBean`-Methode zeigen, dass sie als `bean` registriert wird.

Man erklärt auch, wie man einem `Bean` einen Alias gibt, indem man ihn als Parameter angibt. Es wird sogar gezeigt, dass ein einzelnes Bean mithilfe eines Arrays mehrere Aliase haben kann.

### Alias für Bean setzen

```java
@Bean({"b1", "b2"}) // bean verfügbar als 'b1' und 'b2', aber nicht 'myBean'
public MyBean myBean() {
    // instantiate and configure MyBean obj
    return obj;
}
```

Im obigen Code zeigt der Parameter `{"b1", "b2"}` der Bean-Annotation, dass das `Bean` unter den Aliasen b1 und b2 verwaltet wird.

#### Warum also Aliase setzen?

Der Hauptgrund für das Setzen von Aliasen besteht darin, Namenskonflikte zwischen Spring Beans zu vermeiden.

```java
@Bean
@Profile("production")
@Scope("prototype")
public MyBean myBean() {
    // instantiate and configure MyBean obj
    return obj;
} 
```

### Eigenschaften von Beans?

![image](https://user-images.githubusercontent.com/59782504/155396490-29453e82-9160-416d-b053-8750373bc9ca.png)

Der nächste Kommentar erklärt, dass zusätzlich zu Aliasen keine weiteren Eigenschaften für `Beans` bereitgestellt werden. Zum Beispiel bietet es Eigenschaften wie `Scope`, `Lazy`, `DependsOn`, `Primary` nicht direkt an und erklärt, dass diese zusammen mit Annotationen wie `@Scope`, `@Lazy`, `@DependsOn`, `@Primary` verwendet werden sollten. Da plötzlich mehrere Eigenschaften aufgetaucht sind, erklären wir sie kurz:

#### `@Lazy`

Es kann verschiedene Beans geben, aber manchmal kann ein Bean in einem anderen Bean verwendet werden.

![image](https://user-images.githubusercontent.com/59782504/155397939-d440a56d-8dca-4443-aede-dead72bb6b47.png)

Angenommen, es gibt ein Bean zur Speicherung von Schülerinformationen, und dieses hat ein weiteres Bean als Mitgliedsvariable für persönliche Daten. Wenn das Objekt gleichzeitig erstellt wird und die persönlichen Daten initialisiert werden, könnten andere leicht auf diese zugreifen.

Standardmäßig folgt jedes `Bean` der `Eager`-Politik, bei der Variablen gleichzeitig beim Erstellen initialisiert werden. Ein `Bean`, das mit der `@Lazy`-Annotation gekennzeichnet ist, wird jedoch nicht sofort initialisiert, sondern erst dann, wenn es von einem anderen Bean referenziert oder explizit im `BeanFactory` gesucht wird.

`Bean Factory`: Ein IOC-Container, der für die Erstellung von Beans und die Einstellung von Abhängigkeiten verantwortlich ist.

#### `@Scope`

Jetzt besprechen wir `Scope`. Die `@Scope`-Annotation legt den Rahmen eines `Beans` fest.

![image](https://user-images.githubusercontent.com/59782504/155399798-b6dc7a08-fb47-40d6-ae3f-a9f5d0633193.png)

Auch hier bietet die Beschreibung Erklärungen. Wenn die `@Scope`-Annotation zusammen mit der `@Component`-Annotation verwendet wird, zeigt sie den Namen des Scopes an, der auf die Instanz der Klasse angewendet wird.

Da wir `Component` noch nicht behandelt haben, lassen wir das kurz beiseite.
Wenn es als Method-Level-Annotation mit `@Bean` verwendet wird, zeigt es den Namen des Scopes an, das für die Instanz, die von der Methode zurückgegeben wird, verwendet werden soll.

Normalerweise wird bei `Beans` ein Singleton-Muster verwendet, das sicherstellt, dass nur ein einziges Objekt zurückgegeben wird. Mit der `@Scope`-Annotation kann dieser Rahmen geändert werden.
Es gibt einen klaren Beitrag, der dies gut erklärt. Ich verlinke ihn hier: 

`singleton` – Gibt ein einzelnes Bean pro IoC-Container zurück.
`prototype` – Gibt bei jeder Anforderung ein neues Bean zurück.
`request` – Gibt ein einzelnes Bean pro HTTP-Request zurück.
`session` – Gibt ein einzelnes Bean pro HTTP-Session zurück.
`globalSession` – Gibt ein einzelnes Bean für alle Sessions zurück.

http://ojc.asia/bbs/board.php?bo_table=LecSpring&wr_id=498

#### `@DependsOn`

„Akzeptiert Abhängigkeit“ ist die Bedeutung. Es besagt, dass ein `Bean`, das mit dieser Annotation versehen ist, erst erstellt wird, nachdem das `Bean` mit dem angegebenen `value` erstellt wurde. Zum Beispiel, `@DependsOn(value="myBean")` garantiert, dass das `Bean` erst nach `myBean` erstellt wird.

Auch beim Aufheben wird das `Bean` erst abgebaut, nachdem das abhängige `myBean` abgebaut wurde.

#### `@Primary`

Wenn `component-scanning` angenommen wird, wird das `Bean`, das mit dieser Annotation und `@Bean` gekennzeichnet ist, zuerst in der `component scan` reihenfolge injiziert.

In einem Blog weiter unten wird `Component Scan` sehr gut erklärt. Kurz gesagt, anstatt die in `@Configuration` angegebenen Klassen einzeln zu registrieren, registriert man sie alle auf einmal. Bei `@Primary` wird erklärt, dass es bei diesem Scan als erstes registriert wird.

Ein sehr detaillierter und gut gemachter Blog beschreibt dies ausführlich.

Component Scan: https://velog.io/@hyun-jii/%EC%8A%A4%ED%94%84%EB%A7%81-component-scan-%EA%B0%9C%EB%85%90-%EB%B0%8F-%EB%8F%99%EC%9E%91-%EA%B3%BC%EC%A0%95

## Zusammenfassend
- Heute haben wir einiges über Spring Beans gelernt. Ich hoffe, ihr hattet Spaß beim Lernen!