---
title: "How Do Web Crawlers Determine Freshness"
date: 2025-08-03T15:27:00+09:00
type: blog
translated: true
---

![image](/images/web/web-page-recency.en-1754211273549.png)

In the past, various efforts were made to boost SEO. Recently, these efforts have become more important than expected, as there has been a significant increase in crawlers not only for search engines but also for generating responses by AI.

Such optimization is quite crucial, as traffic from traditional search engines has recently shifted to AI, making it important to ensure visibility to AI. This concept is known as AEO (Answer Engine Optimization), GEO (Generative Engine Optimization), and others.

In the case of specific websites, it is reported that 24.6% of the traffic comes from crawlers used for generating AI responses, making this optimization very important. ([Source](https://pod.geraspora.de/posts/17342163))

## Importance of Freshness
Traditionally, one of the factors that **gives high scores to SEO** is **freshness**.

Freshness refers to how recent the content of a web page is, and how often and periodically it is updated, which is an important factor for search engines to determine the credibility and relevance of the page.

Pages with high freshness are likely to provide more useful information to users, leading search engines to preferentially display pages that are more current.

## Criteria for Judging Freshness
So, how do web crawlers determine freshness?

### 1. Sitemap
When a website is indexed, the crawler first requests the `sitemap.xml` file to identify which pages are on that site. This file contains the structure of the site, each page's URL, last modification time, and more.

A sitemap file is typically composed in the following format. (Below is an example of the author's blog sitemap)

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
<!-- ... truncated ... -->
></urlset>
```

As seen above, there is a `<lastmod>` tag. This tag indicates the date and time the page was last modified. The crawler uses this information to determine the freshness of a specific page.

If this value is from a page that is consistently uploaded regularly, the crawler will rate the freshness of the site highly.

### 2. Schema.org Markup
By adding Schema.org markup to the web page, crawlers can better understand the page's content. This markup provides structured data for the page, helping the search engine interpret the page's content more accurately and assess its freshness.

For example, using the following markup allows the crawler to determine the publication date more accurately.

```html
<head>
    <title>How Do Web Crawlers Determine Freshness</title>
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "How Do Web Crawlers Determine Freshness",
        "datePublished": "2025-08-03T15:27:00+09:00",
        "dateModified": "2025-08-03T15:27:00+09:00",
        "author": {
            "@type": "Person",
            "name": "CodeKirin"
        }
    }
    </script>
</head>
```

By using `datePublished` and `dateModified` in the markup, the publication and modification dates of the page can be specified. This way, the crawler can more clearly judge the freshness of the page.

### 2.1 ~~Microdata~~ (Deprecated)
Structured data for the page can also be provided using Microdata as follows. However, JSON-LD is currently preferred, and Microdata is gradually falling out of use.

```html
<div itemscope itemtype="https://schema.org/BlogPosting">
    <h1 itemprop="headline">How Do Web Crawlers Determine Freshness</h1>
    <p itemprop="datePublished" content="2025-08-03T15:27:00+09:00">Publication Date: August 3, 2025</p>
    <p itemprop="dateModified" content="2025-08-03T15:27:00+09:00">Modification Date: August 3, 2025</p>
    <p itemprop="author" itemscope itemtype="https://schema.org/Person">
        Author: <span itemprop="name">CodeKirin</span>
    </p>
</div>
```

### 3. HTTP Headers
According to [Google's official documentation](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers?hl=ko#http-caching), when both ETag and Last-Modified tags are present, ETag takes precedence.

#### `ETag`?
`ETag` is an HTTP header used by the web server to identify the version of a resource. This value is updated each time the content of the resource changes. The crawler can use the ETag value to determine the freshness of the resource.

```http
ETag: "abc123"
```

#### `Last-Modified`
`Last-Modified` is an HTTP header that indicates the date and time when the resource was last modified. This value is updated each time the resource changes. The crawler uses this value to determine the freshness of the resource.

```http
Last-Modified: Mon, 03 Aug 2025 15:27:00 GMT
```

## How Do Crawlers Find `sitemap.xml`?
The strongest indicator for freshness is the `sitemap.xml` file. With just one file, you can discern the structure of the pages on the site, each page's URL, last modification times, etc.

So, how do crawlers locate the `sitemap.xml` file? The path to `sitemap.xml` isn't fixed everywhere.

## 1. Known Paths
Typically, the sitemap.xml file is located in the root directory of the website. For example, you can find it at a path like `https://example.com/sitemap.xml`.

Other common paths you might try include:

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
If it's still not found, you can check the `robots.txt` file. This file defines the crawling policy for the website and often specifies the location of the `sitemap.xml` file.

The `robots.txt` file for the author's blog looks like this:

```
User-agent: *
```

The sitemap isn't specified separately, as a sitemap exists in the root, which makes it easily discoverable without separate specification.

What about YouTube's robots.txt file?

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

In this manner, the crawling policy is defined. A list of pages that cannot be crawled is defined using the `Disallow` keyword, and the location of the sitemap is specified using the `Sitemap` keyword.

When you actually visit the sitemap link, it looks like this:
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

Through the `robots.txt` file, crawlers can find the location of the sitemap.

### 3. Otherwise?

Additionally, crawlers can find `<link rel="sitemap" href="sitemap.xml">` meta tags in the HTML source code of web pages to identify the location of the sitemap. However, since this method is not commonly used across all websites, generally, the `robots.txt` file is prioritized.

Also, search engines operate their own search consoles, where webmasters can register their sitemaps for indexing.

- Bing Webmaster Tools: https://www.bing.com/webmasters/
- Google Search Console: https://search.google.com/search-console
- Naver Search Advisor: https://searchadvisor.naver.com/

## Reference
- [Google Search Central - Overview of Google crawlers and fetchers (user agents)](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers)
- [Google Search Central - Sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps)
- [SearchPilot - JSON–LD vs Microdata Revisited](https://www.searchpilot.com/resources/case-studies/json-versus-microdata-in-2024)
- [Medium - How JSON-LD is different than Schema or RDF or Microdata](https://medium.com/@HuntingHate/how-json-ld-is-different-than-schema-or-rdf-or-microdata-b6e3759ccd35)