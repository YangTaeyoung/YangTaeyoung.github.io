---
title: "ウェブクローラーはどのように最新性を判断するか？"
date: 2025-08-03T15:27:00+09:00
type: blog
translated: true
---

![image](/images/web/web-page-recency.ja-1754211174611.png)

以前はSEOを引き上げるためにさまざまな作業を行っていた。最近では、これらの作業が思った以上に重要になってきている。それは、検索エンジン用のクローラーだけでなく、AIの回答生成のためのクローラーも増えているからである。

このような最適化は非常に重要で、最近、従来の検索エンジンからのトラフィックがAIに転換されつつあるため、AIに見えやすくすることが重要になり、この概念はAEO（Answer Engine Optimization）、GEO（Generative Engine Optimization）などと呼ばれる。

特定のウェブサイトの場合、トラフィックの24.6%がAI回答生成に使用されるクローラーから発生するというので、こうした最適化は非常に重要かもしれない。（[出典](https://pod.geraspora.de/posts/17342163)）

## 最新性の重要性

従来からSEOに高いスコアを与える要素の1つは**最新性**である。  
最新性は、ウェブページの内容がどれくらい最近、どのくらい頻繁に、定期的に更新されたかを意味し、これは検索エンジンがページの信頼性と関連性を判断する上で重要な要素となる。  
最新性が高いページは、ユーザーにとってより有用な情報を提供する可能性が高いため、検索エンジンは最新性の高いページを優先的に表示させる傾向がある。

## 最新性判断基準
では、ウェブクローラーはどのように最新性を判断するのか？

### 1. Sitemap
ウェブサイトがインデックス化される際、クローラーはまずそのサイトにどのページがあるかを把握するために`sitemap.xml`ファイルを要求する。このファイルには、サイトの構造と各ページのURL、最終更新日時などが含まれている。  
sitemapファイルは一般的に以下のような形式で構成される。（以下は著者のブログのサイトマップの例である）

```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
<script/>
<url>
<loc>https://code-kirin.me/blog/docker/what-is-docker/</loc>
<lastmod>2022-07-11T00:00:00+09:00</lastmod>
<changefreq>hourly</changefreq>
</url>
<url>
<loc>https://code-kirin.me/blog/docker/getting-start-docker/</loc>
<lastmod>2022-07-12T00:00:00+09:00</lastmod>
<changefreq>hourly</changefreq>
</url>
<url>
<loc>https://code-kirin.me/blog/docker/dockerfile/</loc>
<lastmod>2022-07-13T00:00:00+09:00</lastmod>
<changefreq>hourly</changefreq>
</url>
<url>
<loc>https://code-kirin.me/blog/docker/docker-storage/</loc>
<lastmod>2022-07-15T00:00:00+09:00</lastmod>
<changefreq>hourly</changefreq>
</url>
<url>
<loc>https://code-kirin.me/blog/docker/docker-compose/</loc>
<lastmod>2022-07-21T00:00:00+09:00</lastmod>
<changefreq>hourly</changefreq>
</url>
<!-- ... 省略 ... -->
></urlset>
```

上記には、`<lastmod>`タグがある。このタグは、該当ページが最後に修正された日付と時間を示す。クローラーはこの情報を用いて特定ページの最新性を判断する。

この値が定期的に確実にアップロードされるページであれば、クローラーはそのサイトの最新性を高く評価するだろう。

### 2. Schema.orgマークアップ
ウェブページにSchema.orgマークアップを追加すると、クローラーがページの内容をよりよく理解できる。このマークアップはページの構造化データを提供し、検索エンジンがページの内容を正確に解釈し、最新性を判断するのに役立つ。

たとえば、次のようなマークアップを使用するとクローラーは作成日をより正確に把握できる。  
```html
<head>
    <title>ウェブクローラーはどのように最新性を判断するか？</title>
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "ウェブクローラーはどのように最新性を判断するか？",
        "datePublished": "2025-08-03T15:27:00+09:00",
        "dateModified": "2025-08-03T15:27:00+09:00",
        "author": {
            "@type": "Person",
            "name": "コードキリン"
        }
    }
    </script>
</head>
```

このようにマークアップ内に`datePublished`と`dateModified`を使用してページの作成日および修正日を明示することで、クローラーはページの最新性をより明確に判断できる。

### 2.1 ~~Microdata~~ (非推奨)
次のようにMicrodataを使用してページの構造化データを提供することもできる。しかし現在はJSON-LD方式がより好まれており、Microdataは徐々に使用されなくなっている。  
```html
<div itemscope itemtype="https://schema.org/BlogPosting">
    <h1 itemprop="headline">ウェブクローラーはどのように最新性を判断するか？</h1>
    <p itemprop="datePublished" content="2025-08-03T15:27:00+09:00">作成日: 2025年8月3日</p>
    <p itemprop="dateModified" content="2025-08-03T15:27:00+09:00">修正日: 2025年8月3日</p>
    <p itemprop="author" itemscope itemtype="https://schema.org/Person">
        作成者: <span itemprop="name">コードキリン</span>
    </p>
</div>
```

### 3. HTTPヘッダー
`ETag`と`Last-Modified`について、[Google公式文書](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers?hl=ko#http-caching)によれば、ETagとLast-Modifiedタグの両方がある場合は、ETagが優先的に使用されるという。

#### `ETag`とは？
`ETag`は、ウェブサーバーがリソースのバージョンを識別するために使用するHTTPヘッダーである。この値は、リソースの内容が変更されるたびに更新される。クローラーはETag値を使ってリソースの最新性を判断できる。  
```http
ETag: "abc123"
```

#### `Last-Modified`
`Last-Modified`は、リソースが最後に修正された日付と時間を示すHTTPヘッダーである。この値はリソースが変更されるたびに更新される。クローラーはこの値を使ってリソースの最新性を判断できる。  
```http
Last-Modified: Mon, 03 Aug 2025 15:27:00 GMT
```

## どのように`sitemap.xml`を見つけるか？
最新性に対する最も強力な判断指標は`sitemap.xml`ファイルである。この1ファイルだけで、そのサイトが持つページの構造や各ページのURL、最終更新時間などがわかるからである。

では、クローラーはどのように`sitemap.xml`ファイルを見つけるのか？どこでも`sitemap.xml`のパスが固定されているわけではない。

## 1. 知られているパス
一般的にsitemap.xmlファイルはウェブサイトのルートディレクトリに位置している。例えば、`https://example.com/sitemap.xml`のようなパスで見つけることができる。  
そのほかにも、以下のような一般的なパスを試みることができる。
```
/sitemap.xml
/sitemap_index.xml
/sitemap/sitemap.xml
/sitemaps/sitemap.xml
/sitemap1.xml
/sitemap-index.xml
/wp-sitemap.xml (WordPress)
/page-sitemap.xml
/post-sitemap.xml
```

## 2. robots.txt
それでも見つからない場合、`robots.txt`ファイルを確認してみることもできる。このファイルはウェブサイトのクローリングポリシーを定義し、時折`sitemap.xml`ファイルの場所を明示する。

著者のブログの`robots.txt`ファイルは次の通りである。
```
User-agent: *
```

sitemapは別途指定されていないが、これはルートにサイトマップが存在しているため、特に指定しなくてもうまく見つけられるからである。

それでは、YouTubeのrobots.txtファイルはどうか？
```
# robots.txt file for YouTube
# Created in the distant future (the year 2000) after
# the robotic uprising of the mid 90's which wiped out all humans.

User-agent: Mediapartners-Google*
Disallow:

User-agent: *
Disallow: /api/
Disallow: /comment
Disallow: /feeds/videos.xml
Disallow: /file_download
Disallow: /get_video
Disallow: /get_video_info
Disallow: /get_midroll_info
Disallow: /live_chat
Disallow: /login
Disallow: /qr
Disallow: /results
Disallow: /signup
Disallow: /t/terms
Disallow: /timedtext_video
Disallow: /verify_age
Disallow: /watch_ajax
Disallow: /watch_fragments_ajax
Disallow: /watch_popup
Disallow: /watch_queue_ajax
Disallow: /youtubei/

Sitemap: https://www.youtube.com/sitemaps/sitemap.xml
Sitemap: https://www.youtube.com/product/sitemap.xml
```

このようにクローリングポリシーを定義している。クローリングを許可しないページのリストは`Disallow`キーワードで定義され、`Sitemap`キーワードを使用してサイトマップの位置を明示している。

実際にパスにあるサイトマップを確認すると以下のようになっている。
```xml
This XML file does not appear to have any style information associated with it. The document tree is shown below.
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<script/>
<sitemap>
<loc>https://www.youtube.com/ads/sitemap.xml</loc>
</sitemap>
<sitemap>
<loc>https://www.youtube.com/sitemaps/misc.xml</loc>
</sitemap>
<sitemap>
<loc>https://www.youtube.com/kids/sitemap.xml</loc>
</sitemap>
<sitemap>
<loc>https://www.youtube.com/trends/sitemap.xml</loc>
</sitemap>
<sitemap>
<loc>https://about.youtube/sitemap.xml</loc>
</sitemap>
<sitemap>
<loc>https://www.youtube.com/jobs/sitemap.xml</loc>
</sitemap>
<sitemap>
<loc>https://www.youtube.com/creators/sitemap.xml</loc>
</sitemap>
<sitemap>
<loc>https://www.youtube.com/csai-match/sitemap.xml</loc>
</sitemap>
<sitemap>
<loc>https://www.youtube.com/originals/guidelines/sitemap.xml</loc>
</sitemap>
<sitemap>
<loc>https://contributors.youtube.com/sitemap.xml</loc>
</sitemap>
<sitemap>
<loc>https://socialimpact.youtube.com/sitemap.xml</loc>
</sitemap>
<sitemap>
<loc>https://vr.youtube.com/sitemap.xml</loc>
</sitemap>
<sitemap>
<loc>https://artists.youtube/sitemap.xml</loc>
</sitemap>
<sitemap>
<loc>https://www.youtube.com/measurementprogram/sitemap.xml</loc>
</sitemap>
<sitemap>
<loc>https://www.youtube.com/go/family/sitemap.xml</loc>
</sitemap>
<sitemap>
<loc>https://www.youtube.com/yt/terms/sitemap.xml</loc>
</sitemap>
<sitemap>
<loc>https://www.youtube.com/howyoutubeworks/sitemap.xml</loc>
</sitemap>
<sitemap>
<loc>https://www.youtube.com/myfamily/sitemap.xml</loc>
</sitemap>
<sitemap>
<loc>https://health.youtube/sitemap.xml</loc>
</sitemap>
<sitemap>
<loc>https://news.youtube/sitemap.xml</loc>
</sitemap>
<sitemap>
<loc>https://research.youtube/sitemap.xml</loc>
</sitemap>
</sitemapindex>
```

このように`robots.txt`ファイルを通じて、クローラーはサイトマップの位置を見つけることができる。

### 3. その他に
その他にも、クローラーはウェブページのHTMLソースコードから`<link rel="sitemap" href="sitemap.xml">`のようなメタタグを見つけてサイトマップの位置を把握できる。しかしこの方法はすべてのウェブサイトで使用されているわけではないため、一般的には`robots.txt`ファイルを優先的に確認する。

そして検索エンジンは各々独自のサーチコンソールを運営しており、そこにサイトマップを登録してインデックス化する方法もある。

- Bing Webmaster Tools: https://www.bing.com/webmasters/
- Google Search Console: https://search.google.com/search-console
- Naver Search Advisor: https://searchadvisor.naver.com/

## 参考文献
- [Google Search Central - Overview of Google crawlers and fetchers (user agents)](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers)
- [Google Search Central - Sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps)
- [SearchPilot - JSON–LD vs Microdata Revisited](https://www.searchpilot.com/resources/case-studies/json-versus-microdata-in-2024)
- [Medium - How JSON-LD is different than Schema or RDF or Microdata](https://medium.com/@HuntingHate/how-json-ld-is-different-than-schema-or-rdf-or-microdata-b6e3759ccd35)  
