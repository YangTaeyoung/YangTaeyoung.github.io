---
translated: true
title: Erfahren Sie mehr über die SOLID-Prinzipien der objektorientierten Gestaltung.
type: blog
date: 2022-02-25
comments: true
---
Der heutige Beitrag stammt aus meinem Studium für die "Information Processing Engineer"-Prüfung, und ich habe ein Thema mitgebracht, das interessant für einen Beitrag sein könnte.

Es geht um die Prinzipien der objektorientierten Gestaltung, die auch als `SOLID`-Prinzipien bekannt sind, nachdem man die Anfangsbuchstaben jedes Prinzips zusammenfasst.

Diese Prinzipien sind nicht nur in vielen objektorientierten Sprachen, sondern auch in Web-Frameworks wie `Spring` von zentraler Bedeutung und daher für Programmierer äußerst nützlich zu wissen.

~~Es ist auch gut für Vorstellungsgespräche.~~

## 1. Single Responsibility Principle (SRP, Einzelverantwortungs-Prinzip)

Beim Entwurf einer Klasse sollte **eine Klasse nur eine einzige Verantwortung** tragen, lautet das Prinzip.

Obwohl der Begriff "Verantwortung" etwas vage erscheinen mag, lässt er sich einfach erklären, wenn man ihn als den Umfang betrachtet, der bei Funktionsänderungen oder Anpassungen betroffen ist.

Normalerweise wird der Begriff Verantwortung häufig verwendet, wenn jemand ein fehlerhaftes Verhalten korrigieren muss: _"Wer übernimmt die Verantwortung?"_ Das ist vergleichbar.

Das Einzelverantwortungs-Prinzip besagt, dass für eine bestimmte Verantwortung **eine Klasse, die ein Objekt repräsentiert, diese eine Verantwortung tragen sollte.**
> Programmierer haben sicherlich schon einmal den Begriff `Klasse` gehört? Eine Klasse ist eine Sammlung von **denselben Eigenschaften oder Verhalten** eines Objekts.

Das Problem tritt auf, wenn eine bestimmte Klasse mehr als eine Verantwortung trägt.

> Lassen Sie uns ein Beispiel betrachten:

Wenn eine `Fahrzeug`-Klasse sowohl `Verkaufsinformationen` als auch das `Funktionsprinzip` eines Fahrzeugs enthält, würde das Ändern des `Fahrzeugpreises` zwangsläufig auch die Klassen beeinflussen, die das `Funktionsprinzip` des Fahrzeugs verwenden.

Außerdem tragen Klassen, die das Funktionsprinzip des Fahrzeugs verwenden, unnötige Informationen (`Verkaufsinformationen`), die für die Fahrzeugfunktion irrelevant sind.

**Dies kann von niemandem als gutes Design angesehen werden.**

Um derart unglückliche Situationen zu verhindern, bestimmt das **SRP**, dass eine Klasse **nur eine Verantwortung tragen sollte**.

## 2. Open/Closed Principle (OCP, Offen-Geschlossen-Prinzip)

Das Offen-Geschlossen-Prinzip (im Folgenden `OCP`) besagt, dass **eine Software in Bezug auf Erweiterungen offen, auf Änderungen jedoch geschlossen sein sollte**.

Um dies am besten zu veranschaulichen, betrachten wir das Beispiel einer Datei(`file`), in die ein bestimmter Inhalt(`content`) geschrieben wird.

_Der folgende Code dient nur als Referenz und ist nicht lauffähiger Code._
```java
void fileOneWrite(String content){
  File file = new File("./one.txt");
  file.write(content);
}
```

Wenn wir annehmen, dass eine Methode die Aufgabe hat, den Parameter-String in der `File`-Klasse zu schreiben, würde die obige Methode den Inhalt auf `one.txt` schreiben. Aber was, wenn man auch in die `two.txt`-Datei schreiben möchte?

```java
void fileOneWrite(String content){
  File file = new File("./one.txt");
  file.write(content);
}
void fileTwoWrite(String content){
  File file = new File("./two.txt");
  file.write(content);
}
void fileThreeWrite(String content){
  File file = new File("./three.txt");
  file.write(content);
}
```
**Wie oben müsste man weitere Methoden hinzufügen oder die bestehende Methode ändern.**

Wenn man jedoch bei der Gestaltung das Offen-Geschlossen-Prinzip berücksichtigt hätte, hätte man es folgendermaßen entwerfen können:

```java
void fileWrite(String filePath, String content){
  File file = new File(filePath);
  file.write(content);
}
```

**Dies ist das `OCP`: die Flexibilität wird durch den Gebrauch von Interfaces, Vererbung und Beispielen mit Parametern gewährleistet, wodurch die Veränderbarkeit eingeschränkt wird.**

## 3. Liskov Substitution Principle (LSP, Liskovsches Substitutionsprinzip)

Das Prinzip besagt, dass die Objekte eines Programms durch Instanzen von Untertypen ersetzt werden können müssen, ohne die Richtigkeit des Programms zu beeinträchtigen.

Dies ist besonders **mit Polymorphie verbunden**.

```java
void sell(Item item){
  //Verkaufslogik
}
```

Bei einer Funktion wie dieser sollte der Aufruf `sell(apple)` mit einer Instanz einer Unterklasse oder eines Interfaces von `Item` problemlos austauschbar sein!

## 4. Interface Segregation Principle (ISP, Interface-Trennung-Prinzip)

**Das Prinzip besagt, dass ein Client nicht von Methoden abhängen sollte, die er nicht nutzt.**

Wir haben bereits bei der Besprechung der Abhängigkeit im letzten Beitrag darüber gesprochen.

In anderen Worten: Der **Client sollte nur von den Methoden abhängen, die er verwendet**.

Wenn man es etwas anders betrachtet, sollte man bedenken, dass bei einem Interface, das von verschiedenen Clients genutzt wird, Methoden aufgeteilt werden, falls es Methoden gibt, die bestimmte Clients nicht verwenden. In solchen Fällen könnte es sinnvoll sein, das Interface neu zu gestalten, um diese nach Nutzung zu trennen.

Zum Beispiel könnten sowohl `Fender E-Gitarre` als auch `Samick Akustikgitarre` das `Gitarre`-Interface implementieren. Wenn jedoch die `AmpConnection()`-Methode der `Fender E-Gitarre` dazu führt, dass die `Gitarre`-Schnittstelle eine `AmpConnection()`-Methode hat, müsste der `Samick Akustikgitarre`-Client, der das `Gitarre`-Interface erbt, die **AmpConnection()-Methode implementieren, die für ihn irrelevant ist**.

Um solche ineffizienten Aspekte zu vermeiden, ist es sinnvoller, das `Gitarre`-Interface in ein `Akustikgitarre`-Interface und ein `E-Gitarre`-Interface zu trennen und entsprechend zu vererben.

## 5. Dependency Inversion Principle (DIP, Abhängigkeitsinversion-Prinzip)

Dieses Prinzip bezeichnet ein spezifisches Format zur Trennung von Softwaremodulen.

### Dieses Prinzip umfasst die folgenden Aussagen:
1. Oberste Module dürfen nicht von unteren Modulen abhängen. Beide sollten von Abstraktionen abhängen.
2. Abstraktionen dürfen nicht von Details abhängen. Details sollten von Abstraktionen abhängen.

Dieses Prinzip liefert ein grundlegendes Prinzip der objektorientierten Gestaltung, das besagt, dass sowohl obere als auch untere Objekte von derselben Abstraktion abhängen.

Das mag kompliziert klingen, aber lassen Sie uns an einem Beispiel denken, um es einfacher zu machen.

<img width="337" alt="image" src="https://user-images.githubusercontent.com/59782504/155655942-d10562d9-147e-4465-a802-9c0e49b3cb99.png">

Ich benutze eine mechanische Tastatur, daher könnte man sagen, dass ich ein `Objekt bin, das eine mechanische Tastatur enthält` (abhängig von dem Objekt). Aber verwendet man immer eine mechanische Tastatur? Nein. Je nach Situation könnte ich auch eine `Laptop-Tastatur` oder eine `Membran-Tastatur` verwenden.
Daher ist es besser, ein generelles `Tastatur`-Interface dazwischen zu erstellen, das als Abstraktion für die Abhängigkeit dient, wie im folgenden Diagramm gezeigt:

<img width="524" alt="image" src="https://user-images.githubusercontent.com/59782504/155656312-650f4ef5-33fa-4f84-9e8b-f199192d92ae.png">

## Fazit
- Heute haben wir die fünf Prinzipien der objektorientierten Gestaltung, die SOLID-Prinzipien, kennengelernt.  
- Es mag anfangs schwer zu verstehen sein, aber diese Konzepte sind beim Programmieren definitiv notwendig. Ich empfehle, sie durch praktische Anwendung anstelle von reinem Auswendiglernen zu verinnerlichen.  
- Wir sehen uns im nächsten Beitrag!
