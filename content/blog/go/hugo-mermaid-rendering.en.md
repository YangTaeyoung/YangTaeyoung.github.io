---
title: Rendering Mermaid Graphs in Hugo Blog
type: blog
date: 2025-03-06
comments: true
translated: true
---
Currently, my tech blog uses a template engine called Hugo. Hugo is a static site generator that converts Markdown files into HTML.

In Markdown, which we commonly use, there is a feature called code block.

The Go code below is nicely highlighted syntax-wise:
```go
func main() {
	fmt.Println("Hello, World!")
}
```

Java code is likewise displayed with syntax highlighting through a code block:
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
}
```

In fact, code blocks are quite a common feature, and most Markdown processors support it, but sometimes there is a need to draw diagrams.

In such cases, the commonly used tools include traditional favorites like [draw.io](https://draw.io) and tools that give a hand-drawn feel, such as [excalidraw](https://excalidraw.com/).
> I personally enjoy the hand-drawn feel, so I tend to use excalidraw a lot.

For developers who are used to coding, there are many tools that allow you to create diagrams based on code, such as [Mermaid](https://mermaid-js.github.io/mermaid/#/), [graphviz](https://graphviz.org/), and [D2](https://d2lang.com/).

Among these, the most popular tool is arguably Mermaid. Mermaid is a tool that allows you to draw diagrams using its unique syntax.

For example, using the syntax below:
```
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```

You can create a graph like this:
```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```

The theme applied to my blog, called Hextra, natively supports Mermaid. However, not all blog themes support Mermaid.

Therefore, in this instance, I want to explore how to enable Mermaid on any Hugo blog.

## Adding Code Block Rendering for Layouts
First, we need to add code to render Mermaid code blocks in layouts.

```html{filename="layouts/_default/_markup/render-codeblock-mermaid.html"}
<pre class="mermaid">
  {{ .Inner | htmlEscape | safeHTML }}
</pre>
{{ .Page.Store.Set "hasMermaid" true }}
```
This file just needs to be added according to the path.

## Adding Mermaid Script to `baseof.html`
Typically, Hugo has the `layouts/_default/baseof.html` file. This HTML is applied universally to all pages in Hugo.

So, before the closing of the body tag in the existing `baseof.html`, add the following code:
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

## Usage
Now, by adding a class of `mermaid` to the Markdown code block that you want to use, that code block will be rendered using Mermaid.

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

## Reference
- https://gohugo.io/content-management/diagrams/
