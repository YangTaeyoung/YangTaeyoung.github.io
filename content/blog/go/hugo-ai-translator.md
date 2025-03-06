---
title: Hugo에서 AI를 이용해 모든 포스팅을 번역해보자 (feat. 내 블로그가 5개 국어를 지원하게 된 건에 대하여)
type: blog
date: 2025-03-06
comments: true
---

## 과업

최근에 AI가 발전하면서 업무로 Gemini를 활용하게 되었다. 비정형 데이터를 이렇게나 잘 다루는 것을 보며, 예전에 했던 눈물나는 작업들이 머릿속에 떠오르기도 했다.

각설하고 예전부터 숙제처럼 느껴왔던 것이 있다. 바로 블로그 번역이다. 일전에 번역을 하게 되면 블로그를 보는 사람이 훨씬 많이 생긴다는 얘기를 듣곤 했는데, 예전에는 Google Translate API를 이용해서 번역해볼까 생각도하다가, 게으름에 못이겨 그냥 놔뒀었다.

AI번역 분야도 퀄리티가 굉장히 좋아지면서, 이번 기회에 모든 포스팅을 번역해보는 프로젝트를 시작해보기로 했다. 그래서 해당 포스팅은 내가 블로그를 번역하게 된 계기를 소개하고, 어떻게 진행되었는지, 어떤 기능이 있는지를 소개하려 한다.


### CLI냐 웹서비스냐
사실 처음에는 웹서비스로 만들어보려고 했다. 폴더를 업로드 하면, 알아서 번역된 파일을 다운로드 받을 수 있게 하는 것이었다.

별도로 서버를 유지해야 하기도 하고, 설정같은 것들도 따로 관리해줘야 할 것 같아 단점이 많았다.

결국 CLI로 선택했는데, Golang으로 구현했을 때 CLI가 편하기도 했고(이미 다수 구현해본 경험이 있기에...), Github Actions 등에서도 통합하기 쉽기 때문에, 여러모로 유리한 점이 많았다.
> 나중엔 Github Actions로도 출시해야겠다. (번역본은 아카이브에 올리거나 해야겠지만..)


## 번역기 프로젝트 시작
이름은 대충 지었다. Hugo로 된 블로그를 번역해주는 서비스이니, [`hugo-ai-translator`](https://github.com/YangTaeyoung/hugo-ai-translator)로 지었는데, 지금와서 생각해보면 더 Go다운 그런 좋은 이름이 있지 않았을까.. (hugo-trans, transify 등등 스쳐가는 작명이 생각나지만, 지금이 명확한 것 같긴하다)
> 혹시 추천할 이름이 있다면 알려주시길.. 언제든 열려있다

먼저 Hugo의 폴더 구조를 살펴보았다.

모든 폴더 구조가 같은 것은 아니지만, 대부분의 Hugo 블로그는 `content`라는 폴더 안에 `md`파일을 넣는 것으로 시작한다.

대부분 이런 구조를 가지는데

```
/content
    /some
        index.md
    _index.md
```

여기에 `multilingual`을 지원하려면, 다음과 같은 폴더구조로 변모하게 된다.
> 사실 이부분은 테마마다 다르다. 내가 확인한 케이스는 2개 정도인데, 본인의 Hugo 블로그 구조가 아래에 설명할 룰에서 포괄할 수 없다면 덧글을 남겨주길 소망한다.

### Case 1. 파일명에 Locale을 포함하는 경우
기존 폴더구조를 유지하면서, 파일명에 Locale을 포함하는 경우가 있다. 이 경우에는 다음과 같은 구조를 가진다.

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
### Case 2. 폴더를 Locale로 구분하는 경우
폴더를 Locale로 구분하는 경우도 있다. 이 경우에는 다음과 같은 구조를 가진다.

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

## 룰 잡기
생각보다 프롬프트 부분은 쉬워서(~~"이거 영어로 번역해줘" 하면 된다.~~), 더 어려운 것은 자동 번역을 어떻게 수행할 것이고, 자동 번역된 파일을 어떻게 규칙에 맞게 저장할 것인가였다.

먼저 저장될 파일의 규칙을 정해야 했다.

저장된 파일은 무엇이 필요할까?

아까 파일 트리 구조를 룰로 잡기 편하도록 경로로 변환해보았다.
### Case 1. 파일명에 Locale을 포함하는 경우
```
/content/some/index.md
/content/some/index.ko.md
/content/some/index.en.md
/content/_index.md
/content/_index.ko.md
/content/_index.en.md
```

### Case 2. 폴더를 Locale로 구분하는 경우
```
/content/ko/some/index.md
/content/en/some/index.md
/content/ko/_index.md
/content/en/_index.md
```

늘여놓고 보니 어떤 요소로 구성되어 있는지 규칙성이 보였다.

1. 모두 /content 폴더 아래에서 시작한다. -> 즉 /content 폴더 경로가 기준이 되어야 한다.
2. language code가 들어간다. -> `ko`, `en` 등
3. 파일 명이 들어간다. -> `index`, `_index` 등
4. content -> 파일 명 이전까지의 경로가 들어간다. -> `/some` 등

이를 토대로 규칙에 필요한 요소를 정리해보았다.
- {language}: 언어 코드
- {fileName}: 파일 명
- {origin}: content부터 파일명 이전까지의 경로

이제 내가 한 것은 이 규칙을 토대로 `target_path_rule`을 정의하는 것이었다.

대략 이런 느낌이면 될 것 같이 정의했다
case 1에선 다음과 같고
```
{origin}/{fileName}.{language}.md --> /some/index.ko.md
```

case 2에선 다음과 같다.
```
/{language}/{origin}/{fileName}.md --> /ko/some/index.md
```

## 이미 번역된 파일을 재번역하는 문제
처음 성공했을 때는 멋진 쾌감도 있었지만, 두 번째로 번역을 시도하니 이미 번역된 파일을 또 번역하려고 했다. 

나는 단순히 .md파일을 타겟으로 잡았을 뿐이고, 이미 번역된 파일을 걸러내는 로직은 없었다.

**이미 번역된 파일을 어떻게 걸러낼까**가 가장 큰 문제였다.
 
ignore_rules로 정의해서 걸러낼 수도 있겠지만, 언어를 추가할때마다 이런 룰을 지정해줘야 하는 것은 그야말로 지옥이다.

그저 나는 CLI 딸깍 한방이면 번역이 되길 원했을 뿐이다.

### Try 1. 히스토리 파일을 추가하기
사용자 몰래(?)라기 보단 `history.log`를 만들어서 이미 번역된 파일을 기록하고 이를 걸러내는 방법을 처음 생각했다.

초기에 Config를 로드할 때 `history.log`를 읽어서 리스트화시키고, 후보군을 파싱할 때 이 리스트에 있는 파일은 걸러내는 방식이었다.

도표로 표현하면 다음과 같다.

![image](./hugo-ai-translator-1741274971017.png)

하지만 이 방법은 두 가지 문제가 있었다.

1. 다른 컴퓨터에 접속하면 `history.log`가 없어진다.
2. 로그 파일이 비즈니스 로직에 관여한다는 것이 불편하다.


### Try 2. Front matter에 번역 여부를 기록하기
마크다운에는 Front matter라는 개념이 있다. 대개의 블로그 포스트들은 이런 것들을 잘 활용하는 편인데

예를 들면 이런 것이다.
```markdown
---
title: "Hello World"
date: 2025-03-06
--- 

# Hello World ~
Hello Everyone! my first post!
```

여기서 title, date 등이 Front matter이다. toml, yaml, json 등으로 정의할 수 있지만, 블로그 계열에선 보통 yaml front matter가 관리하기 편해서 더 자주 사용되는 편이다.

아이디어는 front matter에 다음과 같이 번역 여부를 기록하는 것이었다.

```markdown
---
title: "Hello World"
date: 2025-03-06
translated: true
---
```

이렇게 하면 파일을 읽을 때 front matter를 읽어서 translated가 true인 파일만 걸러내면 되기에 그야말로 딸깍에 제격인 셈이었다. 

도표로 표현하면 다음과 같다.

![image](./hugo-ai-translator-1741275557807.png)

이 방법은 `history.log`를 사용하는 방법보다 훨씬 깔끔하고, 번역된 파일도 Git에서 관리되므로, 다른 컴퓨터에 접속해도 번역된 파일을 걸러낼 수 있다는 장점이 있었다.

## 번역 품질 문제

이미 번역된 파일을 걸러내는 문제는 해결했지만, 번역 품질 문제는 해결하지 못했다.

처음엔 모델을 선택할 때 gpt-3.5-turbo가 마냥 싸겠지 해서 gpt-3.5-turbo로 선택했는데 영어 번역은 꽤 잘 되도, ja, cn과 같은 언어는 거의 번역을 하지 못했다.

프롬프트가 문제인가 싶어 다음과 같이 문구를 추가해도 보았는데


**"더 잘 번역해줘 제발"**

결과는 똑같았다.

처음에는 [AI를 에이전트화 해서 다음과 같이 품질을 검사하는 AI 노예를 추가할까 생각도 했지만](https://github.com/YangTaeyoung/hugo-ai-translator/issues/1) 모델을 `GPT-4o`로 올리니 해결되었다.
> 예전에 문제가 해결되지 않는다면 들어간 돈이 부족한게 아닌지 생각해보라는 말을 들었던 것 같은데, 그게 맞다 

결론적으로는 gpt-4o-mini 정도로도 충분히 잘 번역이 되었다.

## 코드 블럭에 감싸지는 문제
마크다운으로 번역되다 보니, 아웃풋에 코드 블럭 문자가 포함되는 버그가 있었다.
ex ) ` ```markdown ``` `

처음에는 이를 수동으로 제거하기도 했다.
```go
content := res.Choices[0].Message.Content
content = strings.Trim(content, " ")
content = strings.TrimPrefix(content, "```\n")
content = strings.TrimPrefix(content, "```markdown\n")
content = strings.TrimSuffix(content, "\n")
content = strings.Trim(content, "```")
```

다만 완벽히 제거되지 않는 케이스가 있었고, 주변 지인에게 물어보니 그럴때는 스키마를 사용하면 포맷을 일정하게 맞출 수 있다고 해서 바로 적용해보니 해결되었다.

아래와 같이 스키마를 만드는 함수를 작성하고
```go
package translator

import "github.com/invopop/jsonschema"

type TranslateResponse struct {
	Markdown string `json:"markdown" jsonschema_description:"translated result"`
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

다음과 같이 호출하면 된다.

```go
schemaParam := openai.ResponseFormatJSONSchemaJSONSchemaParam{
    Name:        openai.F("markdown"),
    Description: openai.F("translated markdown"),
    Schema:      openai.F(TranslateMarkdownSchema()),
    Strict:      openai.Bool(true),
}

res, err = t.client.Chat.Completions.New(gctx, openai.ChatCompletionNewParams{
    // ...
    ResponseFormat: openai.F[openai.ChatCompletionNewParamsResponseFormatUnion](
        openai.ResponseFormatJSONSchemaParam{
            Type:       openai.F(openai.ResponseFormatJSONSchemaTypeJSONSchema),
            JSONSchema: openai.F(schemaParam), // Here
        }),
    Model: openai.F(t.cfg.Model),
})
```

## 사용 방법

우역곡절이 길었다. 

사실 사용 방법을 다 장황하게 적을까도 생각해보았지만, 여기선 핵심만 빠르게 전달하고, 자세한 사용 방법은 [Repository의 README.md](https://github.com/YangTaeyoung/hugo-ai-translator)를 참고하면 좋을 것 같다.

결론적으로는 나의 장황한 `.md`파일들이 매우 깔끔하게 다음과 같이 우아한 파일 트리로 나타나게 되었다. 

![image](./hugo-ai-translator-1741276057201.png)


### 빠른 시작
설정 파일은 `~/.hugo-ai-translator/config.yaml`에 저장되어 있다.

```yaml
openai:
    model: gpt-4o-mini
    api_key: {your-openai-api-key}
translator:
    content_dir: {content-dir-path} # ex. ~/dev/personal/YangTaeyoung.github.io/content
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
이걸 구조를 알아야 해? 라고 생각하는 사람을 위해 마치 AWS CLI처럼 configure하는 커멘드도 지정해두었다.

다음과 같은 방법으로 깔쌈하게 설정해보자
```shell
hugo-ai-translator configure
```

나와 파일규칙이 동일하다면 ([Case 1이라면](#case-1-파일명에-locale을-포함하는-경우)) `{your-openai-api-key}`를 본인의 OpenAI API 키로 바꾸고, `content_dir`만 설정하면 바로 실행가능하다

### 딸깍!
설정파일을 완료했다면 딸깍 해보자
```shell
hugo-ai-translator
```


## 남아있는 과제들
아직 이 프로젝트가 종료된 것은 아니다.

### 1. 성능 문제

번역을 돌리면 매우 느려지는데, 처음에는 모두 Gorotine으로 실행하게 했다가 OpenAI API의 Rate Limit을 초과하게 되어서, 현재는 함께 번역되는 언어 단위로만 Gorotine을 할당하고 있다.

[현재는 workerpool을 이용하거나, rate 패키지를 통해 Rate Limit을 직접 관리해주는 것을 고려해보고 있다.](https://github.com/YangTaeyoung/hugo-ai-translator/issues/13) (retrier도 방법일 것이다 )

### 2. [Case 2](#case-2-폴더를-locale로-구분하는-경우) 미포괄
사실 아직 Case 2는 포함시키지 못했다. 이유로는 Source 언어가 경로에 포함되어 있기 때문인데, 현재 구현은 Source 언어가 경로에 포함되어 있지 않은 경우를 가정하고 있기 때문이다.

마냥 룰 앞에 source language code가 있으면 원본으로 인식하라고 하지도 하기 어려운 것이 중간에 껴있거나 하는 경우가 생길 수도 있기 때문이다.

현재는 target-path-rule로 소스 언어로 경로를 미리 만든 뒤, 번역 후보군 파일을 도출할 때 해당 파일 경로에 포함되는 경우 원본으로 인식하라고 할 예정이다.

### 3. Static 파일 복사
이것도 Case 2 문제인데, 폴더가 다른 경우 Static 파일도 복사하는 경우가 있다.

예를 들어
```
/static
    /ko
        /some
            index.md
            image.png
```

다음과 같은 구조로 파일이 있는 경우이다. 이경우 md를 번역해서 룰대로 저장하더라도, 이미지 파일은 이동되지 않는다.

이를 위해 static 파일도 복사할지 선택하는 `static_copy`라는 옵션을 추가하려고 생각하고 있다.

## Reference
- [OpenAI](https://openai.com)
- [Open AI Models](https://platform.openai.com/docs/models)
