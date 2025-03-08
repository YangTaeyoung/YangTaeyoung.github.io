---
title: Hugo Blog에 Mermaid 그래프를 렌더링해보자
type: blog
date: 2025-03-06
comments: true
---
현재 내 기술 블로그는 Hugo 라는 템플릿 엔진을 사용하고 있다. Hugo는 정적 사이트 생성기로, Markdown 파일을 HTML로 변환해주는 역할을 한다.

우리가 흔히 사용하는 마크다운에는 코드 블럭이라는 것이 있다.

아래의 Go 코드도 예쁘게 문법을 강조해서 보여주고,
```go
func main() {
	fmt.Println("Hello, World!")
}
```

Java 코드도 마찬가지로 코드 블럭을 통해 문법을 강조해서 보여준다.
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

사실 코드 블럭은 아주 흔한 기능이라, 대부분의 마크다운에서 지원하는 경우가 많은데, 가끔은 다이어그램을 그려야 할 때가 있다.

그럴때 일반적으로 사용하는 툴은 GUI로는 전통적인 강자 [draw.io](https://draw.io)가 있고, [excalidraw](https://excalidraw.com/)와 같이 마치 손으로 그린 것과 같은 느낌을 주는 툴도 있다.
> 필자는 손으로 그리는 느낌이 좋아서 excalidraw를 많이 사용하는 편이다.

아무래도 개발자의 경우 코드가 익숙하기에 코드 베이스로 다이어그램을 그리는 툴도 많이 존재하는데, [Mermaid](https://mermaid-js.github.io/mermaid/#/), [graphviz](https://graphviz.org/), [D2](https://d2lang.com/) 등이 있다.

이 중 가장 대중적인 툴은 Mermaid라고 할 수 있다. Mermaid는 특유의 문법을 사용하여 다이어그램을 그릴 수 있게 해주는 툴이다.

예를 들어 아래와 같은 문법을 사용하면
```
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```

아래와 같은 그래프를 그릴 수 있다.
```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```

현재 내 블로그에 적용된 Hextra라는 테마는  기본적으로 Mermaid를 지원한다. 다만 모든 블로그 테마가 Mermaid를 지원하는 것은 아니다.

그래서 이번에는 어떤 Hugo 블로그에서도 Mermaid를 사용할 수 있도록 하는 방법을 알아보려고 한다.

## Layout에 코드 블럭 랜더링 추가하기
먼저 layouts에 mermaid 코드 블럭을 랜더링할 수 있는 코드를 추가해야 한다. 

```html{filename="layouts/_default/_markup/render-codeblock-mermaid.html"}
<pre class="mermaid">
  {{ .Inner | htmlEscape | safeHTML }}
</pre>
{{ .Page.Store.Set "hasMermaid" true }}
```
위 파일만 경로에 맞게 추가해주면 된다.

## `baseof.html`에 Mermaid script 추가하기
일반적으로 hugo는 `layouts/_default/baseof.html`이 있다. 해당 HTML은 hugo의 모든 페이지에 공통으로 적용되는 HTML이다.

그래서 기존 `baseof.html` 아래의 body 태그가 닫히기 전 html에 다음 코드를 추가한다.
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

## 사용하기
이제 사용할 마크다운 코드 블럭에 `mermaid`라는 클래스를 추가하면, 해당 코드 블럭이 Mermaid로 랜더링된다.

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