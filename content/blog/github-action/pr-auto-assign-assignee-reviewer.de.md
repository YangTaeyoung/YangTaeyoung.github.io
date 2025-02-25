---
title: Wie man in einem PR (Pull Request) automatisch Assignees und Reviewer zuweist
type: blog
date: 2024-05-23
comments: true
translated: true
---

![image](/images/github_action/pr-auto-assign-assignee-reviewer-1716454592138.png)

Bei der Entwicklung in einem Unternehmen gibt es oft Kleinigkeiten, die lästig werden können.

Zum Beispiel gibt es eine Regel, ein bestimmtes Label anzubringen, oder es ist notwendig, beim Erstellen eines PRs bestimmte Assignees und Reviewer zuzuweisen. Solche Aufgaben sind typischerweise einfach, aber lästig und leicht zu übersehen.

Als ich in das Unternehmen kam, fand ich es auch umständlich, für welche Teile welche Labels anzubringen und welche Reviewer zu benennen waren.

## Auto Assign Action
Eigentlich können solche Dinge nicht automatisch durch die Funktion von Github zugewiesen werden. Aber mithilfe der Ereignisse von Github Actions kann man eine bestimmte Aktion auslösen, sobald ein PR offen ist.

Die tatsächliche Aktion kann selbst implementiert werden, aber es gibt bereits eine bestehende Implementierung dieser Funktion. Die Verwendung dieser Aktion macht es einfach, Assignees und Reviewer zuzuweisen.

In diesem Beispiel verwenden wir die [Auto Assign Action](https://github.com/kentaro-m/auto-assign-action), die im Github Actions Marktplatz zu finden ist.

![image](/images/github_action/pr-auto-assign-assignee-reviewer-1716454564478.png)

Laut Spezifikation können Assignees und Reviewer gruppenweise zugewiesen werden.

Das ist nützlich, wenn ein Repository von mehreren Teams verwaltet wird.

Außerdem können Labels und Schlüsselwörter zum Ein- und Ausschließen definiert werden, sodass PRs, die keine Auto Assign Action benötigen (z.B. Release- oder Test-PRs), ignoriert werden können.

## Anleitung
Um diese Aktion zu verwenden, benötigt man zwei Dateien: eine YAML-Datei zur Konfiguration der Aktion und eine YAML-Datei für den Github Workflow.

```yaml{filename=".github/auto_assign.yml"}
# Einstellungen für automatische Reviewer-Zuweisung
addReviewers: true

# Assignee als Author festlegen
addAssignees: author

# Benutzerliste der hinzuzufügenden Reviewer
reviewers:
  - YangTaeyoung # Mein Name
  - {Teammitglied_Github_Username_1}
  - {Teammitglied_Github_Username_2}
  - {Teammitglied_Github_Username_3 ...}

  
# Anzahl der hinzuzufügenden Reviewer
# Bei 0 werden alle Reviewer der Gruppe hinzugefügt (Standardwert: 0)
numberOfReviewers: 0

# Überspringt den Prozesse, Reviewer hinzuzufügen, wenn die folgenden Keywords im Pull Request enthalten sind
skipKeywords:
  - exclude-review # Schlüsselwort zum Ausschluss von Reviews
```

Neben diesen Parametern gibt es auch andere Bedingungen für automatische Zuweisungen.

Der Workflow sollte wie folgt konfiguriert sein:

```yaml{filename=".github/workflows/auto_assign.yml"}
name: 'Auto Assign'
on:
  pull_request:
    types: [opened, ready_for_review]
    
jobs:
  add-reviews:
    runs-on: ubuntu-latest
    permissions: # Berechtigungseinstellungen
      contents: read
      pull-requests: write
    steps:
      - uses: kentaro-m/auto-assign-action@v2.0.0
        with:
          configuration-path: '.github/auto_assign.yml' # Nur erforderlich, wenn etwas anderes als .github/auto_assign.yml verwendet wird
```

Hier bedeutet `opened`, dass der PR geöffnet wurde, und `ready_for_review`, dass ein ursprünglich als Draft eingestellter PR in den Open-Status geändert wurde.

Eine Abweichung im Beispiel-Repository ist die untenstehende `permission`, die gesetzt werden sollte, wenn der Warnhinweis `Warning: Resource not accessible by integration` angezeigt wird. Dies verhindert die Zuweisung von Reviewern und Assignees, und man sieht, dass es automatisch zugewiesen wird, nachdem die Warnung verschwindet.
```yaml
    permissions: # Berechtigungseinstellungen
      contents: read
      pull-requests: write
```

Mit dieser Aktion kann man den kleinen Jubel der Teammitglieder hören. 😁

![image](/images/github_action/pr-auto-assign-assignee-reviewer-1716458343634.png)
