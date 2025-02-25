---
title: "[Docker] Lernen wir Dockerfile kennen."
type: blog
date: 2022-07-13
weight: 3
comments: true
translated: true
---
## 😡 Jungs.. bin ich der Einzige, den das stört?
Wenn man sich vorher kurz die CLI von Docker angeschaut hat, wird man feststellen, dass es ziemlich unangenehm ist, Container zu erstellen und zu bauen.

Um es mir einfacher zu machen, muss ich bei der Erstellung eines Containers viele Befehle eingeben.

Ein noch größeres Problem könnte jedoch sein, dass das Image beim Bauen enorm groß werden kann.

Es wird nicht riesig sein, aber es kann von mindestens 100MB bis zu 1~2GB variieren.

![img.png](https://blog.kakaocdn.net/dn/dg7HAJ/btq0ZLhsh0x/RXZPbihsD3h9ou7NviGfM1/img.png)

In Firmen, die viele Container verwalten, kann dies noch katastrophaler werden.

Abgesehen von der Größe des Images kann es sehr lange dauern, das Image zu übertragen und herunterzuladen.

## 📄 Dockerfile

Deshalb schlägt Docker eine neue Methode zur Erstellung von Containern vor.

Der Kernpunkt ist, **ein Script zu teilen, das das Image erstellt**, anstatt ein bereits erstelltes Image zu verteilen.

### 🚫 Don't Repeat Yourself

Man muss es sowieso einmal machen. ~~Vielleicht macht das in Zukunft eine AI automatisch?~~
> _Aber man muss es nur einmal machen._

Da es eine integrierte Funktion von Docker ist, ist es viel einfacher, einen Befehlssatz in einer Textdatei zu speichern, der formal und strukturiert ist.

Und letztendlich ist ein `Dockerfile` auch nur eine Textdatei, die beim Speichern nicht viel Speicherplatz in Anspruch nimmt.

Nun zu den Details.

### Wie führt man es aus?
Wenn ein `Dockerfile` erstellt wird, wird ein Image gemäß den Spezifikationen dieser Datei geladen und die Befehle ausgeführt.

Sobald der Container in Docker gestartet wird, wird das entsprechende Image lokal auf dem Rechner des Benutzers gespeichert.

Dieser Prozess wird als `build` bezeichnet und unterscheidet sich von `commit`, das den Container zu einem Image macht.

### `build [BUILD_PATH]`

Der `build`-Befehl erstellt einen Container basierend auf dem `Dockerfile` im angegebenen Pfad.

Da dieser Befehl rekursiv ausgeführt wird, sollte niemals ein absoluter Root-Pfad angegeben werden.

```shell
$ docker build / # (X)
```
Da das `Dockerfile` normalerweise im Root-Verzeichnis des Projekts liegt, wird der folgende Befehl oft als Idiom verwendet.
```shell
$ docker build .
```

### `-f [DOCKER_FILE_PATH]` Option

Traditionell liegt das `Dockerfile` im Root-Pfad des Projekts, das gebaut wird, aber die `-f`-Option erlaubt es, wenn der Root-Pfad und der Pfad des `Dockerfile` unterschiedlich sind.

```shell
$ docker build -f /path/to/a/Dockerfile .
```
> Das bewirkt, dass das `Dockerfile` so agiert, als läge es im aktuellen Verzeichnis (`.`).

#### `-t` Option

Wenn der Build erfolgreich ist, kann das neue Image mit dem `-t`-Option im Repository gespeichert und getaggt werden.

```shell
$ docker build -t shykes/myapp .
```

Wenn das gleiche Image in verschiedenen Repositories oder mit verschiedenen Tags gespeichert werden soll, kann man mehrere `-t`-Optionen angeben, um das gleiche Image zu bauen.
```shell
$ docker build -t shykes/myapp:1.0.2 -t shykes/myapp:latest .
```

## `Dockerfile` erstellen
Es ist einfach, ein `Dockerfile` zu erstellen. Man erstellt einfach ein `Dockerfile`.

Lassen Sie uns nun die umfangreichen Einstellungen kennen lernen, die für die Erstellung eines `Dockerfile` erforderlich sind.

#### `ARG`
Dies ist eine Anweisung zur Deklaration von Variablen, die verwendet wird, um die Wiederverwendbarkeit in einem `Dockerfile` zu maximieren.

```dockerfile
# Verwendung der Definition
ARG [KEY]=[value]

# Verwendung des Aufrufs
${[KEY]}

# Beispiel
ARG  CODE_VERSION=latest
FROM base:${CODE_VERSION}
CMD  /code/run-app

FROM extras:${CODE_VERSION}
CMD  /code/run-extras
```

#### `FROM`
```dockerfile
# - Usage
FROM [--platform=<platform>] <image> [AS <name>]
# or
FROM [--platform=<platform>] <image>[:<tag>] [AS <name>]
# or 
FROM [--platform=<platform>] <image>[@<digest>] [AS <name>]
```
Gibt das Basisimage für den Build an.

Man gibt hier den Teil an, den man im `IMAGE`-Abschnitt der Befehle `run` und `create` aus dem vorherigen Kapitel einfügen würde.
Zuerst sucht Docker das Image lokal, und wenn es nicht gefunden wird, wird es von [Docker Hub](https://hub.docker.com) heruntergeladen.
> Natürlich kann es nicht heruntergeladen werden, wenn man keinen Zugriff auf das Repository hat oder der Name des Images falsch ist.

#### `WORKDIR`
Gibt das Arbeitsverzeichnis innerhalb des Containers an.
Dies entspricht der Verwendung der `-w`, `--workdir`-Option in den `run` und `create`-Befehlen aus dem vorherigen Kapitel.

Alle `COMMANDS` werden im `WORKDIR` ausgeführt. Wenn nichts angegeben ist, wird das Home-Verzeichnis (`~`) als Standardort verwendet.

#### `RUN [COMMAND]`

Dies ist anders als der `run`-Befehl in das vorherige Kapitel.
Es fällt vielmehr unter die Kategorie `COMMAND` und ermöglicht die Eingabe verschiedener Befehle im Container.

**Der `RUN`-Befehl läuft unabhängig vom Basisbefehl des Images (als ob der Befehl in `exec` eingegeben wäre).**

`RUN` unterstützt zwei Eingabeformate.

```dockerfile
# Methode 1
RUN <Befehl>
# Methode 2
RUN ["ausführbare Datei", "param1", "param2"]
```

Die Methode 2 mag kompliziert aussehen, trennt die Befehle jedoch nur durch Leerzeichen.

Zum Beispiel führen die beiden folgenden Befehle das gleiche aus:

```dockerfile
RUN ["/bin/bash", "-c", "echo hello"]
```

```dockerfile
RUN /bin/bash -c "echo hello"
```

#### Achtung
Wenn Sie einen Befehl in Listenform ausführen möchten und Backslashes (`\`) verwenden, um einen Pfad anzugeben, beachten Sie Folgendes.

Da der tatsächliche Befehl im `JSON`-Format ausgeführt wird, sind Backslashes keine zulässigen Zeichen im `JSON`. Besonders in Windows wird (`\`) als Trennzeichen verwendet, und in diesem Fall muss der Backslash (`\`) verdoppelt werden, um ihn zu escapen.

```dockerfile
RUN ["c:\windows\system32\tasklist.exe"] # (X)
RUN ["c:\\windows\\system32\\tasklist.exe"] # (O)
```

#### `ENTRYPOINT`
Führt ein Script oder einen Befehl aus, wenn der Container gestartet wird.

Es wird ausgeführt, wenn der Container gestartet (`start`) oder sowohl erstellt als auch gestartet (`run`) wird, nicht jedoch bei der Ausgabe von Befehlen an einen laufenden Container (`exec`).

Ein weiterer besonderer Aspekt ist, dass `ENTRYPOINT` nur einmal in einem `Dockerfile` deklariert werden kann.


#### `CMD`
Dies funktioniert ähnlich wie `RUN`, aber es ist der `COMMAND`, der standardmäßig ausgeführt wird, wenn kein `COMMAND` im `docker run`-Befehl angegeben ist.

```dockerfile
# Methode 1
CMD ["ausführbare Datei","param1","param2"] # empfohlene exec-Form
# Methode 2
CMD ["param1","param2"]
# Methode 3
CMD Befehl param1 param2
```
Der ausführbare Code in Methode 1 kann weggelassen werden, aber dann muss `ENTRYPOINT` definiert sein.

#### `ENV`
Dient zur Angabe von Umgebungsvariablen im Container, die die gleiche Funktion wie die `-e`-Option im `run`, `create`-Befehl erfüllt.

```dockerfile
# Verwendung
ENV [SCHLÜSSEL]=[WERT]

# Beispiel
ENV abc=hello
ENV abc=bye def=$abc
ENV ghi=$abc
```

#### `LABEL` 
Wird verwendet, um Metadaten in den Container aufzunehmen.
```dockerfile
# Verwendung
LABEL <key>=<value> <key>=<value> <key>=<value> ...
```
Speichert key-value pairs und zum Beispiel kann folgendes geschrieben werden:
```dockerfile
LABEL "com.example.vendor"="ACME Incorporated"
LABEL com.example.label-with-value="foo"
LABEL version="1.0"
LABEL description="Dieser Text zeigt, \ # Mehrzeiliger Text kann mit einem Backslash(\) eingegeben werden.
dass Label-Werte über mehrere Zeilen hinweg fortgeführt werden können."
LABEL multi.label1="value1" \
      multi.label2="value2" \
      other="value3"
```

Um die Metadaten eines bestimmten Images (`myimage`) zu sehen, können Sie folgenden Befehl ausführen:
```shell
$ docker image inspect --format='' myimage
{
  "com.example.vendor": "ACME Incorporated",
  "com.example.label-with-value": "foo",
  "version": "1.0",
  "description": "Dieser Text zeigt, dass Label-Werte über mehrere Zeilen hinweg fortgeführt werden können.",
  "multi.label1": "value1",
  "multi.label2": "value2",
  "other": "value3"
}
```

#### `EXPOSE [PORT]/[PROTOKOLL]`
`EXPOSE` gibt an, welchen Port ein Container abhören soll.

Aber `Dockerfile` bedeutet nicht, dass ein Host-Port weitergeleitet wird.

Es definiert nur, auf welchem `PORT` der Container Daten vom Host empfangen soll.

Deshalb kann die `-p`-Option nicht nur mit einem `Dockerfile` automatisiert werden.

`[PROTOKOLL]` gibt an, welches Protokoll zum Übertragen der Daten verwendet werden soll.

Wählen Sie zwischen `tcp` und `udp`. Der Standardwert ist `tcp`, und es wird empfohlen, diesen nicht zu ändern, es sei denn, es gibt einen spezifischen Grund.
> TCP gewährleistet die Zuverlässigkeit bei der Paketzustellung.

#### `COPY [OPTION] [HOST_PATH] [CONTAINER_PATH]`
Kopiert Dateien von `HOST_PATH` nach `CONTAINER_PATH`.
`HOST_PATH` kann nicht nur Pfade, sondern auch Dateinamen sowie Platzhalter wie `?` _(ein Zeichen)_, `*` _(mehrere Zeichen)_ beinhalten.
#### Relative Pfade
Wenn relative Pfade in jedem `PATH` verwendet werden, basiert `HOST_PATH` auf dem Speicherort der Datei, während `CONTAINER` relativ zu `WORKDIR` ist.

#### Beispiele für Platzhalter
* `home*`: alle Dateien und Pfade, die mit `home` beginnen
* `*home*`: alle Dateien und Pfade, die `home` enthalten
* `?home`: alle Dateien und Pfade mit einem beliebigen Buchstaben vor `home` (z.B. `1home`, `ahome`)

#### `--chown`
Die `--chown`-Option ermöglicht es, den Eigentümer des `CONTAINER_PATH` festzulegen.

Da dies intern durch den Befehl `chown` durchgeführt wird, kann es nur in Linux-basierten Containern ausgeführt werden.


#### `ADD [HOST_PATH] [CONTAINER_PATH]`
`ADD` funktioniert fast genauso wie `COPY`.

Die Funktionalitäten und Optionen von `COPY` gelten auch hier, jedoch hat `ADD` einige zusätzliche Funktionen:
1. Wenn die zu kopierenden Dateien Archive (`.tar`, `.tar.gz`) sind, werden diese entpackt, bevor sie kopiert werden.
2. Man kann Dateien von entfernten Standorten kopieren, ähnlich wie mit `wget`.
> Dateien von entfernten Standorten haben Berechtigungen von 600 (nur lesbar von Benutzern).

## Automatisieren Sie Optionen?
An dieser Stelle sollte ein aufmerksamer Leser skeptisch werden.

Kann man wirklich sagen, dass ein `Dockerfile` den gesamten Erstellungsprozess eines `CONTAINER` spezifiziert hat?

**Die Antwort ist natürlich nein.**

Obwohl ein `Dockerfile` den Container spezifiziert, zielt es nicht darauf ab, die Erstellungsoptionen des Containers zu automatisieren.

Betrachten Sie nur die `-p`-Option, die in den `create`, `run`-Befehlen verwendet wird.

Die `-p`-Option spezifiziert sowohl den Host- als auch den Container-Port, während `EXPOSE` nur den offenen Port des Containers angibt.

Viele andere Optionen auf der Hosts-Ebene können vom `Dockerfile` nicht behandelt werden.

Dies liegt daran, dass `build` ein Container-spezifisches Spezifikationsdokument ist, nicht aber host-spezifisch.

Diese Unzulänglichkeit ist der Grund für die Entwicklung von Docker Compose, das in einem zukünftigen Post behandelt wird.

## Docker Ignore File
Wenn Sie Erfahrung mit `git` haben, haben Sie wahrscheinlich schon einmal ein `.gitignore`-File verwendet.

Die `.dockerignore`-Datei übernimmt eine ähnliche Rolle.

In `.gitignore` werden Dateien festgelegt, die nicht committet werden sollen. In diesem Fall definiert man die Pfade der Dateien oder Ordner, die nicht von `ADD` oder `COPY` vom Host OS kopiert werden sollen.

```dockerignore
# Kommentar
*/temp*
*/*/temp*
temp?
```

## Referenzen
* [Docker Offizielle Dokumentation - Dockerfile Referenz](https://docs.docker.com/engine/reference/builder/)
* [스뎅 - [Docker] RUN vs CMD vs ENTRYPOINT in Dockerfile](https://blog.leocat.kr/notes/2017/01/08/docker-run-vs-cmd-vs-entrypoint)
* [Jae-Hong Lee am schnellsten trifft man Docker 7. Kapitel - 6. ENTRYPOINT](http://pyrasis.com/book/DockerForTheReallyImpatient/Chapter07/06)
* [박개벙 - Der Unterschied zwischen ADD und COPY in Dockerfile](https://parkgaebung.tistory.com/44)