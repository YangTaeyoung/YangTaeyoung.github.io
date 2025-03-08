---
title: Hugo BlogでMermaidグラフをレンダリングしてみよう
type: blog
date: 2025-03-06
comments: true
translated: true
---
現在私の技術ブログはHugoというテンプレートエンジンを使用しています。Hugoは静的サイトジェネレーターで、MarkdownファイルをHTMLに変換する役割を果たします。

私たちがよく使うマークダウンにはコードブロックというものがあります。

以下のGoコードもきれいに文法を強調して表示されます。
```go
func main() {
	fmt.Println("Hello, World!")
}
```

Javaコードも同様にコードブロックを通して文法を強調して表示します。
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
}
```

実際、コードブロックはとても一般的な機能であり、多くのマークダウンでサポートされていますが、時にはダイアグラムを描く必要がある時もあります。

その場合、一般的に使用されるツールはGUIでの伝統的な強者[draw.io](https://draw.io)や、[excalidraw](https://excalidraw.com/)のように手で描いたような感触を与えるツールもあります。
> 筆者は手で描く感じが好きで、excalidrawをよく使用しています。

開発者の場合、コードに親しんでいるため、コードベースでダイアグラムを描くツールも多く存在しています。例えば、[Mermaid](https://mermaid-js.github.io/mermaid/#/)、[graphviz](https://graphviz.org/)、[D2](https://d2lang.com/)などです。

その中で最も普及しているツールはMermaidと言えるでしょう。Mermaidは特有の文法を使用してダイアグラムを描けるツールです。

例えば以下のような文法を使用すると
```
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```

以下のようなグラフを描くことができます。
```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```

現在私のブログに適用されているHextraというテーマは、基本的にMermaidをサポートしています。ただし、すべてのブログテーマがMermaidをサポートしているわけではありません。

そこで今回は、どのHugoブログでもMermaidを使用できるようにする方法を探ろうと思います。

## Layoutにコードブロックレンダリング追加
まず、layoutsにmermaidコードブロックをレンダリングできるコードを追加する必要があります。

```html{filename="layouts/_default/_markup/render-codeblock-mermaid.html"}
<pre class="mermaid">
  {{ .Inner | htmlEscape | safeHTML }}
</pre>
{{ .Page.Store.Set "hasMermaid" true }}
```
上記のファイルを正しいパスに追加すればいいだけです。

## `baseof.html`にMermaidスクリプト追加
一般的にHugoには`layouts/_default/baseof.html`があります。このHTMLはHugoのすべてのページに共通して適用されるHTMLです。

したがって、既存の`baseof.html`のbodyタグが閉じる前に次のコードを追加します。
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

## 使用法
これで使用するマークダウンコードブロックに`mermaid`というクラスを追加すれば、そのコードブロックがMermaidでレンダリングされます。

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

## 参考
- https://gohugo.io/content-management/diagrams/
