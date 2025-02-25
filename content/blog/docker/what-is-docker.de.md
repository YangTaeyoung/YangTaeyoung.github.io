---
title: "[Docker] Docker kennenlernen"
type: blog
date: 2022-07-11
weight: 1
comments: true
translated: true
---
# Was ist Docker?

![img.png](/images/docker/img_9.png)

Wenn man die Definition von [AWS](https://aws.amazon.com/) übernimmt, ist Docker eine Softwareplattform, die es ermöglicht, Anwendungen schnell zu entwickeln, zu testen und bereitzustellen.

Docker verwendet das Konzept von Containern, um Anwendungen, die auf schwergewichtigen Betriebssystemen oder virtuellen Maschinen laufen, zu verschlanken und verschiedene Probleme zu lösen.

In letzter Zeit wird Docker nicht nur lokal, sondern auch in verschiedenen Cloud-Umgebungen genutzt.

So kann man beispielsweise in AWS Docker-Images verwenden, um Bereitstellungen vorzunehmen, und in Github Actions kann Docker installiert werden, um die automatische Bereitstellung und einfache Bereitstellungsaufgaben durchzuführen.

## Welche Probleme löst Docker?
Bei der Installation der Entwicklungsumgebung tritt man auf verschiedene Probleme.

Ich habe während eines Projekts einen Vorfall erlebt, bei dem ein Teamkollege bei der Verwendung von `mysqlclient` in `Python` - um `Maria DB` zu verwenden - einen Fehler bekam und wir beim Trouble Shooting herausfanden, dass die Sprache Python sehr versionssensibel ist.

Zu Beginn des Projekts war Python 3.8 aktuell, aber als der Fehler auftrat, verwendete mein Kollege Python 3.10.

Es stellte sich heraus, dass das `mysqlclient`-Modul nur bis Python 3.9 erhältlich war, während mein Kollege Python 3.10 verwendete.

Solche Probleme treten nicht nur in speziellen Sprachumgebungen wie Python auf.

Besonders wenn das Betriebssystem unterschiedlich ist oder die OS-Version unterschiedlich ist, können solche Situationen häufig auftreten, z.B. wenn:

1. Ein Windows-Entwickler verwendet C von Visual Studio.
2. Ein Linux-Entwickler verwendet den GCC-Compiler.

```cpp
#include<stdio.h>
#include<stdlib.h>

int add(int num,...)
{
    int a, b, anw=0;
    int* point=NULL;

    point=&num+1;

    for(a=0;a<=num;a++)
    {
        anw+=point[a];
    }
    return anw;
}
```
In VS ist die obige Funktion einfach eine Funktion, die den ersten Parameter num verwendet und die nachfolgenden Parameter wie variable Argumente behandelt und sie addiert,

aber in GCC wird diese Schreibweise nicht unterstützt und es wird ein Müllwert zurückgegeben.

Entwickler können zwar Konventionen und Konfigurationsdateien verwenden, um die Entwicklungsumgebung, Compiler und Versionen abzustimmen, aber es ist keine perfekte Lösung.

1. Bei neuen Versionen könnten Verbesserungen oder Sicherheitsupdates enthalten sein, die ein Update erfordern, könnten aber verhindern, dass geupdatet wird.
> In diesem Fall müssen alle Entwickler das Modul aktualisieren, um die Versionen anzupassen. Es kann ziemlich lästig sein.
2. Wenn ein neuer Entwickler hinzugefügt wird, muss er die Fehler und die Entwicklungsumgebung von Grund auf neu einrichten.
> Entwicklerstunden sind teuer, es ist eine Verschwendung von Arbeitskraft.

# Virtuelle Maschine
Kann man es nicht einfach machen?

Ein erster Vorschlag war die **Virtuelle Maschine**.

Man kann es einfach verstehen, wenn man die Virtualisierung des Betriebssystems als Lösung ansieht, die es ermöglicht, unabhängig auf der CPU zu laufen.
Mit einer virtuellen Maschine kann man Betriebssysteme mit installierten Entwicklungsumgebungen, spezifischen Modulen und Versionen als Image verwalten.

Auch wenn es wie eine universelle Lösung erscheinen mag, gibt es auch bei virtuellen Maschinen **Probleme**.

_**Es handelt sich um Ressourcenverschwendung.**_

Viele Betriebssysteme enthalten nicht nur die Werkzeuge und Umgebungen, die für die Entwicklung benötigt werden, sondern auch ihre eigenen Programme. Man könnte sagen, es ist wie das Ausführen eines Computers innerhalb meines Computers.

Es gibt etwas, das `HyperVisor` genannt wird. Der HyperVisor hat die Aufgabe, die Infrastrukturressourcen eines Computers auf unterschiedliche virtuelle Maschinen zu verteilen.
Jede virtuelle Maschine, die Infrastrukturressourcen zugeteilt bekommt, hat ein eigenes unabhängiges Gast-Betriebssystem.

![img_1.png](/images/docker/img_1.png)

In dem obigen Bild ist das Betriebssystem, das jeder VM zugeteilt ist, zu sehen. Da es sich um unnötige Ressourcen handelt, spricht man von Ressourcenverschwendung.

# Container
Wie sieht es mit Containern aus?
Ein Container wird direkt auf dem eigenen OS, dem HOST, ausgeführt **als ob er ein eigenständiges Programm wäre**.

Da jeder Container unter der Docker-Engine unabhängig läuft, ist es nicht nötig, das Betriebssystem zu absolvieren oder die Infrastruktur unabhängig zu verteilen, was es skalierbar und schnell macht.

![img.png](/images/docker/img_0.png)

Auch die Migration, das Backup und die Übertragung ist einfacher. Im Vergleich zu VMs ist es kleiner.

**"Jetzt müssen sich neue Entwickler keine Sorgen mehr machen, dass der Computer durch das Installieren vieler VMs langsamer wird."**

_~~Man kann Container verwalten~~_


# Docker
Kommen wir zurück zum Thema. Was ist Docker?

Docker ist eine der Open-Source-Container-basierte Virtualisierungsplattformen, die zuvor erwähnt wurden.
Neben dem Betriebssystem stellt Docker auch Entwicklungsinfrastrukturen wie Datenbanken, Compiler, Interpreter usw. in Form von Images bereit.
> _Für einen Eindruck davon, wie enorm diese Infrastruktur ist, schauen Sie sich bitte kurz [Docker Hub](https://hub.docker.com/) an_

![img_2.png](/images/docker/img_2.png)

#### Image
Der Container von Docker bietet die Fähigkeit zur Verpackung und zum Ausführen jeder Anwendung.
> Dies ist das starke Image (`image`) von Docker. Images sind das Ergebnis der Verpackung von Containern.

#### Volume, Bind
Man kann direkt den Speicher des Hosts `binden` und verwenden oder ein `Volume` im virtualisierten Speicherraum von Docker (eigentlich im Speicherraum des Hosts) erstellen, um es mit anderen Containern zu teilen.

Diese starken Eigenschaften bedeuten, dass man das eigene Entwickler-Repository (wie Git, SVN) nicht direkt in das virtualisierte OS schieben muss, sondern die Möglichkeit hat, Entwicklungen über lose Verknüpfungen in Echtzeit zu reflektieren.

#### Docker Registry
Ich habe vorher erwähnt, dass man ein Image, das über Docker Hub aufgebaut wurde, herunterladen und verwenden kann. Ein Docker-Registry ist der Speicherort für Images, und Docker Hub ist das öffentliche Registry für Benutzer von Docker.

# Referenz
- [Container und Docker Begriffsdefinition - geunwoobaek.log](https://velog.io/@geunwoobaek/%EC%BB%A8%ED%85%8C%EC%9D%B4%EB%84%88-%EB%B0%8F-%EB%8F%84%EC%BB%A4-%EA%B0%9C%EB%85%90%EC%A0%95%EB%A6%AC)
- [Docker Benutzerhandbuch](https://docs.docker.com/get-started/overview/)
- [Einführung in Docker für Anfänger - subicura](https://subicura.com/2017/01/19/docker-guide-for-beginners-1.html)
- [Zustände eines Docker-Containers - baeldung](https://www.baeldung.com/ops/docker-container-states)