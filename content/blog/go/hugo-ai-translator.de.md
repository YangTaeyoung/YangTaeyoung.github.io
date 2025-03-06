---
title: Lassen Sie uns alle Beiträge mit AI auf Hugo übersetzen (feat. Warum mein Blog fünf Sprachen unterstützt)
type: blog
date: 2025-03-06
comments: true
translated: true
---

## Aufgabe

Mit der jüngsten Entwicklung der KI habe ich begonnen, Gemini für meine Arbeit zu verwenden. Während ich sah, wie gut es unstrukturierte Daten verarbeitet, erinnerten mich die früheren wehmütigen Arbeiten, die ich gemacht hatte, an meine Erfahrungen.

Um es kurz zu machen, ich hatte schon lange das Gefühl, dass ich die Aufgabe habe, meinen Blog zu übersetzen. Ich hörte früher, dass viele mehr Leser kommen würden, wenn ich ihn übersetze, und ich dachte einmal darüber nach, die Google Translate API zu verwenden, aber ich ließ es einfach bleiben, da ich bequem war.

Da auch die Qualität der KI-Übersetzungen in den letzten Jahren wesentlich besser geworden ist, habe ich beschlossen, mit einem Projekt zu beginnen, um alle meine Beiträge zu übersetzen. In diesem Posting möchte ich erklären, wie es dazu kam, dass ich meinen Blog übersetzte, wie ich vorgegangen bin und welche Funktionen es gibt.


### CLI oder Webdienst?
Ursprünglich wollte ich es als Webdienst entwickeln. Wenn man einen Ordner hochlädt, kann man die übersetzten Dateien automatisch herunterladen.

Es gab jedoch viele Nachteile, da ich einen Server separat warten und auch die Konfigurationen selbst verwalten müsste.

Letztendlich wählte ich die CLI. Es war bequem, es mit Golang zu implementieren (zumal ich bereits viele Erfahrungen damit hatte...) und es war aus verschiedenen Gründen einfach, es in Dinge wie Github Actions zu integrieren.
> Ich sollte es später auch mit Github Actions veröffentlichen. (Ich denke, die Übersetzungen sollten dann im Archiv hochgeladen werden.)


## Start des Übersetzungsprojekts
Ich wählte einen groben Namen. Da es ein Dienst ist, der Blogs auf Hugo übersetzt, nannte ich es [`hugo-ai-translator`](https://github.com/YangTaeyoung/hugo-ai-translator), aber jetzt denke ich, dass es einen besseren, göttlicher klingenden Namen gegeben hätte. (Namen wie hugo-trans, transify usw. kommen mir in den Sinn, aber ich denke, der jetzige ist klar.)
> Falls Sie einen Vorschlag für einen Namen haben, lassen Sie es mich wissen... Ich bin jederzeit offen dafür.

Zuerst habe ich die Ordnerstruktur von Hugo untersucht.

Nicht alle Ordnerstrukturen sind gleich, aber die meisten Hugo-Blogs beginnen damit, `md`-Dateien in einen Ordner namens `content` zu legen.

Die meisten haben eine solche Struktur:

```
/content
    /some
        index.md
    _index.md
```

Um `multilingual` zu unterstützen, ändert sich die Struktur wie folgt:
> Tatsächlich variiert dieser Teil je nach Thema. Ich habe zwei Fälle überprüft, und falls die Struktur des eigenen Hugo-Blogs nicht durch die unten beschriebenen Regeln abgedeckt werden kann, hoffe ich auf Kommentare.

### Fall 1. Dateinamen enthalten Locale
In einigen Fällen wird die ursprüngliche Ordnerstruktur beibehalten und der Dateiname enthält die Locale. In diesem Fall sieht die Struktur wie folgt aus:

```
/content
    /some
        index.md
        index.ko.md
        index.en.md
    _index.md
    _index.ko.md
    _index.en.md
```
### Fall 2. Ordner nach Locale unterteilt
In einigen Fällen werden Ordner nach Locale unterteilt. In diesem Fall sieht die Struktur wie folgt aus:

```
/content
    /ko
        /some
            index.md
        _index.md
    /en
        /some
            index.md
        _index.md
```

## Regeln definieren
Die Eingabeaufforderung war einfacher als erwartet (~~"Übersetze dies ins Englische" reicht aus.~~), aber schwieriger war es, das automatische Übersetzen durchzuführen und die automatisch übersetzten Dateien gemäß den Regeln zu speichern.

Ich musste zuerst die Regeln für die zu speichernden Dateien festlegen.

Was benötigen wir in der gespeicherten Datei?

Ich habe die Dateistruktur so umgewandelt, dass es einfacher ist, die Regeln festzulegen.
### Fall 1. Dateinamen enthalten Locale
```
/content/some/index.md
/content/some/index.ko.md
/content/some/index.en.md
/content/_index.md
/content/_index.ko.md
/content/_index.en.md
```

### Fall 2. Ordner nach Locale unterteilt
```
/content/ko/some/index.md
/content/en/some/index.md
/content/ko/_index.md
/content/en/_index.md
```

Wenn wir es aufschlüsseln, zeigt es eine Regelmäßigkeit, aus welchen Elementen es besteht.

1. Alle starten im /content-Ordner. -> Dies bedeutet, dass der /content-Pfad als Basis dienen sollte.
2. Language-Code ist enthalten. -> `ko`, `en` usw.
3. Dateiname ist enthalten. -> `index`, `_index` usw.
4. Content -> Der Pfad bis zum Dateinamen ist enthalten. -> `/some` usw.

Basierend darauf habe ich die notwendigen Elemente für die Regeln zusammengestellt.
- {language}: Sprachcode
- {fileName}: Dateiname
- {origin}: Der Pfad vom Inhalt bis vor den Dateinamen

Ich habe also das getan, was ich auf Basis dieser Regeln definiert habe, um die `target_path_rule` zu erstellen.

Ich habe es grob so definiert:
Für Fall 1 sieht es wie folgt aus:
```
{origin}/{fileName}.{language}.md --> /some/index.ko.md
```

Für Fall 2 sieht es wie folgt aus:
```
/{language}/{origin}/{fileName}.md --> /ko/some/index.md
```

## Problem mit bereits übersetzten Dateien neu zu übersetzen
Als ich den ersten Erfolg hatte, fühlte ich mich großartig, aber beim zweiten Versuch, eine Übersetzung durchzuführen, wollte ich bereits übersetzte Dateien erneut übersetzen.

Ich hatte einfach nur die .md-Dateien als Ziel gesetzt und kein Logik zum Filtern von bereits übersetzten Dateien implementiert.

**Wie können wir bereits übersetzte Dateien herausfiltern?** war das größte Problem.

Wir könnten eine ignore_rules definieren, um sie herauszufiltern, aber das Festlegen solcher Regeln jedes Mal, wenn eine Sprache hinzugefügt wird, wäre die Hölle.

Ich wollte einfach, dass eine Übersetzung mit einem Klick funktioniert.

### Versuch 1. Hinzufügen einer Verlaufdatei
Ich dachte zunächst an die Möglichkeit, eine `history.log` zu erstellen, um bereits übersetzte Dateien zu protokollieren und diese herauszufiltern.  

Beim Initialisieren von Config lese ich `history.log` ein und mache eine Liste daraus. Wenn ich die potenziellen Dateien durchgehe, filtere ich die Dateien aus, die in dieser Liste sind.

Grafisch sieht es so aus:

![image](./hugo-ai-translator-1741274971017.png)

Aber diese Methode hatte zwei Probleme.

1. Bei Zugriff auf einen anderen Computer gibt es keinen `history.log` mehr.
2. Es ist unangenehm, dass die Logdatei an der Geschäftslogik beteiligt ist.


### Versuch 2. Aufzeichnung des Übersetzungsstatus in den Front matter
Markdown enthält ein Konzept namens Front matter. Die meisten Blogbeiträge nutzen dies gut.

Ein Beispiel:
```markdown
---
title: "Hallo Welt"
date: 2025-03-06
--- 

# Hallo Welt ~
Hallo zusammen! mein erster Post!
```

Hier sind Titel, Datum usw. die Front matter. Es kann in toml, yaml, json usw. definiert werden, aber im Blog-Bereich wird oft yaml front matter verwendet, da es einfacher zu verwalten ist.

Die Idee war, den Übersetzungsstatus im Front matter wie folgt zu protokollieren:

```markdown
---
title: "Hallo Welt"
date: 2025-03-06
translated: true
---
```

So müsste ich nur beim Lesen der Datei das Front matter einlesen und nur die Dateien herausfiltern, bei denen translated true ist, was es perfekt für einen einfachen Prozess macht.

Grafisch sieht es so aus:

![image](./hugo-ai-translator-1741275557807.png)

Diese Methode war viel sauberer als die Verwendung von `history.log`, und da auch die übersetzten Dateien in Git verwaltet werden, gibt es den Vorteil, dass ich bei Zugriff auf einen anderen Computer auch die übersetzten Dateien herausfiltern kann.

## Problem der Übersetzungsqualität

Ich habe das Problem, bereits übersetzte Dateien herauszufiltern gelöst, aber das Problem mit der Übersetzungsqualität blieb ungelöst.

Zuerst wählte ich beim Modell gpt-3.5-turbo, in der Annahme, dass es sehr günstig sein würde, aber während die englischen Übersetzungen ziemlich gut waren, funktionierte die Übersetzung in Sprachen wie ja, cn fast gar nicht.

Ich dachte, das Problem könnte am Prompt liegen, also versuchte ich, den folgenden Satz hinzuzufügen:

**"Bitte übersetze besser"**

Aber das Ergebnis blieb das gleiche.

Zuerst dachte ich daran, [AI zu einem Agenten zu machen, um die Qualität zu kontrollieren, indem ich ihm einen pseudo AI- Sklaven hinzugefügt habe](https://github.com/YangTaeyoung/hugo-ai-translator/issues/1), aber als ich das Modell auf `GPT-4o` hochgestuft hatte, wurde das Problem behoben.
> Früher wurde mir geraten, wenn das Problem nicht gelöst ist, darüber nachzudenken, ob nicht einfach das Budget für Eingaben nicht ausreicht, und das war es.

Schlussendlich scheint sogar das Modell gpt-4o-mini ziemlich gut zu übersetzen.

## Problem mit eingebetteten Code-Blöcken
Da die Übersetzung im Markdown-Prozess stattfand, gab es einen Fehler, bei dem die Ausgaben Codeblöcke enthielten.  
z.B. ` ```markdown ``` `

Anfangs entfernte ich dies manuell:
```go
content := res.Choices[0].Message.Content
content = strings.Trim(content, " ")
content = strings.TrimPrefix(content, "```
")
content = strings.TrimPrefix(content, "```markdown\n")
content = strings.TrimSuffix(content, "\n")
content = strings.Trim(content, "```")
```

Aber es gab Fälle, in denen es nicht vollständig entfernt wurde, und nach Rücksprache mit Freunden stellte sich heraus, dass es einfacher ist, ein Schema zu verwenden, um die Formatierung konsistent zu halten, also setzte ich dies schnell um.

Ich habe eine Funktion erstellt, um das Schema so zu definieren:
```go
package translator

import "github.com/invopop/jsonschema"

type TranslateResponse struct {
    Markdown string `json:"markdown" jsonschema_description:"übersetzte Ergebnisse"}`
}

func GenerateSchema[T any]() interface{} {
    reflector := jsonschema.Reflector{
        AllowAdditionalProperties: false,
        DoNotReference:            true,
    }
    var v T
    schema := reflector.Reflect(v)
    return schema
}

var TranslateMarkdownSchema = GenerateSchema[TranslateResponse]
```

Dann kann es wie folgt aufgerufen werden:
```go
schemaParam := openai.ResponseFormatJSONSchemaJSONSchemaParam{
    Name:        openai.F("markdown"),
    Description: openai.F("übersetzte markdown"),
    Schema:      openai.F(TranslateMarkdownSchema()),
    Strict:      openai.Bool(true),
}

res, err = t.client.Chat.Completions.New(gctx, openai.ChatCompletionNewParams{
    // ...
    ResponseFormat: openai.F[openai.ChatCompletionNewParamsResponseFormatUnion](
        openai.ResponseFormatJSONSchemaParam{
            Type:       openai.F(openai.ResponseFormatJSONSchemaTypeJSONSchema),
            JSONSchema: openai.F(schemaParam), // Hier
        }),
    Model: openai.F(t.cfg.Model),
})
```

## Verwendung

Es war ein langer Weg.

Zuerst überlegte ich, die Verwendungsmethoden lang zu beschreiben, aber ich denke, ich sollte hier einfach die wichtigsten Punkte schnell übermitteln, und detaillierte Anweisungen finden Sie im [README.md des Repositories](https://github.com/YangTaeyoung/hugo-ai-translator).

Zusammenfassend kann man sagen, dass sich meine umfangreichen `.md`-Dateien nun in einer eleganten Struktur wie folgt präsentieren:

![image](./hugo-ai-translator-1741276057201.png)


### Schneller Einstieg
Die Konfigurationsdatei wird unter `~/.hugo-ai-translator/config.yaml` gespeichert.

```yaml
openai:
    model: gpt-4o-mini
    api_key: {your-openai-api-key}
translator:
    content_dir: {content-dir-path} # z.B. ~/dev/personal/YangTaeyoung.github.io/content
    source:
        source_language: ko
        ignore_rules: []
    target:
        target_languages:
            - en
            - ja
            - fr
            - de
        target_path_rule: '{origin}/{fileName}.{language}.md'
```
Diese Struktur muss man verstehen? Ich habe auch einen Befehl bereitgestellt, um es ein bisschen einfacher zu konfigurieren, ähnlich wie bei der AWS CLI.

Versuchen wir, es auf elegante Weise einzurichten:
```shell
hugo-ai-translator configure
```

Wenn Sie die gleiche Dateistruktur wie ich haben (wenn es [Fall 1 ist](#case-1-dateinamen-enthalten-locale)), ersetzen Sie einfach `{your-openai-api-key}` durch Ihren OpenAI API-Schlüssel und stellen Sie nur das `content_dir` ein, und es kann sofort ausgeführt werden.

### Klick!
Wenn die Konfigurationsdatei fertig ist, drücken wir einfach auf das Klick:
```shell
hugo-ai-translator
```


## Ausstehende Aufgaben
Dieses Projekt ist noch nicht abgeschlossen.

### 1. Leistungsprobleme

Wenn ich eine Übersetzung starte, wird es sehr langsam. Zuerst ließ ich alles mit Goroutines laufen, aber ich überschritt die Rate Limit des OpenAI API. Deshalb teile ich jetzt die Goroutines nur nach den zu übersetzenden Sprachen auf.

[Ich überlege aktuell, einen Worker-Pool oder ein rate Paket zu verwenden, um die Rate Limit direkt zu verwalten.](https://github.com/YangTaeyoung/hugo-ai-translator/issues/13) (Retrier könnte auch eine Lösung sein)

### 2. [Fall 2](#case-2-ordner-nach-locale-unterteilt) nicht abgedeckt
Tatsächlich habe ich Fall 2 noch nicht implementiert. Der Grund ist, dass die Quellsprache im Pfad enthalten ist, und das aktuelle Implementationsmodell berücksichtigt die Fälle nicht, in denen die Quellsprache im Pfad enthalten ist.

Es ist auch schwer zu sagen, dass die Quellsprache im Pfad steht, wenn sie manchmal mittendrin steht. 
Aktuell werde ich es so gestalten, dass ich vor dem Übersetzen eine `target-path-rule` für die Quellsprache erstellen kann, und beim Durchsuchen der Dateien sagen, dass ich die Dateien, die diesen Pfad enthalten, als Herkunftsdateien behandeln werde.

### 3. Kopieren von statischen Dateien
Das ist auch ein Problem von Fall 2, da es vorkommen kann, dass statische Dateien in andere Ordner kopiert werden.

Zum Beispiel:
```
/static
    /ko
        /some
            index.md
            image.png
```

In diesem Fall bleibt die Bilddatei, auch wenn die md-Datei übersetzt und regelkonform gespeichert wird, an ihrem ursprünglichen Platz.

Ich denke darüber nach, eine Option `static_copy` hinzuzufügen, mit der Sie entscheiden können, ob statische Dateien kopiert werden sollen oder nicht.


## Referenz
- [OpenAI](https://openai.com)
- [OpenAI-Modelle](https://platform.openai.com/docs/models)
