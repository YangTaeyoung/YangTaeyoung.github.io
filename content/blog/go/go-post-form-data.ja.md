---
title: Golangでフォームデータをボディに含めて送信する方法
type: blog
date: 2025-04-14
comments: true
translated: true
---

作業をしていると、外部APIを使用しなければならなくなった。

一般的なJSONやXMLをやり取りするAPIとは異なり、フォームデータをやり取りする必要があった。著者の場合、JSPで扱ったことがあるが、現場ではほとんど扱ったことがなかったので、フォームデータ自体を使用したのは非常に長い時間前のことだった。また、Goではどのようにするのかわからなかった。

今回はこれらを調べながら整理してみようと思う。

## フォームデータとは？  
フォームデータはHTMLフォームで使用されるデータ形式で、主にWebアプリケーションでクライアントがサーバーにデータを送信する時に使用される。フォームデータはキー・バリューのペアで構成されており、一般的に `application/x-www-form-urlencoded` または `multipart/form-data` 形式でエンコードされる。


### `application/x-www-form-urlencoded`  
`application/x-www-form-urlencoded` は一般的なフォームデータ形式で、すべてのデータがURLエンコードされて送信される。この形式はテキストデータに適している。

一般的に次のような `<form>` タグの中に入れて使用する。

```html
<form action="http://www.example.com" method="post">
  <input type="text" name="name" value="John Doe">
  <input type="text" name="age" value="30">
  <input type="submit" value="Submit">
</form>
```

webhook.siteで実際にデータを確認すると、ボディは次のように表示されるのを見ることができる。

![image](/images/go/go-post-form-data-1744638673842.png)

ボディには特別なものはなく、一般的にクエリパラメータにデータを載せて送信されたことがわかる。

GoではPostFormというメソッドを使用してデータを次のように送信できる。
```go
_, err := http.PostForm("http://www.example.com", url.Values{
	"name": {"John Doe"},
	"age":  {"30"},
})
if err != nil {
	panic(err)
}
```

もしメソッドを `POST` ではなく別のメソッドで送信する必要がある場合、以下のように `url.Values` を使用して直接ボディに含めて送信することもできる。
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
`multipart/form-data` はファイルのアップロードなど大容量データを送信する際に使用される形式である。この形式では各フィールドが別々のパートに分けられて送信され、各パートはヘッダーと本文で構成される。この形式ではテキストデータだけでなくバイナリデータも送信できる。
一般的に次のような `<form>` タグの中に入れて使用する。

```html
<form action="http://www.example.com" method="post" enctype="multipart/form-data">
    <input type="text" name="username" value="JohnDoe">
    <input type="password" name="password" value="123456">
    <input type="submit" value="Submit">
</form>
```

実際にデータを見てみると次のように表示される。
![image](/images/go/go-post-form-data-1744639837601.png)

さて、Goでmultipart/form-dataを送信してみよう。
```go
var buf bytes.Buffer
writer := multipart.NewWriter(&buf)

// フォームフィールドを追加
writer.WriteField("name", "John Doe")
writer.WriteField("age", "30")

// マルチパートメッセージを仕上げるためにライターを閉じる
writer.Close()

req, err := http.NewRequest(http.MethodPost, "http://www.example.com", &buf)
if err != nil {
	panic(err)
}

req.Header.Set("Content-Type", writer.FormDataContentType())
http.DefaultClient.Do(req)
``` 

ここで重要な部分の1つは `Content-Type` であり、単に `multipart/form-data` と記述するのではなく、 `writer.FormDataContentType()` を使用して `Content-Type` を設定する必要がある点である。この関数を詳しく見ると次のようになっている。
```go
// FormDataContentTypeはHTTPのためのContent-Typeを返します
// multipart/form-data この[Writer]のBoundaryを持つ。
func (w *Writer) FormDataContentType() string {
	b := w.boundary
	// Boundaryに特別な文字が含まれている場合、
	// RFC 2045で定義されたtspecials文字を含むか、またはスペースを含む場合は、
	// バウンダリを引用する必要があります。
	if strings.ContainsAny(b, `()<>@,;:"/[]?= `) {
		b = `"` + b + `"`
	}
	return "multipart/form-data; boundary=" + b
}
```

注目すべきは `boundary` である。単に `multipart/form-data` で送信するのではなく、`boundary` が必要であること。

`boundary` とは各パートを区別する文字列であり、各パートの開始と終了を示すのに使用される。

一般的に `multipart/form-data` を送信すると次のような形式でボディデータが送信される。
```
--boundary
Content-Disposition: form-data; name="name"
John Doe
--boundary
Content-Disposition: form-data; name="age"
30
```
この時、各フィールドを分ける `--boundary` が、前述した `boundary` 文字列である。

これを適切に指定しなければ、サーバーはどこからどこまでがフィールドのデータなのかを認識できなくなってしまうため、これを必ず留意しておかなければならない。

実際に [webhook.site](https://webhook.site/) で受け取った文字列も次のようにバウンダリが指定されていることがわかる。  

![image](/images/go/go-post-form-data-1744640885745.png)  
