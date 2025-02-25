---
title: Lass uns über MVC lernen
type: blog
date: 2022-02-22
comments: true
translated: true
---
`MVC` steht für `Model`, `View`, `Controller`. Es ist eines der vielen Methodiken zur Strukturierung von Webanwendungen und ein repräsentatives Muster, das die Komponenten in drei Teile aufteilt. Es ist bekannt dafür, im bekannten Web-Framework `Spring Framework` eingesetzt zu werden, und viele andere Web-Frameworks folgen ähnlichen Mustern, auch wenn es kleine Unterschiede gibt.

## Welche anderen Frameworks gibt es?
- Ein ähnliches Muster ist das `MVT`-Muster. Es wird in dem auf Python basierenden Framework `Django` verwendet und steht für `Model`, `View`, `Template`. Die Rollen stimmen fast mit dem `MVC`-Muster überein, jedoch unterscheiden sich die Zuordnungsgrundlagen.

## Unterschiede zwischen MVC und MVT
  ![image](https://user-images.githubusercontent.com/59782504/155057532-25c9325c-3009-4ee7-8cee-7946530643ec.png)

- Das Bild oben verdeutlicht, wie sich die Beziehung zwischen `MVC` und `MVT` unterscheidet.
- `View` in `Django` ist das, was in `Spring` als `Controller` bekannt ist!
- Ebenso ist bekannt, dass das `View` in `Spring` in `Django` als `Template` bezeichnet wird.

**Jetzt, da wir den Unterschied aus Spaß erkannt haben, sollten wir langsam herausfinden, was `MVC` genau ist.**

## Model, View, Controller und User

![image](https://user-images.githubusercontent.com/59782504/155059391-11d1e224-cbc0-4eac-bdcc-31e7f255d2e1.png)

Obwohl die Beziehung zwischen Model, View und Controller im Bild oben vereinfacht dargestellt ist, können die Pfeile tatsächlich in mehr Richtungen zeigen. 

Das Wichtigste ist hier nicht die Richtung der Pfeile, sondern Sie sollten den **Fluss** betrachten.

### Model
Lassen Sie uns mit dem Model beginnen. Das Model ist ein Begriff für ein Objekt, das Daten enthält, oder eine Entität, und es enthält die Klassen für die tatsächlichen Daten, die in der Datenbank gespeichert werden sollen.

Einfach gesagt, **es ist wie ein Freund, der mit der Datenbank kommuniziert.** <br><br>Es sollte alle Informationen über Objekte enthalten, in denen CRUD-Operationen stattfinden, und sollte keinen Bezug zu **View** oder **Controller** haben.

### View
Es ist das Objekt, das die dem Benutzer angezeigte Benutzeroberfläche enthält. Mit der zunehmenden Bedeutung von RESTful APIs ist es in letzter Zeit weniger geworden, dass Spring direkt HTML enthält. Frontend-Frameworks wie Vue.js und React übernehmen die Rolle der View in Spring MVC!

Es empfängt zunächst die Eingaben vom Benutzer und leitet sie an den Controller weiter.

Es behandelt Aufgaben wie Benutzereingabetags in HTML, z. B. `input`, `checkbox`, `submit`-Button, und den Teil, der die Daten, die aus der Datenbank abgerufen wurden, dem Benutzer anzeigt.

### Controller
Es nimmt Eingaben vom Benutzer entgegen, verarbeitet die Daten entsprechend (Model) und ruft die View auf oder sendet bei asynchroner Kommunikation die Antwort in einem passenden Format (JSON/XML usw.).

## Fazit
- Heute haben wir uns kurz mit dem MVC-Muster auseinandergesetzt.
- Da dies mein erstes technisches Blog ist, habe ich erkannt, wie viel Aufwand in einen einzigen Beitrag fließen muss.
- In nächsten Beiträgen werden wir das Spring MVC-Muster etwas detaillierter untersuchen.