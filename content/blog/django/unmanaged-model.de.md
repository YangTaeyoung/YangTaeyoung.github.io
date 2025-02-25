---
title: Anwendung von Tests mit einem Unmanaged Model (feat. Table XXX doesn't exist)
type: Blog
date: 2022-04-20
comments: true
translated: true
---

Hatte ich bereits erwähnt, dass wir in der Firma daran arbeiten, den legacy Code, der mit Raw Query geschrieben wurde, auf eine Django ORM-basierte Architektur umzustellen?

Einige der Überlegungen, die ich letztes Mal aufgeschrieben habe, wurden bereits entschieden, und sowohl die Projektstruktur als auch die Methoden zur Dateiorganisation sind etwas klarer geworden. Jetzt möchte ich darüber posten, was passiert ist, während wir das Modell klassifiziert haben.

Während der Analyse der bestehenden `SQL Query` wurde überprüft, welche Tabellen mit anderen Tabellen verknüpft sind und wie groß der Einfluss ist. Die Klassifizierung der Modelle verlief bis dahin reibungslos. Ein Problem trat jedoch auf, als ich Testcodes schrieb, um zu überprüfen, ob alles gut funktioniert. Ein für Entwickler ~~willkommener?~~ Fehler trat auf:

`Table my_database.XXX doesn't exist.`

~~Was zur... warum gibt es diese Tabelle nicht?~~

---

## Was ist ein Unmanaged Model?

In `Django` benutzt man das Modul `django.db.models.Model`, um ein `Model` zu definieren, das mit der `DB` verbunden ist. Da `Django` auf der Basis von `Model` Migrationen unterstützt, kann man bei der Entwicklung einer `Django Native App` den direkten Zugang von `Django` zur `DB Table` erlauben.
_Nähere Informationen zu `migration` werde ich das nächste Mal detaillierter posten._

In diesem Fall wird das `Model`, das in `Django` definiert ist, zum direkten Schema für die Datenbankverbindung.

Das standardmäßig in der `Model`-Klasse festgelegte `managed = True` ist die Einstellung für ein von Django verwaltetes Datenbankschema. Der tatsächliche Code sieht folgendermaßen aus:

```python
class MyModel(models.Model):
  ...
  # Definieren der Datenbankfelder
  ...
  class Meta:
    db_table = "real_database_table_name"
    manage = True # Genau dieser Teil.
```

Die innere `Meta` Klasse im `Model` muss nicht explizit angegeben werden, wenn das Modell in einer `Django Native App` definiert wird, da `Django Model` dies standardmäßig festlegt.

 > Wenn die inside-the-Meta-Klasse konfigurierte managed-Variable auf False gesetzt ist, handelt es sich um ein Unmanaged Model, also ein Modell, das nicht von Django verwaltet wird.


## Table xxx doesn't exist

Endlich kann ich den Fehler erklären, mit dem ich konfrontiert war. 
`Django Unit Test` verwendet nicht die bestehende Datenbank, um Tests durchzuführen.

**Es sollte auch nicht verwenden.**

Selbst bei einer Entwicklungsdatenbank könnten andere Projekte beeinflusst werden oder die Datenbank könnte durch viele Testdurchführungen unordentlich werden (aufgrund vieler wiederholter Testfälle.. ~~unschön~~).

Um dieses Problem zu lösen, erstellt der Django Test auf Grundlage der Modelle mit `managed = True` ein `Test Database` in der DB, erstellt temporäre Tabellen und führt darin die Tests durch. Nach Abschluss der Tests werden die Testdatenbank und die Tabellen gelöscht.

Dabei sind die in `app/migration` definierten Tabellenschemata von Bedeutung.

Obwohl gesagt wurde, dass über das Modell erstellt wird, muss, um das Modell tatsächlich in die DB anzuwenden, ein Zwischenstadium durchlaufen werden, um die Änderungen des Modells in die DB zu übernehmen. Daher verfolgt und bewertet `Django` die Änderungsspur über die `migrations` innerhalb jeder App.

_+ Bei der Django-Einarbeitung wird häufig der Befehl `python manage.py makemigrations`, `python manage.py migrate` verwendet. Die Generierung erfolgt zu diesem Zeitpunkt._

Für ein `Unmanaged Model` sollte die Migration jedoch nicht verwendet werden. `Django` sollte nicht auf eine Datenbank zugreifen, die möglicherweise von anderen Diensten verwendet wird. Die DB gilt als Änderungsursprung, nicht `Django`. Daher sollte es `managed = False` sein.

Um Code von der DB in ein `Django`-Modell zu generieren, wird häufig der Befehl `python manage.py inspectdb` verwendet, was zu einem Modellcode führt, in dem `managed = False` zu finden ist.

Bei Tests ist die Situation jedoch ganz anders. Da es sich um eine temporäre DB handelt, spielt es keine Rolle, wenn sie generiert wird. Der TestDB kann jedoch aufgrund des Einflusses von `managed = False` nicht erstellt werden, was zu dem Fehler führt, dass die Tabelle nicht existiert.

## Lösung, was soll man tun?

Mein Fall war einfach, wenn auch ein wenig klobig gelöst. (Es war letztlich erfolgreich, aber es ist nicht die empfohlene Methode und wird in Zukunft ersetzt.)

Mehrere Blogs schlagen vor, den `Default Test Runner` zu ändern, um den `managed = False` in der `Meta Class` des `modells` zu ändern, bevor der Test ausgeführt wird.

Das, was ich angewendet habe, und auch die unten aufgeführten Beispiele verwenden im Wesentlichen die oben beschriebene Methode.

### Lösung #1: Abfangen des Befehls (Methode, die ich verwendet habe)

Um Tests durchzuführen, habe ich den Befehl abgefangen, wenn `test` enthalten war, so dass es `managed = False` geändert wird. Der eigentliche Code zur Änderung bestand aus nur zwei Zeilen und funktionierte wirklich gut.

Zuerst habe ich im Einstellungsfile Code definiert, der prüft, ob der Befehl `test` enthält.

Ich habe auf diesen Verweis verwiesen: [https://stackoverflow.com/questions/53289057/how-to-run-django-test-when-managed-false](https://stackoverflow.com/questions/53289057/how-to-run-django-test-when-managed-false)

```python
# settings.py
...
UNDER_TEST = (len(sys.argv) > 1 and sys.argv[1] == 'test')
...
```
Dann setzen Sie in der Metaklasse des Testmodells `managed = getattr(settings, 'UNDER_TEST', False)` wie unten gezeigt.
```python
# models.py
from django.conf import settings # Modul, um die Werte von settings.py, die ich definiert habe, zu erhalten.

class MyModel(models.Model)
  ...
  # Definierte Felder
  ...
  class Meta(object):
      db_table = 'your_db_table'
      managed = getattr(settings, 'UNDER_TEST', False)
```

### Lösung #2: Verwenden eines Customed Test Runner

Im oben beschriebenen Fall ist ein Vorteil, dass es einfach ist, Tests durchzuführen, aber der Nachteil ist, dass alle Modelle die `managed` Variablen auf denselben Wert ändern müssen.

Wenn dies fortgesetzt wird und es mehr Tabellen gibt, kann es sein, dass etwas übersehen wird, und wenn andere Teammitglieder Testcodes schreiben, müssen sie zu dieser Methode noch separate Kenntnis haben. _(Viele Regeln machen den Entwickler das Leben schwer)_

Wie bereits erwähnt, kann die Definition und Ausführung von Tests über einen separaten `Test Runner` eine konsistente, eigentliche Implementierung von Django beibehalten, und Teammitglieder können den Code ohne zusätzliche Übergabe reibungslos fortführen.

Die Idee ist, dass der `Test Runner` eine Klasse definiert, die bei der Erkennung von `managed = False` während des Tests alle Klassen in `managed = True` umwandelt und dann den Test durchführt.

Obwohl ich mit dieser Umsetzung noch keinen erfolgreichen Code habe, jederzeit einen Verweislink hierzu:

_Wahrscheinlich lag das Problem daran, dass ich nach der erfolgreichen Methode oben den `migration`-Ordner spät gelöscht hatte. Der leere `migration`-Ordner war der Schuldige (er hätte vollständig entfernt werden sollen). Dies wird, wenn es in der Firma möglich ist, angewendet und aktualisiert._

[Django 1.9 und höher](https://technote.fyi/programming/django/django-database-testing-unmanaged-tables-with-migrations/)

[Django 1.8 und niedriger](https://www.pythonfixing.com/2021/11/fixed-how-to-create-table-during-django.html)

## Zum Abschied

> Es war vielleicht nicht so ordentlich wie sonst, aber ich glaube, dass ich das Vertrauen gewinne, mich nach und nach zu ändern und anzupassen. Der eigentliche Beitrag mag nicht so lang sein, aber für diesen Blog hat es in der Firma viel Zeit in Anspruch genommen, um alles zu diskutieren... ㅠㅠ
> 
> Damit beende ich mein heutiges Posten, und beim nächsten Mal möchte ich mehr Details zu `Django Test Runner` oder `migration`, die ich heute während der Bug-Suche kennengelernt habe, posten!
> Vielen Dank fürs Lesen. Fragen oder Korrekturen sind jederzeit willkommen. Bitte verwenden Sie die Kommentarsection!