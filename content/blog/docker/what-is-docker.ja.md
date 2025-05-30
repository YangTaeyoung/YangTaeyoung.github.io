---
title: "[Docker] Dockerについて学ぶ"
type: blog
date: 2022-07-11
weight: 1
comments: true
translated: true
---
# Dockerとは何か？

![img.png](/images/docker/img_9.png)

[AWS](https://aws.amazon.com/) の定義を借りると、Dockerはアプリケーションを迅速に構築、テスト、デプロイできるソフトウェアプラットフォームです。

Dockerは、コンテナという概念を使用して、従来の重いオペレーティングシステムや仮想マシンで動作するアプリケーションを軽量化し、様々な問題を解決しています。

最近では、Dockerがローカルだけでなく、さまざまなクラウド環境でも活用されています。

例えば、AWSでもDockerイメージを用いてデプロイが可能であり、Github ActionsでもDockerをインストールしてデプロイの自動化、簡単なデプロイ作業を行うことができます。

## Dockerはどのような問題を解決するのか？
開発環境を構築する際に自身の開発環境を整えると、多くの問題に直面します。

私は以前のプロジェクトで、あるチームメンバーが`Python`で`Maria DB`を使用するために`mysqlclient`というモジュールをインストールする過程でエラーが発生し、トラブルシューティングを行う過程でPythonという言語がバージョンに非常に敏感であることを知りました。

プロジェクトの開始時はPython 3.8バージョンが登場した頃で、彼はエラーが発生した時点ではPython 3.10を使用していました。

実際には`mysqlclient`モジュールはPython 3.9までしか対応しておらず、彼のPythonは3.10バージョンでした。

このような問題は、Pythonという特定の言語環境でのみ発生するわけではありません。

特にOSが異なる場合、OSのバージョンが異なる場合にはこのような状況が頻繁に発生することがあります。例えば、以下のようなことが起こるかもしれません。

1. Windows開発者はVSのCを使用します。
2. Linux開発者はgccコンパイラを使用します。

```cpp
#include<stdio.h>
#include<stdlib.h>

int add(int num,...)
{
    int a, b, anw=0;
    int* point=NULL;

    point=&num+1;

    for(a=0;a<=num;a++)
    {
        anw+=point[a];
    }
    return anw;
}
```
VSでは上記の関数は単純に最初の引数numを活用し、その後に続くパラメータを可変引数のように使用してパラメータをすべて加算する関数ですが、

GCCではこの表記方法をサポートしておらず、ゴミのような値が返されます。

このように使用する開発環境、コンパイラ、バージョンを一致させるために、開発者はコンベンションや環境設定ファイルで管理することができますが、これも良い方法とは言えません。

1. 新バージョンに優れた機能やセキュリティパッチなどが存在しており、アップデートする必要がある状況でアップデートを阻止することができます。
> この場合、すべての開発者がバージョンを合わせるためにモジュールを更新する必要があります。面倒なことこの上ありません。
2. 新しく新規開発者が投入された場合、そのバージョンに関するエラー、開発環境のセットアップを最初から最後まで行う必要があります。
> 開発者の人件費も高いため、人的リソースの無駄です。

# 仮想マシン（Virtual Machine）
それではこれを簡単にする方法はないのでしょうか？

これに対する最初の代替案として提示されたのが**仮想マシン**です。

OSを仮想化して、CPUから独立して動作させると簡単に理解しておきましょう。
仮想マシンを使用すると、開発環境や特定のモジュール、バージョンなどが既にインストールされたOSをイメージの形で作成して管理できます。

万能の解決策に見えますが、仮想マシンにも**問題**があります。

_**それはリソースの無駄遣いという点です。**_

多くのOSは私が開発するツールや環境だけでなく、それぞれの独立したプログラムを一緒に含んでいます。
ある種のコンピュータを私のコンピュータの中で実行するようなものだと言っても過言ではありません。

`HyperVisor`というものがあります。HyperVisorはコンピュータが持つインフラリソースを仮想マシンごとに割り当てる役割を果たします。
インフラリソースを割り当てられた各仮想マシンは独立したゲストOSを持っています。

![img_1.png](/images/docker/img_1.png)

上記の写真を見ると、各VMごとに割り当てられたOSが目を引きます。これは前述の不要なリソースを増大させ、リソースの無駄遣いと述べました。

# コンテナ
それではコンテナはどうでしょうか？
コンテナは自身のOSつまりホスト上でまるでそれぞれの**独立したプログラムのように実行**され、管理されます。

各コンテナはDockerエンジンの下でそれぞれ独立して実行されるため、OSを作成する作業やインフラを独立して分配する必要がなく、拡張性が良く、迅速です。

![img.png](/images/docker/img_0.png)

また、マイグレーション、バックアップ、転送が簡単です。VMに比べてサイズが小さいためです。

**"これで新入開発者は複数の仮想マシンをインストールしてコンピュータが遅くなる心配をしなくて済むようになりました。"**

_~~コンテナを管理すればいいから~~_

# Docker
もう一度本題に戻りましょう。それではDockerとは何でしょうか？

Dockerは前述のコンテナベースのオープンソース仮想化プラットフォームの一つです。
これはOSだけでなく、DB、コンパイラ、インタープリターなどの開発に必要なさまざまなインフラがすでにDockerでイメージの形で提供されています。
> _このインフラの素晴らしさを知りたかったら[Docker Hub](https://hub.docker.com/)を少し見てみるといいでしょう_

![img_2.png](/images/docker/img_2.png)

#### イメージ
Dockerのコンテナは各アプリケーションをパッケージングし、実行する機能を提供します。
> これがDockerの強力なイメージ（`image`）です。イメージはコンテナをパッケージングした結果物です。

#### ボリューム、バインド
ホストのストレージを直接`バインド`して使用することもでき、Dockerの仮想化されたストレージ内に（実際はホストのストレージに）`ボリューム`を作成し、他のコンテナと共有して使用することもできます。

このような強力な特徴は何を示唆しているかというと、私の開発ストレージ（Git、SVNなど）を仮想化されたOSの中に直接入れなくても、ゆるやかにリンクさせることで開発内容をリアルタイムで反映できることを意味します。

#### Dockerレジストリー
前述のDocker Hubを通じてビルドされたイメージをダウンロードして使用できると述べました。Dockerレジストリーはイメージを保存する場所であり、Docker HubはDockerを使用するユーザーの共用レジストリーです。

# 参考文献
- [コンテナおよびDocker概念整理 - geunwoobaek.log](https://velog.io/@geunwoobaek/%EC%BB%A8%ED%85%8C%EC%9D%B4%EB%84%88-%EB%B0%8F-%EB%8F%84%EC%BB%A4-%EA%B0%9C%EB%85%90%EC%A0%95%EB%A6%AC)
- [Docker公式ドキュメント](https://docs.docker.com/get-started/overview/)
- [初心者のためのDockerガイド - Dockerとは何か？ - subicura](https://subicura.com/2017/01/19/docker-guide-for-beginners-1.html)
- [Dockerコンテナの状態 - baeldung](https://www.baeldung.com/ops/docker-container-states)