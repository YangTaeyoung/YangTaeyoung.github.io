---
title: "[Docker] Dockerを始める create, exec, start, run, commit"
type: blog
date: 2022-07-12
weight: 2
comments: true
translated: true
---

# Docker開始
これからDockerの概念を一つずつ確認しながらDockerを始めてみよう

## Dockerインストール
[リンク](https://docs.docker.com/get-docker/) を辿って、自分のOSに合ったDockerをインストールしよう

## Dockerイメージを取得
Dockerを実行するために、[Docker Hub](https://hub.docker.com)で提供される多くのイメージを使用してみることができる。試しにPythonイメージを見てみよう

![img_3.png](/images/docker/img_3.png)
> ▲ Docker Hubで`python`を検索した様子

ターミナルを開き、`docker pull python`と入力すると、最新のPythonイメージを取得することができる。

![img_4.png](/images/docker/img_4.png)
> もし自分のサービスが特定のバージョンのPythonを要求する場合、タグを見つけて特定のバージョンのPythonをインストールすることもできる。
_例) `docker pull python:3.8.13`_

---
# Dockerコンテナの状態
以下のコマンドを知るためには、Dockerコンテナの状態を理解する必要がある。

Dockerコンテナは一般的なプロセスと同様に、様々な状態値を持つ。

各状態値についての説明は以下の通り。
### 1. Created
コンテナが生成された後、一度も使用されていない場合、この状態が割り当てられる。

Host OSのCPUやメモリを消費しない。

### 2. Running
文字通りコンテナが実行中の状態を意味する。
この状態はコンテナ内のプロセスが環境(Host OS)とは独立して実行中であることを意味する。

### 3. Restarting
この状態も文字通り、コンテナが再起動中であることを意味する。

`docker run`コマンドでオプション`--restart=[RESTART_POLICY]`を使用して、再起動時のアクションを定義できる。
* `RESTART_POLICY`
    * `no`: 再起動しない(`default`)
    * `on-failure`: コンテナが正常終了(0コードで終了)でない場合再起動
    * `always`: プロセス終了時に常に再起動
    * `unless-stopped`: 明示的に停止されるか、Docker自体が停止、または再起動されない限りコンテナを再起動する。

### 4. Exited
内部プロセスが終了した時、この状態に変更される。Created状態と同様にCPU、メモリを消費しない。

> 一般にコンテナがExited状態になる理由は次のとおり。
1. 内部プロセスが完了した。
2. 内部プロセスが実行中エラーが発生した。
3. `docker`の`stop`コマンドで意図的に終了した。
4. `bash`を実行するコンテナに対話型ターミナルが設定されていない。

### 5. Paused
無期限で全てのプロセスが一時停止状態を示す。
`docker pause`コマンドを通じてDockerの特定のコンテナを一時停止させることができる。

### 6. Dead
この状態はコンテナを削除しようとしたが、特定のリソースが外部プロセスで使用中の場合に現れる状態である。

この状態のコンテナは再起動することはできず、削除するアクションのみ可能である。

---
# コンテナの生成: `create`
受け取ったイメージを基にして`create`コマンドを利用してコンテナを`生成`することができる。

## Usage
使い方は以下の通り。
```shell
$ docker create [OPTIONS] IMAGE [COMMAND] [ARG...]
```

## よく使われるオプション
Dockerの`create`コマンドの全てのオプションを確認したい場合は[このページ](https://docs.docker.com/engine/reference/commandline/create/)を参考にしよう

### `--name [CONTAINER_NAME]`
実行されるコンテナの名前をつける時に使用する。
```shell
$ docker ps -a

CONTAINER ID   IMAGE                    COMMAND                  CREATED              STATUS                  PORTS                    NAMES
d4a0d00c26f9   docker/getting-started   "/docker-entrypoint.…"   21 seconds ago       Created                                          hello
000e821c8396   docker/getting-started   "/docker-entrypoint.…"   About a minute ago   Up About a minute       0.0.0.0:80->80/tcp       admiring_jemison
```
dockerで作成された全てのコンテナを見たい場合は`docker ps -a`を入力すれば良い。
コンテナの名前は右端のカラムに表示され、`name`が`hello`で設定されたコンテナは、指定された名前を持っている。

名前が設定されたコンテナの場合、後にビルドする際にイメージ名がコンテナ名に設定される。

### `--publish, -p [HOST_PORT]:[CONTAINER_PORT]`
このオプションはポートフォワーディングの基本的な理解が必要である。

Docker内でのポートフォワーディングは、Host OSのPortに来るリクエストを、ContainerのPortが代わりに受けることを意味する。
例えば`-p 80:8000`と設定した場合、ホストOSの80ポートへのリクエストをコンテナの8000ポートに渡す。
> 80ポートはインターネットポートなので、上記のように構成するとインターネットが使用できない。

### `--tty, -t`
TTYモードを有効にする。SSH接続が成功すると自動的にデフォルトで設定されたターミナルが実行されるように、該当オプションを設定するとターミナルが開いた状態でコンテナを実行することができる。

ターミナルは基本的にキーボード入力が必要となるので、一般的に上記の`-i`オプションと共に使用する。

### `--interactive, -i`
コンテナと接続(`attach`)されていなくても標準入力(`STDIN`)を有効にする。

### `--volume, -v [VOLUME_NAME]:[REMOTE_PATH]`
`docker volume`を`container`のパスに`bind`する。

> 今はただ単に_‘ストレージを接続するんだな~’_ と考えよう。
>
> これはDocker Volumeに対する理解が必要なため、類似の概念を後で比較学習を通じて知ることにする。

### `--workdir, -w [WORKDIR_PATH]`
コンテナ内のプロセスが実行されるディレクトリを指定する。
設定されたワーキングディレクトリは初期の進入ポイントとなる。

### `--env, -e [KEY=VALUE]`
コンテナに環境変数を指定する。通常、設定値やパスワードなどをコンテナに渡す時に使用する。

ほとんどの言語にはOS環境変数にアクセスできる関数が指定されているため、該当オプションを使用すれば、適切に設定値を隠して配置することができる。

### オプションの組み合わせ
ハイフン(`-`)を1つだけ使用するオプションの場合、複数のオプションを組み合わせて使用できる。
```shell
# Example
$ docker run --name test -it debian
```
---

# コンテナを開始: `start`
作られたコンテナはまだ実行されている状態ではない。
コンテナを実行するために該当コマンドを使えば良い。
## Usage
```shell
docker start [OPTION] CONTAINER_NAME_OR_ID
```

--- 
# 実行中のコンテナに指示する: `exec`
`exec`を活用すると実行中のコンテナに指示を伝えることができる。

主に実行中のコンテナのターミナルを起動するために使用する。
> _(これを利用すればまるでSSHのように活用することもできる。)_

特徴的な点は、`exec`を通じて実行されたコマンドは基本的にメインプロセスの進行に影響を与えないという点である。

## Usage
使用方法は以下の通り。
```shell
$ docker exec [OPTIONS] CONTAINER COMMAND [ARG...]
```

## よく使われるオプション
Dockerの`exec`コマンドの全てのオプションを確認したいなら[このページ](https://docs.docker.com/engine/reference/commandline/exec/)を参考にしよう

### `--detach , -d`
コンテナに指示をバックグラウンドで渡す。

### `--interactive, -i`
コンテナと接続(`attach`)されていなくても標準入力(`STDIN`)を有効にする。

### `--tty, -t`
TTYモードを有効にする。SSH接続が成功すると自動的にデフォルトで設定されたターミナルが実行されるように、該当オプションを設定するとターミナルが開いた状態でコンテナを実行することができる。

ターミナルは基本的にキーボード入力が必要となるので、一般的に上記の`-i`オプションと共に使用する。

### `--workdir, -w [WORKDIR_PATH]`
コンテナ内のプロセスが実行されるディレクトリを指定する。
設定されたワーキングディレクトリは初期の進入ポイントとなる。

### `--env, -e [KEY=VALUE]`
コンテナに環境変数を指定する。通常、設定値やパスワードなどをコンテナに渡す時に使用する。

ほとんどの言語にはOS環境変数にアクセスできる関数が指定されているため、該当オプションを使用すれば、適切に設定値を隠して配置することができる。

### オプションの組み合わせ
ハイフン(`-`)を1つだけ使用するオプションの場合、複数のオプションを組み合わせて使用できる。
```shell
# Example
$ docker exec -it test /bin/bash
```
---
# コンテナの生成と実行: `run`
受け取ったイメージは`run`コマンドを通じて実行することができる。
> 正確には`run`コマンドはコンテナを生成(`create`)し、該当コンテナを実行(`start`)する。

## Usage
使用方法は以下の通り。
```shell
$ docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
```

## よく使われるオプション
Dockerの`run`コマンドの全てのオプションを確認したいなら[このページ](https://docs.docker.com/engine/reference/commandline/run/)を参考にしよう

以前のセクター（`create`、`start`）は生成、実行に関する命令を扱い、よく利用されるオプションを明示した。

基本的に`run`は`create`と`start`を一度に行うコマンドであるため、各コマンドで使用されるオプションを全て使用することができる。


### `--detach, -d`
該当オプションを設定されたコンテナはHost OSでバックグラウンドプロセスとして実行され、実行中のコンテナIDを返す。

### オプションの組み合わせ
ハイフン(`-`)を1つだけ使用するオプションの場合、複数のオプションを組み合わせて使用できる。
```shell
# Example
$ docker run --name test -it debian
```
---
# コンテナからイメージへ: `commit`
自分が設定した通りにコンテナを運用した。それにより自分のサービスは独立して動作できるようになっただろう。

しかし、チャプター1で説明した問題点はまだ解決できていない。

引き継ぎを受ける人が来ると、自分のコンテナを使うことになるが、根本的にコンテナは実行されているだけで、**コンテナ自体は配布可能な形ではない。**

`commit`コマンドは実行中の**コンテナをイメージに変換**する。

**誰でも使える形**となる。

基本的にコンテナからイメージに変換するコマンドは以下のように行われ、該当コンテナは自身のローカルイメージに保存される。

## Usage
以下のように基本的に使用できる
```shell
$ docker commit [OPTION] CONTAINER_NAME_OR_ID IMAGE_NAME
```
その後`image`を確認してみれば、自分が新しく作ったイメージがローカルに保存されていることが分かる。
```shell
$ docker commit test test
95221529517f...
$ docker images
REPOSITORY               TAG       IMAGE ID       CREATED          SIZE
test                     latest    95221529517f   3 seconds ago    118MB
```

## 疑問
ローカルにイメージを保存したことは正しい。しかしこれを`共有`したとは言えるのか？

> まだ自分のイメージは他人に渡されていない。

`docker export`, `docker save`などのコマンドを通じて、イメージやコンテナを`tar`形式にして渡す方法もあるが、もう少しスマートに使ってみよう。
> Docker Repositoryを通じてのことだ。
## Docker Repository
開発者なら一度は`Repository`という言葉を聞いたことがあるだろう。

Springを利用してウェブを実装してみた誰かはSpringの`Annotation`で見たかもしれないし、多くの開発者は恐らくGithub, Gitlab等自分のソースの形状管理に使用したことがあるだろう。

どこであれ`Repository`は保存所としての意味で使われる。保存所という意味はもちろん本人だけが使うLocalが対象になることもあれば、Remoteすなわち共有のための`Repository`のこともあるだろう。

DockerはまるでGithubのように、自ら作ったリポジトリを共有できるようになっている。

敏感な人なら既に察しているかもしれないが、合っている。予測した通りこのRepositoryの名前は[Docker Hub](https://hub.docker.com)だ。

## 自分のRepositoryを作る
自分のRepositoryを作る方法はGithubと大きく変わらない。

![img_5.png](/images/docker/img_5.png)

まずDocker Hubで`Create a Repository`を押してみよう



![img_6.png](/images/docker/img_6.png)

その後画面では自分のRepositoryに対する明細を入力すれば良い。

Visibilityを通じてGithubと同様に全員に公開(`Public`)なRepositoryとして設定することもできるし、許可された人だけがアクセス(`Private`)できるようにもできる。

![img_7.png](/images/docker/img_7.png)

Repositoryを作成したら、横に上記のようなコマンドを使って`push`可能であることを知らせてくれる。
> Githubを使用したことがあるならば、`push`というキーワードが耳馴染みがあるだろう。結論としてあなたが考えたことが正しい。まさにその`push`だ。

### Tag
写真でタグ名を記入しなさい、と示していることが分かる。

これは通常、コミット時に生成され、一般的にバージョンを記入することが普通である。

冒頭で`docker pull python:3.8`のようなコマンドを通じて、特定のPythonバージョンが含まれたイメージを取り寄せた時のように、<br>
**コロン(`:`)の後ろに付く文字列(例:`3.8`)はタグ名**を示している。

## Usage
上で使用方法を明記したが、これはローカルに限定した方法だ。
Docker公式ドキュメントによると`commit`の使用方法は以下の通りだ。
```
$ docker commit [OPTIONS] CONTAINER [REPOSITORY[:TAG]]
```
> そうだ。結局イメージ名がRepository名に一致するのだ。

`commit`という言葉から勘が働いたならば、**もちろんまだ配布されていないこと**が分かるだろう。
> 正確には以前と一致する。

## 使用可能なオプション

### `--message, -m [MESSAGE]`
一般的なGit Commit Messageと類似している。

該当オプションは生成したコミットの時点でメッセージを挿入できるようにする。

### `--author, -a [AUTHOR]`
イメージ作成者の記録を残す。

### `--change, -c`
`Dockerfile`を通じてコンテナを生成し、コミットを生成する場合、該当オプションを使う。
> Dockerfileは次のチャプターで学ぶ。

## 類似のコマンド: `build`
イメージを作成する方法は今学んだコンテナからスナップショットを生成する`commit`コマンドの他に、`build`というコマンドが追加的に存在する。
しかし`Dockerfile`に対する理解が必要であるため`Dockerfile`は次のチャプターで学ぶことにする。

# 作成したイメージをRepositoryに共有する: `push`
これで最後の段階である。作り上げたイメージを私のRepositoryに`push`すること。

## Usage
使用方法は以下の通り。
```shell
$ docker push [OPTIONS] NAME[:TAG]
```

ここで`NAME[:TAG]`は`commit`で作成する際に使用した`[REPOSITORY[:TAG]]`と一致する。


```shell
$ docker push xodud9632/test-repo:ver1
The push refers to repository [docker.io/xodud9632/test-repo]
27d8bf01e7ea: Mounted from library/debian
ver1: digest: sha256:ef143c422f108a12a93c202078d2d9e8c2966e9479b74f6662af9e32bb05ad73 size: 529
```
実際に行ってみると、上記のようなメッセージが表示され、

![img_8.png](/images/docker/img_8.png)

Repositoryにもちゃんと適用されたことが分かる。

### Error: `repository does not exist or may require 'docker login'`

上のメッセージでエラーが出る場合は、Docker CLIにログインされていないことを意味する。

```shell
$ docker login
```

上記のコマンドを入力し、IDとパスワードを入力してログインすると、問題なく正常に実行されることが分かる。

# Reference
* **Docker公式ドキュメント**
    * [runコマンド](https://docs.docker.com/engine/reference/commandline/run/)
    * [createコマンド](https://docs.docker.com/engine/reference/commandline/create/)
    * [execコマンド](https://docs.docker.com/engine/reference/commandline/exec/)
    * [startコマンド](https://docs.docker.com/engine/reference/commandline/start/)
    * [pushコマンド](https://docs.docker.com/engine/reference/commandline/push/)
    * [commitコマンド](https://docs.docker.com/engine/reference/commandline/commit/)
* **ブログ**
    * [LainyZine - docker exec 使用法](https://www.lainyzine.com/ko/article/docker-exec-executing-command-to-running-container/)
    * [ジェイコブ(JACOB) - Docker入門4 - Dockerイメージを作成](https://code-masterjung.tistory.com/133)
    * [Nirsa - \[Docker CE\] Dockerレポジトリログインエラー](https://nirsa.tistory.com/46?category=868315)
    * [alice - \[Docker Study\] 5. よく使われるDockerコマンド復習 - 1](https://blog.naver.com/alice_k106/220359633558)
