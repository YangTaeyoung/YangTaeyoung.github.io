---
title: "[Programmers] Einreiseprüfung (Golang)"
type: blog
date: 2025-05-23
comments: true
translated: true
---

## Problem
[**Programmers Problem Einreiseprüfung**](https://school.programmers.co.kr/learn/courses/30/lessons/43238)
```
n Personen stehen in der Schlange, um die Einreiseprüfung zu durchlaufen. Jeder Prüfer an den Prüfstationen benötigt unterschiedlich viel Zeit für die Prüfung.

Zu Beginn sind alle Prüfstationen leer. An einer Prüfstation kann immer nur eine Person gleichzeitig geprüft werden. Die Person, die vorne steht, kann zur nächsten freien Prüfstation gehen und sich dort prüfen lassen. Wenn jedoch eine Prüfstation schneller fertig wird, kann sie auch warten und dann zur schnelleren Prüfstation gehen.

Das Ziel ist es, die Zeit, die benötigt wird, damit alle Personen geprüft werden, zu minimieren.

Die Anzahl der auf Einreiseprüfung wartenden Personen n und ein Array times, das die Zeit enthält, die jeder Prüfer für die Prüfung einer Person benötigt, werden als Parameter übergeben. Schreiben Sie die Funktion solution, die die minimale Zeit zurückgibt, die benötigt wird, damit alle Personen geprüft werden.
```

## Einschränkungen
```
- Die Anzahl der Personen, die auf die Einreiseprüfung warten, ist mindestens 1 und maximal 1.000.000.000.
- Die Zeit, die jeder Prüfer für die Prüfung einer Person benötigt, liegt zwischen 1 und 1.000.000.000 Minuten.
- Die Anzahl der Prüfer beträgt mindestens 1 und maximal 100.000.
```

## Ansatz
In der Regel kann man bei so breiten Bereichen das Problem mit Binärsuche lösen.

In diesem Fall gibt es jedoch maximal 1.000.000.000 wartende Personen und Zeiten bis zu 1.000.000.000 Minuten, und es können bis zu 100.000 Prüfer existieren, was es schwierig macht, einen Ansatz zu finden.

Ich habe lange darüber nachgedacht, wie ich vorgehen soll, und wendete mich diesmal an ChatGPT um einen Hinweis.
~~(Tatsächlich ist dies ein nachdenklicher Beitrag darüber)~~ 

### Hinweis von ChatGPT

![image](/images/algorithm/programmers-43238-1747970726257.png)

Zusammenfassend empfiehlt sie, die Rückgabewerte, die `gesamt benötigte Mindestzeit`, als Grundlage für die Binärsuche zu verwenden. `gesamt benötigte Zeit / Zeit eines Prüfers` ergibt die `anzahl der bearbeiteten Personen`, sodass ich die Binärsuche auf dieser Grundlage durchführen sollten.

In diesem Fall sollte das Array mit 100.000 Prüfern durchlaufen werden. Ich dachte zunächst, dass dies eine große Last wäre, aber ich denke, ich sollte zukünftig mit diesem Maß umgehen können.

Daher lassen Sie uns die Binärsuche mit dem `gesamt benötigten minimalen Zeit` als Grundlage durchführen.

In der Regel ist der Rückgabewert der Binärsuche das Ziel der Binärsuche. Zukünftig ist es wahrscheinlich besser, solche Probleme zuerst über den Rückgabewert zu betrachten.

### Implementierung
Zuerst habe ich die Funktion `canHandled()` geschrieben, die die Grundlage für die Binärsuche bildet. 
Diese Funktion berechnet die `anzahl der bearbeiteten Personen` basierend auf der `gesamt benötigten minimalen Zeit`.

Die Funktion wird verwendet, um die Bedingungen in jedem Schritt der Binärsuche zu prüfen.
```go
func canHandled(times []int, time int64, human int) bool {
	var total int64 = 0
	
    for _, t := range times {
		total += time / int64(t)
	}
    
	return total >= int64(human)
}
```

Anschließend schreibe ich den Code, um die Binärsuche tatsächlich durchzuführen, unter Verwendung dieser Funktion.
```go
func solution(n int, times []int) int64 {
    maxTime := int64(1000000000) * int64(n)
    minTime := int64(1)
    answer := int64(0)
    for minTime <= maxTime {
        mid := (minTime + maxTime) / 2
        if canHandled(times, mid, n) {
            maxTime = mid - 1
            answer = mid
        } else {
            minTime = mid + 1
        }
    }
	
    return answer
}
```

Wenn das Ergebnis von `canHandled()` `true` ist, bedeutet das, dass die `anzahl der bearbeiteten Personen` größer oder gleich `n` ist, also wird `maxTime` verringert.
Im umgekehrten Fall, wenn es `false` ist, bedeutet dies, dass die `anzahl der bearbeiteten Personen` kleiner ist als `n`, deshalb wird in der nächsten Phase mehr Zeit benötigt, um dies zu reduzieren, und `minTime` wird erhöht.

An dieser Stelle wird `answer` nur aktualisiert, wenn `canHandled()` `true` zurückgibt, weil dies offensichtlich ein bearbeitbares Zeitrahmen ist, und daher braucht es keine Aktualisierung, wenn es nicht bearbeitet werden kann.