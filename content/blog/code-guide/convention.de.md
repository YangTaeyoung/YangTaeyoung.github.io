---
layout: post
title: Wenn Junior-Entwickler mit Code-Konventionen beginnen
date: 2024-05-20
comments: true
translated: true
---

![image](/images/code_guide/convention-1716212794001.png)

Als ich das erste Mal in die Firma kam, gab es vieles, das mich frustrierte. Besonders, wenn ich Code sah: Warum sind die `if`- und `for`-Schleifen so verschachtelt? Warum ist der Code so unordentlich? Warum sind die Variablennamen so seltsam? Und so weiter.

Wenn man in einem Unternehmen arbeitet, kann man sicherlich die offensichtliche Erklärung finden, dass jemand einfach nicht genug Fähigkeiten besitzt. Doch je mehr Erfahrung man in der Berufspraxis sammelt, desto mehr stößt man auf Situationen, die improvisierte Lösungen erfordern, sowie auf abweichende Pläne von der ursprünglichen Designrichtung. Auch bei sorgfältiger eigener Entwicklung kann der Code aus verschiedenen Gründen unordentlich werden.

In solchen Fällen helfen Code-Konventionen bei der Zusammenarbeit, da man durch strikte Regeln die Codequalität in relativ kurzer Zeit erheblich verbessern kann. (Insbesondere falls es eine Kultur des Code-Reviews gibt, ist die Chance groß, dass sich diese positiv verankert.)

In diesem Artikel möchte ich kurz darauf eingehen, was bei der Einführung von Code-Konventionen berücksichtigt wurde und wie Junior-Entwickler solche Konventionen vorschlugen und im Unternehmen umsetzten.

## Warum sind Code-Konventionen wichtig?
Eigentlich machen Code-Konventionen nur dann Sinn, wenn **mehr als eine Person** am Entwicklungsprozess beteiligt ist.

Im Fall einer Ein-Personen-Entwicklung trägt diese Person die volle Verantwortung für alle Bereiche der Entwicklung und muss sich nicht unbedingt an Code-Konventionen gebunden fühlen.

Sobald jedoch mehr als eine Person beim Entwickeln beteiligt ist oder dies geplant ist, gibt es unterschiedliche Code-Stile. Je mehr Personen am Projekt beteiligt sind, desto größer die Verwirrung.

Code-Konventionen sind der direkteste Weg, Regelungen auf den Code anzuwenden. Sie können die Codequalität auf einem bestimmten Niveau halten. Wenn viele Personen die Code-Konventionen kennen, kann der Code gelesen werden, als ob er von einer einzigen Person geschrieben wurde. Dadurch wird die Konsistenz bewahrt und es ist einfacher, für alle nachvollziehbaren Code zu schreiben.

Da es um Regelungen des Codes geht, können Projektmitglieder allerdings Widerstand leisten oder man benötigt Überzeugungsarbeit, um die Notwendigkeit solcher Konventionen zu verdeutlichen. In diesem Artikel möchte ich beschreiben, wie ich dies angegangen bin.

## Hindernisse bei der Einführung von Code-Konventionen
Ich persönlich finde, dass es nicht einfach ist, bei allen Menschen, sei es in großen Unternehmen, Start-ups oder mittelständischen Firmen, auf systematische Weise mit Code-Konventionen zu entwickeln. Hierfür gibt es verschiedene Gründe.

### 1. Frühphasen-Startups wollen das nicht.
In der Anfangsphase eines Startups, wenn das Unternehmen noch keine Gewinne erzielt, wird die Erstellung und Pflege von Code-Konventionen oft als ein Kostenfaktor wahrgenommen.

Ich stehe diesem Punkt sowohl zustimmend als auch ablehnend gegenüber.

Auch wenn es ein dokumentiertes Regelwerk für Code-Konventionen gibt, kann sich der Zweck der Konventionen mit steigenden Kosten für die Pflege, aufgrund von Version-Updates oder der Einführung neuer Werkzeuge, schnell abschwächen.

In Start-up-Phasen ist oft eine Zeile Code oder eine Funktion wichtiger als die Erstellung solcher Dokumente. Da die Pflegekosten von Code-Konventionen erheblich sind, sehe ich hier einige Einschränkungen.

Kann eine Firma wirklich die Kosten tragen, das Dokument der Code-Konventionen zu überarbeiten, wenn von JSP auf Spring umgestellt wird? Die Umstellung auf neue Methoden, Änderungen in der Datenbank, die Veränderung der Arbeitsweise von SSR zu Restful API, all das könnte die Kosten in die Höhe treiben, besonders wenn es eine gründliche Dokumentation der Konventionen gibt.

Allerdings sollten selbst Start-ups, sobald sie wachsen und immer mehr Entwickler einstellen, grundlegende Aspekte von Code-Konventionen einführen, da der Code mit den vielen individuellen Eindrücken der Entwickler zunehmend unübersichtlich werden kann. Solche schlechten Codierungen erschweren die Wartung nach außen hin. Methoden können mit create oder get benannt sein und dennoch könnte es schwer sein, die eigentliche Funktion zu erkennen. (Es kann vorkommen, dass create nur zur Rückgabe eines temporären Objektes verwendet wird, während es bei einer anderen Methode um eine Speicherung in der Datenbank geht.)

Wenn derartige Situationen über einen längeren Zeitraum bestehen bleiben und die verantwortliche Person das Unternehmen verlässt, kann sich die Schwierigkeit bei der Wartung drastisch erhöhen. Daher ist es selbst bei Start-ups ratsam, in einigen essentiellen Bereichen Code-Konventionen einzuführen.

### 2. Code-Konventionen müssen von allen akzeptiert werden.
Eines der Dinge, die ich als Junior-Entwickler stark empfand, war: egal, wie gut ich eine bestimmte Herangehensweise finde, wenn andere sie nicht mögen, ist es schwer, daraus eine Code-Konvention zu machen.

Selbst wenn man die ganze Nacht Konventionen erstellt, hat es nichts genützt, wenn sich die anderen Entwickler nicht daran halten.

Deshalb ist es wichtig, dass die Kooperation der Kollegen gleich von Beginn an gegeben ist und die Notwendigkeit der Code-Konvention den Entwicklern erläutert wird.

Folgendes Beispiel illustriert den Prozess, wie es bei mir zur Akzeptanz kam.

Im vergangenen Projekt fiel einer Kollegin ein Missgeschick auf, dass im Servicelayer keine Filter für das Repository vorhanden waren, was fast zu einem versehentlichen Löschen aller markierten Daten führte. _(Zum Glück nicht in Produktion.)_

Anschließend schlug ich vor, eine Validierung im Repository einzuführen, um zu vermeiden, dass alle Daten ohne Bedingung geändert oder gelöscht werden, erhielt jedoch von Kollegen folgendes Feedback:
1. Erhöht es nicht die Entwicklungskosten, wenn wir diese Situation durch Code-Konventionen verhindern wollen?
   - Das stimmt. Die Validierung für alle Datenebenen würde nicht nur die Entwicklungszeit, sondern auch die Zeit für das Schreiben von Testfällen erhöhen.
2. Würde das Hinzufügen von Validierung im Repository nicht den Zweck und das Ziel der Repository-Ebene verfehlen? Eigentlich handelt es sich dabei nicht um Geschäftslogik.
   - Laut ursprünglicher Definition sollte die Repository-Ebene normalerweise nicht mit Geschäftslogik in Berührung kommen. Wenn jedoch die Validierung noch spezifischer wird und bestimmte Zeilen und Felder einschränkt, übernimmt die Repository-Ebene Geschäftslogik. Es gab sogar den Kommentar, dass diese Logik besser im Servicelayer aufgehoben wäre.

Durch dieses Feedback erkannte ich Aspekte, die ich zuvor nicht bedacht hatte.

Später habe ich die ursprünglich vorgesehenen Beschränkungen geändert, sodass sie nur für bestimmte kritische Daten gelten, und konnte die Code-Konvention akzeptieren lassen.

### 3. Code-Konventionen müssen kontinuierlich gepflegt werden.
Wenn man einmal Code-Konventionen eingeführt hat, müssen sie kontinuierlich gepflegt werden. Je detaillierter die Konventionen, desto notwendiger wird es bei Änderungen, neue Versionen oder bei Einführung neuer Technologien die Konventionen zu überarbeiten.

Dies ist sowohl ermüdend für das Unternehmen, das Team als auch für die Personen, die mit der Pflege der Code-Konvention betraut sind.

Deshalb braucht man bei der Erstellung von Code-Konventionen Mitarbeiter, die bereit sind, diese kontinuierlich zu betreuen, und man muss sorgfältig über den Umfang und Inhalt der Regelungen nachdenken.

## Warum Code-Konventionen trotzdem notwendig sind
Trotz der Herausforderungen können gut definierte Code-Konventionen die Entwicklungsgeschwindigkeit verbessern.

Die strengen Regeln sind insbesondere für neue Mitarbeiter als Wegweiser hilfreich, wie sie nach einem intensiven Code-Review ihren Code weiterentwickeln können.

Gute Code-Konventionen ermöglichen es, effizienten Code zu schreiben und fördern eine gemeinschaftliche Entwicklung eines wartungsfreundlichen Codes.

Früher, als in einer Firma ein Bug auftrat, konnte trotz Abwesenheit des ursprünglichen Entwicklers (durch Urlaub oder Kündigung) der fehlerhafte Code schnell behoben werden, dank der Code-Konventionen.

Die vorhersehbare Funktionalität des Codes, die allein schon durch die Konventionen gegeben war, ermöglichte es uns, den Problemen schnell auf den Grund zu gehen.

## Einführung von Code-Konventionen
Falls Sie erwägen, Code-Konventionen einzuführen, könnten die folgenden Tipps hilfreich sein.

### Recherche zu bestehenden Code-Konventionen
Es ist empfehlenswert, auf bestehende Konventionen wie Google Convention oder Airbnb Convention zurückzugreifen, um ein eigenes Regelwerk für die Firma zu erstellen.

Als Backend-Entwickler habe ich zuvor die [Google Cloud Methodennamen-Regeln](https://cloud.google.com/apis/design/naming_convention?hl=ko#method_names) als Basis für die Methodennamen-Konvention verwendet.
> Ein praktischer Hinweis ist, dass ein auf solchen Dokumenten basierendes Regelwerk es einfacher macht, Kollegen zu überzeugen. Man argumentiert nicht nur mit der eigenen Meinung, sondern beruft sich darauf, dass renommierte Entwickler von Google den Code genauso gestalten.

### Nutzen von Github Discussion
Github Discussion ist eine Community-Funktion von Github. In der Vergangenheit habe ich über diese Plattform Code-Konventionen vorgeschlagen und durch Diskussionen die Einführung solcher Konventionen empfohlen. Dank Abstimmungen, Kommentaren und Labels konnte vieles gemeinsam überprüft und entschieden werden.

![image](/images/code_guide/convention-1716212280924.png)
> Beispiel einer Discussion

Ein Nachteil ist, dass die Diskussion an ein Repository gebunden ist. Für firmenweite Themen wurde daher die Organization Discussion genutzt.

### Code-Reviews für Code-Konventionen nutzen
Code-Review ist ein weiterer Kanal, über den Code-Konventionen entstehen. Viele Konventionen sind durch die Einflüsse diverser Code-Reviews entstanden, darunter:
1. Verwendung des Early Return Pattern
2. Nach der Variablen-Deklaration eine Zeile freilassen
3. Bei mehr als drei Aufrufen der Datenebene im Businesslayer einen Kommentar hinzufügen
4. Beim Datenübergang von einer bestimmten Ebene zu einer anderen das DTO verwenden

Obwohl ich mich nicht an alle Details erinnere, entstanden viele Code-Konventionen durch die Reviews.

### Nicht bei erster Ablehnung verzagen
Es ist menschlich, sich entmutigt zu fühlen, wenn Vorschläge für Code-Konventionen abgelehnt werden.

Doch aus Erfahrung kann ich sagen, dass Probleme, die durch abgelehnte Konventionen entstehen, neu aufgegriffen und schließlich akzeptiert werden oder durch alternative Lösungen bewältigt werden.

Falls ein abgelehnter Vorschlag in der Praxis keine weiteren Probleme verursachte, könnte es sein, dass die Konvention überflüssig gewesen wäre und die Effizienz des Teams möglicherweise sogar beeinträchtigt hätte.

Code-Konventionen sind mächtige Beschränkungen beim Entwickeln, und es ist wichtig zu wissen, dass sie in einigen Fällen die Lesbarkeit und Effizienz beeinträchtigen können.

### Die Kosten von Code-Konventionen bewusst machen
Es ist ratsam, Code-Konventionen als letztes Mittel zu sehen.

Aufgrund der vielen oben erwähnten Gründe sollte man sich der hohen Kosten bei der Einführung von Konventionen bewusst sein.

Stattdessen könnte die Nutzung von Automatisierungswerkzeugen, Linter und Formatierer effizienter sein. Die Machbarkeit solcher Optionen sollte daher zuerst geprüft werden.