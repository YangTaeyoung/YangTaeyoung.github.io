---
title: Spring @Configuration と @Component アノテーションの違いを見てみよう
type: blog
date: 2024-07-09
comments: true
translated: true
---
<img src="/images/spring/spring-configuration-vs-component-1720537043936.png" width="500"/>

Springで依存性（Beanクラスとも呼ばれる）を登録する方法は大きく2つある。すぐに説明する`@Configuration`と`@Component`である。

Beanは[以前の投稿](/blog/spring/spring-bean/)で説明したように、Spring IoC Containerで管理されるオブジェクトを指す。

`@Configuration`と`@Component`はそのBeanを登録する方法である。この2つの違いについて調べてみよう。

## `@Component`を使う
`@Component`はSpring IoC ContainerにBeanを登録する方法の1つである。

以下に3つのコンポーネントを登録する方法を見てみよう。
```java{filename=Computer.java}
@Component
public class Computer {
	MainBoard mainBoard;
	CPU cpu;

	public Computer(MainBoard mainboard, CPU cpu) {
		this.cpu = cpu;
		this.mainBoard = mainBoard;
	}

	void printComputerInfo() {
		System.out.println("CPU Name:" + cpu.name);
		System.out.println("CPU Manufacturer:" + cpu.manufacturer);
		System.out.println("Main board Name:" + mainBoard.name);
		System.out.println("Main board Manufacturer:" + mainBoard.manufacturer);
	}
}
```

```java{filename=MainBoard.java}
@Component
public class MainBoard {
	String name; // 製品名
	String manufacturer; // 製造業者

	// コンストラクタ関数
	public MainBoard() {
		this.name = "B760M Pro RS D5";
		this.manufacturer = "ASRock";
	}
}
```

```java{filename=CPU.java}
@Component
class CPU {
	String name; // 製品名
	String manufacturer; // 製造業者

	// コンストラクタ関数
	public CPU() {
		this.name = "Ryzen7 PRO 8700GE";
		this.manufacturer = "AMD";
	}
}
```

このようにすると、IoCコンテナにそれぞれ`Computer`、`MainBoard`、`CPU`クラスが個別のBeanとして登録される。

これらのコンポーネントはアプリケーション実行時点で依存性が登録され、3つのクラスがそれぞれ依存性を注入されることを図にすると以下の通りである。

![image](/images/spring/spring-configuration-vs-component-1720536036710.png)

## `@Configuration`と`@Bean`を使う
`@Configuration`もSpring IoC ContainerにBeanを登録する方法の1つである。

`@Component`で宣言した場合、メンバ変数として宣言されたname、manufacturerなどを事前に初期化する必要がある。もしString型の変数を初期化しなかった場合、以下のようなエラーが発生する。

```java
Field name in com.example.demo.product.domain.MainBoard required a bean of type 'java.lang.String' that could not be found.
```

もちろんString型のBeanを登録すればエラーは発生しないが、String自体は非常に広範であるため、Beanとして登録して使用するには適していない。

では、メンバ変数を必ず事前に初期化しなければならないのか？

そうではない。

`@Configuration`を使用すると、コンストラクタメソッドで引数を保持しながらBeanを登録することができる。

以下の3つの説明したクラスは以前に定義した`@Component`を外し、コンストラクタに各クラスの引数を受け取るように初期化する。

```java{filename=Computer.java}
public class Computer {
	MainBoard mainBoard;
	CPU cpu;

	public Computer(MainBoard mainboard, CPU cpu) {
		this.cpu = cpu;
		this.mainBoard = mainBoard;
	}

	void printComputerInfo() {
		System.out.println("CPU Name:" + cpu.name);
		System.out.println("CPU Manufacturer:" + cpu.manufacturer);
		System.out.println("Main board Name:" + mainBoard.name);
		System.out.println("Main board Manufacturer:" + mainBoard.manufacturer);
	}
}
```

```java{filename=MainBoard.java}
public class MainBoard {
	String name; // 製品名
	String manufacturer; // 製造業者

	// コンストラクタ関数
	public MainBoard(String name, String manufacturer) {
		this.name = name;
		this.manufacturer = manufacturer;
	}
}
```

```java{filename=CPU.java}
class CPU {
	String name; // 製品名
	String manufacturer; // 製造業者

	// コンストラクタ関数
	public CPU(String name, String manufacturer) {
		this.name = name;
		this.manufacturer = manufacturer;
	}
}
```

そして、ComputerConfigというクラスを作成して`@Configuration`を宣言し、`@Bean`を通じて各クラスのBeanを登録する。

```java{filename=ComputerConfig.java}
@Configuration
public class ComputerConfig {
    @Bean
    public Computer computer(MainBoard mainBoard, CPU cpu) {
        return new Computer(mainBoard, cpu);
    }

    @Bean
    public MainBoard mainBoard() {
        return new MainBoard("B760M Pro RS D5", "ASRock");
    }

    @Bean
    public CPU cpu() {
        return new CPU("Ryzen7 PRO 8700GE", "AMD");
    }
}
```

このように`@Configuration`を使うと、コンストラクタメソッドで引数を保持しつつBeanを登録することができる。

このようにBeanを登録する方法の違いであって、実際には技術的に大きな違いはない。

## それぞれはいつ使われるのか？
`@Component`は独自実装したコンポーネントについて多く使用される傾向がある。たとえば、`@Controller`、`@Repository`、`@Serivce`などがユーザーが実装する代表的なコンポーネントの例である。

`@Configuration`は名前の通り、**外部クラスの設定をBeanとして登録したいときに使用**される。

たとえば、`@Configuration`を使用して`DataSource`をBeanとして登録すると、`application.yaml`を使用しなくても`DataSource`をBeanとして登録することができる。（実際には`application.yaml`もyamlを読み込んでBeanとして登録する方法を取っており、これをSpringでは`AutoConfiguration`と呼んでいる。）

```java{filename=DataSourceConfig.java}
@Configuration
public class DataSourceConfig {
    @Bean
    public DataSource dataSource() {
        return DataSourceBuilder.create()
                .url("jdbc:mysql://localhost:3306/test")
                .username("root")
                .password("password")
                .build();
    }
}
