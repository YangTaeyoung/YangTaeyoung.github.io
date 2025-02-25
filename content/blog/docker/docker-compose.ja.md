---
title: "[Docker] Docker Composeを学ぼう"
type: blog
date: 2022-07-21
weight: 5
comments: true
translated: true
---
## お兄さんたち、私だけ不便を感じてる？
二回目のお兄さんたちです。実際、不便なことが多いからです。

## Dockerの用途
Dockerはどんな時に使用するといったのか？

Dockerの核心技術であるコンテナを使用したいときでしょう。
> つまり、再利用のためです。

前に学んだ`Dockerfile`は、コンテナを作成するのに必要な多くの部分を自動化しました。

しかし、`Dockerfile`にも短所があります。

[以前の投稿](/docs/docker/04.dockerfile/)でも扱ったように、ホストOSの設定を自動化することには制限があるという部分でした。

例えば、ホストOSのポートフォワーディングや、ボリュームのパスをマウントすることまではできていませんでした。

結局、多くの開発者は`Dockerfile`を作成し、

`build`を通じて作成されたコンテナを相互に接続し、

`volume`をマウントする必要がありました。

## Docker Compose
![img.png](https://miro.medium.com/max/1000/1*JK4VDnsrF6YnAb2nyhMsdQ.png)

Docker Composeは上記の煩わしさを解決します。

`docker-compose.yml`で定義できる内容には`volume`、`port`、`env`の他にコンテナを定義する様々な作業を実行できるようにしています。

また、単一コンテナだけでなく、**多重コンテナを定義し、コンテナ間の関係を設定できるようにも支援しています**。

[Docker公式ドキュメント](https://docs.docker.com/compose/compose-file/)ではComposeを**プラットフォームに依存しないコンテナベースのアプリケーション**として紹介しています。

### `.yml`, `.yaml`
Docker Composeについて知る前に知っておかなければならないことがあります。

![img2](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/YAML_Logo.svg/1200px-YAML_Logo.svg.png)

先に`docker-compose.yml`に多重コンテナに下すコマンドを設定できることを強調しました。

では、`.yml`ファイルとは何なのか？

`.yml`、`.yaml`拡張子がついているファイルはYet Another Markup Languageという一種のマークアップ言語の一形態です。

まるでPythonのようにコロンとインデントを利用して階層を構成し、特定のオブジェクト、設定値などを簡単に記述することができます。

直感的に理解するために以下の例を見てみましょう。
```yaml
car:
  name: "bus"
  color: "red"
  door: 4
  capability:
    max_weight: "4T"
    human: 10
  customers:
    - name: "Alice"
      age: 14
    - name: "Ban"
      age: 16
    - name: "Yang"
      age: 26
```

この形式の`.yaml`は以下のような`JSON`形式でも表現できます。

```json
{
  "car": {
    "name": "bus",
    "color": "red",
    "door": 4,
    "capability": {
      "max_weight": "4T"
    }
  }
}
```

このように`.yml`は階層的な形態の資料、既存の`JSON`、`XML`などのフォーマットを使ってデータを表現する際に利用しやすいファイル形式です。

### `docker-compose.yml`
では、`docker-compose.yml`を作成し、私たちが使用するコンテナを明示してみましょう。

#### `services`
まず、定義する各コンテナに関する仕様は`service`という単位で定義されます。

`.yml`フォーマットを借りて説明するとこのような形式になります。
```yaml
services:
  container_1:
    ...
  container_2:
    ...
```

#### `image`
取得するイメージを仕様する部分です。

様々な方法で欲しいイメージを取得することができます。

```yaml
# イメージ名
image: redis
# イメージ名:タグ名
image: redis:5
# イメージ名@sha256: IMAGE ID
image: redis@sha256:0ed5d5928d4737458944eb604cc8509e245c3e19d02ad83935398bc4b991aac7
# リポジトリ名/イメージ名
image: library/redis
# レジストリ名/リポジトリ名/イメージ名
image: docker.io/library/redis
# 個人レジストリアドレス:ポート番号/イメージ名
image: my_private.registry:5000/redis
```

#### `build`
`Dockerfile`を通じてコンテナを生成したい時に使用します。

```yaml
services:
  frontend:
    image: awesome/webapp
    build: ./webapp # 下位段階を指定しなければcontextの役割

  backend:
    image: awesome/database
    build:
      context: backend # Dockerfileを探索するパス
      dockerfile: ../backend.Dockerfile # ファイル名がDockerfileでない場合はファイル名を明示

  custom:
    build: ~/custom # ホームディレクトリを示す"~"も使えます。
```

1. `awesome/webapp`イメージはComposeファイルの上位フォルダ内の`./webapp`下位ディレクトリをdockerビルドコンテキストとして使用してビルドされます。 このフォルダ内に`Dockerfile`が見つからない場合、エラーが発生します。
2. `awesome/database`イメージはComposeファイルの上位フォルダ内の`./backend`下位ディレクトリを使ってビルドされます。 `backend.Dockerfile`ファイルはビルド段階を定義するために使用され、このファイル(`backend.Dockerfile`)はコンテキストパス(`./backend`)を基準に定義されています。 つまり、このサンプルの`..`の場合、Composeファイルの上位フォルダとして解釈されるので、`backend.Dockerfile`兄弟`Dockerfile`も検索対象にされます。
3. `custom`サービスはユーザーの`HOME`ディレクトリの`custom`ディレクトリを`context`として使用してビルドされます。

#### `image`と`build`が同時にある場合
`image`は明示されたイメージを基にコンテナを生成することであり、`build`は`Dockerfile`を使ってコンテナを生成することだとおっしゃいました。

しかし、`Dockerfile`でも`FROM`キーワードを通じてイメージを取得できるため、その属性が衝突しないか不安になるかもしれません。

Docker公式ドキュメントでも[これについてのセクション](https://docs.docker.com/compose/compose-file/build/#consistency-with-image)を見つけることができますが、私たちが恐れる通りその部分はどのイメージが使われるのか保証できないと明記しています。

ただし、ユーザーの別途の指示がない限り、まず`image`で定義したイメージを取得し、次にレジストリでイメージを見つけられない場合、`Dockerfile`から取得したイメージをビルドすると明記しています。

#### `depends-on`
複数のサービスを`docker-compose.yml`に定義するとき、特定のサービスが起動されてからそのサービスが起動される必要がある場合は、`depends_on: サービス名`を通じて指定できます。
```yaml
services:
  seviceA:
    ...
    depends_on: serviceB
    
  serviceB:
    ...
```

#### `entrypoint`
[Dockerfile](/docs/docker/04.dockerfile)で扱った`ENTRYPOINT`と同様の役割をします。

つまり、Dockerコンテナが実行する際の初期コマンドを定義する部分です。
> 前の章で扱ったように、そのコマンドは一度しか宣言できないので、もし`build`オプションを通じてDockerfileでも`ENTRYPOINT`を記載している場合はどちらか一方（または両方）を削除しなければなりません。

> 多くの事例で主に初期にどんなシェルを使うのかに関する定義のような部分を使用するようです。

```yaml
entrypoint: /code/entrypoint.sh
```

#### `labels`
[Dockerfile](/docs/docker/04.dockerfile/)の`LABEL`部分で調べたように、コンテナにメタデータを追加できる項目です。

### `environment`
コンテナで使用する環境変数を定義する際に使用します。

二つの方式を使用できます。

1. Map方式
```yaml
environment:
  RACK_ENV: development
  SHOW: "true"
  USER_INPUT: "hello"
```

2. Array方式
```yaml
environment:
  - RACK_ENV=development
  - SHOW=true
  - USER_INPUT=hello
```

#### `env_file`
環境変数を直接定義するのではなくファイルで定義する場合はこのオプションを使用します。

```yaml
env_file: some_env.env
```

```
# some_env.env
RACK_ENV=development
VAR="quoted"
```

この方式を使うと、環境変数をファイルの形式で管理できるため、管理がより容易になるという利点があります。

#### `command`
`Dockerfile`の`CMD`部分でも調べたように、そのサービスを担当するコンテナに下すコマンドを定義する部分です。
```yaml
command: ls -al
```
筆者はバックエンド開発者なので、バックエンド開発者の視点から両方のコマンド(`Dockerfile`:`CMD`, `docker-compose.yml`:`command`)の違いを説明してみます。 

`Dockerfile`の`CMD`は主に`pip install`、`gradle build`のようにサーバーを構成する基本要素をインストールするコマンドとして主に使用されます。
> 言ってみれば、コンテナを起動できる形態を作るということです _(しかし、必ず従う必要はありません。)_

`docker-compose.yml`の`command`は主にサーバーをデプロイするコマンド(例: `... run serve`)のようにサービスを起動するコマンドとして主に使用されます。

#### `volumes`
`volumes`はユーザーが作成したDocker Volumeや、Host PathとContainer Pathを接続することを定義したり、ボリューム自体を宣言するのに使用されます。

##### volumeの仕様
`volumes`の下位エレメントを定義する方式は簡略構文と一般構文の二つが混在します。

一般的には簡略構文を使用しますが、場合やユーザーの嗜好に応じて一般構文も使用できます。
1. 一般構文要素

|Element| Description|
|:--------:|---------------|
|`type`|Docker Volumeを使用する(`volume`)のか、Host OS pathとバインドする(`bind`)のかを定義します。|
|`source`|Volume nameやID値、またはバインドするHost OSのPathを指定します。|
|`target`|ContainerのPathを入力します。|
|`read_only`| 読み取り専用に指定した場合は設定します。

```yaml
    ...
    volumes:
      - type: volume
        source: db-data
        target: /data
    ...
```

2. 簡略構文

`VOLUME:CONTAINER_PATH:ACCESS_MODE`形式で指定します。
> `ACCESS_MODE`はデフォルトで`rw`に設定されます。

```yaml
services:
  service_1:
    image: some/image
    # Docker VolumeとContainer Pathを接続する
    volumes:
      - db-data:/etc/data

  service_2:
    image: some/image
    # ホストOSのPathとContainer Pathを接続する
    volumes:
      - .:/var/lib/backup/data
      - 
  service_3:
    image: some/image
    # ホストOSのPathとContainer Pathを接続し、Container Pathを読み取り専用に設定する
    volumes:
      - .:/var/lib/backup/data:ro
```

#### Volumeを定義する
`volumes`を通してVolumeを定義したい場合は`volumes`を`docker-compose.yml`の最上位エレメントに置けばいいです。
```yaml
# Docker Volume定義
volumes:
  db-data:
```

### `ports`
Docker CLIの`run`と`create`で使用される`-p`オプションと同じように機能します。
つまりHost OSのPortとContainer PathのPortをマッピングします。

```yaml 
    ...
    ports:
      - "8000:8000"
    ...
```

このように設定すると、Host OSの`8000`番ポートに入る全ての要求はContainerの`8000`番ポートに代わるように伝達されます。

## Docker Compose CLI
さて、コンテナを作成することだけが残っています。

`docker-compose up`コマンドを使用すると、命令したディレクトリで`docker-compose.yml`ファイルを見つけて自動的に実行します。

新しく出たDocker Compose V2では`docker compose`キーワードを使用して実行することを明記しているので、V2を使用している場合はこの点を考慮してください。

`-d`オプションを付けると、そのサービスがバックグラウンドモードで実行されます。（一般的に多く使用されます。）

`-f [COMPOSE_FILE_NAME]`オプションを通じて`docker-compose.yml`以外の特定ファイルを通じてDocker Composeを実行することができます。

`docker-compose start [SERVICE_NAME]`を使用すると、services内の特定のサービスを実行することができます。

反対に`docker-compose stop [SERVICE_NAME]`コマンドは特定のサービスを停止するコマンドです。

## 参考文献
* [Docker公式ドキュメント - Compose file Reference](https://docs.docker.com/compose/compose-file/)
* [Docker公式ドキュメント - Docker Compose CLI Reference](https://docs.docker.com/compose/reference/)