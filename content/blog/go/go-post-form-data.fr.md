---
title: Comment envoyer des données de formulaire dans le corps en Golang
type: blog
date: 2025-04-14
comments: true
translated: true
---

En travaillant, j'ai eu besoin d'utiliser une API externe.

Contrairement aux API qui échangent généralement des JSON ou des XML, je devais échanger des données de formulaire. Dans mon cas, ayant traité cela avec JSP mais ne l’ayant pas beaucoup utilisé dans la pratique, cela faisait très longtemps que je n'avais pas utilisé les données de formulaire, donc je ne savais pas comment ça se passait en Go.

J'ai décidé de faire quelques recherches et de me renseigner.

## Qu'est-ce que les données de formulaire ?  
Les données de formulaire sont un format de données utilisé dans les formulaires HTML, principalement utilisées par les applications web lorsque le client envoie des données au serveur. Les données de formulaire sont composées de paires clé-valeur et sont généralement encodées au format `application/x-www-form-urlencoded` ou `multipart/form-data`.

### `application/x-www-form-urlencoded`  
`application/x-www-form-urlencoded` est un format de données de formulaire standard, dans lequel toutes les données sont envoyées encodées en URL. Ce format est adapté aux données textuelles.

En général, on l'utilise dans une balise `<form>` comme ceci:

```html
<form action="http://www.example.com" method="post">
  <input type="text" name="name" value="John Doe">
  <input type="text" name="age" value="30">
  <input type="submit" value="Submit">
</form>
```

En vérifiant les données sur webhook.site, on peut constater que le corps apparaît de la manière suivante :

![image](/images/go/go-post-form-data-1744638673842.png)

Le corps n'a rien de spécial, et on peut voir que les données sont envoyées de la manière dont on envoie des données dans les paramètres de requête.

En Go, on peut utiliser la méthode PostForm pour envoyer les données comme ceci :
```go
_, err := http.PostForm("http://www.example.com", url.Values{
    "name": {"John Doe"},
    "age":  {"30"},
})
if err != nil {
    panic(err)
}
```

Si vous devez envoyer par une méthode autre que POST, vous pouvez également les placer directement dans le corps comme suit à l'aide de `url.Values` :
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
`multipart/form-data` est un format utilisé pour envoyer des données volumineuses, comme le téléversement de fichiers. Dans ce format, chaque champ est envoyé sous forme de partie séparée, chaque partie se composant d'un en-tête et d'un corps. Ce format peut transmettre à la fois des données textuelles et des données binaires.  
En général, on l'utilise dans une balise `<form>` comme ceci :

```html
<form action="http://www.example.com" method="post" enctype="multipart/form-data">
    <input type="text" name="username" value="JohnDoe">
    <input type="password" name="password" value="123456">
    <input type="submit" value="Submit">
</form>
```

En voyant les données réelles, cela apparaît comme suit :
![image](/images/go/go-post-form-data-1744639837601.png)

Maintenant, envoyons des données multipart/form-data avec Go.
```go
var buf bytes.Buffer
writer := multipart.NewWriter(&buf)

// Ajouter des champs de formulaire
writer.WriteField("name", "John Doe")
writer.WriteField("age", "30")

// Fermer l'écrivain pour finaliser le message multipart
writer.Close()

req, err := http.NewRequest(http.MethodPost, "http://www.example.com", &buf)
if err != nil {
    panic(err)
}

req.Header.Set("Content-Type", writer.FormDataContentType())
http.DefaultClient.Do(req)
```

L'un des points importants est le `Content-Type`, il ne suffit pas d'écrire simplement `multipart/form-data`, vous devez utiliser `writer.FormDataContentType()` pour définir le `Content-Type`. En examinant cette fonction, elle ressemble à ceci :
```go
// FormDataContentType retourne le Content-Type pour un HTTP
// multipart/form-data avec la frontière de ce [Writer].
func (w *Writer) FormDataContentType() string {
    b := w.boundary
    // Nous devons mettre en guillemets la frontière si elle contient l'un des
    // caractères tspecials définis par le RFC 2045, ou un espace.
    if strings.ContainsAny(b, `()<>@,;:"/[]?= `) {
        b = `"` + b + `"`
    }
    return "multipart/form-data; boundary=" + b
}
```

Un point à noter est le `boundary`. Ce n'est pas juste `multipart/form-data`, il doit y avoir un `boundary`.

Le `boundary` est une chaîne de caractères qui délimite chaque partie et indique le début et la fin de chaque partie.

En général, lorsqu'on envoie `multipart/form-data`, les données du corps sont envoyées sous la forme suivante :
```
--boundary
Content-Disposition: form-data; name="name"
John Doe
--boundary
Content-Disposition: form-data; name="age"
30
```
À ce moment-là, le `--boundary` qui sépare chaque champ est la chaîne `boundary` que nous avons examinée précédemment.

Si ce n'est pas correctement spécifié, le serveur ne pourra pas savoir où commencent et où se terminent les données de chaque champ, il est donc essentiel de bien le comprendre.

En fait, vous pouvez également voir les chaînes que vous recevez sur [webhook.site](https://webhook.site/) avec le `boundary` spécifié comme suit :

![image](/images/go/go-post-form-data-1744640885745.png)