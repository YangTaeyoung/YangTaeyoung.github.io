---
title: "Comment un crawler web juge-t-il la fraîcheur ?"
date: 2025-08-03T15:27:00+09:00
type: blog
translated: true
---

![image](/images/web/web-page-recency.fr-1754211369467.png)

Autrefois, nous réalisions diverses tâches pour améliorer le SEO. Récemment, ces tâches sont devenues plus importantes que prévu, car le nombre de crawlers dédiés non seulement aux moteurs de recherche mais aussi à la génération de réponses par l'IA a considérablement augmenté.

Cette optimisation est assez essentielle, car le trafic traditionnel provenant des moteurs de recherche se transforme en trafic vers l'IA, rendant crucial le fait d'apparaître clairement aux yeux de l'IA. Ce concept est désigné par des termes tels que AEO (Answer Engine Optimization) et GEO (Generative Engine Optimization).

Pour certains sites web, il a été observé que 24,6 % de leur trafic provient de crawlers dédiés à la génération de réponses IA, ce qui souligne l'importance de cette optimisation. ( [source](https://pod.geraspora.de/posts/17342163) )

## Importance de la fraîcheur
Traditionnellement, l'une des choses qui accorde un score élevé au **SEO** est la **fraîcheur**.

La fraîcheur désigne à quelle fréquence et récemment le contenu d'une page web a été mis à jour, et c'est un facteur clé que les moteurs de recherche prennent en compte pour juger de la fiabilité et de la pertinence d'une page.

Les pages avec une fraîcheur élevée ont plus de chances de fournir des informations utiles aux utilisateurs, c'est pourquoi les moteurs de recherche tendent à prioriser l'affichage de ces pages.

## Critères de jugement de la fraîcheur
Alors, comment un crawler web juge-t-il la fraîcheur ?

### 1. Sitemap
Lorsqu'un site web est indexé, le crawler demande d'abord le fichier `sitemap.xml` pour comprendre quelles pages existent sur le site. Ce fichier contient la structure du site ainsi que les URL de chaque page, et la dernière date de modification.

Le fichier sitemap se compose généralement du format suivant. (Ci-dessous est un exemple de la carte du site du blog de l'auteur.)

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
<!-- ... omitted ... -->
></urlset>
```

Vous pouvez voir qu'il y a une balise `<lastmod>` en haut. Cette balise indique la date et l'heure de la dernière modification de cette page. Le crawler utilise cette information pour juger de la fraîcheur d'une page spécifique.

Si cette valeur provient d'une page qui s'upload régulièrement, le crawler va évaluer la fraîcheur du site comme élevée.

### 2. Marquage Schema.org
L'ajout de marquages Schema.org à une page web aide le crawler à mieux comprendre le contenu de la page. Ce marquage fournit des données structurées sur la page, permettant aux moteurs de recherche d'interpréter le contenu d'une page avec plus de précision et de juger de sa fraîcheur.

Par exemple, en utilisant le marquage suivant, le crawler peut déterminer la date d'écriture de manière plus précise.

```html
<head>
    <title>Comment un crawler web juge-t-il la fraîcheur ?</title>
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "Comment un crawler web juge-t-il la fraîcheur ?",
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

Dans ce marquage, les champs `datePublished` et `dateModified` permettent de spécifier la date de création et de modification de la page. Cela permet au crawler de déterminer la fraîcheur de la page plus clairement.

### 2.1 ~~Microdata~~ (Déprécié)
On peut également fournir des données structurées pour une page avec Microdata comme ci-dessous. Cependant, aujourd'hui, la méthode JSON-LD est plus appréciée, et l'utilisation de Microdata est en déclin.

```html
<div itemscope itemtype="https://schema.org/BlogPosting">
    <h1 itemprop="headline">Comment un crawler web juge-t-il la fraîcheur ?</h1>
    <p itemprop="datePublished" content="2025-08-03T15:27:00+09:00">Date de publication : 3 août 2025</p>
    <p itemprop="dateModified" content="2025-08-03T15:27:00+09:00">Date de modification : 3 août 2025</p>
    <p itemprop="author" itemscope itemtype="https://schema.org/Person">
        Auteur : <span itemprop="name">Code Kirin</span>
    </p>
</div>
```

### 3. En-tête HTTP
La documentation officielle de Google indique que lorsque les balises `ETag` et `Last-Modified` sont toutes deux présentes, la première doit être priorisée.

#### `ETag` ?
`ETag` est un en-tête HTTP utilisé par le serveur web pour identifier la version d'une ressource. Cette valeur est mise à jour chaque fois que le contenu de la ressource change. Le crawler utilise la valeur ETag pour évaluer la fraîcheur de la ressource.

```http
ETag: "abc123"
```

#### `Last-Modified`
`Last-Modified` est un en-tête HTTP qui indique la date et l'heure de la dernière modification de la ressource. Cette valeur est mise à jour chaque fois que la ressource change. Le crawler utilise cette valeur pour juger de la fraîcheur de la ressource.

```http
Last-Modified: Mon, 03 Aug 2025 15:27:00 GMT
```

## Comment trouver `sitemap.xml` ?
Le critère de jugement de la fraîcheur le plus fort est le fichier `sitemap.xml`. Avec un seul fichier, il est possible de comprendre la structure des pages d'un site, leurs URL respectives et la dernière date de modification.

Alors, comment le crawler trouve-t-il le fichier `sitemap.xml` ? La route de `sitemap.xml` n'est pas fixe.

## 1. Chemin connu
En général, le fichier sitemap.xml se trouve dans le répertoire racine du site web. Par exemple, il peut être trouvé à un chemin comme `https://example.com/sitemap.xml`.

D'autres chemins communs que l'on pourrait essayer incluent :  
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
S'il n'y a toujours pas de fichier, on peut vérifier dans `robots.txt`. Ce fichier définit les politiques de crawling du site web et indique souvent la localisation du fichier `sitemap.xml`.

Le fichier `robots.txt` de mon blog est le suivant :  
```
User-agent: *
```

Le sitemap n'est pas spécifié séparément, car il existe un sitemap à la racine qui peut être trouvé sans besoin d'indication séparée.

Que se passe-t-il alors avec le fichier robots.txt de YouTube ?  
```
# Fichier robots.txt pour YouTube  
# Créé dans le futur lointain (l'année 2000) après  
# le soulèvement robotique du milieu des années 90 qui a anéanti tous les humains.

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

De cette manière, les politiques de crawling sont définies. Les pages qui ne sont pas autorisées à être crawlées sont listées avec le mot clé `Disallow`, et l'emplacement du sitemap est indiqué par le mot clé `Sitemap`.

En regardant ce qu’il y a sur le chemin indiqué par le sitemap, nous voyons :  
```xml
Ce fichier XML ne semble pas avoir de style associé. L'arbre du document est montré ci-dessous.
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

Ainsi, à travers le fichier `robots.txt`, le crawler peut identifier l'emplacement du sitemap.

### 3. Autres méthodes ?
En plus de cela, le crawler peut également trouver des balises méta telles que `<link rel="sitemap" href="sitemap.xml">` dans le code HTML de la page pour déterminer l'emplacement du sitemap. Cependant, cette méthode n'est pas utilisée sur tous les sites, c'est pourquoi on favorise généralement la consultation du fichier `robots.txt` en premier.

Les moteurs de recherche disposent également de consoles de recherche distinctes, où la soumission de sitemaps pour l'indexation est également possible.

- Bing Webmaster Tools: https://www.bing.com/webmasters/
- Google Search Console: https://search.google.com/search-console
- Naver Search Advisor: https://searchadvisor.naver.com/

## Références
- [Google Search Central - Vue d'ensemble des crawlers et fetchers Google (agents utilisateurs)](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers)
- [Google Search Central - Sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps)
- [SearchPilot - JSON–LD vs Microdata Revisited](https://www.searchpilot.com/resources/case-studies/json-versus-microdata-in-2024)
- [Medium - Comment JSON-LD est différent de Schema ou RDF ou Microdata](https://medium.com/@HuntingHate/comment-json-ld-est-différent-de-schema-ou-rdf-ou-microdata-b6e3759ccd35)  
