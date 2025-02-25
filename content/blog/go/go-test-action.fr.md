---
title: Automatisons l'exécution des tests Golang via Github Actions lors de l'ouverture d'une PR et générons un rapport
type: blog
date: 2025-02-17
comments: true
translated: true
---

Où que ce soit, dans n'importe quelle langue, automatiser la construction ou le test pour les tests est essentiel.

Bien sûr, vous pouvez effectuer et soumettre le test directement en local, mais comme il arrive souvent que les gens soumettent leur travail sans exécuter de tests, il est bon de ne pas trop dépendre du local. L'automatisation permet une utilisation à long terme et peut réduire le coût de la maintenance.

Cet article présente comment créer une action de test dans Golang, exécuter automatiquement un test lors de l'ouverture d'une PR et générer un rapport.

Le scénario est conçu comme suit :
1. Configuration Go
2. Exécution du test Go
3. Génération du rapport de test
4. Laisser le lien du rapport en commentaire sur la PR

## Code de test
### Code Go
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
Ce code implémente une fonction appelée `Divide()`. C'est une fonction qui divise simplement `a` par `b` et, comme la division par zéro n'est pas autorisée, elle retourne une erreur.

### Code de test
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
			name: "10 divisé par 2",
			args: args{
				a: 10,
				b: 2,
			},
			want:    5,
			wantErr: false,
		},
		{
			name: "10 divisé par 0",
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
				t.Errorf("Erreur de Divide() = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("Divide() got = %v, want %v", got, tt.want)
			}
		})
	}
}
```

Bien que vous puissiez tester en local avec `go test -v ./...`, un fichier yaml doit être écrit pour que le test soit exécuté sur Github Actions.

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

Il est tout à fait acceptable d'utiliser le code que j'ai écrit et testé sans le modifier, en le copiant tout simplement.

Pour l'explication :
```yaml
      - name: Checkout Repository
        uses: actions/checkout@v4
```

Cette étape consiste à vérifier ce référentiel. C'est un peu comme la commande `git clone` exécutée localement : elle amène le code du référentiel vers le système de fichiers du Runner de l'action.

```yaml
      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: 1.23
```

Cette étape installe Go. Bien sûr, vous pouvez l'installer directement avec apt-get, mais ces types d'actions de configuration appliquent généralement le cache des actions, ce qui peut augmenter la vitesse de compilation.

```yaml
      - name: Test Report
        id: test-report
        uses: robherley/go-test-action@v0
        with:
          testArguments: '-count 1 -v ./...'
```
Vous pouvez créer une action pour générer un rapport de test, mais comme il existe déjà une bonne action, nous avons décidé de l'utiliser.

J'ai utilisé [robherley/go-test-action](https://github.com/robherley/go-test-action). Cette action exécute des tests Go et laisse un rapport dans le Summary.

J'ai appliqué `testArguments`, mais il n'est pas obligatoire de le faire. Si vous ne le faites pas, `-v ./...` sera appliqué par défaut. J'ai appliqué l'option `count 1` pour éviter le cache.
> Voir ce précédent [article](/blog/go/go-test-without-cache/) pour plus d'informations sur le cache de Go Test.

```yaml
      - name: PR Comment
        if: always() && github.event_name == 'pull_request'
        uses: mshick/add-pr-comment@v2
        with:
          message: |
            ${{ steps.test-report.outcome == 'success' && '![image](https://img.shields.io/badge/testing-success-green)' || '![image](https://img.shields.io/badge/testing-failure-red)' }}
            
            **📃 Report**: https://github.com/${{github.repository}}/actions/runs/${{ github.run_id }}
```
Ceci est une action pour laisser un lien de rapport dans un commentaire sur la PR. Puisqu'une PR doit exister pour qu'un commentaire soit publié, nous avons appliqué la condition `if: always() && github.event_name == 'pull_request'`.
`always()` fait en sorte que l'action s'exécute que l'action précédente ait réussi ou échoué. Et [shields.io](https://shields.io/) est utilisé pour afficher agréablement une icône de succès ou d'échec. (Ce n'est pas très sophistiqué, c'est juste une icône ajoutée)

**Succès** ![image](https://img.shields.io/badge/testing-success-green)

**Échec** ![image](https://img.shields.io/badge/testing-failure-red)

## Résultat
Voyons maintenant le résultat réel créé

### En cas de succès
En consultant cette [PR](https://github.com/YangTaeyoung/go-test-action/pull/1), vous verrez qu'un commentaire est ajouté.

![image](/images/web/go-test-action-1739793455218.png)

Et lorsque vous cliquez sur le rapport, vous pouvez voir le rapport détaillé comme suit.

![image](/images/web/go-test-action-1739793500644.png)

### En cas d'échec
En consultant cette [PR](https://github.com/YangTaeyoung/go-test-action/pull/2) où le test a échoué, vous verrez qu'un commentaire est ajouté.

![image](/images/web/go-test-action-1739793727246.png)

Et lorsque vous cliquez sur le lien, vous pouvez voir le rapport échoué comme suit.
![image](/images/web/go-test-action-1739793754098.png)

## Conclusion
Le rapport est plutôt approprié, et avec un peu de personnalisation du commentaire PR, il peut être très utile.

Bien sûr, il existe d'autres actions. Certains enverront des notifications à Slack, d'autres souhaiteront un reportage plus varié, sous différentes formes.

Dans ce cas, vous pouvez créer vos propres actions ou les modifier légèrement pour les adapter à vos besoins.

## \+ Configuration des règles Github
Juste configurer une action peut être insatisfaisant. La fonctionnalité de fusion peut être activée même en cas d'échec.

![image](/images/web/go-test-action-1739793900804.png)
> Vous pouvez toujours cliquer sur le bouton `Merge pull request`.

Dans ce cas, utiliser les règles de GitHub est une bonne idée. Vous pouvez empêcher la fusion en fonction des résultats d'une action spécifique.

Tout d'abord, allez dans `Repository - Settings - Rules - Rulesets` où se trouvent les actions.

![image](/images/web/go-test-action-1739794029637.png)

Ensuite, sélectionnez `New ruleset - New branch ruleset`. (Vous pouvez également choisir `New tag ruleset` si ce n'est pas destiné à une ouverture de PR.)

![image](/images/web/go-test-action-1739794083049.png)

Donnez-lui le nom que vous voulez, et ajoutez la branche cible de la fusion dans `Target branches`.

![image](/images/web/go-test-action-1739794265367.png)

Je cible la branche `main`, j'ai donc ajouté `main`.

Ensuite, changez l'état de la politique d'application en actif. Cela doit être activé pour activer le Ruleset créé.

![image](/images/web/go-test-action-1739794630084.png)

Ensuite, sélectionnez `Required status checks to pass`.

![image](/images/web/go-test-action-1739794378460.png)

Cliquez sur le bouton `Add checks +` et ajoutez `Run Go Tests`, le nom du Job.

![image](/images/web/go-test-action-1739794430310.png)

Ensuite, vous verrez la vérification ajoutée à la liste. Maintenant, cliquez sur le bouton Create pour créer le Ruleset.

![image](/images/web/go-test-action-1739794445136.png)

Alors, vous voyez que le bouton `Merge pull request` est maintenant désactivé.

![image](/images/web/go-test-action-1739794686030.png)