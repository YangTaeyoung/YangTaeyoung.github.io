---
title: Golang-Tests automatisch via GitHub Actions beim Erstellen eines PR ausführen und einen Bericht erstellen
type: blog
date: 2025-02-17
comments: true
translated: true
---

Egal wo und in welcher Sprache: Die Automatisierung von Build oder Tests ist für Tests von großer Bedeutung.

Natürlich kann man Tests lokal ausführen und hochladen, jedoch wird beim Arbeiten häufig übersehen, Tests durchzuführen. Daher ist es sinnvoller, weniger von der lokalen Umgebung abhängig zu sein und Automatisierungen einzurichten, die langfristig gut funktionieren und weniger Wartungskosten verursachen.

Dieser Beitrag beschreibt, wie man eine Aktion für Tests in Golang erstellt, die Tests automatisch beim Erstellen eines PR ausführt und einen Bericht generiert.

Das Szenario ist wie folgt geplant:
1. Go-Setup
2. Go-Test ausführen
3. Testbericht erstellen
4. Kommentar mit Link zum Bericht im PR hinterlassen

## Test Code
### Go-Code
```go{filename="math.go"}
package math

import "errors"

var (
	ErrDivideByZero = errors.New("cannot divide by zero")
)

func Divide(a, b int) (int, error) {
	if b == 0 {
		return 0, ErrDivideByZero
	}
	return a / b, nil
}
```
Der obige Code implementiert die Funktion `Divide()`. Dies ist eine Funktion, die einfach `a` durch `b` teilt, wobei Division durch Null nicht erlaubt ist, sodass ein Fehler zurückgegeben wird.

### Test Code
```go{filename="math.go"}
package math

import "testing"

func TestDivide(t *testing.T) {
	type args struct {
		a int
		b int
	}
	tests := []struct {
		name    string
		args    args
		want    int
		wantErr bool
	}{
		{
			name: "10 durch 2 teilen",
			args: args{
				a: 10,
				b: 2,
			},
			want:    5,
			wantErr: false,
		},
		{
			name: "10 durch 0 teilen",
			args: args{
				a: 10,
				b: 0,
			},
			want:    0,
			wantErr: true,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Divide(tt.args.a, tt.args.b)
			if (err != nil) != tt.wantErr {
				t.Errorf("Divide() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("Divide() got = %v, want %v", got, tt.want)
			}
		})
	}
}
```

Tests können lokal mit `go test -v ./...` ausgeführt werden, aber um die Tests auf GitHub Actions durchzuführen, ist es notwendig, eine YAML-Datei zu verfassen.

## Github Actions
```yaml{filename=".github/workflows/go-test.yml"}
name: Go Test and Coverage

on:
  pull_request:
    types: [ opened, synchronize, reopened ]
  workflow_dispatch:

jobs:
  test:
    name: Run Go Tests
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: 1.23


      - name: Test Report
        id: test-report
        uses: robherley/go-test-action@v0
        with:
          testArguments: ${{ github.event_name == 'pull_request' && '-short -v ./...' || '-count 1 -v ./...' }}

      - name: PR Comment
        if: always() && github.event_name == 'pull_request'
        uses: mshick/add-pr-comment@v2
        with:
          message: |
            ${{ steps.test-report.outcome == 'success' && '![image](https://img.shields.io/badge/testing-success-green)' || '![image](https://img.shields.io/badge/testing-failure-red)' }}
            
            **📃 Report**: https://github.com/${{github.repository}}/actions/runs/${{ github.run_id }}
```

Das ist der fertige Code, den ich geschrieben und getestet habe, und man kann ihn direkt verwenden.

Zur Erklärung:
```yaml
      - name: Checkout Repository
        uses: actions/checkout@v4
```

Dieser Schritt checkt das Repository aus. Es ist vergleichbar mit dem lokalen Befehl `git clone`, aber in diesem Fall wird der Code des Repositories ins Dateisystem des Action Runners gebracht.

```yaml
      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: 1.23
```

Dieser Schritt installiert Go. Natürlich könnte man es auch direkt mit apt-get installieren, aber solche Setup-Aktionen verwenden im Allgemeinen Caching, was die Build-Geschwindigkeit verbessern kann.

```yaml
      - name: Test Report
        id: test-report
        uses: robherley/go-test-action@v0
        with:
          testArguments: '-count 1 -v ./...'
```
Man könnte auch eine eigene Aktion für den Testbericht erstellen, aber es gibt bereits gute bestehende Aktionen, die wir nutzen können.

Ich habe die Aktion [robherley/go-test-action](https://github.com/robherley/go-test-action) verwendet. Diese Aktion führt den Go-Test aus und hinterlässt einen Bericht in der Zusammenfassung.

Zusätzlich habe ich `testArguments` spezifiziert, was optional ist. Wenn nichts angegeben wird, wird standardmäßig `-v ./...` angenommen. Um Caching zu vermeiden, habe ich die Option `-count 1` verwendet.
> Weitere Details dazu findest du in meinem früheren Beitrag über Go-Test-Caches [Post](/blog/go/go-test-without-cache/).

```yaml
      - name: PR Comment
        if: always() && github.event_name == 'pull_request'
        uses: mshick/add-pr-comment@v2
        with:
          message: |
            ${{ steps.test-report.outcome == 'success' && '![image](https://img.shields.io/badge/testing-success-green)' || '![image](https://img.shields.io/badge/testing-failure-red)' }}
            
            **📃 Report**: https://github.com/${{github.repository}}/actions/runs/${{ github.run_id }}
```
Die folgende Aktion fügt einen Kommentar mit einem Link zum Bericht im PR hinzu. Der Kommentar wird nur hinterlassen, wenn es einen PR gibt, daher die Bedingung `if: always() && github.event_name == 'pull_request'`.
`always()` sorgt dafür, dass die Aktion unabhängig vom Erfolg oder Fehlschlag vorheriger Aktionen durchgeführt wird. Icons von [shields.io](https://shields.io/) werden verwendet, um den Status mit einem Badge anzuzeigen.

**Erfolg** ![image](https://img.shields.io/badge/testing-success-green)

**Fehlschlag** ![image](https://img.shields.io/badge/testing-failure-red)

## Ergebnis
Schauen wir uns nun die tatsächlich generierten Ergebnisse an.

### Im Erfolgsfall
Im [PR](https://github.com/YangTaeyoung/go-test-action/pull/1) sind Kommentare wie folgt zu sehen.

![image](/images/web/go-test-action-1739793455218.png)

Und beim Klicken auf den Bericht kann man den detaillierten Bericht wie folgt sehen.

![image](/images/web/go-test-action-1739793500644.png)

### Im Fehlerfall
Im [PR](https://github.com/YangTaeyoung/go-test-action/pull/2), wo der Test fehlschlug, sieht man die Kommentare so.

![image](/images/web/go-test-action-1739793727246.png)

Und beim Klick auf den Link sieht man den fehlerhaften Bericht.

![image](/images/web/go-test-action-1739793754098.png)

## Fazit
Der Bericht ist angemessen, und der PR-Kommentar kann mit etwas Anpassung recht nützlich sein.

Natürlich gibt es noch viele andere Aktionen. Man könnte etwa Benachrichtigungen an Slack senden oder vielfältigere Berichte und Formate wünschen.

In solchen Fällen ist es gut, eigene Aktionen zu erstellen oder bestehende leicht zu ändern.

## \+ Github-Ruleset-Einstellungen
Allein mit Aktionen ist man nicht immer sicher, denn es kann vorkommen, dass trotz Fehlschlags ein Merge ermöglicht wird.

![image](/images/web/go-test-action-1739793900804.png)
> Man kann den `Merge pull request`-Button jederzeit klicken.

In solchen Fällen kann man die Regeln von GitHub nutzen, um das Merging basierend auf bestimmten Aktionsresultaten zu sperren.

Rufen Sie zuerst `Repository - Settings - Rules - Rulesets` auf, wo sich die Aktionen befinden.

![image](/images/web/go-test-action-1739794029637.png)

Wählen Sie `New ruleset - New branch ruleset`. (Wenn es nicht für das Öffnen von PR verwendet wird, wählen Sie `New tag ruleset`.)

![image](/images/web/go-test-action-1739794083049.png)

Der Name kann nach Belieben gesetzt werden, und im `Target branches`-Feld fügen Sie den Merge-Zielzweig hinzu.

![image](/images/web/go-test-action-1739794265367.png)

Da der Zielzweig bei mir `main` ist, habe ich `main` hinzugefügt.

Wechseln Sie den Enforcement Status zu Aktiv. Diese Einstellung muss aktiv sein, damit das erstellte Ruleset aktiviert wird.

![image](/images/web/go-test-action-1739794630084.png)

Unten wählen Sie `Required status checks to pass`.

![image](/images/web/go-test-action-1739794378460.png)

Klicken Sie auf die Schaltfläche `Add checks +` und fügen Sie den Namen des Jobs, Run Go Tests, hinzu.

![image](/images/web/go-test-action-1739794430310.png)

Dann wird der hinzugefügte Check in der Liste angezeigt. Klicken Sie auf Create, um das Ruleset zu erstellen.

![image](/images/web/go-test-action-1739794445136.png)

Jetzt sieht man im Vergleich zu vorher, dass der `Merge pull request`-Button deaktiviert ist.

![image](/images/web/go-test-action-1739794686030.png)