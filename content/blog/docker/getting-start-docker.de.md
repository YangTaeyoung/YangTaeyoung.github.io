---
title: "[Docker] Einführung in Docker: create, exec, start, run, commit"
type: blog
date: 2022-07-12
weight: 2
comments: true
translated: true
---

# Einführung in Docker
Lass uns beginnen, Docker Schritt für Schritt kennenzulernen.

## Docker Installation
Folge diesem [Link](https://docs.docker.com/get-docker/), um Docker für dein Betriebssystem zu installieren.

## Docker Image holen
Um Docker auszuführen, kannst du die zahlreichen Images auf [Docker Hub](https://hub.docker.com) verwenden.
Wir werden uns zum Test das Python-Image anschauen.

![img_3.png](/images/docker/img_3.png)
> ▲ `python` im Docker Hub suchen

Öffne das Terminal und gib `docker pull python` ein, um das neueste Python-Image zu erhalten.

![img_4.png](/images/docker/img_4.png)
> Wenn dein Service eine bestimmte Python-Version benötigt, kannst du durch Tagging eine bestimmte Version installieren.<br>
_Bsp.: `docker pull python:3.8.13`_

---
# Docker Container Status
Um die folgenden Befehle zu verstehen, ist es notwendig, den Status eines Docker-Containers zu kennen.

Docker-Container haben, wie normale Prozesse, verschiedene Statuswerte.

Jede Statusbeschreibung ist unten angegeben.
### 1. Created
Wenn ein Container erstellt wurde, aber noch nicht verwendet wurde, erhält er diesen Status.

Er verbraucht keine CPU oder Speicher des Host-Betriebssystems.

### 2. Running
Dies bedeutet, dass der Container in Betrieb ist.
Dieser Status zeigt an, dass der Prozess im Container unabhängig vom Host-Betriebssystem ausgeführt wird.

### 3. Restarting
Dieser Status bedeutet, dass der Container gerade neu startet.

Der Neustart-Aktion kann man mit dem `--restart=[RESTART_POLICY]` Option des `docker run` Befehls festlegen.
* `RESTART_POLICY`
    * `no`: Kein Neustart (`default`)
    * `on-failure`: Neustart bei abnormalem Ausstieg des Containers
    * `always`: Immer neustarten wenn der Prozess beendet wird
    * `unless-stopped`: Neustart, außer der Container wurde manuell gestoppt oder Docker selbst wird gestoppt bzw. neu gestartet

### 4. Exited
Dieser Status bedeutet, dass der interne Prozess beendet wurde. Wie der Created-Status verbraucht er keine CPU- oder Speicher-Ressourcen.

> Normalerweise wird ein Container aus den folgenden Gründen in den Exited-Status versetzt:
1. Der interne Prozess ist abgeschlossen.
2. Eine Ausnahme trat während der Ausführung des internen Prozesses auf.
3. Der Container wurde manuell mit dem `stop` Befehl beendet.
4. Ein interaktives Terminal ist für einen Container mit `bash` nicht eingerichtet.

### 5. Paused
Dies zeigt an, dass alle Prozesse für unbestimmte Zeit ausgesetzt sind.
Mit dem Befehl `docker pause` kann ein bestimmter Docker-Container pausiert werden.

### 6. Dead
Dieser Status tritt auf, wenn der Container gelöscht werden sollte, aber bestimmte Ressourcen von einem externen Prozess verwendet werden.

Container in diesem Status können nicht neu gestartet werden und können nur gelöscht werden.

---
# Erstellen von Containern: `create`
Auf Basis des erhaltenen Images kann ein Container mit dem Befehl `create` erstellt werden.

## Usage
Verwende den Befehl folgendermaßen:
```shell
$ docker create [OPTIONS] IMAGE [COMMAND] [ARG...]
```

## Häufig verwendete Optionen
Wenn du eine Liste aller Optionen des Docker `create` Befehls sehen möchtest, beziehe dich auf [diese Seite](https://docs.docker.com/engine/reference/commandline/create/).

### `--name [CONTAINER_NAME]`
Wird verwendet, um dem auszuführenden Container einen Namen zu geben.
```shell
$ docker ps -a

CONTAINER ID   IMAGE                    COMMAND                  CREATED              STATUS                  PORTS                    NAMES
d4a0d00c26f9   docker/getting-started   "/docker-entrypoint.…"   Vor 21 Sekunden      Created                                          hello
000e821c8396   docker/getting-started   "/docker-entrypoint.…"   Vor etwa einer Minute running Vor etwa einer Minute       0.0.0.0:80->80/tcp       admiring_jemison
```
Um alle mit Docker erstellten Container zu sehen, gib `docker ps -a` ein. Der Containername wird in der rechten Spalte angezeigt, wobei der Container mit dem `name` `hello` einen Namen hat.

Der Name des Container-Images wird bei zukünftigen Builds standardmäßig als Containername gesetzt.

### `--publish, -p [HOST_PORT]:[CONTAINER_PORT]`
Für diese Option ist ein grundlegendes Verständnis von Portweiterleitung notwendig.

Portweiterleitung in Docker bedeutet, dass Anfragen, die an einen Port des Host-Betriebssystems gerichtet sind, vom entsprechenden Container-Port angenommen werden.
Wenn das Flag beispielsweise auf `-p 80:8000` gesetzt ist, werden Anfragen an Port 80 des Host-Betriebssystems an Port 8000 des Containers weitergeleitet.
> 80 ist der Internet-Port, daher würde eine solche Konfiguration den Internetzugriff verhindern.

### `--tty, -t`
Aktiviert den TTY-Modus. Wie bei erfolgreicher SSH-Verbindung wird standardmäßig ein Terminal geöffnet, damit kannst du den Container im laufenden Terminal steuern.

Da ein Terminal normalerweise eine Tastatureingabe erfordert, wird diese Option normalerweise mit der vorherigen `-i` Option verwendet.

### `--interactive, -i`
Aktiviert die Standardeingabe (`STDIN`) selbst, wenn das Terminal nicht mit dem Container verbunden ist.

### `--volume, -v [VOLUME_NAME]:[REMOTE_PATH]`
Bindet `docker volume` an den Pfad des `container`.

> Vorerst kann man es so sehen, als ob ein Speichermedium verbunden wird.
>
> Diese Option erfordert ein Verständnis von Docker Volumes und wir werden es durch Vergleichsstudien später erkunden.

### `--workdir, -w [WORKDIR_PATH]`
Gibt das Verzeichnis an, in dem der Containerprozess ablaufen wird.
Das eingestellte Arbeitsverzeichnis wird der Startpunkt sein.

### `--env, -e [KEY=VALUE]`
Legt Umgebungsvariablen im Container fest. Diese werden normalerweise genutzt, um Konfigurationen oder Passwörter an den Container zu übergeben.

Fast alle Programmiersprachen haben Funktionen, um auf die OS-Umgebungsvariablen zuzugreifen, was ermöglicht, Konfigurationen sicher zu verbergen und zu verteilen.

### Kombination von Optionen
Optionen, die mit nur einem Bindestrich (`-`) beginnen, können kombiniert werden.
```shell
# Beispiel
$ docker run --name test -it debian
```
---

# Starten von Containern: `start`
Ein erstellter Container ist noch nicht aktiv.
Um den Container zu aktivieren, benutze diesen Befehl.

## Usage
```shell
$ docker start [OPTION] CONTAINER_NAME_OR_ID
```

---
# Befehl an einen laufenden Container senden: `exec`
Mit `exec` kannst du Befehle an einen aktiven Container senden.

Es wird in der Regel verwendet, um das Terminal eines laufenden Containers zu starten.
> _(Dies kann wie ein SSH-Zugang verwendet werden.)_

Ein markanter Punkt ist, dass durch `exec` gestartete Befehle den Hauptprozess nicht beeinflussen.

## Usage
Verwende den Befehl folgendermaßen:
```shell
$ docker exec [OPTIONS] CONTAINER COMMAND [ARG...]
```

## Häufig verwendete Optionen
Wenn du alle Optionen des Docker `exec` Befehl sehen möchtest, beziehe dich auf [diese Seite](https://docs.docker.com/engine/reference/commandline/exec/).

### `--detach , -d`
Führt den Befehl im Hintergrund aus.

### `--interactive, -i`
Aktiviert die Standardeingabe (`STDIN`) selbst, wenn das Terminal nicht mit dem Container verbunden ist.

### `--tty, -t`
Aktiviert den TTY-Modus. Wie bei erfolgreicher SSH-Verbindung wird standardmäßig ein Terminal geöffnet, damit kannst du den Container im laufenden Terminal steuern.

Da ein Terminal normalerweise eine Tastatureingabe erfordert, wird diese Option normalerweise mit der vorherigen `-i` Option verwendet.

### `--workdir, -w [WORKDIR_PATH]`
Gibt das Verzeichnis an, in dem der Containerprozess ablaufen wird.
Das eingestellte Arbeitsverzeichnis wird der Startpunkt sein.

### `--env, -e [KEY=VALUE]`
Legt Umgebungsvariablen im Container fest. Diese werden normalerweise genutzt, um Konfigurationen oder Passwörter an den Container zu übergeben.

Fast alle Programmiersprachen haben Funktionen, um auf die OS-Umgebungsvariablen zuzugreifen, was ermöglicht, Konfigurationen sicher zu verbergen und zu verteilen.

### Kombination von Optionen
Optionen, die mit nur einem Bindestrich (`-`) beginnen, können kombiniert werden.
```shell
# Beispiel
$ docker exec -it test /bin/bash
```
---
# Container erstellen und starten: `run`
Erhaltene Images können mit dem Befehl `run` ausgeführt werden.
> Der Befehl `run` erstellt (`create`) und startet (`start`) automatisch den Container.

## Usage
Verwende den Befehl folgendermaßen:
```shell
$ docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
```

## Häufig verwendete Optionen
Wenn du eine Liste aller Optionen des Docker `run` Befehls sehen möchtest, beziehe dich auf [diese Seite](https://docs.docker.com/engine/reference/commandline/run/).

Im vorherigen Abschnitt (`create`, `start`) wurden die gängigen Optionen für erstellen und ausführen behandelt.

Grundsätzlich funktioniert `run` wie eine Kombination aus den Befehlen `create` und `start`, sodass alle Optionen der beiden Befehle genutzt werden können.

### `--detach, -d`
Ein mit dieser Option versehener Container wird als Hintergrundprozess auf dem Host-Betriebssystem ausgeführt und gibt die Container-ID aus.

### Kombination von Optionen
Optionen, die mit nur einem Bindestrich (`-`) beginnen, können kombiniert werden.
```shell
# Beispiel
$ docker run --name test -it debian
```
---
# Vom Container zum Image: `commit`
Es ist gut, dass unser Container nach unseren Vorstellungen konfiguriert wurde. Nun kann unser Service unabhängig arbeiten.

Aber das in Kapitel 1 beschriebene Problem ist noch ungelöst.

Wenn jemand kommt, um unser Container zu übernehmen, wird er feststellen, dass der Container an sich nicht bereit zur Distribution ist, da **der Container nur läuft, aber nicht als image-distributierbare Form existiert.**

Der Befehl `commit` verwandelt einen laufenden **Container in ein Image**.

Damit wird es **für jeden nutzbar**.

Der grundlegende Befehl, um einen Container in ein Image zu konvertieren, ist wie folgt. Das erstellte Image wird auf dem lokalen Rechner gespeichert.

## Usage
Benutze den folgenden Befehl:
```shell
$ docker commit [OPTION] CONTAINER_NAME_OR_ID IMAGE_NAME
```
Wenn du danach `image` betrachtest, wirst du feststellen, dass das neue Image lokal gespeichert ist.
```shell
$ docker commit test test
95221529517f...
$ docker images
REPOSITORY               TAG       IMAGE ID       CREATED          SIZE
test                     latest    95221529517f   vor 3 Sekunden    118MB
```

## Fragestellung
Das Image ist lokal gespeichert worden, aber wurde es **geteilten**?

> Das Image ist noch nicht an andere weitergegeben worden.

Es wäre auch möglich, das Image oder den Container mit Befehlen wie `docker export` oder `docker save` in ein `tar`-Format zu speichern. Aber lasst uns eine elegantere Lösung betrachten.
> Durch ein Docker Repository.

## Docker Repository
Softwareentwickler haben sicherlich schon den Begriff `Repository` gehört.

Vielleicht aus dem `Annotation`-System von Spring beim Erstellen von Web-Anwendungen oder aus der Nutzung von Tools wie Github oder Gitlab zur Versionsverwaltung.

Ein `Repository` kann sowohl lokal für sich selbst als auch als Remote-Version zur gemeinsamen Nutzung existieren.

Docker ermöglicht ebenfalls das Teilen selbst erstellter Repositories, ähnlich wie Github.

Scharfsinnige Leser haben sicher schon erraten,

ja, dieser Repository Name ist [Docker Hub](https://hub.docker.com).

## Eigenes Repository erstellen
Die Erstellung eines Repositories unterscheidet sich nicht wesentlich von Github.

![img_5.png](/images/docker/img_5.png)

Zuerst auf Docker Hub auf `Create a Repository` klicken.

![img_6.png](/images/docker/img_6.png)

Auf der nächsten Seite die Details deines Repositories eingeben.

Wie bei Github kann durch Visibility die Öffentlichkeit (`Public`) oder Privatsphäre (`Private`) des Repositories festgelegt werden.

![img_7.png](/images/docker/img_7.png)

Nachdem das Repository erstellt ist, gibt es Befehle um mit `push` zu arbeiten.
> Wer Github nutzt, kennt sicher das Keywort `push` nur allzu gut. Es bedeutet genau das, was du denkst. Dasselbe `push`.

### Tag
Auf dem Bildschirm wird nach einem Tagname gefragt.

Dieser wird im Allgemeinen bei Commit-Erstellung gesetzt und entspricht normalerweise einer Versionsnummer.

Wie beim Ziehen des Python-Images mit dem Befehl `docker pull python:3.8`,<br>
der **String nach dem Doppelpunkt (`:`), z.B. `3.8`, ist der Tagname.**

## Usage
Der oben beschriebene Anwendungsweg ist beschränkt auf den lokalen Bereich.
Nach dem offiziellen Docker-Dokument lautet der Befehl `commit` wie folgt:
```
$ docker commit [OPTIONS] CONTAINER [REPOSITORY[:TAG]]
```
> Ja, die Bildbezeichnung korreliert mit dem Repositorynamen.

Das Wort `commit` lässt vermuten, dass **es noch nicht veröffentlicht ist.**
> Es ändert sich im Grunde nichts.

## Verfügbare Optionen

### `--message, -m [MESSAGE]`
Ähnelt den konventionellen Git-Commit-Nachrichten.

Diese Option ermöglicht das Hinzufügen einer Nachricht zum Erstellungszeitpunkt des Commits.

### `--author, -a [AUTHOR]`
Speichert die Informationen über den Image-Autor.

### `--change, -c`
Diese Option wird verwendet, wenn ein Container mit einem `Dockerfile` erstellt wurde und ein Commit erstellt werden soll.
> Das Thema `Dockerfile` wird im nächsten Kapitel behandelt.

## Ähnlicher Befehl: `build`
Zusätzliche zu `commit`, gibt es ebenfalls den Befehl `build`, um ein Bild zu erstellen.
Aber das erfordert ein Verständnis von `Dockerfile`, weshalb dies im späteren Kapitel erklärt wird.

# Image im Repository teilen: `push`
Nun ist es der letzte Schritt, das erstellte Bild in unser Repository zu `push`.

## Usage
Benutze folgenden Befehl:
```shell
$ docker push [OPTIONS] NAME[:TAG]
```

Das `NAME[:TAG]` korrespondiert mit dem `[REPOSITORY[:TAG]]` in `commit`.

```shell
$ docker push xodud9632/test-repo:ver1
The push refers to repository [docker.io/xodud9632/test-repo]
27d8bf01e7ea: Mounted from library/debian
ver1: digest: sha256:ef143c422f108a12a93c202078d2d9e8c2966e9479b74f6662af9e32bb05ad73 size: 529
```
Nach der Anwendung wird eine solche Meldung erscheinen und

![img_8.png](/images/docker/img_8.png)

wir können sehen, dass es im Repository aktualisiert wurde.

### Error: `repository does not exist or may require 'docker login'`

Wenn diese Fehlermeldung erscheint, bedeutet es, dass du noch nicht im Docker CLI eingeloggt bist.

```shell
$ docker login
```

Nach der Eingabe des Kommandos und der Eingabe von ID und Passwort kannst du dich anmelden und es wird erfolgreich durchgeführt.

# Referenz
* **Docker Offizielle Dokumentation**
    * [run-Befehl](https://docs.docker.com/engine/reference/commandline/run/)
    * [create-Befehl](https://docs.docker.com/engine/reference/commandline/create/)
    * [exec-Befehl](https://docs.docker.com/engine/reference/commandline/exec/)
    * [start-Befehl](https://docs.docker.com/engine/reference/commandline/start/)
    * [push-Befehl](https://docs.docker.com/engine/reference/commandline/push/)
    * [commit-Befehl](https://docs.docker.com/engine/reference/commandline/commit/)
* **Blogs**
    * [LainyZine - Verwendung des docker exec Befehls](https://www.lainyzine.com/article/docker-exec-executing-command-to-running-container/)
    * [JACOB - Einführung in Docker 4 - Docker Image erstellen](https://code-masterjung.tistory.com/133)
    * [Nirsa - \[Docker CE\] Docker Repository Login-Fehler](https://nirsa.tistory.com/46?category=868315)
    * [alice - \[Docker Study\] 5. Häufig genutzte Docker Befehle Rückblick - 1](https://blog.naver.com/alice_k106/220359633558)
