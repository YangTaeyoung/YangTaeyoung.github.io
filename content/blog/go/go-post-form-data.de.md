---
title: Wie man Formulardaten im Body von Golang sendet
type: blog
date: 2025-04-14
comments: true
translated: true
---

Ich arbeite gerade an einem Projekt, in dem ich externe APIs verwenden muss.

Im Gegensatz zu herkömmlichen APIs, die JSON oder XML austauschen, musste ich Formulardaten senden und empfangen. Der Autor hat dies zwar schon in JSP behandelt, aber in meiner aktuellen Berufserfahrung hatte ich damit kaum Kontakt, sodass es schon eine lange Zeit her ist, seit ich Formulardaten verwendet habe. Daher wusste ich nicht genau, wie das in Go funktioniert.

Ich möchte das Thema jetzt aufarbeiten und auf verschiedene Dinge eingehen.

## Was sind Formulardaten?  
Formulardaten sind ein Datenformat, das in HTML-Formularen verwendet wird und hauptsächlich in Webanwendungen verwendet wird, wenn ein Client Daten an einen Server sendet. Formulardaten bestehen aus Schlüssel-Wert-Paaren und werden normalerweise im Format `application/x-www-form-urlencoded` oder `multipart/form-data` kodiert.


### `application/x-www-form-urlencoded`  
`application/x-www-form-urlencoded` ist das gängigste Format für Formulardaten, bei dem alle Daten URL-kodiert gesendet werden. Dieses Format eignet sich gut für Textdaten.

Normalerweise wird es innerhalb eines `<form>`-Tags verwendet.

```html
<form action="http://www.example.com" method="post">
  <input type="text" name="name" value="John Doe">
  <input type="text" name="age" value="30">
  <input type="submit" value="Absenden">
</form>
```

Wenn man die Daten auf webhook.site beobachtet, sieht man, dass der Body wie folgt aussieht:

![image](/images/go/go-post-form-data-1744638673842.png)

Der Body enthält nichts Besonderes und man kann erkennen, dass die Daten allgemein so gesendet wurden, wie es bei den Abfrageparametern der Fall ist.

In Go kann man die Methode `PostForm` verwenden, um die Daten wie folgt zu senden:
```go
_, err := http.PostForm("http://www.example.com", url.Values{
	"name": {"John Doe"},
	"age":  {"30"},
})
if err != nil {
	panic(err)
}
```

Falls es erforderlich ist, die Daten mit einer anderen Methode als `POST` zu senden, kann man `url.Values` verwenden, um die Daten direkt im Body zu verpacken und zu senden:
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
`multipart/form-data` wird verwendet, um größere Datenmengen, wie z. B. beim Datei-Upload, zu übertragen. Diese Formatierung sendet jedes Feld als separate Teile, wobei jedes Teil aus Headern und dem Inhalt besteht. Dieses Format kann sowohl Text- als auch Binärdaten übertragen.
Normalerweise wird es in einem `<form>`-Tag verwendet.

```html
<form action="http://www.example.com" method="post" enctype="multipart/form-data">
    <input type="text" name="username" value="JohnDoe">
    <input type="password" name="password" value="123456">
    <input type="submit" value="Absenden">
</form>
```

Wenn man die übertragenen Daten beobachtet, sieht man folgendes:
![image](/images/go/go-post-form-data-1744639837601.png)

Jetzt lassen Sie uns die `multipart/form-data`-Daten in Go senden.
```go
var buf bytes.Buffer
writer := multipart.NewWriter(&buf)

// Fügen Sie die Formulardaten hinzu
writer.WriteField("name", "John Doe")
writer.WriteField("age", "30")

// Schließen Sie den Writer, um die multipart-Nachricht abzuschließen
writer.Close()

req, err := http.NewRequest(http.MethodPost, "http://www.example.com", &buf)
if err != nil {
	panic(err)
}

req.Header.Set("Content-Type", writer.FormDataContentType())
http.DefaultClient.Do(req)
```

Ein wichtiger Punkt ist der `Content-Type`. Man sollte nicht einfach `multipart/form-data` setzen, sondern sollte `writer.FormDataContentType()` verwenden, um den `Content-Type` korrekt einzustellen. Wenn man sich diese Funktion ansieht, sieht es folgendermaßen aus:
```go
// FormDataContentType gibt den Content-Type für ein HTTP
// multipart/form-data mit dieser [Writer]-Grenze zurück.
func (w *Writer) FormDataContentType() string {
	b := w.boundary
	// Wir müssen die Grenze in Anführungszeichen setzen, wenn sie
	// eines der tspecials-Zeichen gemäß RFC 2045 oder ein Leerzeichen enthält.
	if strings.ContainsAny(b, `()<>@,;:"/[]?= `) {
		b = `"` + b + `"`
	}
	return "multipart/form-data; boundary=" + b
}
```

Wichtig ist das `boundary`. Man sendet nicht einfach nur `multipart/form-data`, sondern man benötigt ein `boundary`, um die einzelnen Teile zu kennzeichnen.

Das `boundary` ist eine Zeichenfolge, die dazu verwendet wird, den Anfang und das Ende jedes Teils zu kennzeichnen.

Wenn man `multipart/form-data` überträgt, sieht das Body-Datenformat normalerweise folgendermaßen aus:
```
--boundary
Content-Disposition: form-data; name="name"
John Doe
--boundary
Content-Disposition: form-data; name="age"
30
```

Hierbei kennzeichnet `--boundary` den Teil, das ist die vorher besprochene `boundary`-Zeichenfolge.

Wenn man dies nicht korrekt angibt, kann der Server nicht erkennen, wo die Daten für jedes Feld anfangen und enden, was sehr wichtig zu beachten ist.

Tatsächlich sieht man, dass bei den Daten, die von [webhook.site](https://webhook.site/) empfangen wurden, ebenfalls das Boundary wie folgt markiert ist:

![image](/images/go/go-post-form-data-1744640885745.png)