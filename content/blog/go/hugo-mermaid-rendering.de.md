---
title: Lassen Sie uns Mermaid-Diagramme in Hugo Blog rendern
type: blog
date: 2025-03-06
comments: true
translated: true
---

Derzeit benutze ich den Template-Engine Hugo für meinen Technik-Blog. Hugo ist ein statischer Seiten-Generator, der Markdown-Dateien in HTML umwandelt.

Das Markdown, das wir häufig verwenden, enthält Blockcode.

Der folgende Go-Code wird ebenfalls schön mit Syntax-Highlighting angezeigt:
```go
func main() {
	fmt.Println("Hello, World!")
}
```

Der Java-Code zeigt sich ebenso mit Syntax-Highlighting durch einen Blockcode:
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
}
```

Tatsächlich ist der Blockcode eine sehr verbreitete Funktion, die von den meisten Markdown unterstützt wird, aber gelegentlich muss man Diagramme zeichnen.

In solchen Fällen sind traditionelle Titel in der GUI-Tools wie [draw.io](https://draw.io) zu finden, daneben gibt es auch Tools wie [excalidraw](https://excalidraw.com/), die den Eindruck vermitteln, dass sie von Hand gezeichnet sind.  
> Ich persönlich benutze oft excalidraw, da ich das Gefühl von Handzeichnungen mag.

Da Entwickler in der Regel an den Umgang mit Code gewöhnt sind, gibt es viele Tools, um Diagramme auf Basis von Code zu zeichnen, darunter [Mermaid](https://mermaid-js.github.io/mermaid/#/), [graphviz](https://graphviz.org/) und [D2](https://d2lang.com/).

Unter diesen ist das bekannteste Tool vermutlich Mermaid. Mermaid ist ein Tool, das es erlaubt, Diagramme mit einer speziellen Syntax zu erstellen.

Wenn wir beispielsweise die folgende Syntax verwenden:
```
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```

könnten wir das folgende Diagramm zeichnen:
```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```

Das aktuell auf meinem Blog verwendete Hextra-Theme unterstützt standardmäßig Mermaid. Es gibt jedoch nicht alle Blog-Themes, die Mermaid unterstützen.

Deshalb möchte ich nun herausfinden, wie man Mermaid in jedem Hugo-Blog verwenden kann.

## Rendern eines Codeblocks im Layout hinzufügen
Zuerst müssen wir den Code hinzufügen, um die Mermaid-Codeblöcke im Layout zu rendern.  

```html{filename="layouts/_default/_markup/render-codeblock-mermaid.html"}
<pre class="mermaid">
  {{ .Inner | htmlEscape | safeHTML }}
</pre>
{{ .Page.Store.Set "hasMermaid" true }}
```

Wir müssen die oben genannte Datei nur an den angegebenen Pfad anpassen.

## Mermaid-Skript zu `baseof.html` hinzufügen
Normalerweise gibt es die Datei `layouts/_default/baseof.html` in Hugo. Diese HTML-Datei wird auf allen Seiten von Hugo gemeinsam angewendet.

Deshalb fügen wir vor dem schließenden body-Tag in der vorhandenen `baseof.html` den folgenden Code ein:
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

## Verwendung
Jetzt, wenn Sie die Klasse `mermaid` zu einem Markdown-Codeblock hinzufügen, wird dieser Block als Mermaid gerendert.

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

## Referenz
- https://gohugo.io/content-management/diagrams/