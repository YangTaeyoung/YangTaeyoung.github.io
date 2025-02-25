---
title: Vorsichtsmaßnahmen bei der Initialisierung von 2D-Arrays mit denselben Elementen
type: blog
date: 2022-03-02
comments: true
translated: true
---

Dieser Beitrag ist ein Reflexionsbeitrag ㅠㅠ

Ich möchte einen Fehler korrigieren, den ich während eines Coding-Tests gemacht habe!

## Problemdefinition

Es geht um die Initialisierung und Änderung von Elementen in Arrays.

Ich habe ein 2D-Array mit denselben Elementen in Python initialisiert. Die Initialisierung habe ich folgendermaßen durchgeführt:

```python
two_arr = [[False] * 2] * 5
```

Wenn man das Ergebnis ausgibt, erhält man:

```python
[
  [False, False], 
  [False, False], 
  [False, False], 
  [False, False], 
  [False, False]
]
```

Wie man sieht, kommen wir zu einer Ausgabe mit einer 2*5-Form von Listen mit dem Element `False`. 

**Es ist genau so initialisiert, wie ich es beabsichtigt habe!**

Aber nun werde ich ein Element des Arrays ändern:

```python
two_arr[0][0] = True
```

Ich habe erwartet, dass das erste Element des Arrays von `False` zu `True` geändert wird, so wie unten dargestellt:

```python
[
  [True, False], 
  [False, False], 
  [False, False], 
  [False, False], 
  [False, False]
]
```

Aber wenn das tatsächliche Ergebnis gezeigt wird, erscheint:

```python
[
  [True, False], 
  [True, False], 
  [True, False], 
  [True, False], 
  [True, False]
]
```

Obwohl ich `[0][0]` änderte, haben alle 0. Elemente der Reihen dieselbe Änderung erfahren. Was ist da passiert?

## Lösung

Das Problem liegt in der Multiplikationsoperation (`*`) bei der Deklaration eines Python-Arrays mit denselben Elementen.

Wenn man ein eindimensionales Array, also `[False] * 2` kopiert, wird der Wert `False` zweimal kopiert und in die Liste gesetzt, was zu einer korrekten Kopie führt. 

Das Kopierte ist der Wert `False` und nicht `Liste`. Daher wird eine Liste wie `[False, False]` erstellt.

Das eigentliche Problem tritt bei der zweiten Operation auf. Das mit `[[False] * 2] * 5` deklarierte Array enthält einen Fehler in der Kopieroperation des Arrays `[False * 2]`.

Ein Listen-Instanz wie `[[False] * 2]` ist keine `Wert`, sondern eine `Adresse`.

Verstehen Sie? Letztendlich habe ich den Befehl gegeben, die Adresse der Liste `[False, False]` fünfmal zu kopieren.

Einfacher gesagt, die Adresse, in der `[False, False]` enthalten ist, wurde fünfmal kopiert. Daher teilen **alle Reihen die Adresse der Elemente**, sodass das Ändern eines Teils einer spezifischen Reihe dazu führen kann, dass dieselbe Änderung in allen Reihen erfolgt.

Um das Array so zu initialisieren, wie es ursprünglich beabsichtigt war, muss es direkt über eine `for`-Schleife initialisiert werden. Da der Aufruf von `[False, False]` zu unterschiedlichen Zeitpunkten erfolgt, wird die Adresse für jeden Aufruf anders zugewiesen.

Um dies zu lösen, kann man das `append()`-Funktion verwenden oder:

```python
two_arr = []
for _ in range(5):
  two_arr.append([False] * 2)
```

Wenn man den Code eleganter gestalten möchte, kann man List-Comprehension verwenden:

```python
two_arr= [[False] * 2 for _ in range(5)]
```

Wenn man den Ausgabewert danach vergleicht, stellt man fest, dass er korrekt gemäß den Absichten ausgegeben wird.

## Ergebnis

```python
[
    [True, False], 
    [False, False], 
    [False, False], 
    [False, False], 
    [False, False]
]
```

## Abschließende Worte
- Bei diesem Coding-Test wurde mir bewusst, dass es wichtig ist, auch Dinge, die man zu wissen glaubt, noch einmal zu überprüfen. Zwar habe ich alle wichtigen Logiken implementiert, aber hier kam es zu einem Fehler.. :(
- Listenvariablen sind Objekte, das heißt, sie haben, anders als Variablen des `primitive type`, Adresswerte. Wenn Sie diesen Beitrag lesen, hoffe ich, dass Sie sich das merken, um nicht denselben Fehler zu machen wie ich!