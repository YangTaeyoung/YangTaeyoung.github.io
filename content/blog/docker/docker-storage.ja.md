---
title: "[Docker] Docker Storageについて知ろう: Volume vs Bind Mount"
type: blog
date: 2022-07-15
weight: 4
comments: true
translated: true
---
# Docker Storage
今回はDocker Storageについて説明します。

Storageはその名の通り単純に保存領域を意味しますが、コンテナを使用する場合、従来のものよりやや複雑に感じるかもしれません。

これは開発においてStorageが非常に重要な部分であり、多くの人がコンテナベースの開発環境よりもHost OSベースの`local`開発環境を採用する理由でもあります。
> 一部の人は実際のデプロイサーバーでだけ`dockerize`するのが良いと言いますが、私は`local`開発環境にもDockerを適用した方がその真価を見られると考えます。

![image](https://user-images.githubusercontent.com/59782504/179159615-2387ae9e-5beb-40c2-8b9d-f2bfed8d9a12.png)

上記はDockerで使用するStorageを図で説明したものです。

# Bind Mount
`bind mount`は`Host OS`のファイルシステム（以下FS）と、`Container`のFSを`linking`することで、**コンテナ内部にあたかも`Host OS`のファイルがあるかのように動作**させることができます。

実際にはそのように動作し、Linuxコマンドの`ln`コマンドに似ていると言えるでしょう。

このコマンドを通じて、単にHost OSのFSを接続する用途だけでなく、コンテナ間で同じ作業空間を指す作業を進めることも可能です。

しかし、該当方式には問題点があります。

当然のことながら、`Host OS`の影響を大きく受けるということです。
> 特にWindowsのファイルシステムの場合、`C:\`、`D:\`のように始まることが一般的で、設定時にUnixやLinux系のパスとは異なる設定が必要という面倒さがあります。

~~開発時のWindowsは常に厄介です。~~

## `-v,  --volume`
前章では`create, run, exec`など、`docker`で使用可能な有用なコマンドと合わせてオプションを確認しました。
その中で`bind mount`を行うことができるオプションがこのオプションです。

```shell
$ docker [create|run|exec...] ... -v [HOST_PATH]:[CONTAINER_PATH] ...
```
上記のように使用でき、このコマンドを通じて`HOST_OS`の`Storage`と`CONTAINER`の`Storage`を接続できます。

## `--mount`
使い方と用途が似たコマンドで、ほぼ同様に動作しますが、違いがあるとすれば、`[HOST_PATH]`がない場合には実行されず、例外を返すという点です。
`-v`オプションの場合は**エンドポイントパスを自動で生成**します。
```shell
# Example
# $(pwd): 現在の作業ディレクトリパスを表します。
# -- mount 使用時
$ docker run -d \
  -it \
  --name devtest \
  --mount type=bind,source="$(pwd)"/target,target=/app \
  nginx:latest
  
# -v 使用時
 $ docker run -d \
  -it \
  --name devtest \
  -v "$(pwd)"/target:/app \
  nginx:latest
```
### Parameter
> `--mount`オプションで使用するパラメータは次の通りです。

|Param|Description|
|:-------:|--------------------------------------|
|`type`|\[`volume`\|`bind`\] `volume`を使用するか、`bind mount`を使用するかの選択|
|`source`|`HOST_PATH`|
|`target`|`CONTAINER_PATH`|

# Docker Volume
[Docker公式ドキュメント](https://docs.docker.com/storage/volumes/)によると、Docker Volumeは**コンテナで生成し使用するデータを維持するための基本メカニズムと定義**されています。

類似の概念として前述の`bind mount`があります。

ただし、この概念は`Host OS`のFSを直接使用するのではなく、`Docker`が管理する`Storage`という点で違いがあります。

つまりOSに関係なく保存領域をコンテナ間で共有できます。

ただし、正確な用途としては`Host OS`と接続するより、**複数のコンテナでそのVolumeのファイルを共有する必要がある場合に利用するといったのがより適しています。**
> 例えば、特定の設定ファイルなどが該当します。変更時にリアルタイムで反映される必要がないものに対して有用です。

## 長所
[Docker公式ドキュメント](https://docs.docker.com/storage/volumes/)では、Docker Volumeは前述のbind mountより以下のような長所があると説明されています。

1. ボリュームはバインドマウントよりバックアップまたはマイグレーションが簡単です。
2. Docker CLIコマンドまたはDocker APIを使用してボリュームを管理することができます。
3. ボリュームはLinuxおよびWindowsコンテナで動作します。
4. 複数のコンテナ間でボリュームをより安全に共有できます。
5. ボリュームドライバーを使用すると、リモートホストまたはクラウドプロバイダーにボリュームを保存し、ボリュームの内容を暗号化したり他の機能を追加することができます。
6. 新しいボリュームのコンテンツはコンテナによって事前に埋め込むことができます。
7. Docker Desktopのボリュームは、MacおよびWindowsホストのバインドマウントに比べてはるかに高いパフォーマンスを持っています。

## 作成

では、Docker Volumeを作ってみましょう。
```shell
$ docker volume create my-vol
```
上記コマンドで簡単にVolumeを作ることができます。
```shell
$ docker volume inspect my-vol
[
    {
        "CreatedAt": "2022-07-18T23:53:04Z",
        "Driver": "local",
        "Labels": {},
        "Mountpoint": "/var/lib/docker/volumes/my-vol/_data",
        "Name": "my-vol",
        "Options": {},
        "Scope": "local"
    }
]
```
`docker volume inspect [VOL_NAME]`コマンドは、存在するボリュームの詳細を確認します。
## 削除
```shell
$ docker volume rm my-vol
```
簡単なコマンドで作成したVolumeを削除することができます。
# Reference
* [Docker公式ドキュメント - Storage Overview](https://docs.docker.com/storage/)
```