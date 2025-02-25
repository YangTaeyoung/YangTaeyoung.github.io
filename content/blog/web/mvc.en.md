---
title: Let's Learn About MVC
type: blog
date: 2022-02-22
comments: true
translated: true
---
`MVC` stands for `Model`, `View`, `Controller`. It is one of the methodologies for constructing web applications, known as a representative pattern that divides components into three categories. It is famous for its use in the well-known web framework, `Spring Framework`. Although there are minor differences, various web frameworks follow a similar pattern.

## What about other frameworks?
- A similar pattern is the `MVT` pattern, used by the Python-based framework `Django`. MVT stands for `Model`, `View`, and `Template`. Each role is almost identical to the `MVC` pattern, but the matching criteria differ.

## Differences between MVC and MVT
  ![image](https://user-images.githubusercontent.com/59782504/155057532-25c9325c-3009-4ee7-8cee-7946530643ec.png)

- As seen in the above image, we can understand how the relationships between `MVC` and `MVT` differ.
- In `Django`, a `View` corresponds to a `Controller` in `Spring`!
- Additionally, a `View` in `Spring` corresponds to a `Template` in `Django`.

**Now that we've had some fun understanding the differences, shall we dive into what `MVC` is?**

## Model, View, Controller, and User

![image](https://user-images.githubusercontent.com/59782504/155059391-11d1e224-cbc0-4eac-bdcc-31e7f255d2e1.png)

While the relationship among Model, View, and Controller is broadly represented as in the above image, in reality, the arrows can travel in many more directions.

The key here is not the direction of the arrows but observing the **flow**.

### Model
Let's start with the Model. The Model refers to the objects that contain data or entities, which are classes that comprise the actual data to be stored in databases.

Simply put, it can be seen as a **friend that communicates with the database.** <br><br>It should contain information for all objects on which CRUD operations occur and should not reference the **View** or **Controller**.

### View
This object contains the UI shown to users. With the rise of RestFul APIs, it's becoming less common for Spring to directly handle HTML. Instead, frontend frameworks like Vue.js and React are taking on the role of Spring MVC's View!

The View first receives input from the user and passes it to the Controller.

It handles tasks such as user input tags like `input`, `checkbox`, and `submit` buttons in HTML, and displaying data fetched from the database to the user.

### Controller
The Controller takes users' requests, processes the data properly (Model), and either calls the View or, in the case of asynchronous communication, responds in an appropriate format (JSON/XML...etc).

## In Conclusion
- Today, we briefly explored the MVC pattern.
- Writing the first technical blog post, I realized how much effort goes into creating a single post.
- For the next topic, I'll dive a little deeper into the Spring MVC pattern.