---
layout: post
title: Lass uns über Case Styles lernen (Camel Case? Pascal Case? Kebab Case?)
date: 2022-04-14
comments: true
translated: true
---

Heute beschäftige ich mich mit einem der Artikel, die ich bereits im Unternehmen gepostet habe.

Ich möchte einige Richtlinien für diejenigen geben, die neu mit dem Codieren anfangen. Diese werde ich unter dem Schlagwort `Code Guide` sammeln und posten!

## Codierungsstil

Wenn man allein entwickelt, gibt es keine Probleme. Heutzutage unterstützen fast alle Sprachen die UTF-8-Codierung, sodass es sogar möglich ist, im Code Koreanisch zu verwenden.

Insbesondere bei Dingen wie `Variablennamen`, `Funktionsnamen`, `Klassennamen`, die der Entwickler frei benennen kann, ist es theoretisch völlig in Ordnung, sie auf Chinesisch oder Koreanisch zu benennen.

## Warum erfolgt das meiste Coden auf Englisch?

Das mag ein wenig abschweifend klingen, aber manchmal gibt es Module oder Funktionen, die nur auf Englisch funktionieren.

Besonders bei älteren Sprachen wie `C++`, bei denen eine Parsing-Modul-Konvertierung erforderlich ist, um Koreanisch in Zeichen umzuwandeln, die von Englisch oder dem Betriebssystem verstanden werden.

Tatsächlich ist der wichtigste Grund, um den **Codierungsstil zwischen kooperierenden Entwicklern konsistent zu halten**.

Wenn jemand auf Koreanisch, jemand auf Englisch und jemand auf Chinesisch Variablennamen definiert und sie dieselbe Funktion auswählen, wäre der Code für einen neuen Entwickler im Team, der solchen Code sieht, schwer verständlich.

Deshalb gibt es unter Entwicklern etablierte Regeln zur Benennung und Definition von Code, die oft als Codierleitfäden oder Konventionen bezeichnet werden.

Ich weiche ab. Lassen Sie uns zur Sache kommen.

## Case Styles

Case Styles kann man sich als eine Art Namensregel vorstellen.

Wenn Sie Variablen, Funktions- oder Klassennamen festlegen, folgen Sie diesen Richtlinien. Dies steht insbesondere im Zusammenhang mit Leerzeichen.

Die meisten Sprachen beinhalten Leerzeichen als Bestandteil der Syntax, und es ist eine Überlegung wert, welche Zeichen zur Ersetzung dieser Leerzeichen verwendet werden sollen.

_▼ Ein unterhaltsames Bild, das die Stile der verschiedenen Case-Styles ausdrucksstark darstellt_
![image](https://user-images.githubusercontent.com/59782504/163414665-0c9bf7d7-8e04-4fb3-bdf9-400db3c5959a.png)

Es gibt viele Case-Styles, aber vier davon werden am häufigsten verwendet:

```python
camelCase # Camel Case
PascalCase # Pascal Case
snake_case # Snake Case
kabab-case # Kebab Case
```

Wie Sie vielleicht bemerkt haben, ist der oben gezeigte Code ein typisches Beispiel für die Merkmale der verschiedenen Case-Styles.

## Camel Case

Der Camel Case stammt von der Form eines einhöckrigen Kamels. Wenn Sie Leerzeichen verwenden sollten, ersetzen Sie sie durch Großbuchstaben an der Stelle des Leerzeichens. Manchmal wird zwischen Lower camel case und Upper camel case unterschieden, wobei letzterer im Allgemeinen als Pascal case bekannt ist.

_▼ Beispiel für Camel Case_
```python
todayDate = "2022-04-14";
```

Wie oben gezeigt, kann der Ausdruck `today date` ohne Leerzeichen als `todayDate` geschrieben werden.

Laut dem Java-Codierungsstil-Leitfaden von Google wird dieses Schema für die Benennung von Methoden und Variablen in `Java` sowie in auf Java basierenden Sprachen wie `Kotlin` verwendet.

(Referenzlink: https://google.github.io/styleguide/javaguide.html#s5-naming)

## Pascal Case
 
Der Pascal Case wird auch als Upper camel case bezeichnet. Da alle Anfangsbuchstaben in Pascal-Sprachen großgeschrieben sind, hat dieser Stil seinen Namen.

▼ Beispiel für Pascal Case
```python
TodayDate = "2022-04-14"
```

Dieses Schema wird häufig in den Benennungsregeln für `Python`-Klassennamen, `C`-Strukturen, `C++`-Klassennamen sowie `Java`-Klassen und -Interfaces verwendet.

Außerdem weist die Python-Codierleitlinie `PEP8` auf die Verwendung dieses Case-Styles bei Python-Klassen hin. 

_Bei der genannten Seite wird Pascal Case als Camel Case bezeichnet, bitte nicht verwechseln._
https://realpython.com/python-pep8/#naming-styles

# Snake Case

Diese Schreibweise, die an die Form einer Schlange erinnert, ist als Snake Case bekannt. 

Es handelt sich um ein Schema, bei dem Leerzeichen durch einen Unterstrich `_` getrennt werden.

_▼ Beispiel für Snake Case_
```python
today_date = "2022-04-14"
```

Dies ist das von PEP8 empfohlene Stilmittel für Modulnamen, Funktionsnamen, Methodennamen und Variablennamen in Python.

(Referenzlink: https://google.github.io/styleguide/javaguide.html#s5-naming)

Wenn Sie einen Variablennamen nicht gemäß dieser Regel erstellen, bietet die beliebte Python-IDE PyCharm an, den Namen zu ändern, indem sie einen PEP8-kompatiblen Namen vorschlägt.

_▼ Beispiel für einen fehlerhaften Variablennamen_
```
HelloMyMrYesterday = "2021-01-10"
```

_▼ Pycharm-Warnung_

![image](https://user-images.githubusercontent.com/59782504/163415564-6536513c-0a1b-46c3-a0e9-b38f73cf139d.png)

### + Zusatztipp

`PEP8` enthält nicht nur Namensregeln, sondern auch Richtlinien für Einrückungen, Leerzeichen usw. Die meisten dieser Richtlinien können mithilfe des Shortcut-Keys zum automatischen Bereinigen von Code (`Ctrl` + `Alt` + `L`) in `PyCharm IDE` auf einmal angewendet werden.

_▼ Im folgenden Code werde ich bewusst gegen die Regeln verstoßen, um die Verständlichkeit zu erleichtern._

```python
def func_1():
    return 1
def func_2():
    return 2
```

PyCharm zeigt wie folgt eine gelbe Linienwarnung an und empfiehlt, den Code zu ändern. Es ist höflich mit "PEP8" markiert!

![image](https://user-images.githubusercontent.com/59782504/163415681-d8fe6dd6-0179-4936-ade5-9f0c3fb87688.png)

![image](https://user-images.githubusercontent.com/59782504/163415693-44ad9ad7-f00a-41d3-9400-33d10c566459.png)

- Nach Drücken von `Ctrl` + `Alt` + `L`,

```python
def func_1():
    return 1
    
    
def func_2():
    return 2
```
ist es möglich zu sehen, dass die Warnung verschwindet, indem zwei Zeilen Einrückung jeweils pro Funktion vorgenommen werden.

## Kebab Case

Aus den Case Styles wie Camel Case, Snake Case und Kebab Case lässt sich erkennen, dass Entwickler den Code auf sehr intuitive Weise betrachten.
```python
today-date = "2022-04-14"
```
Wie Sie sehen, handelt es sich beim Kebab Case um einen Schreibstil, bei dem Leerzeichen durch einen Bindestrich (-) ersetzt werden, ähnlich wie Zutaten auf einem Kebabspieß.

Es wird häufig in Publishing-Sprachen wie `CSS` verwendet, und nähere Informationen dazu können in der Naming Convention `BEM` gefunden werden.
https://en.bem.info/methodology/naming-convention/

## Zusammenfassung
- Heute haben wir über verschiedene Codierungsstilkonventionen und die damit verbundenen Naming Conventions und Case Styles gesprochen!
- Ich möchte auch über Regelungen wie die Commit Conventions beim `Git commit` sprechen.
- Hinterlassen Sie einen Kommentar, wenn Sie Fragen oder Korrekturen haben!