---
title: REST?, RESTful?, REST API? Was ist das überhaupt?
type: blog
date: 2022-02-28
comments: true
translated: true
---
Hallo! In diesem Beitrag möchte ich über REST sprechen, das im Web weit verbreitet ist. `REST` wurde im Jahr 2000 von Roy Fielding in seiner Doktorarbeit vorgestellt.

`REST` steht für Representation State Transfer und ist eine Form der Softwarearchitektur für `Hypermedia`-Systeme.

# Hypermedia?

Ein unbekanntes Wort, nicht wahr? Was ist `Hypermedia`?
<br>
Hypermedia ist ein **Netzwerkgeflecht, das mehrere Informationen wie Text, Grafiken, Animationen und Videos organisch mit Knoten und Links verbindet**.
<br><br>
Das Besondere daran ist, dass man durch die Verlinkungsfunktion **Informationen organisch verknüpfen und interaktiv abrufen kann**, indem man sie der Reihe nach hervorzieht! **Das Wesentliche dabei ist, dass die Informationen über Links verbunden sind**!

# Was ist also REST?

`REST` bezeichnet alles, was Ressourcen (`Resource`) durch den Namen der Ressource (Repräsentation der Ressource: `Representation`) unterscheidet und den Zustand der Ressource (`State`) überträgt.

Klingt ziemlich kompliziert, nicht wahr? Lassen Sie es uns einfacher ausdrücken.

![image](https://user-images.githubusercontent.com/59782504/155932531-4587a4ea-b9de-4625-a9ad-90adb1bd9e69.png)

Ressourcen sind all das, was wir beim Surfen im Internet häufig sehen. **Alles, was von einem Service bereitgestellt wird, wie Text, Videos, Bilder usw., kann als Ressource betrachtet werden**.

Was ist die **Repräsentation einer Ressource**? Es ist im Wesentlichen **das Benennen einer Ressource**.

Um Informationen im Internet anzusehen, müssen Sie ihnen Namen geben.

Stellen Sie sich vor, Sie möchten die folgenden Informationen darstellen.

![image](https://user-images.githubusercontent.com/59782504/155925520-e33b36c9-8d2b-49a2-b0bc-5346d0ab6db6.png)

- Es ist ein Bild von einem Löwen. Aber wie kann das Netzwerk das Löwenbild in der Datenbank abrufen?

<img width="541" alt="image" src="https://user-images.githubusercontent.com/59782504/155926067-7a1994ac-ad25-420e-91a4-7ff537605da1.png">

- Wie im nächsten Bild gezeigt, ruft der Internetbrowser das Löwenbild anhand des Ressourcennamens auf.
- Wie Sie auf dem Foto sehen können, fordert der Browser die Ressource über den Link an, der die Ressource enthält.

Es heißt `Repräsentation der Ressource`, wenn der `Name der Ressource` angegeben wird und `die Ressource über diesen Namen gesendet und empfangen` wird :)

Aber die Aufgaben, die im Internet durchgeführt werden, bestehen nicht nur darin, ein Löwenbild zu erhalten (`GET`).

# REST-Methoden

REST bietet über das HTTP-Protokoll vier wesentliche `Methoden`, um verschiedene Anfragen zu verarbeiten.

1. `GET`: Ein Protokoll, das sich auf **das Abrufen von Informationen** konzentriert. Wenn Sie sich bei Naver anmelden, wird Ihr Profil auf Ihrem Bildschirm angezeigt, oder? Beim Anmelden und Laden der Hauptseite wird vom Service ein Request gestellt, um Ihre Profildaten abzurufen, und diese werden dann vom Server zurückgegeben.<br>
2. `POST`: Ein Protokoll, das sich auf **die Erstellung von Informationen** konzentriert. Wenn Sie sich beispielsweise registrieren, werden Ihre Nutzerdaten über die POST-Methode an den Service gesendet, um in der Datenbank gespeichert zu werden.<br>
3. `PUT`: Ein Protokoll, das sich auf **die Bearbeitung von Informationen** konzentriert. Wenn Sie bei Naver Ihr Profil bearbeiten, werden die bearbeiteten Informationen über dieses Protokoll an den Service übermittelt.<br>
4. `DELETE`: Ein Protokoll, das sich auf **das Löschen von Informationen** konzentriert. Es wird verwendet, um eine Anfrage an den Service zum Löschen eines Datensatzes in der Datenbank, wie z. B. Kontoabmeldung oder Löschen von Beiträgen, zu senden.<br>

# Wie werden die tatsächlichen Daten gesendet und empfangen? (Zustand der Ressource: State)

Das Wesentliche des `REST`-Konzepts liegt in der Methode, wie Ressourcen gesendet und empfangen werden.

Tatsächlich werden Daten über das `XML`- oder `JSON`-Format gesendet und empfangen. Beispielsweise kann das Löwenbild, das wir vorhin erwähnt haben, so im `JSON`-Format ausgedrückt werden.

```json
{
  "pic_name": "lion",
  "link": "https://cdn.example.com/img/lion.png"
}
```
_▲ Beispiel JSON_

```xml
<?xml version="1.0"?>
<pic>
    <pic_name>lion</pic_name>
    <link>"https://cdn.example.com/img/lion.png"</link>
</pic>
```
_▲ Beispiel XML_

So kann der Zustand der Ressource als Wert zurückgegeben werden, und der Client kann die erhaltene Antwort verwenden, um z. B. dem `img`-Tag den Link zum Löwenbild hinzuzufügen und dem Benutzer die Informationen zum Löwen anzuzeigen.

# Die 6 Einschränkungen von REST
Entwickler können die folgenden Bedingungen einhalten, um `REST`-Protokolle zu implementieren.

1. **Einheitliche Schnittstelle** (Uniform Interface): **Schnittstellen müssen konsistent getrennt** sein. 
   - Es sollte nicht formatspezifisch sein, wie z. B. für ein bestimmtes Framework oder Programm, sondern ein Service, der die `REST`-Prinzipien befolgt, sollte in der Lage sein, Ressourcen über das `HTTP`-Protokoll zu senden und zu empfangen.
2. **Zustandslos** (Stateless): Es gibt eine **Prinzipienregel, dass der Kontext des Clients zwischen den Anforderungen nicht auf dem Server gespeichert werden sollte**.
   - Das Prinzip lautet, dass eine vorherige Anfrage die aktuelle Anfrage niemals beeinflussen darf.
     - Als Beispiel kann die Anmeldung dienen.
     - Vor REST und auch heute noch speichern und verwalten viele Services Benutzer-Authentifizierungsinformationen auf dem Server in Form von Sessions.
     - Wenn jedoch ein vollständig in REST implementierter Service vorhanden ist, sollte der Benutzer (Client) die Authentifizierungsinformationen selbst verwalten.
     - Normalerweise wird die Anmeldeinformation in verschlüsselter Form wie `JWT Token` im Header gespeichert und bei jeder Anfrage, die eine Authentifizierung erfordert, die Authentifizierungsinformation im Header hinzugefügt.
3. **Cachefähig** (Cacheable): Ein großer Vorteil von REST ist, dass es **das Webstandard-`HTTP`-Protokoll in seiner ursprünglichen Form verwendet**.
   - Das bedeutet, dass Sie die `Caching`-Funktion von `HTTP` nutzen können. `Caching` bezieht sich auf die **Technik, eine Kopie einer gegebenen Ressource zu speichern und bereitzustellen, wenn sie angefordert wird**.  
   - Wenn bei jeder Anforderung Ressourcen vom Server angefordert werden, würde dies eine große Belastung für den Server darstellen.
   - Aus diesem Grund werden Dateien oder zuvor bereitgestellte Anforderungen, die bereits empfangen wurden, als Cache-Dateien gespeichert, und bei Anfragen nach vorhandenen Ressourcen **werden keine weiteren Anfragen an den Server gesendet, sondern die Ressourcen werden als Antwort zurückgegeben**.
4. **Schichtung** (Layered System): Ein Client stellt seine Anfrage in der Regel nicht direkt an den Service. Der Service muss API-Server für den Benutzer bereitstellen, über den der Client Ressourcen anfordern (`Request`) und empfangen (`Response`) kann. 
   - In `Spring`-Projekten zum Beispiel stellen `Controller`, in `Django`-Projekten die `View` den typischen Kommunikationspunkt mit dem Client dar.
   - Zusätzlich kann der `API-Server` nur die geschäftliche Logik ausführen, während Frontend-Features wie Authentifizierung und Lastverteilung zusätzlich implementiert werden können.
5. **Code On Demand**: Der Client sollte als Option in der Lage sein, Skripte vom Server zu erhalten und diese auszuführen, obgleich diese spezielle Einschränkung optional ist.
6. **Client-Server-Architektur**: Der `Server` ist die Entität, die die Ressourcen bereitstellt, während der `Client` diejenige ist, die die Anfragen stellt. 
   - Der `Server` ist zuständig für die Bereitstellung der `API`, die Verarbeitung der Geschäftslogik und das Speichern der Informationen.
   - Der `Client` hingegen ist dafür verantwortlich, die benötigten Ressourcen vom Server anzufordern und ist für die Verwaltung von Benutzerinformationen wie Authentifizierung oder Sessions verantwortlich.

# REST API

Unter REST API versteht man eine Schnittstelle, die auf der `REST`-Architektur basiert und die einem Client die Möglichkeit gibt, Anfragen zu senden und Ressourcen zu nutzen.

Schauen wir uns ein Beispiel einer `REST API` an, die ich während eines Projekts implementiert habe!

<img width="250" alt="image" src="https://user-images.githubusercontent.com/59782504/155930373-280d5db5-6273-4384-a533-5cedbed5ea26.png">

Eine `API` muss, wie oben gezeigt, das Anforderungs-URI, den Status der über das URI empfangbaren Ressourcen (`JSON`) und die Anforderungsmethode beschreiben. Die Entwickler auf der Clientseite erstellen die Clientschnittstelle so, dass die darin enthaltenen `JSON`- oder `XML`-Daten den Nutzern in geeigneter Weise angezeigt werden können.

# RESTful

`RESTful` ist ein Begriff, der verwendet wird, um Webservices zu beschreiben, die die `REST`-Architektur implementiert haben. Wenn ein bestimmter Webservice eine `REST API` implementiert hat, kann man sagen, dass der Dienst `RESTful` ist.

## Ziel

Das Ziel ist, eine API zu schaffen, die intuitiv verständlich und einfach zu nutzen ist, sodass jeder sie verwenden kann.

# Fazit
- Wir haben nun die im Web weit verbreitete Architektur `REST`, `REST API` und `RESTful` kennengelernt.
- Wenn Sie Fragen haben oder etwas nicht klar ist, lassen Sie es mich bitte jederzeit wissen. Ich werde es umgehend bearbeiten!

## Referenzen
* [https://gmlwjd9405.github.io/2018/09/21/rest-and-restful.html](https://gmlwjd9405.github.io/2018/09/21/rest-and-restful.html)
* [https://developer.mozilla.org/ko/docs/Web/HTTP/Caching](https://developer.mozilla.org/ko/docs/Web/HTTP/Caching)
* [https://ko.wikipedia.org/wiki/REST](https://ko.wikipedia.org/wiki/REST)
* [https://blog.daum.net/hsyang112/7](https://blog.daum.net/hsyang112/7)