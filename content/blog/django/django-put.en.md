---
title: Parsing Data Through PUT in Class View
type: blog
date: 2022-04-12
comments: true
translated: true
---

## Request has no Attribute 'data'
I'm going to discuss an issue that arose as we restructured views that were initially designed functionally into class views at my company.

There are some intriguing aspects when using Django, particularly when receiving data through `REST Framework`.

In my case, an error occurred: `AttributeError: request has no attribute 'data'`.

Let's first take a look at the class I implemented.

```python
# urls.py
urlpatterns = [
  path('my_url/', views.MyView.as_view())
]

# views.py 
class MyView(View)
  def put(self, request):
    my_data = request.data
    # my business logic
    
```

Of course, in `JavaScript`, correct data was being sent to `myapp/my_url/`. However, the variable `request.data` didn't seem to exist.

Those who are familiar with `Django Rest Framework` would find this code peculiar.

I know. Generally, it's typical to implement a `Serializer` and parse the `JSON` data through that class, right?

Unfortunately, my situation didn't allow for that.

There wasn't a model for reference, and nearly every function related to the Models was executing queries directly connecting to the database using Raw Query, which made me hesitant to independently configure a `Serializer`.

In a way, the `Serializer` precedes the models in receiving the data, but I thought unraveling and extracting the data every time could introduce new risks when designing a new model later on.

Anyway, back to the code. Ultimately, the above code didn't correctly receive data, and I realized there was an issue, so I debugged it using PyCharm IDE.

In conclusion, there was no `data` member variable inside `request`.

It's strange, right? When I used a `Function View` instead of a `Class View` and structured it like the code below, `request.data` was properly received.

Of course, for data received through `GET` and `POST`, there are internal member variables like `request.POST` and `request.GET` that separately parse and store data, but there's nothing like that for `PUT` and `DELETE`, which I found very peculiar.

```python
# urls.py
urlpatterns = [
  path('my_url/', views.my_view)
]

# views.py 
  def my_view(self, request):
    my_data = request.data
    # my business logic
    
```
I searched Google with the keywords `class view django put` and successfully found the following page.

Let's see what the blog has to say.

The content of the post on [this blog](https://thihara.github.io/Django-Req-Parsing/) served as a reference.

## `request.POST` is Different from REST's POST

When you explore the blog post, you'll find [this conversation](https://groups.google.com/g/django-developers/c/dxI4qVzrBY4/m/m_9IiNk_p7UJ) among developers in a Google group.

From the conversation, it is evident that `Django`'s `request.POST` isn't designed for `REST` but rather for receiving data submitted from an `HTML` `form` with `method="post"` set.

In most forms submitted as POST, the `Content Type` is set to `multipart/form-data`, which indicates that its encoding is different from `JSON`.

The premise in `Django` is that `request.POST` parses this type of data, and it warns that unexpected errors can occur frequently.

Even when data is sent in `JSON` format through `REST framework`, it gets properly entered into `request.POST`, although it advises that this is always data encoded through `form` and should be ignored.

Ultimately, there isn't anything like `request.PUT` or `request.DELETE` inside `request`.

## Then What Should You Do?

In the web that we use, there is no `Serializer` being implemented through an appropriate model, and since our goal is currently a class view, receiving data in a format like `request.PUT` the way you receive `request.POST` or `request.GET` would be quite convenient.

To achieve this, we'll allow the `request` to be intercepted proactively in middleware while being passed as a function, then proceed by adding a variable `PUT` under the attributes of `request`.

We shall create a `JSON` attribute to accommodate cases where `content-type` of POST or PUT is given as `application/json`!

## Solution

If you have a common module folder, create it there. If not, make a new folder and name it `parsing_middleware.py` (the name doesn't matter, so you may name it however you wish). Then input the following code:

I created a common module folder named `COMMON`, and for module distinction, inserted a folder named `middleware` inside and created a `parsing_middleware.py` file.

```python
# COMMON/middleware/parsing_middleware.py

import json

from django.http import HttpResponseBadRequest
from django.utils.deprecation import MiddlewareMixin


class PutParsingMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.method == "PUT" and request.content_type != "application/json":
            if hasattr(request, '_post'):
                del request._post
                del request._files
            try:
                request.method = "POST"
                request._load_post_and_files()
                request.method = "PUT"
            except AttributeError as e:
                request.META['REQUEST_METHOD'] = 'POST'
                request._load_post_and_files()
                request.META['REQUEST_METHOD'] = 'PUT'

            request.PUT = request.POST


class JSONParsingMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if (request.method == "PUT" or request.method == "POST") and request.content_type == "application/json":
            try:
                request.JSON = json.loads(request.body)
            except ValueError as ve:
                return HttpResponseBadRequest("unable to parse JSON data. Error : {0}".format(ve))
```

Then, configure your `settings.py` to utilize these middleware.

```python
# my_project_name/settings.py
MIDDLEWARE = [
...
  # Add middleware for PUT and JSON parsing
  'COMMON.middleware.parsing_middleware.PutParsingMiddleware',
  'COMMON.middleware.parsing_middleware.JSONParsingMiddleware',
...
]
```

## Future Concerns

I intend to post later on improvements born while transitioning Raw Query to Django Model-based structures, but it seems the problem lies with Django's project structure.

I've consulted various references, but even the Django Document endorses a structure where `views.py` and `models.py` inevitably become bloated.

_▼ An exemplary case proposed by Django_

![image](https://user-images.githubusercontent.com/59782504/163424387-9d327726-249a-4212-9089-053b6ef04825.png)

I'm not sure if this is optimal or ideal structuring in `python`, but apparent problems arise immediately.

In `Django's` independent app, `views.py` houses business logic and controllers, models include DB-related models, and `template` contains `HTML` pages, `CSS`, and `JS`. The more features added to the app, the higher the dependency each file will carry.

However, if one divides `views.py` recklessly, issues like circular references and heightened dependency would arise, and problems would entail sequentially.

Modules should be designed independently following an object-oriented model but, unlike `Spring` which boasts the `IOC` container feature that manages dependency, `Django` lacks such utility.

Pondering over how to design modules independently and create good services will be a later assignment.

Document automation for transfer of responsibility is also an important task.

I’ll be posting about my concerns and how I solve these issues in the future!

## In Conclusion

- Today, we discussed how I resolved errors encountered while converting a function-based view into a class-based view. Although not everyone might face the same scenario, I hope referring to this post aids you in resolving your issues.
- I always welcome constructive criticism or comments.
- Thank you!