---
title: Automatisches Starten und Stoppen von AWS ECS-Diensten über Github Actions
type: blog
date: 2023-10-18
comments: true
translated: true
---
Nachdem das [Plog](https://github.com/project-555) ("Projekt zur Erstellung von Entwicklerblogs"), das in AWS ECS bereitgestellt wurde, abgeschlossen war, wollte ich die Wartungskosten des Servers flexibel kontrollieren.

~~_(Es wurde aus Lernzwecken gestartet, nicht um damit Geld zu verdienen... Ich muss sparen...)_~~

Die Kosten für ECS sind nicht unbedingt hoch, aber ich dachte, es gibt keinen Grund, es unnötig zu betreiben. Allerdings plane ich, den API-Server so zu gestalten, dass Teammitglieder ihn jederzeit für ihren Lebenslauf nutzen können, egal ob sie in eine neue Stelle wechseln oder eine Stelle suchen.

## Wie wird der ECS-Dienst beendet?
Es ist eigentlich sehr einfach. Sie müssen die gewünschte Anzahl der Aufgaben im ECS-Dienst auf 0 setzen. Umgekehrt setzen Sie beim Start die gewünschte Anzahl von Aufgaben auf die gewünschte Anzahl von Containern.
> Ein wichtiger Hinweis: Diese Methode bedeutet nicht das Bereitstellen. Es bedeutet das Beenden und Neustarten eines bereits erstellten Containers.

### AWS CLI
Ursprünglich hatte ich vor, die Befehle der [AWS CLI](https://aws.amazon.com/cli/) zu automatisieren. Obwohl ich wusste, wie es geht, habe ich mich letztendlich entschieden, Github Action zu verwenden. Dafür gab es folgende Gründe:
1. Die Frontend-Mitarbeiter waren mit AWS nicht sehr vertraut.
2. Um die Befehle des AWS Clients zu nutzen, werden AWS Access Key und Secret Key benötigt. Diese unter den Teammitgliedern zu teilen, erschien mir nicht elegant.

#### Schritte
1. Teilen Sie die AWS Access Key ID und den AWS Secret Access Key unter den Teammitgliedern und installieren Sie die [AWS CLI](https://aws.amazon.com/cli/).
2. Vervollständigen Sie die Konfiguration, indem Sie über AWS Configure den Access Key und Secret Key eingeben.
    ```bash
    $ aws configure
    > AWS Access Key ID [None]: {AWS_ACCESS_KEY_ID}
    > AWS Secret Access Key [None]: {AWS_SECRET_ACCESS_KEY}
    > Default region name [None]: {AWS_REGION}
    > Default output format [None]: {AWS_OUTPUT_FORMAT}
    ```
3. Beginnen und beenden Sie den ECS-Dienst über den AWS Client.
    ```bash
    $ aws ecs update-service --cluster plog-cluster --service plog-service --desired-count 0 # Dienst beenden
    $ aws ecs update-service --cluster plog-cluster --service plog-service --desired-count gewünschte Anzahl von Aufgaben # Dienst starten
    ```

## Github Actions
Github Actions ist ein CI/CD-Dienst, der von Github bereitgestellt wird. Es ermöglicht die Konfiguration von CI/CD über verschiedene Actions, die von Github angeboten werden.

Ein starker Vorteil ist Github Secrets, ein von Github angebotener Schlüsselverwaltungssystem. Durch Github Actions ist es möglich, geheime Schlüssel, die in Github Secrets gespeichert sind, bei der Bereitstellung zu nutzen, ohne diese direkt eingeben zu müssen.

### Schritte
1. Registrieren Sie den AWS Access Key und Secret Key in Github Secrets.
   a. Gehen Sie zu Github Repository > Einstellungen > Secrets > Neues Repository-Geheimnis und registrieren Sie `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`. Da in meiner ECS-Bereitstellung die ECR-Adresse `AWS_ACCOUNT_ID` enthält, habe ich `AWS_ACCOUNT_ID` zusätzlich registriert.
   ![image](/images/aws/ecs_start_and_stop_with_github_action-1697561976275.png)

   ![image](/images/aws/ecs_start_and_stop_with_github_action-1697561871820.png)

2. Erstellen Sie eine Workflow-Datei zum Starten des ECS-Dienstes `project-root/.github/workflows/start-ecs.yaml`.
   ```yaml
   name: Start ECS Service
   
   on:
     workflow_dispatch:
   
   env:
     ECS_CLUSTER: Name des erstellten ECS-Clusters
     ECS_SERVICE: Name des erstellten ECS-Dienstes
   
   jobs:
     start-plog:
       runs-on: ubuntu-latest
   
       steps:
         - name: Checkout
           uses: actions/checkout@v2
   
         - name: Start ECS Service
           run: |
             aws ecs update-service --cluster ${% raw %}{{ env.ECS_CLUSTER }}{% endraw %} --service ${% raw %}{{ env.ECS_SERVICE }}{% endraw %} --desired-count 1
           env:
             AWS_ACCESS_KEY_ID: ${% raw %}{{ secrets.AWS_ACCESS_KEY_ID }}{% endraw %}
             AWS_SECRET_ACCESS_KEY: ${% raw %}{{ secrets.AWS_SECRET_ACCESS_KEY }}{% endraw %}
             AWS_DEFAULT_REGION: "AWS Region"
   ```
3. Erstellen Sie eine Workflow-Datei zum Beenden des ECS-Dienstes `project-root/.github/workflows/stop-ecs.yaml`.
   ```yaml
   name: Stop ECS Service
   
   on:
      workflow_dispatch:
   
   env:
     ECS_CLUSTER: Name des erstellten ECS-Clusters
     ECS_SERVICE: Name des erstellten ECS-Dienstes
   
   jobs:
      stop-plog:
         runs-on: ubuntu-latest
   
         steps:
            - name: Checkout
              uses: actions/checkout@v2
   
            - name: Stop ECS Service
              run: |
                 aws ecs update-service --cluster ${% raw %}{{ env.ECS_CLUSTER }}{% endraw %} --service ${% raw %}{{ env.ECS_SERVICE }}{% endraw %} --desired-count 0
              env:
                 AWS_ACCESS_KEY_ID: ${% raw %}{{ secrets.AWS_ACCESS_KEY_ID }}{% endraw %}
                 AWS_SECRET_ACCESS_KEY: ${% raw %}{{ secrets.AWS_SECRET_ACCESS_KEY }}{% endraw %}
                 AWS_DEFAULT_REGION: "AWS Region"
   ```

Beide Aktionen sind bis auf `desired-count` identisch. `desired-count` gibt die gewünschte Anzahl von Aufgaben an. Bei Einstellung auf `0` wird der Dienst beendet, bei `1` wird er gestartet.

Auf dem Bild unten erkennen Sie, dass sich der benötigte Teil ändert. ECS passt die Anzahl der Container gemäß der angegebenen Anzahl von Aufgaben an.

![image](/images/aws/ecs_start_and_stop_with_github_action-1697562816389.png)

Der Grund, warum `on` in jedem `yaml`-File auf `workflow_dispatch` gesetzt ist, besteht darin, Github Actions manuell ausführen zu können.

![image](/images/aws/ecs_start_and_stop_with_github_action-1697562773679.png)

Ein angemessen eingestellter `name` sorgt für eine bessere Übersicht in der Aktionsliste.

![image](/images/aws/ecs_start_and_stop_with_github_action-1697562727292.png)

## Zusammenfassung
Wir haben gelernt, wie man mit Github Actions AWS ECS-Dienste startet und stoppt. Die Bereitstellung von AWS ECS mittels Github Actions wird in einem zukünftigen Thema behandelt.

![image](/images/aws/ecs_start_and_stop_with_github_action-1697562898329.png)