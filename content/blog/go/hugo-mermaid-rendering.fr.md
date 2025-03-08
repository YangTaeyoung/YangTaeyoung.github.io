---
title: Rendre des graphiques Mermaid dans Hugo Blog
type: blog
date: 2025-03-06
comments: true
translated: true
---

Mon blog technique utilise un moteur de template appelé Hugo. Hugo est un générateur de sites statiques qui convertit les fichiers Markdown en HTML.

Le Markdown que nous utilisons couramment inclut une fonctionnalité appelée blocs de code.

Le code Go ci-dessous est également affiché avec une belle coloration syntaxique :
```go
func main() {
	fmt.Println("Hello, World!")
}
```

Le code Java montre aussi la coloration syntaxique à travers des blocs de code.
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
}
```

En fait, les blocs de code sont une fonctionnalité assez commune, largement prise en charge par la plupart des Markdown, mais parfois il est nécessaire de dessiner des diagrammes.

Les outils couramment utilisés dans ce cas sont les traditionnels gagnants en interface graphique tels que [draw.io](https://draw.io) et des outils comme [excalidraw](https://excalidraw.com/) qui donnent l'impression d'être dessinés à main levée.
> J'ai tendance à utiliser beaucoup excalidraw, car j'apprécie son aspect dessiné à la main.

Les développeurs, étant habitués au code, ont accès à de nombreux outils permettant de dessiner des diagrammes de manière code, tels que [Mermaid](https://mermaid-js.github.io/mermaid/#/), [graphviz](https://graphviz.org/) et [D2](https://d2lang.com/).

Parmi ceux-ci, l'outil le plus populaire est sans aucun doute Mermaid. Mermaid est un outil qui permet de dessiner des diagrammes grâce à sa propre syntaxe.

Par exemple, en utilisant la syntaxe suivante, 
```
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```

on peut dessiner un graphique comme celui-ci :
```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```

Le thème Hextra actuellement appliqué à mon blog supporte par défaut Mermaid. Cependant, tous les thèmes de blog ne supportent pas Mermaid.

Ainsi, nous allons explorer comment utiliser Mermaid sur n'importe quel blog Hugo.

## Ajouter le rendu de blocs de code dans le Layout
Tout d'abord, il est nécessaire d'ajouter du code pour rendre les blocs de code mermaid dans les layouts.

```html{filename="layouts/_default/_markup/render-codeblock-mermaid.html"}
<pre class="mermaid">
  {{ .Inner | htmlEscape | safeHTML }}
</pre>
{{ .Page.Store.Set "hasMermaid" true }}
```
Il suffit d'ajouter ce fichier dans le bon chemin.

## Ajouter le script Mermaid dans `baseof.html`
En général, Hugo a `layouts/_default/baseof.html`. Ce HTML sera appliqué communément à toutes les pages de Hugo.

Ainsi, avant de fermer la balise body dans `baseof.html`, ajoutez le code suivant.
```html{filename="layouts/_default/baseof.html"}
<!-- ... -->
{{ if .Store.Get "hasMermaid" }}
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: true });
  </script>
{{ end }}
</body>
```

## Utilisation
Maintenant, en ajoutant la classe `mermaid` à un bloc de code Markdown, ce bloc sera rendu avec Mermaid.

````markdown
```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```
````

```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```

## Référence
- https://gohugo.io/content-management/diagrams/
