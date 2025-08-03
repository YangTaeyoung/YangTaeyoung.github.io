---
title: "Wie beurteilt ein Web-Crawler die Aktualität?"
date: 2025-08-03T15:27:00+09:00
type: blog
translated: true
---
![image](/images/web/web-page-recency.de-1754211455204.png)

Früher habe ich verschiedene Maßnahmen ergriffen, um die SEO zu verbessern. In letzter Zeit sind diese Maßnahmen wichtiger als gedacht, da nicht nur die Crawler für Suchmaschinen, sondern auch die Crawler, die Antworten für KI generieren, zugenommen haben.

Diese Optimierung ist ziemlich wichtig, da der Verkehr von traditionellen Suchmaschinen auf KI umschlägt und es wichtig geworden ist, für KI sichtbar zu sein. Dieses Konzept wird als AEO (Answer Engine Optimization), GEO (Generative Engine Optimization) usw. bezeichnet.

Bei bestimmten Websites stammen 24,6 % des Verkehrs von Crawlern, die für die Generierung von KI-Antworten verwendet werden, daher könnte diese Optimierung sehr wichtig sein. ([Quelle](https://pod.geraspora.de/posts/17342163))

## Bedeutung der Aktualität
Traditionell erhält die **Aktualität** eine hohe Bewertung von SEO.

Aktualität bedeutet, wie kürzlich und wie oft die Inhalte einer Webseite aktualisiert wurden, und spielt eine wichtige Rolle, indem sie die Zuverlässigkeit und Relevanz einer Seite für Suchmaschinen beurteilt.

Seiten mit hoher Aktualität bieten wahrscheinlich nützlichere Informationen für Benutzer, weshalb Suchmaschinen dazu neigen, diese Seiten vorrangig anzuzeigen.

## Beurteilungskriterien der Aktualität
Wie beurteilt ein Web-Crawler also die Aktualität?

### 1. Sitemap
Wenn eine Website indiziert wird, fordert der Crawler zunächst die `sitemap.xml`-Datei an, um zu erkennen, welche Seiten auf der Website vorhanden sind. Diese Datei enthält die Struktur der Seite sowie die URLs jeder Seite und die letzte Bearbeitungszeit.

Eine Sitemap-Datei ist normalerweise in folgendem Format strukturiert. (Unten ist ein Beispiel der Sitemap meines Blogs)

```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
<script/>
<url>
<loc>https://code-kirin.me/blog/docker/was-ist-docker/</loc>
<lastmod>2022-07-11T00:00:00+09:00</lastmod>
<changefreq>hourly</changefreq>
</url>
<url>
<loc>https://code-kirin.me/blog/docker/erste-schritte-mit-docker/</loc>
<lastmod>2022-07-12T00:00:00+09:00</lastmod>
<changefreq>hourly</changefreq>
</url>
<url>
<loc>https://code-kirin.me/blog/docker/dockerfile/</loc>
<lastmod>2022-07-13T00:00:00+09:00</lastmod>
<changefreq>hourly</changefreq>
</url>
<url>
<loc>https://code-kirin.me/blog/docker/docker-speicher/</loc>
<lastmod>2022-07-15T00:00:00+09:00</lastmod>
<changefreq>hourly</changefreq>
</url>
<url>
<loc>https://code-kirin.me/blog/docker/docker-compose/</loc>
<lastmod>2022-07-21T00:00:00+09:00</lastmod>
<changefreq>hourly</changefreq>
</url>
<!-- ... ausgelassen ... -->
></urlset>
```

In der obigen Sitemap sehen wir das Tag `<lastmod>`. Dieses Tag zeigt das Datum und die Uhrzeit an, zu der die Seite zuletzt bearbeitet wurde. Der Crawler verwendet diese Informationen, um die Aktualität einer bestimmten Seite zu beurteilen.

Wenn dieser Wert für eine Seite, die regelmäßig aktualisiert wird, hoch bleibt, wird der Crawler die Aktualität dieser Seite hoch bewerten.

### 2. Schema.org Markup
Durch das Hinzufügen von Schema.org-Markup zu einer Webseite kann der Crawler den Inhalt der Seite besser verstehen. Dieses Markup bietet strukturierte Daten der Seite, die Suchmaschinen helfen, den Inhalt der Seite genauer zu interpretieren und die Aktualität zu beurteilen.

Wenn beispielsweise das folgende Markup verwendet wird, kann der Crawler das Erstellungsdatum genauer erfassen.

```html
<head>
    <title>Wie beurteilt ein Web-Crawler die Aktualität?</title>
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "Wie beurteilt ein Web-Crawler die Aktualität?",
        "datePublished": "2025-08-03T15:27:00+09:00",
        "dateModified": "2025-08-03T15:27:00+09:00",
        "author": {
            "@type": "Person",
            "name": "Code Kirin"
        }
    }
    </script>
</head>
```

Das Markup kann `datePublished` und `dateModified` verwenden, um das Erstellungs- und Änderungsdatum der Seite zu kennzeichnen. Dadurch kann der Crawler die Aktualität der Seite eindeutiger beurteilen.

### 2.1 ~~Microdata~~ (Veraltet)
Durch die Verwendung von Microdata kann die strukturierte Daten der Seite bereitgestellt werden. Inzwischen wird jedoch die JSON-LD-Methode bevorzugt, und Microdata wird allmählich weniger verwendet.

```html
<div itemscope itemtype="https://schema.org/BlogPosting">
    <h1 itemprop="headline">Wie beurteilt ein Web-Crawler die Aktualität?</h1>
    <p itemprop="datePublished" content="2025-08-03T15:27:00+09:00">Erstellungsdatum: 3. August 2025</p>
    <p itemprop="dateModified" content="2025-08-03T15:27:00+09:00">Änderungsdatum: 3. August 2025</p>
    <p itemprop="author" itemscope itemtype="https://schema.org/Person">
        Autor: <span itemprop="name">Code Kirin</span>
    </p>
</div>
```

### 3. HTTP-Header
Das `ETag` und `Last-Modified` sind ebenfalls wichtig. [Laut den offiziellen Google-Dokumenten](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers?hl=ko#http-caching) wird, wenn sowohl ETag als auch Last-Modified vorhanden sind, das ETag bevorzugt verwendet.

#### `ETag`?
`ETag` ist ein HTTP-Header, den Webserver verwenden, um eine Version von Ressourcen zu identifizieren. Dieser Wert wird bei jeder Änderung des Inhalts der Ressource aktualisiert. Crawler verwenden den ETag-Wert, um die Aktualität der Ressource zu beurteilen.

```http
ETag: "abc123"
```

#### `Last-Modified`
`Last-Modified` ist ein HTTP-Header, der das Datum und die Uhrzeit angibt, zu der die Ressource zuletzt geändert wurde. Dieser Wert wird ebenfalls bei jeder Änderung der Ressource aktualisiert. Crawler verwenden diesen Wert, um die Aktualität der Ressource zu beurteilen.

```http
Last-Modified: Mon, 03 Aug 2025 15:27:00 GMT
```

## Wie findet man `sitemap.xml`?
Der stärkste Indikator für die Aktualität ist die `sitemap.xml`-Datei. Mit nur dieser Datei können wir die Struktur der Seiten der jeweiligen Website, die URLs jeder Seite und die letzte Bearbeitungszeit erfahren.

Aber wie findet der Crawler die `sitemap.xml`-Datei? Es ist nicht so, dass der Pfad zu `sitemap.xml` überall festgelegt ist.

## 1. Bekannter Pfad
Im Allgemeinen befindet sich die sitemap.xml-Datei im Stammverzeichnis der Website. Zum Beispiel kann sie im Pfad `https://example.com/sitemap.xml` gefunden werden.

Darüber hinaus können weitere gängige Pfade wie folgt versucht werden:

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
Falls sie immer noch nicht zu finden ist, kann die Datei `robots.txt` überprüft werden. Diese Datei definiert die Crawling-Richtlinien der Website und gibt oft den Speicherort der `sitemap.xml`-Datei an.

Die `robots.txt`-Datei meines Blogs lautet:

```
User-agent: *
```

Es wurde keine separate Sitemap angegeben, da die Sitemap im Stammverzeichnis existiert und daher problemlos gefunden werden kann.

Wie sieht es mit der `robots.txt` von YouTube aus?

```
# robots.txt-Datei für YouTube
# Erstellt in der fernen Zukunft (Jahr 2000) nach
# dem Roboteraufstand in den 90er Jahren, der alle Menschen auslöschte.

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

So definiert sie die Crawling-Richtlinien. Die Seitenlisten, für die das Crawlen nicht erlaubt ist, werden mit dem Schlüsselwort `Disallow` definiert, und der Speicherort der Sitemap wird mit dem Schlüsselwort `Sitemap` angegeben.

Wenn wir tatsächlich den Pfad zur Sitemap besuchen, sieht sie so aus:
```xml
Diese XML-Datei scheint keine Formatierungsinformationen zu haben. Der Dokumentbaum wird wie folgt angezeigt.
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

Durch die `robots.txt`-Datei kann der Crawler also den Speicherort der Sitemap finden.

### 3. Andere Möglichkeiten?
Darüber hinaus kann der Crawler den Standort der Sitemap anhand eines Meta-Tags im HTML-Quellcode der Webseite erkennen, der wie folgt aussieht: `<link rel="sitemap" href="sitemap.xml">`. Diese Methode wird jedoch nicht auf allen Websites verwendet, daher wird in der Regel zuerst die Datei `robots.txt` überprüft.

Außerdem betreiben Suchmaschinen eigene Suchkonsolen, wo die Sitemap registriert wird, um indiziert zu werden.

- Bing Webmaster Tools: https://www.bing.com/webmasters/
- Google Search Console: https://search.google.com/search-console
- Naver Search Advisor: https://searchadvisor.naver.com/

## Referenz
- [Google Search Central - Übersicht über Google-Crawler und Fetcher (User-Agent)](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers)
- [Google Search Central - Sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps)
- [SearchPilot - JSON–LD vs Microdata Revisited](https://www.searchpilot.com/resources/case-studies/json-versus-microdata-in-2024)
- [Medium - Wie sich JSON-LD von Schema oder RDF oder Microdata unterscheidet](https://medium.com/@HuntingHate/how-json-ld-is-different-than-schema-or-rdf-or-microdata-b6e3759ccd35)