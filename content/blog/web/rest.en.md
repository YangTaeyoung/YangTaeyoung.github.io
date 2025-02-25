---
title: What is REST?, RESTful?, REST API?
type: blog
date: 2022-02-28
comments: true
translated: true
---

Hello! In this post, we're going to learn about REST, which is widely used on the web. `REST` was introduced by Roy Fielding in his doctoral dissertation in 2000.

`REST` stands for Representation State Transfer and is a type of software architecture for `hypermedia` systems.

# What is Hyper Media?

You've encountered an unfamiliar term, right? What is `hyper media`?  
<br>
Hyper media refers to a **network web structure that organically connects multiple pieces of information such as text, shapes, animations, and video images with nodes and links**.  
<br><br>
The characteristic is that **you can interactively extract related information by organically connecting information through links and sequentially extracting them**! The key is that **information is connected through links**!

# So, what is REST?

`REST` refers to everything that involves distinguishing resources (`Resource`) by the name of the resource (the representation of the resource: `Representation`) and exchanging the state (`State`) of the resource. 

That sounds quite complex, right? I'll try to express it a little more simply.

![image](https://user-images.githubusercontent.com/59782504/155932531-4587a4ea-b9de-4625-a9ad-90adb1bd9e69.png)

Resources are what we commonly see when surfing the internet. **Text, videos, images, and everything the service provides can be expressed as resources**.

What is **resource representation**? You can view it as **naming the resource**. 

You need to give it a name to view materials on the internet. 

Think about when you want to express the following information.

![image](https://user-images.githubusercontent.com/59782504/155925520-e33b36c9-8d2b-49a2-b0bc-5346d0ab6db6.png)

- It's an image of a lion. But how can the network display the lion image stored in the DB?

<img width="541" alt="image" src="https://user-images.githubusercontent.com/59782504/155926067-7a1994ac-ad25-420e-91a4-7ff537605da1.png">

- As seen in the next image, the internet browser calls the lion image through the name of the resource. 
- Specifically, the request for the resource is made through the link that contains the resource, as shown in the photo.

`This is called specifying the name of a resource` and `exchanging resources through this name` is called `resource representation` :)

However, there isn't only the task of obtaining (`GET`) a lion image when dealing with the internet, right?

# REST Method

REST provides four major `Methods` to handle various requests through the HTTP protocol.

1. `GET`: A protocol focusing on **retrieving information**. When you log in to Naver, your profile information appears, right? In the process of logging in and loading the main page, Naver requests (Requests) your profile information, and the service returns the requested information.  
2. `POST`: A protocol focusing on **creating information**. When you sign up, your information recorded in the web browser is delivered to the service via the POST Method to be reflected in the DB.  
3. `PUT`: A protocol focusing on **modifying information**. If you edit your profile on Naver, the modified information is delivered to the service through this protocol.  
4. `DELETE`: A protocol focusing on **deleting information**. It is used when requesting the service to delete records in the DB, such as withdrawing membership or deleting a post.  

# How is actual data exchanged? (Resource state: State)

The core of the `REST` concept lies in the way of exchanging resources.

Actual data is exchanged through formats like `XML` or `JSON`. For example, the lion photo mentioned earlier can be represented in `JSON` like this:

```json
{
  "pic_name": "lion",
  "link": "https://cdn.example.com/img/lion.png"
}
```
_▲ Example JSON_

```xml
<?xml version="1.0"?>
<pic>
    <pic_name>lion</pic_name>
    <link>"https://cdn.example.com/img/lion.png"</link>
</pic>
```
_▲ Example XML_

In this way, the value containing the state of the resource is returned to the user, and the client assigns the lion image link within an appropriate tag (e.g., `img` tag) and finally displays the lion information to the user.

# 6 Constraints of REST
Developers can implement `REST` protocols by complying with the following conditions:

1. **Uniform Interface**: A principle that **interfaces must be consistently separated**. 
   - It should not be dependent on specific frameworks or programs. Services implemented following `REST` should exchange resources through the `HTTP` protocol.
2. **Stateless**: A principle that **client context should not be stored on the server** across requests.
   - It means previous requests should never affect the current request.
     - For example, consider the login example.
     - Before REST and even now in many services, user authentication information is stored and managed on the server in forms like sessions.
     - However, if implemented perfectly with REST, the client (user) should directly manage authentication information.
     - Typically, login information is stored in an encrypted form like `JWT Token` in the header, and login is implemented by sending authentication information in the header for requests requiring authentication.
3. **Cacheable**: A major advantage is that **REST uses the web standard `HTTP` protocol as it is**.
   - Thus, you can use the `caching` feature of `HTTP`. `Caching` refers to a **technology that stores and provides copies of given resources**.
   - If every resource is requested from the server, it would put a huge burden on it.
   - Therefore, for resources that have already been received or requested, the `HTTP` protocol **stores them as cache files, and for requests of existing resources, it does not request the server separately and returns the resource**.
4. **Layered System**: The client does not directly request the service. The service should prepare an API server for users, and the client requests (`Request`) and receives (Response) resources through the `API` server.
   - Commonly, in `Spring`, the `Controller`, and in `Django`, `View` is the part that communicates with the client.
   - + Additionally, the `API Server` performs only business logic, while you can implement additional features like authentication or load balancing at the front end.
5. **Code On Demand**: Clients should be able to execute scripts received from the server. However, this is not a mandatory constraint.
6. **Client-Server Structure**: The side that holds resources is the `Server`, while the requesting side is the `Client`.
   - `Server`: In charge of providing `API`, processing business logic, and storage.
   - `Client`: Requests necessary resources from the server and is responsible for managing and handling additional user authentication or sessions.

# REST API

REST API refers to an interface implemented to allow clients to send requests and utilize them based on the `REST` architecture mentioned above.

Let me show you an example of the `API` I implemented during my project!

<img width="250" alt="image" src="https://user-images.githubusercontent.com/59782504/155930373-280d5db5-6273-4384-a533-5cedbed5ea26.png">

As seen above, an `API` should specify the request URI, the state of the resource that can be received through the URI (`JSON`), the `request Method`, etc. The client developer refers to this `API` to configure the client so that data within `JSON` or `XML` can be appropriately displayed to users.

# RESTful

`RESTful` is a term used to describe web services that have implemented the `REST` architecture. If a particular web service has implemented `REST API`, it can be considered `RESTful`.

## Purpose

The goal is to create an API that is intuitive, understandable, and easy to use for anyone.

# Conclusion
- This time, we learned about `REST`, an architecture widely used on the web, as well as `REST API` and `RESTful`.
- If there are any insufficient or incorrect explanations, please feel free to let me know. I will promptly reflect on them!

## Reference
* [https://gmlwjd9405.github.io/2018/09/21/rest-and-restful.html](https://gmlwjd9405.github.io/2018/09/21/rest-and-restful.html)
* [https://developer.mozilla.org/ko/docs/Web/HTTP/Caching](https://developer.mozilla.org/ko/docs/Web/HTTP/Caching)
* [https://ko.wikipedia.org/wiki/REST](https://ko.wikipedia.org/wiki/REST)
* [https://blog.daum.net/hsyang112/7](https://blog.daum.net/hsyang112/7)