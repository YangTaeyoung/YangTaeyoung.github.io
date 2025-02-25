---
title: "[Docker] Lassen Sie uns Docker Compose kennenlernen"
type: blog
date: 2022-07-21
weight: 5
comments: true
translated: true
---
## Brüder, bin ich der einzige, der sich unwohl fühlt?
Das ist der zweite Artikel für die Brüder. Denn es gibt tatsächlich viele Dinge, die unangenehm sind.

## Zweck von Docker
Wann hat man Docker gesagt, dass es verwendet wird?

Es wird wohl sein, wenn Sie die Kerntechnologie von Docker, den Container, nutzen möchten.
> Das heißt, es ist zur Wiederverwendung gedacht.

Das zuvor gelernte `Dockerfile` hat viele Teile, die für die Erstellung eines Containers erforderlich sind, automatisiert.

Aber auch `Dockerfile` hat Nachteile.

Wie im [vorherigen Beitrag](/docs/docker/04.dockerfile/) behandelt, gab es Einschränkungen bei der Automatisierung der Host-OS-Einstellungen.

Zum Beispiel konnte es Portweiterleitungen des Host-OS oder das Mounten des Pfads eines Volumes nicht erreichen.

Am Ende mussten viele Entwickler ein `Dockerfile` erstellen,

die entworfenen Container mittels `build` verbinden und das `volume` mounten.

## Docker Compose
![img.png](https://miro.medium.com/max/1000/1*JK4VDnsrF6YnAb2nyhMsdQ.png)

Docker Compose löst die obigen Probleme.

Die in `docker-compose.yml` definierbaren Elemente umfassen nicht nur `volume`, `port`, `env`, sondern auch verschiedene Aufgaben zur Definition von Containern.

Darüber hinaus unterstützt es nicht nur die Definition eines einzelnen Containers, sondern auch die Definition mehrerer Container und die Festlegung der Beziehungen zwischen ihnen.

Die [offizielle Docker-Dokumentation](https://docs.docker.com/compose/compose-file/) beschreibt Compose als **plattformunabhängige containerbasierte Anwendung**.

### `.yml`, `.yaml`
Bevor wir uns mit Docker Compose befassen, sollten wir etwas wissen.

![img2](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/YAML_Logo.svg/1200px-YAML_Logo.svg.png)

Wie bereits erwähnt, können Sie in `docker-compose.yml` Befehle für mehrere Container festlegen.

Was ist nun eine `.yml`-Datei?

Dateien mit der Erweiterung `.yml` oder `.yaml` sind eine Form von Markup-Sprache, die als Yet Another Markup Language bezeichnet wird.

Ähnlich wie bei Python können Sie durch Doppelpunkte und Einrückungen Schichten bilden und bestimmte Objekte, Einstellungen usw. leicht schreiben.

Um es intuitiv zu verstehen, betrachten wir das folgende Beispiel:
```yaml
car:
  name: "bus"
  color: "red"
  door: 4
  capability:
    max_weight: "4T"
    human: 10
  customers:
    - name: "Alice"
      age: 14
    - name: "Ban"
      age: 16
    - name: "Yang"
      age: 26
```

Diese Form der `.yaml` kann auch im folgenden `JSON`-Format ausgedrückt werden.

```json
{
  "car": {
    "name": "bus",
    "color": "red",
    "door": 4,
    "capability": {
      "max_weight": "4T"
    }
  }
}
```

So ist `.yml` ein praktisches Dateiformat zur Darstellung von Daten, das sich für die Nutzung hierarchisch strukturierter Daten eignet, ähnlich den bestehenden Formaten `JSON`, `XML`.

### `docker-compose.yml`
Erstellen wir jetzt `docker-compose.yml` und spezifizieren die Container, die wir verwenden werden.

#### `services`
Die Spezifikationen für jeden Container, den wir definieren, werden als Einheit durch `service` definiert.

Wenn Sie das `.yml`-Format als Vorlage verwenden, wird es so aussehen.
```yaml
services:
  container_1:
    ...
  container_2:
    ...
```

#### `image`
Dies ist der Abschnitt, in dem Sie das abzurufende Image spezifizieren.

Sie können auf verschiedene Weise das gewünschte Image abrufen.

```yaml
# Image Name
image: redis
# Image Name: Tag Name
image: redis:5
# Image Name@sha256: IMAGE ID
image: redis@sha256:0ed5d5928d4737458944eb604cc8509e245c3e19d02ad83935398bc4b991aac7
# Repository Name/Image Name
image: library/redis
# Registry Name/Repository Name/Image Name
image: docker.io/library/redis
# Private Registry Address:Port/Image Name
image: my_private.registry:5000/redis
```

#### `build`
Dies wird verwendet, um über ein `Dockerfile` einen Container zu erstellen.

```yaml
services:
  frontend:
    image: awesome/webapp
    build: ./webapp # Wenn keine Unterstufen angegeben werden, fungiert es als Kontext

  backend:
    image: awesome/database
    build:
      context: backend # Pfad, in dem nach Dockerfile gesucht wird
      dockerfile: ../backend.Dockerfile # Wenn der Dateiname nicht Dockerfile ist, geben Sie den Dateinamen an

  custom:
    build: ~/custom # Sie können auch das Homeverzeichnis-Symbol "~" verwenden.
```

1. Das Image `awesome/webapp` wird mit dem Verzeichnis `./webapp` im übergeordneten Ordner der Compose-Datei als Docker-Build-Kontext gebaut.
Wenn in diesem Verzeichnis kein Dockerfile vorhanden ist, tritt ein Fehler auf.
2. Das Image `awesome/database` wird mit dem Verzeichnis `./backend` im übergeordneten Ordner der Compose-Datei gebaut.
Die Datei `backend.Dockerfile` wird verwendet, um den Buildprozess zu definieren, und diese Datei (`backend.Dockerfile`) wird relativ zum Kontextpfad (`./backend`) definiert.
Das heißt, in diesem Beispiel wird `..` als übergeordneter Ordner der Compose-Datei interpretiert, sodass auch das `Dockerfile`-Geschwister-Paar, `backend.Dockerfile`, durchsucht wird.
3. Der `custom` Service wird mit dem `custom` Verzeichnis im `HOME`-Verzeichnis des Benutzers als Kontext gebaut.

#### Wenn `image` und `build` gleichzeitig vorhanden sind
`image` bedeutet, dass Sie basierend auf dem definierten Image einen Container erstellen, während mit `build` ein Container mit dem `Dockerfile` erstellt wird.

Aber da Sie mit dem `FROM`-Schlüsselwort im `Dockerfile` auch Images holen können, könnte dieser Punkt Konflikte erzeugen, oder?

In der [Docker-Dokumentation](https://docs.docker.com/compose/compose-file/build/#consistency-with-image) wird dieser Abschnitt behandelt. 

Unsere Sorge wird bestätigt, da es festlegt, dass nicht garantiert werden kann, welches Image verwendet wird. 

Es wird jedoch angegeben, dass ohne spezielle Anweisungen des Benutzers das in `image` definierte Image zuerst geholt wird und bei Nichterreichen das im `Dockerfile` definierte Image gebaut wird.

#### `depends-on`
Wenn Sie mehrere Services in `docker-compose.yml` definieren und ein Service nach einem anderen gestartet werden soll, können Sie `depends_on: servicename` verwenden, um dies anzugeben.
```yaml
services:
  serviceA:
    ...
    depends_on: serviceB
    
  serviceB:
    ...
```

#### `entrypoint`
Es erfüllt dieselbe Funktion wie `ENTRYPOINT` im `Dockerfile`.

Das heißt, es definiert den Befehl, den der Docker-Container beim Start ausführt.
> Wie im vorherigen Kapitel beschrieben, kann dieser Befehl nur einmal angegeben werden. Wenn Sie daher `ENTRYPOINT` bereits im Dockerfile über die `build`-Option definieren, müssen Sie eines (oder beide) entfernen.

> In vielen Fällen scheint es sich dabei oft um die Festlegung zu handeln, welche Shell zu Beginn verwendet werden soll, oder ähnliches.

```yaml
entrypoint: /code/entrypoint.sh
```

#### `labels`
Wie im Abschnitt `LABEL` des [Dockerfile](/docs/docker/04.dockerfile/) beschrieben, ist dies ein Element, mit dem Sie Metadaten zu einem Container hinzufügen können.

### `environment`
Dies wird verwendet, um Umgebungsvariablen zu definieren, die Container verwenden.

Es gibt zwei Methoden:

1. Map Methode
```yaml
environment:
  RACK_ENV: development
  SHOW: "true"
  USER_INPUT: "hello"
```

2. Array Methode
```yaml
environment:
  - RACK_ENV=development
  - SHOW=true
  - USER_INPUT=hello
```

#### `env_file`
Wenn Sie Umgebungsvariablen nicht direkt definieren, sondern über eine Datei festlegen möchten, verwenden Sie diese Option.

```yaml
env_file: some_env.env
```

```
# some_env.env
RACK_ENV=development
VAR="quoted"
```

Bei dieser Methode können Sie Umgebungsvariablen in Form von Dateien verwalten, was die Verwaltung erleichtert.

#### `command`
Wie im Abschnitt `CMD` des `Dockerfile` behandelt, wird dieser Abschnitt verwendet, um die Befehle zu definieren, die dem Container, der für den Service verantwortlich ist, erteilt werden.
```yaml
command: ls -al
```
Da ich ein Backend-Entwickler bin, werde ich aus der Perspektive eines Backend-Entwicklers den Unterschied zwischen den beiden Befehlen (`Dockerfile`:`CMD`, `docker-compose.yml`:`command`) beschreiben.

Der `CMD` im `Dockerfile` wird hauptsächlich verwendet, um grundlegende Komponenten zu installieren, die für die Konfiguration eines Servers erforderlich sind, wie `pip install`, `gradle build`.
> Es wird oft gesagt, dass man so ein funktionsfähiges Container-Abbild erstellt _(allerdings ist das keine feste Regel)._

Der `command` in `docker-compose.yml` wird hauptsächlich verwendet, um einen Befehl zur Bereitstellung des Servers zu erteilen (z. B. `... run serve`).

#### `volumes`
`volumes` definiert das Verknüpfen zwischen einem vordefinierten Docker Volume oder einem Host-Pfaden mit Container-Pfaden oder der Deklaration von Volumes.

##### Definition von Volumes
Die speichernde Definition der Elemente unter `volumes` besteht sowohl aus vereinfachter als auch ausführlicher Syntax.

Generell wird die vereinfachte Syntax verwendet, aber je nach Fall und Benutzervorliebe ist auch die ausführliche Syntax möglich.
1. Ausführliche Elemente

|Element| Beschreibung|
|:--------:|---------------|
|`type`|Es spezifiziert, ob ein Docker Volume (`volume`) oder die Bindung an einen Host-OS-Pfad (`bind`) verwendet wird.|
|`source`|Es spezifiziert den Volumename oder die ID, oder den zu bindenden Host-OS-Pfad.|
|`target`|Geben Sie den Pfad des Containers an.|
|`read_only`|Wenn Sie es als schreibgeschützt einstellen möchten, setzen Sie es.

```yaml
    ...
    volumes:
      - type: volume
        source: db-data
        target: /data
    ...
```

2. Vereinfachte Syntax

Es wird in der Form `VOLUME:CONTAINER_PATH:ACCESS_MODE` spezifiziert.
> `ACCESS_MODE` ist standardmäßig auf `rw` (lesen-schreiben) eingestellt. 

```yaml
services:
  service_1:
    image: some/image
    # Verbinden Sie Docker Volume mit Container Path
    volumes:
      - db-data:/etc/data

  service_2:
    image: some/image
    # Verbinden Sie Host-OS-Pfad mit Container-Pfad
    volumes:
      - .:/var/lib/backup/data
      - 
  service_3:
    image: some/image
    # Verbinden Sie Host-OS-Pfad mit Container-Pfad und stellen Sie Container-Pfad auf schreibgeschützt ein
    volumes:
      - .:/var/lib/backup/data:ro
```

#### Definition von Volume
Wenn Sie Volumes über `volumes` definieren möchten, setzen Sie `volumes` als oberstes Element in `docker-compose.yml`.
```yaml
# Definition von Docker Volume
volumes:
  db-data:
```

### `ports`
Es funktioniert auf die gleiche Weise wie die `-p`-Option, die in `run` und `create` der Docker CLI verwendet wird.
Das heißt, es entspricht den Ports des Host-OS mit den Ports des Container-Pfades.

```yaml 
    ...
    ports:
      - "8000:8000"
    ...
```

Mit der obigen Konfiguration werden alle Anfragen an den Port `8000` des Host-OS über den Port `8000` des Containers geleitet.

## Docker Compose CLI
Nun bleibt nur noch das Erstellen des Containers.

Wenn Sie den Befehl `docker-compose up` verwenden, sucht er automatisch die `docker-compose.yml`-Datei im Verzeichnis, in dem sich der Befehl befindet und startet sie.

Mit der neu erschienenen Docker Compose V2 wird angegeben, dass der Befehl mit dem Schlüsselwort `docker compose` ausgeführt werden sollte. Wenn Sie also V2 verwenden, behalten Sie dies im Hinterkopf.

Wenn Sie die Option `-d` hinzufügen, wird der entsprechende Service im Hintergrundmodus ausgeführt. (Dies wird häufig verwendet.)

Mit der Option `-f [COMPOSE_FILE_NAME]` können Sie Docker Compose mit einer bestimmten Datei ausführen, die nicht `docker-compose.yml` ist.

Mit dem Befehl `docker-compose start [SERVICE_NAME]` können Sie einen bestimmten Service unter `services` ausführen.

Im Gegensatz dazu stoppt der Befehl `docker-compose stop [SERVICE_NAME]` einen bestimmten Service.

## Referenzen
* [Docker Offizielle Dokumente - Compose file Reference](https://docs.docker.com/compose/compose-file/)
* [Docker Offizielle Dokumente - Docker Compose CLI Reference](https://docs.docker.com/compose/reference/)