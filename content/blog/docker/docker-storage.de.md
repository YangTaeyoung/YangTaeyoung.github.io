---
title: "[Docker] Docker-Speicher kennenlernen: Volume vs Bind Mount"
type: blog
date: 2022-07-15
weight: 4
comments: true
translated: true
---
# Docker-Speicher

In diesem Kapitel werden wir uns mit dem Docker-Speicher auseinandersetzen.

Storage bedeutet, wie der Name schon sagt, einfach Speicherplatz, aber wenn man Container verwendet, kann es schwieriger erscheinen, als es tatsächlich ist.

Dies liegt daran, dass die Speicherung bei der Entwicklung eine sehr wichtige Rolle spielt und immer noch viele Menschen traditionelle, hostbasierte `lokale` Entwicklungsumgebungen gegenüber containerbasierten Umgebungen bevorzugen.
> Manche meinen, dass es besser ist, `dockerize` nur auf tatsächlich bereitgestellten Servern zu verwenden, aber ich denke, dass man die wahre Stärke von Docker auch in lokalen Entwicklungsumgebungen sehen kann.

![image](https://user-images.githubusercontent.com/59782504/179159615-2387ae9e-5beb-40c2-8b9d-f2bfed8d9a12.png)

Oben ist ein Diagramm, das den in Docker verwendeten Speicher beschreibt.

# Bind Mount

Ein `bind mount` verlinkt das Dateisystem (FS) des `Host-OS` mit dem FS des `Containers`, sodass **es so funktioniert, als ob sich die Dateien des `Host-OS` im Container befinden würden**.

Tatsächlich funktioniert es auf diese Weise, und es ist den `ln`-Befehlen in Linux ähnlich.

Mit diesen Befehlen können Sie nicht nur das FS des Host-Betriebssystems verbinden, sondern auch Container so konfigurieren, dass sie denselben Arbeitsbereich nutzen.

Es gibt jedoch ein Problem mit dieser Methode.

Es ist selbstverständlich, dass sie stark vom `Host-OS` beeinflusst wird.
> Besonders im Fall des Dateisystems von Windows, bei dem es üblich ist, mit `C:\`, `D:\` usw. zu beginnen, gibt es die Unannehmlichkeit, es anders als in Unix- oder Linux-Pfaden konfigurieren zu müssen.

~~Windows ist beim Entwickeln immer ein Ärgernis.~~

## `-v,  --volume`

Im vorherigen Kapitel wurden nützliche Befehle wie `create`, `run`, `exec` und ihre Optionen erkannt, die in `docker` verwendet werden können. Die Option, die `bind mount` übernehmen kann, ist genau diese.

```shell
$ docker [create|run|exec...] ... -v [HOST_PATH]:[CONTAINER_PATH] ...
```

Damit können Sie das `Storage` des `HOST_OS` mit dem `Storage` des `Containers` verbinden.

## `--mount`

Diese Befehle sind sich in der Verwendung und Bestimmung ähnlich und funktionieren fast identisch. Der Unterschied besteht darin, dass, falls `[HOST_PATH]` fehlt, es nicht ausgeführt wird und eine Ausnahme wirft. Bei der `-v` Option wird **der Endpunktpfad automatisch erstellt**.

```shell
# Beispiel
# $(pwd): aktueller Arbeitsverzeichnispfad
# Beim Verwenden von --mount
$ docker run -d \
  -it \
  --name devtest \
  --mount type=bind,source="$(pwd)"/target,target=/app \
  nginx:latest
  
# Beim Verwenden von -v
 $ docker run -d \
  -it \
  --name devtest \
  -v "$(pwd)"/target:/app \
  nginx:latest
```

### Parameter

> Parameter, die mit der `--mount` Option verwendet werden:

|Param|Beschreibung|
|:-------:|--------------------------------------|
|`type`|\[`volume`\|`bind`\] ob `volume` oder `bind mount` verwendet werden soll|
|`source`|`HOST_PATH`|
|`target`|`CONTAINER_PATH`|

# Docker-Volume

Laut der [offiziellen Docker-Dokumentation](https://docs.docker.com/storage/volumes/) wird Docker Volume als der **Hauptmechanismus definiert, um Daten zu behalten, die von Container erstellt und verwendet werden**.

Es gibt ein ähnliches Konzept, den oben erwähnten `bind mount`.

Der Unterschied besteht jedoch darin, dass im Rahmen dieses Konzepts nicht das FS des `Host-OS` direkt verwendet wird, sondern ein von `Docker` verwalteter Speicher.

Das bedeutet, dass der Speicherplatz containerübergreifend ohne Rücksicht auf das OS geteilt werden kann.

Die eigentliche Bestimmung ist jedoch nicht, sich mit dem `Host-OS` zu verbinden, sondern es ist **besonders geeignet in Fällen, wo mehrere Container Dateien des Volumes teilen müssen**.
> Zum Beispiel bestimmte Konfigurationsdateien. Es ist nützlich in Fällen, wo Änderungen nicht in Echtzeit reflektiert werden müssen.

## Vorteile

In der [offiziellen Docker-Dokumentation](https://docs.docker.com/storage/volumes/) werden die Vorteile von Docker-Volumes gegenüber Bind Mount wie folgt beschrieben:

1. Volumes sind leichter zu sichern oder zu migrieren als Bind Mounts.
2. Volumes können mit den Docker-CLI-Befehlen oder der Docker-API verwaltet werden.
3. Volumes funktionieren bei sowohl Linux- als auch Windows-Containern.
4. Volumes können sicherer zwischen mehreren Containern geteilt werden.
5. Mit Volume-Treibern können Volumes auf Remote-Hosts oder bei Cloud-Anbietern gespeichert werden und die Inhalte der Volumes verschlüsselt oder andere Funktionen hinzugefügt werden.
6. Der Inhalt neuer Volumes kann von Containern vorab gefüllt werden.
7. Volumes in Docker Desktop bieten eine wesentlich höhere Leistung als Bind Mounts auf Mac- und Windows-Hosts.

## Erstellung

Nun erstellen wir ein Docker Volume.

```shell
$ docker volume create my-vol
```

Mit diesem Befehl können Volumes einfach erstellt werden.

```shell
$ docker volume inspect my-vol
[
    {
        "CreatedAt": "2022-07-18T23:53:04Z",
        "Driver": "local",
        "Labels": {},
        "Mountpoint": "/var/lib/docker/volumes/my-vol/_data",
        "Name": "my-vol",
        "Options": {},
        "Scope": "local"
    }
]
```

Der Befehl `docker volume inspect [VOL_NAME]` beschreibt detaillierte Informationen über das bestehende Volume.

## Löschen
```shell
$ docker volume rm my-vol
```

Einfacher Befehl, um das erstellte Volume zu löschen.

# Referenz

* [Offizielle Docker-Dokumentation - Speicherübersicht](https://docs.docker.com/storage/)