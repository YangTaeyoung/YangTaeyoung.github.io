---
title: Golang에서 form data를 Body에 담아 보내는 방법
type: blog
date: 2025-04-14
comments: true
---

일을 하고 있는데, 외부 API를 사용해야 할 일이 생겼다.

일반적인 JSON이나, XML을 주고 받는 API와는 다르게 form data를 주고 받아야 했는데, 필자의 경우 JSP때 다루어보고 현업에선 거의 다루지 않았던 지라, form data 자체가 사용한지 굉장히 오랜 시간이 지났다보니 Go에선 어떻게 하는지 잘 몰랐다.

이번에 이것저것 찾아보면서 정리해보려고 한다.

## form data란? 
form data는 HTML form에서 사용되는 데이터 형식으로, 주로 웹 애플리케이션에서 클라이언트가 서버로 데이터를 전송할 때 사용된다. form data는 key-value 쌍으로 구성되어 있으며, 일반적으로 `application/x-www-form-urlencoded` 또는 `multipart/form-data` 형식으로 인코딩된다.


### `application/x-www-form-urlencoded`
`application/x-www-form-urlencoded`는 일반적인 form data 형식으로, 모든 데이터가 URL 인코딩되어 전송된다. 이 형식은 텍스트 데이터에 적합하다.

일반적으로 다음과 같은 `<form>` 태그 안에 넣어서 사용한다.

```html
<form action="http://www.example.com" method="post">
  <input type="text" name="name" value="John Doe">
  <input type="text" name="age" value="30">
  <input type="submit" value="Submit">
</form>
```

webhook.site에서 실제로 데이터를 확인해보면 Body는 다음과 같이 찍히는 것을 볼 수 있다.

![image](/images/go/go-post-form-data-1744638673842.png)

Body는 특별한 것은 없고, 일반적으로 쿼리 파라미터에 데이터를 실어 보내듯 데이터가 전송된 것을 알 수 있다.

Go로는 PostForm이라는 메서드를 사용하여 데이터를 다음과 같이 전송할 수 있고,
```go
	_, err := http.PostForm("http://www.example.com", url.Values{
		"name": {"John Doe"},
		"age":  {"30"},
	})
	if err != nil {
		panic(err)
	}
```

만약 메서드를 `POST`가 아닌 다른 메서드로 보내야 한다면 아래와 같이 `url.Values`를 사용하여 직접 Body에 담아 보내도 된다.
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
`multipart/form-data`는 파일 업로드와 같은 대용량 데이터를 전송할 때 사용되는 형식이다. 이 형식은 각 필드가 별도의 파트로 나누어져 전송되며, 각 파트는 헤더와 본문으로 구성된다. 이 형식은 텍스트 데이터뿐만 아니라 바이너리 데이터도 전송할 수 있다.
일반적으로 다음과 같은 `<form>` 태그 안에 넣어서 사용한다.

```html
<form action="http://www.example.com" method="post" enctype="multipart/form-data">
    <input type="text" name="username" value="JohnDoe">
    <input type="password" name="password" value="123456">
    <input type="submit" value="Submit">
</form>
```

실제로 데이터를 보면 다음과 같이 찍힌다.
![image](/images/go/go-post-form-data-1744639837601.png)

이제 Go로 multipart/form-data를 보내보자.
```go
    var buf bytes.Buffer
    writer := multipart.NewWriter(&buf)

    // Add form fields
    writer.WriteField("name", "John Doe")
    writer.WriteField("age", "30")

    // Close the writer to finalize the multipart message
    writer.Close()

    req, err := http.NewRequest(http.MethodPost, "http://www.example.com", &buf)
    if err != nil {
        panic(err)
    }

    req.Header.Set("Content-Type", writer.FormDataContentType())
    http.DefaultClient.Do(req)
``` 

여기서 중요한 부분 중 하나는 `Content-Type`인데, 단순히 `multipart/form-data`를 적는 것이 아닌, `writer.FormDataContentType()`를 사용하여 `Content-Type`을 설정해야 한다는 점이다. 이 함수를 들어가서 살펴보면 다음과 같은 모습을 하고 있는데
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

주목할 점은 `boundary`이다. 단순히 `multipart/form-data`로 보내는 것이 아니라, `boundary`가 있어야 한다

`boundary`는 각 파트를 구분하는 문자열로, 각 파트의 시작과 끝을 나타내는 데 사용된다.

일반적으로 `multipart/form-data`를 전송하면 다음과 같은 형식으로 Body 데이터가 날아가는데
```
--boundary
Content-Disposition: form-data; name="name"
John Doe
--boundary
Content-Disposition: form-data; name="age"
30
```
이때 각 필드를 나누는 `--boundary`가 바로 앞서 살펴보았던 `boundary` 문자열이다.

이걸 제대로 지정해주지 않는다면 서버는 어디서부터 어디까지가 필드의 데이터인지 알 수 없게 되기 때문에, 이를 꼭 숙지하고 있어야 한다.

실제로 [webhook.site](https://webhook.site/)에서 받은 문자열도 다음과 같이 boundary가 지정되어 있는 것을 알 수 있다.

![image](/images/go/go-post-form-data-1744640885745.png)
