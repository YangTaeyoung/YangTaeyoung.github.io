---
title: AWS Load Balancerを使用する際、常に405（Method Not Allowed）が出る場合
type: blog
date: 2023-11-23
comments: true
translated: true
---

会社のAPIサーバでウェブフック関連のAPIを作成することになり、POSTリクエストを受け取るウェブフックエンドポイントを生成しました。

しかし、確かにリクエストを送信するサーバでは正常にPOSTでリクエストを送っているのに、受信するサーバのログでは405（Method Not Allowed）が表示されました。

![image](/images/aws/lb_https_redirect_caution-1700742951722.png)

## 原因

AWS Load Balancerを使用する際、HTTPリクエストをHTTPSにリダイレクトする機能があります。

![image](/images/aws/lb_https_redirect_caution-1700743047350.png)

一般的には上記のように設定されますが、この場合301（Moved Permanently）でリダイレクトを行うため、HTTPでPOSTリクエストを送るとHTTPSにリダイレクトされる際にGETリクエストに変わります。

サーバはLoad Balancerの背後にあるため、GETリクエストを受け取るエンドポイントがないので405（Method Not Allowed）が表示されました。

これを図で示すと以下のようになります。

![image](/images/aws/lb_https_redirect_caution-1700744557719.png)


### リダイレクトの原理
通常のリダイレクトは、クライアント（ウェブブラウザなど）がサーバから301（Moved Permanently）のようなリダイレクト応答を受け取ると、クライアントはリダイレクト応答に含まれるLocationヘッダのアドレスに再リクエストを行います。

リダイレクトの場合、以前送信したRequest、HTTP Methodなどの情報を通常保持していないため、GETリクエストおよび以前送信したBodyを失った状態で再リクエストを行います。

## 解決方法
解決方法は非常に簡単です。リダイレクトされないように最初からHTTPSでリクエストを送れば良いのです。

Load Balancerが提供するこの機能は、staticなページを受け渡す際（例：`text/html`のようなcontent-typeを持つリクエスト）にHTTPSプロトコルを通じて受信するようリダイレクトするために使用するものであり、REST APIサーバのような場合は、URLに`http`ではなく`https`を明記してリクエストを送るようにすればよいです。

### 参考文献
- [https://webstone.tistory.com/65](https://webstone.tistory.com/65)