---
title: Wenn bei der Verwendung von AWS Load Balancer ständig 405 (Method Not Allowed) auftritt
type: blog
date: 2023-11-23
comments: true
translated: true
---

In der Firmen-API-Server wurde ein Webhook-Endpunkt erstellt, der POST-Anfragen erhält, da eine API im Zusammenhang mit Webhooks erstellt werden musste.

Obwohl der Server, der die Anfragen sendet, eindeutig POST-Anfragen korrekt sendet, zeigt das Log des empfangenden Servers 405 (Method Not Allowed) an.

![image](/images/aws/lb_https_redirect_caution-1700742951722.png)

## Ursache

Beim Verwenden von AWS Load Balancer gibt es eine Funktion, die HTTP-Anfragen nach HTTPS umleitet.

![image](/images/aws/lb_https_redirect_caution-1700743047350.png)

Im Allgemeinen wird dies wie oben gezeigt konfiguriert, in diesem Fall wird eine 301 (Moved Permanently) Umleitung vorgenommen, sodass eine über HTTP gesendete POST-Anfrage bei der Umleitung zu HTTPS in eine GET-Anfrage geändert wird.

Da der Server hinter dem Load Balancer steht, gibt es keinen Endpunkt, der GET-Anfragen empfängt, was zu 405 (Method Not Allowed) führt.

Dies lässt sich im Diagramm wie folgt darstellen:

![image](/images/aws/lb_https_redirect_caution-1700744557719.png)

### Prinzip der Umleitung

Bei einer allgemeinen Umleitung erhält der Client (wie z.B. Webbrowser) eine Umleitungsantwort wie 301 (Moved Permanently) vom Server, woraufhin der Client eine erneute Anfrage an die in der Location-Header der Umleitungsantwort enthaltene Adresse sendet.

In solchen Fällen werden Informationen wie die ursprünglich gesendete Anfrage und die HTTP-Methode in der Regel nicht beibehalten, sodass eine erneute Anfrage als GET erfolgt, ohne die ursprünglich gesendete Body-Daten.

## Lösung

Die Lösung ist sehr einfach. Senden Sie statt umgeleitet zu werden, Ihre Anfrage von Anfang an über HTTPS.

Bei Funktionen wie der vom Load Balancer bereitgestellten, die beim Empfang und Versenden von statischen Seiten (z.B. Anfragen mit dem content-type `text/html`) verwendet werden, umleitet man sie über das HTTPS-Protokoll. Bei einem REST-API-Server sollte die Anfrage mit der URL `https` statt `http` gesendet werden.

### Referenz

- [https://webstone.tistory.com/65](https://webstone.tistory.com/65)