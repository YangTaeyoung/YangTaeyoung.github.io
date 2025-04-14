---
title: How to Send Form Data in the Body in Golang
type: blog
date: 2025-04-14
comments: true
translated: true
---

While working, I encountered a situation where I needed to use an external API.

Unlike the usual APIs that handle JSON or XML, I had to send and receive form data. Since I had only dealt with it during my time with JSP and had not used it much in my current industry, it had been a long time since I had used form data, and I was not well-versed in how to do it in Go.

This time, I am going to sort out what I've researched.

## What is Form Data?
Form data is a data format used in HTML forms, mainly used when a client sends data to a server in web applications. Form data consists of key-value pairs and is typically encoded in either `application/x-www-form-urlencoded` or `multipart/form-data` format.

### `application/x-www-form-urlencoded`
`application/x-www-form-urlencoded` is the standard form data format where all data is transmitted URL encoded. This format is suitable for text data.

It is typically used within a `<form>` tag as follows:

```html
<form action="http://www.example.com" method="post">
  <input type="text" name="name" value="John Doe">
  <input type="text" name="age" value="30">
  <input type="submit" value="Submit">
</form>
```

If you check the actual data on webhook.site, you'll see that the Body looks like this:

![image](/images/go/go-post-form-data-1744638673842.png)

The Body is nothing special, and you can see that the data is sent similarly to how query parameters carry data.

In Go, you can use the PostForm method to send data as follows:
```go
_, err := http.PostForm("http://www.example.com", url.Values{
    "name": {"John Doe"},
    "age":  {"30"},
})
if err != nil {
    panic(err)
}
```

If you need to send it using a method other than `POST`, you can also use `url.Values` to pack it directly into the Body as shown below:
```go
formData := url.Values{
    "name": {"John Doe"},
    "age":  {"30"},
}

req, err := http.NewRequest(http.MethodPut, "https://webhook.site/f5fcf7e6-2233-4374-8c73-32195b38e7fb", strings.NewReader(formData.Encode()))
if err != nil {
    panic(err)
}

req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
http.DefaultClient.Do(req)
```

### `multipart/form-data`
`multipart/form-data` is a format used for transmitting larger amounts of data, such as file uploads. In this format, each field is separated into different parts, each consisting of headers and a body. This format can handle not only text data but also binary data.
It is generally used within a `<form>` tag, like this:

```html
<form action="http://www.example.com" method="post" enctype="multipart/form-data">
    <input type="text" name="username" value="JohnDoe">
    <input type="password" name="password" value="123456">
    <input type="submit" value="Submit">
</form>
```

When you check the actual data, it would appear like this:
![image](/images/go/go-post-form-data-1744639837601.png)

Now let's send multipart/form-data using Go.
```go
var buf bytes.Buffer
writer := multipart.NewWriter(&buf)

// Add form fields
writer.WriteField("name", "John Doe")
wwriter.WriteField("age", "30")

// Close the writer to finalize the multipart message
writer.Close()

req, err := http.NewRequest(http.MethodPost, "http://www.example.com", &buf)
if err != nil {
    panic(err)
}

req.Header.Set("Content-Type", writer.FormDataContentType())
http.DefaultClient.Do(req)
```

An important aspect here is `Content-Type`. You should not just set it as `multipart/form-data`, but use `writer.FormDataContentType()` to set the `Content-Type`. If you take a look at this function, it looks like this:
```go
// FormDataContentType returns the Content-Type for an HTTP
// multipart/form-data with this [Writer]'s Boundary.
func (w *Writer) FormDataContentType() string {
    b := w.boundary
    // We must quote the boundary if it contains any of the
    // tspecials characters defined by RFC 2045, or space.
    if strings.ContainsAny(b, `()<>@,;:\"/[]?= `) {
        b = `"` + b + `"`
    }
    return "multipart/form-data; boundary=" + b
}
```

The key point is the `boundary`. It’s not just sending `multipart/form-data`, but it requires a `boundary` to distinguish each part.

The `boundary` is a string used to separate each part, indicating the start and end of each part.

When `multipart/form-data` is sent, the Body data typically looks like this:
```
--boundary
Content-Disposition: form-data; name="name"
John Doe
--boundary
Content-Disposition: form-data; name="age"
30
```
At this time, the `--boundary` that separates each field is the `boundary` string we discussed earlier.

If you do not set this correctly, the server will be unable to determine where the field data starts and ends, so it is crucial to understand this.

In fact, the strings received from [webhook.site](https://webhook.site/) also show that the boundary is specified like this:

![image](/images/go/go-post-form-data-1744640885745.png)