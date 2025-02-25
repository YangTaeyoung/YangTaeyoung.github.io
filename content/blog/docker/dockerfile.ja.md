---
translated: true
---
```
---
title: "[Docker] Dockerfileを見てみよう。"
type: blog
date: 2022-07-13
weight: 3
comments: true
---
## 😡 皆さん、不便を感じているのは私だけ？
DockerのCLIを少し試してみた方は、コンテナを作成して管理することがとても面倒だと感じたかもしれません。

私は簡単にしたいので、コンテナを作るたびに多くのコマンドを入力しなければなりません。

実際、それ以上に大きな問題があるとすれば、イメージをビルドする際、容量が驚くほど大きくなる可能性があるということです。

非常に大きくはないにしても、少なくとも100MBから、1〜2GBに達するものまで様々です。

![img.png](https://blog.kakaocdn.net/dn/dg7HAJ/btq0ZLhsh0x/RXZPbihsD3h9ou7NviGfM1/img.png)

多くのコンテナを管理する会社であれば、このようなことはさらなる災難として訪れる可能性があります。

容量はさておき、イメージを転送し、これを受け取るのにかかる時間は非常に長くなるでしょう。

## 📄 Dockerfile

そのためDockerには新たにコンテナを作る方法が提案されています。 

作成済みのイメージではなく、**イメージを作るスクリプトを共有する**ことが主旨です。

### 🚫 Don't Repeat Yourself

どうせ一度は作らなければなりません。 ~~これを自動化することは後にAIがするのでしょうか..?~~
> _でも一度作ればいいのです。_

これはDockerの内部機能であるため、コマンドを作ってテキストファイルとして保存するよりもはるかに簡単で、形式的で、構造的です。

また、結論として`Dockerfile`も結局はテキストファイルなので、保存する際に大容量を占めることはありません。

では本題に入りましょう。

### では、どうやって実行するのか？
`Dockerfile`を作成すると、ファイルの仕様に従ってイメージを読み込み、コマンドを実行します。

コンテナがDockerに表示されると、そのイメージはユーザーのローカルに保存されます。

この過程を`build`と呼び、コンテナをイメージにする`commit`とは異なります。

### `build [BUILD_PATH]`

`build`コマンドは指定したパスの下位にある`Dockerfile`を基にコンテナを作成するコマンドです。

このコマンドは再帰的に実行されるため、絶対にルートディレクトリをパスとしてはいけません。

```shell
$ docker build / # (X)
```
通常、プロジェクトのルートディレクトリに`Dockerfile`を置くため、以下のコマンドが慣用句のように使われます。
```shell
$ docker build .
```

### `-f [DOCKER_FILE_PATH]` オプション

伝統的に`Dockerfile`はビルドするプロジェクトのルートパスにありますが、`-f`オプションを使ってルートパスと`Dockerfile`のパスが異なっても接続できます。

```shell
$ docker build -f /path/to/a/Dockerfile .
```
> これは`Dockerfile`が現在のディレクトリ(`.`)にあるかのように振る舞うことを意味します。

#### `-t` オプション

ビルドが成功すると、新しいイメージを保存するリポジトリとタグを`-t`オプションを使って指定できます。

```shell
$ docker build -t shykes/myapp .
```

同じイメージを複数のリポジトリに配置したり、複数のタグを保存したい場合、複数の`-t`を指定して同じイメージでビルドできます。
```shell
$ docker build -t shykes/myapp:1.0.2 -t shykes/myapp:latest .
```

## `Dockerfile`の作成
`Dockerfile`を作成する方法は簡単です。`Dockerfile`を作成するだけです。

さあ、`Dockerfile`を作成するための膨大な設定を見ていきましょう。

#### `ARG`
`Dockerfile`内で変数の再利用性を最大化するために使用される変数宣言文です。

```dockerfile
# 使用方法
ARG [KEY]=[value]

# 呼び出し
${[KEY]}

# 例
ARG  CODE_VERSION=latest
FROM base:${CODE_VERSION}
CMD  /code/run-app

FROM extras:${CODE_VERSION}
CMD  /code/run-extras
```

#### `FROM`
```dockerfile
# - 使用方法
FROM [--platform=<platform>] <image> [AS <name>]
# または
FROM [--platform=<platform>] <image>[:<tag>] [AS <name>]
# または
FROM [--platform=<platform>] <image>[@<digest>] [AS <name>]
```
作業する基になるイメージを記載します。 

前の章の`run`、`create`コマンドで見た`IMAGE`部分に記載する内容と見なされ、記載されたイメージは最初にローカルで探し、その後なければ、[Docker Hub](https://hub.docker.com)からイメージを取り込むことになります。
> もちろん、アクセス権限のないリポジトリにアクセスしたり、イメージ名を間違えて記載した場合は取得できません。

#### `WORKDIR`
コンテナ内で作業するパスを指定します。
前の章の`run`、`create`コマンドで見た`-w`、`--workdir`と同じ役割を果たします。

以後、`COMMAND`は`WORKDIR`で実行され、この部分を指定しない場合はホームディレクトリ（`~`）として設定されます。

#### `RUN [COMMAND]`

前の章の`run`コマンドとは別物です。
むしろ`COMMAND`部分に属し、コンテナ上での様々なコマンドをこのキーワードを通じて入力することができます。

**この命令はイメージのデフォルトの命令とは独立して（まるで`exec`に入力した命令のように）動作します。**

`RUN`は2つの入力形式をサポートしています。

```dockerfile
# 方法1
RUN <command>
# 方法2
RUN ["executable", "param1", "param2"]
```

`方法2`の方式は複雑そうに見えるだけで、単にコマンドをスペースで区切って書いたものに過ぎません

例えば下記の2つのコマンドは完全に同一の動作を行います。

```dockerfile
RUN ["/bin/bash", "-c", "echo hello"]
```

```dockerfile
RUN /bin/bash -c "echo hello"
```

#### 注意点
リスト形式で命令を実行したい場合、バックスラッシュ文字（`\`）を使ってパスを入力することがあります。

実際のコマンドは`JSON`形式で実行されますが、バックスラッシュ文字は`JSON`で認められる文字ではないため、特に`Windows`では`\`が区切り文字として使用される際、バックスラッシュ（`\`）を2回入力してエスケープする必要があります。

```dockerfile
RUN ["c:\windows\system32\tasklist.exe"] # (X)
RUN ["c:\\windows\\system32\\tasklist.exe"] # (O)
```

#### `ENTRYPOINT`
コンテナが実行された際にスクリプトやコマンドを実行します。

このファイルをコンテナに作った場合、コンテナをスタートさせるとき（`start`）、生成と同時に実行する際（`run`）に行われると考えればわかります。

実行中のコンテナにただコマンドを送る場合（`exec`）には実行されません。

もう一つの特徴は、`ENTRYPOINT`は`Dockerfile`内で1回しか宣言できないことです。

#### `CMD`
`RUN`と似た役割を果たしますが、`docker run`実行時に特別な`COMMAND`がない場合に基本的に実行される`COMMAND`という点で差があります。

```dockerfile
# 方法1
CMD ["executable","param1","param2"] # exec形、推奨
# 方法2
CMD ["param1","param2"]
# 方法3
CMD command param1 param2
```
方法1で`executable`を省略することが可能ですが、この場合、ENTRYPOINTが定義されている必要があります。

#### `ENV`
コンテナの環境変数を指定する役割を果たし、`run`、`create`コマンドで見た`-e`オプションと同じ役割を果たします。

```dockerfile
# 使用方法
ENV [KEY]=[VALUE]

# 例
ENV abc=hello
ENV abc=bye def=$abc
ENV ghi=$abc
```

#### `LABEL` 
コンテナのメタデータを追加する際に使用されます。
```dockerfile
# 使用方法
LABEL <key>=<value> <key>=<value> <key>=<value> ...
```
key-valueペアとして保存され、例えば下記のように記述できます。
```dockerfile
LABEL "com.example.vendor"="ACME Incorporated"
LABEL com.example.label-with-value="foo"
LABEL version="1.0"
LABEL description="This text illustrates \ # マルチラインはバックスラッシュ（\）区切り文字を通じて入力できます。
that label-values can span multiple lines."
LABEL multi.label1="value1" \
      multi.label2="value2" \
      other="value3"
```

もしメタデータを確認したい場合、以下のようなコマンドを通じて特定のイメージ（`myimage`）のメタデータを確認できます。
```shell
$ docker image inspect --format='' myimage
{
  "com.example.vendor": "ACME Incorporated",
  "com.example.label-with-value": "foo",
  "version": "1.0",
  "description": "This text illustrates that label-values can span multiple lines.",
  "multi.label1": "value1",
  "multi.label2": "value2",
  "other": "value3"
}
```

#### `EXPOSE [PORT]/[PROTOCOL]`
`EXPOSE`はどのポートを待機するかを示す部分です。

しかし`Dockerfile`ではホストのフォワードを意味するものではありません。

ただホストから`Container`にデータを送信する際にどの`PORT`で送るか指定するためのものです。

したがって、`-p`オプションは`Dockerfile`だけでは自動化できません。

`[PROTOCOL]`はデータの転送にどのプロトコルを使うかに関する仕様です。

`tcp`、`udp`から一つを選びます。デフォルト値は`tcp`であり、特別な場合を除いて変更しないことをお勧めします。
> TCPはパケット送信において信頼性を保証するためです。

#### `COPY [OPTION] [HOST_PATH] [CONTAINER_PATH]`
`HOST_PATH`にあるファイルを`CONTAINER_PATH`にコピーするコマンドです。
`HOST_PATH`はパスだけでなく、ファイル名も含めることができ、`?` _(一文字)_, `*` _(複数文字)_ などのワイルドカードも使用可能です。
#### 相対パス
各`PATH`に相対パスを入力する場合、`HOST_PATH`はファイルの位置を基準とし、`CONTAINER`は`WORKDIR`が基準となります。

#### ワイルドカード例
* `home*`: `home`で始まるすべてのファイルとパス
* `*home*`: `home`を含むすべてのファイルとパス
* `?home`: `home`の前に1文字あるすべてのファイルとパス（例：`1home`、`ahome`）

#### `--chown`
`--chown`オプションを使って`CONTAINER_PATH`の所有者を決定できます。

内部的に実際の`chown`コマンドを通じて操作するため、Linuxベースのコンテナでのみ実行可能です。

#### `ADD [HOST_PATH] [CONTAINER_PATH]`
`ADD`はほぼ`COPY`と同じ機能を果たすと考えられます。

`COPY`のオプションと内容が適用され、`ADD`だけの追加機能がいくつかあります。
1. コピー対象が圧縮ファイル（`.tar`, `.tar.gz`）の場合、該当ファイルの圧縮を解除してコピーします。
2. wgetなどを使ってリモートのファイルをコピー対象として指定できます。
> ただしリモートファイルは`600`権限（ユーザーのみが読み取り可能）を持ちます。

## オプションを自動化する？
この時点でこの文章を読む人が疑問を持つべき部分があります。

果たして`Dockerfile`は`CONTAINER`の作成過程を全て明記していると言えるか？

**答えはもちろん「いいえ」。**

`Dockerfile`がコンテナを明記することはしますが、コンテナを作成するオプションを自動化する目的ではありません。

`create`、`run`コマンドで使用する`-p`オプションを見てもそうです。

`-p`オプションはHost OSのポートとContainerのポートを明記する必要がありますが、`EXPOSE`は単にコンテナの開放ポートだけを明記するに過ぎません。

その以外のHost OSの多くのオプションを`Dockerfile`が処理できません。

これは`build`がコンテナに関する仕様であり、Hostに関する仕様ではないためです。

当然このような不便さは、後に投稿するDocker Composeが登場するきっかけとなりました。

## Docker Ignore File
`git`を使った経験があるならば、`.gitignore`を一度くらい使った経験があるでしょう。

`.dockerignore`ファイルも同様に、ファイルやフォルダーのパスを定義する役割を果たします。

`.gitignore`ファイルはコミットしないファイルを設定することが多いですが、ここでは、`ADD`や`COPY`を通じてHost OSからコピーされるべきでないファイルやフォルダのパスを定義します。

```dockerignore
# コメント
*/temp*
*/*/temp*
temp?
```

## 参考
* [Docker 公式ドキュメント - Dockerfileリファレンス](https://docs.docker.com/engine/reference/builder/)
* [スンデン - [Docker] RUN vs CMD vs ENTRYPOINT in Dockerfile](https://blog.leocat.kr/notes/2017/01/08/docker-run-vs-cmd-vs-entrypoint)
* [Jae-Hong Lee 가장 빨리 만나는 Docker 7장 - 6. ENTRYPOINT](http://pyrasis.com/book/DockerForTheReallyImpatient/Chapter07/06)
* [박개벙 - Dockerfile의 ADD와 COPY의 차이](https://parkgaebung.tistory.com/44)
```
