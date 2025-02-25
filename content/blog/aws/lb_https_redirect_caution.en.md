---
title: When You Keep Getting a 405 (Method Not Allowed) Error with AWS Load Balancer
type: blog
date: 2023-11-23
comments: true
translated: true
---

At our company, there was a task to create an API for webhooks on the API server, resulting in the creation of a webhook endpoint that receives POST requests.

However, although the server sending the request was indeed sending POST requests correctly, the receiving server's logs showed a 405 (Method Not Allowed) error.

![image](/images/aws/lb_https_redirect_caution-1700742951722.png)

## Cause

When using an AWS Load Balancer, there is a feature for redirecting HTTP requests to HTTPS.

![image](/images/aws/lb_https_redirect_caution-1700743047350.png)

Typically, this is configured as shown above. In this scenario, since it's a 301 (Moved Permanently) redirect, sending a POST request over HTTP results in it being changed to a GET request when redirected to HTTPS.

The server, being located behind the Load Balancer, does not have an endpoint to receive GET requests, which leads to the 405 (Method Not Allowed) error.

This can be illustrated in the following diagram.

![image](/images/aws/lb_https_redirect_caution-1700744557719.png)


### Redirection Principle
In general, when redirection occurs, the client (such as a web browser) receives a redirection response like 301 (Moved Permanently) from the server, and the client makes another request to the address included in the Location header of the redirection response.

In cases like redirection, since it generally does not retain previously sent information such as Request or HTTP Method, the client sends another request as a GET request without the previously sent Body.

## Solution
The solution is very simple. Just send the request in HTTPS from the start to avoid redirection.

In scenarios like a Load Balancer providing this feature, it is typically used to redirect static pages (e.g., requests with a `text/html` content-type) to be received over the HTTPS protocol. For REST API servers, ensure that the URL is specified as `https` instead of `http` when sending requests.

### Reference
- [https://webstone.tistory.com/65](https://webstone.tistory.com/65)