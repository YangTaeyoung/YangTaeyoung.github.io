---
title: Résoudre le problème de corruption des caractères coréens dans un fichier exporté en csv depuis Golang
type: blog
date: 2023-09-23
comments: true
translated: true
---
## BOM
Excel a besoin d'un BOM au début du fichier pour lire correctement les fichiers CSV encodés en UTF-8.

> BOM : **Marque d'ordre d'octet** (Byte Order Mark, **BOM**) est le caractère U+FEFF d'[unicode](https://fr.wikipedia.org/wiki/Unicode "unicode"), qui agit comme un [nombre magique](https://fr.wikipedia.org/wiki/Nombre_magique "nombre magique"). Ajouté au début du document, il peut transmettre plusieurs informations au [programme](https://fr.wikipedia.org/wiki/Programme "programme") qui lit le texte.

## Dans le code
Pour prévenir le problème de corruption des caractères coréens lorsque vous utilisez le csv en Golang, vous pouvez procéder comme suit :

```go
package main

import (
    "encoding/csv"
    "os"
)

func main() {
    file, err := os.Create("test.csv")
    if err != nil {
        panic(err)
    }
    defer file.Close()

    // NOTE : Ajouter le BOM UTF-8
    file.WriteString("\xEF\xBB\xBF")

    writer := csv.NewWriter(file)
    defer writer.Flush()

    data := [][]string{
        {"이름", "나이", "주소"},
        {"홍길동", "30", "서울"},
        {"김영희", "25", "부산"},
    }

    for _, value := range data {
        err := writer.Write(value)
        if err != nil {
            panic(err)
        }
    }
}

```

## Référence
- [Marque d'ordre des octets - Wikipédia](https://fr.wikipedia.org/wiki/Marque_d%27ordre_des_octets)
