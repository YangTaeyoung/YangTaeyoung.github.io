---
title: Daten-Parsing über PUT in einer Klassenansicht
type: blog
date: 2022-04-12
comments: true
translated: true
---

## Die Anfrage hat kein Attribut 'data'
In der Firma entstand ein Problem, als wir eine ursprünglich funktional gestaltete Ansicht in eine Klassenansicht umgebaut haben.

Wenn man Django verwendet, gibt es einige Punkte, die ein wenig seltsam erscheinen. Dies trifft insbesondere zu, wenn man Daten über das `REST Framework` erhält.

In meinem Fall erhielt ich den Fehler `AttributeError: request has no attribute 'data'`.

Sehen wir uns zunächst die von mir implementierte Klasse an:

```python
# urls.py
urlpatterns = [
  path('meine_url/', views.MyView.as_view())
]

# views.py
class MyView(View)
  def put(self, request):
    meine_daten = request.data
    # meine Business-Logik
    
```

Natürlich wurden im `JavaScript` ordnungsgemäß Daten an `meineapp/meine_url/` gesendet. Der Variablen `request.data` wurde jedoch nichts zugewiesen.

Wer sich mit dem `Django Rest Framework` auskennt, wird erkennen, dass dieser Code seltsam ist.

Das ist mir klar. In der Regel implementiert man `Serializer` und parst Daten über diese Klasse im `JSON`-Format, nicht wahr?

Leider war das in meiner Situation nicht möglich.

Es gab kein Modell zur Referenz, und fast alle mit Modellen verbundenen Funktionen führten Rohe Abfragen direkt auf der Datenbank aus, sodass es belastend war, die `Serializer` unabhängig zu konstruieren.

Selbst wenn `Serializer` die Daten vor den Modellen empfängt, könnte das Zerlegen der Daten beim Neuentwurf der Modelle zu Risiken führen.

Zurück zum Code. Der obige Code konnte keine Daten korrekt empfangen. Also habe ich das Problem mit dem PyCharm IDE Debugger untersucht.

In der Tat existierte in `request` das Mitgliedsvariable `data` überhaupt nicht.

Das ist merkwürdig. Als wir keine `Class View` sondern eine `Function View` verwendeten und den Code wie unten gestalteten, wurde `request.data` einwandfrei empfangen.

Natürlich gibt es für empfangene `GET`- und `POST`-Daten interne Mitgliedsvariablen wie `request.POST` und `request.GET`, die die Daten separat parsen und speichern, aber bei `PUT` und `DELETE` existiert so etwas nicht, was wirklich rätselhaft war.

```python
# urls.py
urlpatterns = [
  path('meine_url/', views.meine_Ansicht)
]

# views.py 
  def meine_Ansicht(self, request):
    meine_daten = request.data
    # meine Business-Logik
    
```

Ich habe nach dem Keyword `class view django put` gegoogelt und es geschafft, die folgende Seite zu finden.

Lassen Sie uns in einem Blog nach Antworten suchen.

Der nachfolgende Inhalt bezieht sich auf diesen [Blog](https://thihara.github.io/Django-Req-Parsing/).

## `request.POST` ist nicht das gleiche wie ein REST-POST.
Wenn man sich den Blog ansieht, kann man in einer [solchen Unterhaltung](https://groups.google.com/g/django-developers/c/dxI4qVzrBY4/m/m_9IiNk_p7UJ) zwischen Entwicklern in einer Google-Gruppe sehen.

Aus der Konversation geht hervor, dass `Django`'s `request.POST` nicht für `REST`, sondern für Daten ausgelegt ist, die bei der Übermittlung eines `HTML`-Formulars mit `method="post"` empfangen werden.

In den meisten Fällen ist der Content Type bei `POST`, das über ein Formular gesendet wird, auf `multipart/form-data` eingestellt, sodass die Kodierung von `JSON` abweicht.

`Django` hat `request.POST` für die Verarbeitung solcher Formulardaten entworfen, was unerwartete Fehler bei der Verwendung von `REST framework` und dem Senden von Daten im `JSON`-Format verursachen kann.

Es ist schwierig, aber es stellt sich heraus, dass es keine `request.PUT` oder `request.DELETE` im `request` gibt.

## Was soll man also tun?
Tatsächlich wäre es bequem, Daten wie bei `request.POST` oder `request.GET` in `request.PUT` zu empfangen, weil der Zweck darin besteht, Klassenansichten zu erstellen, ohne dass ein `Serializer` durch ein Modell implementiert ist.

Zu diesem Zweck werden wir das `request` während der Übergabe an die Funktion im Middleware vorab abfangen und eine Variable namens `PUT` zu den untergeordneten Eigenschaften von `request` hinzufügen.

Wir werden auch eine `JSON`-Eigenschaft hinzufügen, um Fälle abzudecken, in denen der `Content-Type` bei `POST` oder `PUT` auf `application/json` eingestellt ist!

## Lösung

Legen Sie, falls Sie einen Ordner für allgemeine Module haben, eine neue Datei `parsing_middleware.py` ab (der Name spielt keine Rolle, es kann auch ein anderer gewählt werden). Wenn nicht, erstellen Sie einen neuen Ordner.

Ich habe einen Ordner `COMMON` für gemeinsame Module erstellt und zur Unterteilung der Module einen `middleware`-Ordner darin platziert und eine `parsing_middleware.py`-Datei erstellt.

```python
# COMMON/middleware/parsing_middleware.py

import json

from django.http import HttpResponseBadRequest
from django.utils.deprecation import MiddlewareMixin


class PutParsingMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.method == "PUT" and request.content_type != "application/json":
            if hasattr(request, '_post'):
                del request._post
                del request._files
            try:
                request.method = "POST"
                request._load_post_and_files()
                request.method = "PUT"
            except AttributeError as e:
                request.META['REQUEST_METHOD'] = 'POST'
                request._load_post_and_files()
                request.META['REQUEST_METHOD'] = 'PUT'

            request.PUT = request.POST


class JSONParsingMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if (request.method == "PUT" or request.method == "POST") and request.content_type == "application/json":
            try:
                request.JSON = json.loads(request.body)
            except ValueError as ve:
                return HttpResponseBadRequest("unable to parse JSON data. Error : {0}".format(ve))
```

Und konfigurieren Sie `settings.py`, um diese Middleware zu nutzen, dann sind Sie fertig.

```python
# my_project_name/settings.py
MIDDLEWARE = [
...
  # Middleware hinzufügen für PUT und JSON-Parsing
  'COMMON.middleware.parsing_middleware.PutParsingMiddleware',
  'COMMON.middleware.parsing_middleware.JSONParsingMiddleware',
...
]
```

## Zukünftige Überlegungen

Ich werde auch den Problemen beim Umgestalten von Raw Queries zu Django Model-basierten Queries in zukünftigen Beiträgen nachgehen, aber das Django-Projekt-Layout scheint das eigentliche Problem zu sein.

Diverse Referenzen zeigen, dass auch die Django-Dokumentation eine Struktur mit unvermeidlich großen `views.py` und `models.py` befürwortet.

_▼ Beispiel für ein Best Practice auf Django_

![image](https://user-images.githubusercontent.com/59782504/163424387-9d327726-249a-4212-9089-053b6ef04825.png)

Ich weiß nicht, ob dies die ideale Struktur in `Python` ist, aber es gibt sofortig zahlreich erkennbare Probleme.

`Django` legt nahe, dass es in einer unabhängigen App `views.py` für Geschäftslogik und Controller sowie `models` für Datenbankmodelle und `template` für `HTML`, `CSS`, `JS` gibt. Doch je mehr Funktionen man zur App hinzufügt, umso mehr Abhängigkeiten erhält eine Datei.

Aber wenn man `views.py` unüberlegt trennt, treten Probleme wie zyklische Abhängigkeiten, zunehmende Abhängigkeit und damit zusammenhängende Probleme auf.

Module sollten unabhängig, im Einklang mit dem objektorientierten Modell, gestaltet werden, aber Funktionen wie ein `IOC`-Container für das Abhängigkeitsmanagement wie in `Spring` gibt es in `Django` nicht.

Es bleibt eine zukünftige Aufgabe, wie man Module souverän gestaltet und Dienstleistungen hochwertig entwickelt.

Die Automatisierung von Dokumenten für die Übergabe ist ebenfalls eine wichtige Aufgabe.

Wie ich diese Probleme und Überlegungen gelöst habe, wird in zukünftigen Beiträgen skizziert!

## Abschließend

- Heute haben wir den Prozess der Behebung eines Problems betrachtet, das entstand, als ich eine funktionale Ansicht in eine Klassenansicht umwandelte. Auch wenn nur wenige genau das gleiche Problem haben, hoffe ich, dass dieser Beitrag von Nutzen im Fall ähnlicher Probleme sein kann.
- Konstruktives Feedback und Anregungen sind immer willkommen.
- Vielen Dank!