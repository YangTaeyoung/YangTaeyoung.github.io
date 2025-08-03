---
title: "웹 크롤러는 어떻게 최신성을 판단할까?"
date: 2025-08-03T15:27:00+09:00 
type: blog
---
![image](/images/web/web-page-recency-1754211151067.png)

예전엔 SEO를 끌어올리기 위해 다양한 작업을 했다. 최근엔 이런 작업들이 생각보다 많이 중요해지고 있는데, 검색엔진을 위한 크롤러 뿐 아니라 AI의 답변 생성을 위한 크롤러도 많이 증가하고 있기 때문이다.

이런 최적화는 꽤나 중요한데, 최근에 전통적인 검색엔진에서의 트래픽이 AI로 전환되면서, AI에게 잘 보이도록 하는 것이 중요해졌고, 이런 개념은 AEO(Answer Engine Optimization), GEO(Generative Engine Optimization) 등으로 불린다.

특정 웹 사이트의 경우 트래픽의 24.6%가 AI 답변 생성에 사용되는 크롤러로부터 발생한다고 하니, 이런 최적화는 매우 중요할 수 있겠다.([출처](https://pod.geraspora.de/posts/17342163))

## 최신성의 중요성

전통적으로 **SEO에게 높은 점수를 부여**하는 것이 있는데 그 중 하나가 **최신성**이다. 

최신성은 웹 페이지의 내용이 얼마나 최근에 얼마나 자주, 주기적으로 업데이트 되었는지를 의미하며, 이는 검색엔진이 페이지의 신뢰성과 관련성을 판단하는 데 중요한 요소로 작용한다.

최신성이 높은 페이지는 사용자에게 더 유용한 정보를 제공할 가능성이 높기 때문에, 검색엔진은 최신성 높은 페이지를 우선적으로 노출시키는 경향이 있다.

## 최신성 판단 기준
그럼 웹 크롤러는 어떻게 최신성을 판단할까?

### 1. Sitemap
웹 사이트가 색인이 될 때 크롤러는 가장 먼저 해당 사이트에 어떤 페이지들이 있는지를 인식하기 위해 `sitemap.xml` 파일을 요청한다. 이 파일은 사이트의 구조와 각 페이지의 URL, 마지막 수정 시간 등을 포함하고 있다.

sitemap 파일은 일반적으로 다음과 같은 형식으로 구성된다. (아래는 필자 블로그의 사이트 맵 예시이다)

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
<!-- ... 생략 ... -->
></urlset>
```

위에 보면 `<lastmod>` 태그가 있다. 이 태그는 해당 페이지가 마지막으로 수정된 날짜와 시간을 나타낸다. 크롤러는 이 정보를 사용하여 특정 페이지의 최신성을 판단한다.

이 값이 주기적으로 꾸준히 업로드 되는 페이지라면, 크롤러는 해당 사이트의 최신성을 높게 평가할 것이다.

### 2. Schema.org 마크업
웹 페이지에 Schema.org 마크업을 추가하면, 크롤러가 페이지의 내용을 더 잘 이해할 수 있다. 이 마크업은 페이지의 구조화된 데이터를 제공하여, 검색엔진이 페이지의 내용을 더 정확하게 해석하고 최신성을 판단하는 데 도움을 준다.

예를 들어 다음과 같은 마크업을 사용하면 크롤러는 작성날짜를 더욱 정확하게 파악할 수 있다.

```html
<head>
    <title>웹 크롤러는 어떻게 최신성을 판단할까?</title>
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "웹 크롤러는 어떻게 최신성을 판단할까?",
        "datePublished": "2025-08-03T15:27:00+09:00",
        "dateModified": "2025-08-03T15:27:00+09:00",
        "author": {
            "@type": "Person",
            "name": "코드키린"
        }
    }
    </script>
</head>
```

다음과 마크업 내에 `datePublished`와 `dateModified`를 사용하여 페이지의 작성 및 수정 날짜를 명시할 수 있다. 이를 통해 크롤러는 페이지의 최신성을 더욱 명확하게 판단할 수 있다.

### 2.1 ~~Microdata~~ (Deprecated)
다음과 같이 Microdata를 사용하여 페이지의 구조화된 데이터를 제공할 수 있다. 하지만 현재는 JSON-LD 방식이 더 선호되며, Microdata는 점차 사용되지 않는 추세이다.

```html
<div itemscope itemtype="https://schema.org/BlogPosting">
    <h1 itemprop="headline">웹 크롤러는 어떻게 최신성을 판단할
까?</h1>
    <p itemprop="datePublished" content="2025-08-03T15:27:00+09:00">작성일: 2025년 8월 3일</p>
    <p itemprop="dateModified" content="2025-08-03T15:27:00+09:00">수정일: 2025년 8월 3일</p>
    <p itemprop="author" itemscope itemtype="https://schema.org/Person">
        작성자: <span itemprop="name">코드키린</span>
    </p>
</div>
```

### 3. HTTP 헤더
`ETag`와 `Last-Modified`, [Google 공식 문서](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers?hl=ko#http-caching)에서는 ETag와 Last-Modified 태그 모두가 있는 경우 ETag를 우선적으로 사용한다고 한다.

#### `ETag`?
`ETag`는 웹 서버가 리소스의 버전을 식별하기 위해 사용하는 HTTP 헤더이다. 이 값은 리소스의 내용이 변경될 때마다 업데이트된다. 크롤러는 ETag 값을 사용하여 리소스의 최신성을 판단할 수 있다.

```http
ETag: "abc123"
```

#### `Last-Modified`
`Last-Modified`는 리소스가 마지막으로 수정된 날짜와 시간을 나타내는 HTTP 헤더이다. 이 값은 리소스가 변경될 때마다 업데이트된다. 크롤러는 이 값을 사용하여 리소스의 최신성을 판단할 수 있다.

```http
Last-Modified: Mon, 03 Aug 2025 15:27:00 GMT
```

## 어떻게 `sitemap.xml`을 찾을까?
최신성에 대한 가장 강력한 판단 지표는 `sitemap.xml` 파일이다. 파일 하나만으로 해당 사이트가 가진 페이지의 구조와 각 페이지의 URL, 마지막 수정 시간 등을 알 수 있기 때문이다.

그럼 크롤러는 어떻게 `sitemap.xml` 파일을 찾을까? 어디든 `sitemap.xml` 경로가 고정되어 있는 것도 아니고 말이다.

## 1. 알려진 경로
일반적으로 sitemap.xml 파일은 웹 사이트의 루트 디렉토리에 위치한다. 예를 들어, `https://example.com/sitemap.xml`와 같은 경로에서 찾을 수 있다.

그 밖에도 아래와 같은 일반적인 경로를 시도할 수 있을 것이다. 

```
/sitemap.xml
/sitemap_index.xml
/sitemap/sitemap.xml
/sitemaps/sitemap.xml
/sitemap1.xml
/sitemap-index.xml
/wp-sitemap.xml (워드프레스)
/page-sitemap.xml
/post-sitemap.xml
```

## 2. robots.txt
그래도 없다면 `robots.txt` 파일을 확인해 볼 수 있다. 이 파일은 웹 사이트의 크롤링 정책을 정의하며, 종종 `sitemap.xml` 파일의 위치를 명시한다.

필자의 블로그의 `robots.txt` 파일은 다음과 같다.

```
User-agent: *
```

sitemap은 별개로 지정되어 있지 않은데, 이는 루트에 사이트맵이 존재하여 별도로 지정하지 않아도 잘 찾기 때문이다.

그럼 유투브의 robots.txt 파일은 어떨까?

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

이런식으로 크롤링 정책을 정의하고 있다. 크롤링을 허용하지 않는 페이지 목록은 `Disallow` 키워드로 정의하고, `Sitemap` 키워드를 사용하여 사이트맵의 위치를 명시한다.

실제로 경로에 있는 사이트맵을 가보면 다음과 같다.
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

이렇게 `robots.txt` 파일을 통해 크롤러는 사이트맵의 위치를 찾을 수 있다.

### 3. 이외에는?

이외에도 크롤러는 웹 페이지의 HTML 소스 코드에서 `<link rel="sitemap" href="sitemap.xml">`와 같은 메타 태그를 찾아 사이트맵의 위치를 파악할 수 있다. 하지만 이 방법은 모든 웹 사이트에서 사용되지 않기 때문에, 일반적으로는 `robots.txt` 파일을 우선적으로 확인한다.

그리고 검색 엔진은 각자 별도의 서치 콘솔을 운영하고 있는데, 그곳에 사이트맵을 등록하여 색인하는 방법도 있다.

- Bing Webmaster Tools: https://www.bing.com/webmasters/
- Google Search Console: https://search.google.com/search-console
- Naver Search Advisor: https://searchadvisor.naver.com/

## Reference
- [Google Search Central - Overview of Google crawlers and fetchers (user agents)](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers)
- [Google Search Central - Sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps)
- [SearchPilot - JSON–LD vs Microdata Revisited](https://www.searchpilot.com/resources/case-studies/json-versus-microdata-in-2024)
- [Medium - How JSON-LD is different than Schema or RDF or Microdata](https://medium.com/@HuntingHate/how-json-ld-is-different-than-schema-or-rdf-or-microdata-b6e3759ccd35)