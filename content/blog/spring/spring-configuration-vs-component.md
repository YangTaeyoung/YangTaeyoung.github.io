---
title: Spring @Configuration vs @Component 어노테이션 차이에 대해 알아보기 
type: blog
date: 2024-07-09
comments: true
---
<img src="/images/spring/spring-configuration-vs-component-1720537043936.png" width="500"/>


Spring에서 의존성(Bean 클래스라고도 한다)을 등록 하는 방식은 크게 2가지가 있다. 바로 아래에서 설명할 `@Configuration`과 `@Component`이다.

Bean은 [이전 포스팅](/blog/spring/spring-bean/)에서 설명한 것과 같이 Spring IoC Container에서 관리하는 객체를 말한다.

`@Configuration`과 `@Component`는 바로 그 Bean을 등록하는 방식이다. 이 둘의 차이점에 대해 알아보자.

## `@Component` 사용하기
`@Component`는 Spring IoC Container에 Bean을 등록하는 방식 중 하나이다.

아래 3가지의 컴포넌트를 등록하는 방식을 보자
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
	String name; // 제품명
	String manufacturer; // 제조사

	// 생성자 함수
	public MainBoard() {
		this.name = "B760M Pro RS D5";
		this.manufacturer = "ASRock";
	}
}
```

```java{filename=CPU.java}
@Component
class CPU {
	String name; // 제품명
	String manufacturer; // 제조사

	// 생성자 함수
	public CPU() {
		this.name = "Ryzen7 PRO 8700GE";
		this.manufacturer = "AMD";
	}
}
```

이렇게 하면 IoC 컨테이너에 각각 `Computer`, `MainBoard`, `CPU` 클래스가 각각 Bean으로 등록된다.

해당 컴포넌트들은 어플리케이션 실행 시점에 의존성이 등록되며, 3개의 클래스가 각각 의존성을 주입 받는 것을 도표로 그리면 다음과 같다.

![image](/images/spring/spring-configuration-vs-component-1720536036710.png)


## `@Configuration`과 `@Bean` 사용하기
`@Configuration`은 Spring IoC Container에 Bean을 등록하는 방식 중 하나이다.

`@Component` 로 선언한 경우 멤버 변수로 선언된 name, manufacturer 등을 미리 초기화 했어야 했다. 만약 String 타입의 변수를 초기화 하지 않았다면 아래와 같은 에러가 발생한다.

```java
Field name in com.example.demo.product.domain.MainBoard required a bean of type 'java.lang.String' that could not be found.
```

물론 String 타입의 Bean을 등록하면 에러가 발생하지 않겠지만, String 자체는 너무 광범위하기에 Bean으로 등록해서 사용하기에 적합하지 않다.

그럼 멤버변수를 무조건 사전에 초기화 해야 사용할 수 있을까? 

그렇진 않다.

`@Configuration`을 사용하면 생성자 메서드에서 매개변수들을 유지하면서도 Bean을 등록할 수 있다.

아래 3가지 설명한 클래스는 이전에 정의했던 `@Component`를 빼고, 생성자에 각 클래스의 매개변수를 받도록 하여 초기화한다.

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
	String name; // 제품명
	String manufacturer; // 제조사

	// 생성자 함수
	public MainBoard(String name, String manufacturer) {
		this.name = name;
		this.manufacturer = manufacturer;
	}
}
```

```java{filename=CPU.java}
class CPU {
	String name; // 제품명
	String manufacturer; // 제조사

	// 생성자 함수
	public CPU(String name, String manufacturer) {
		this.name = name;
		this.manufacturer = manufacturer;
	}
}
```

이제 ComputerConfig 라는 클래스를 생성하여 `@Configuration`을 선언하고, `@Bean`을 통해 각 클래스의 Bean을 등록한다.

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

이렇게 `@Configuration`을 사용하면 생성자 메서드에서 매개변수들을 유지하면서도 Bean을 등록할 수 있다.

이처럼 Bean 을 등록하는 방식의 차이이지 사실 기술상 큰 차이는 없다.

## 각각은 언제 쓰이나?
`@Component`는 자체적으로 구현한 컴포넌트에 대해 많이 사용되는 편이다. 
예를 들어 `@Controller`, `@Repository`, `@Serivce` 등이 사용자가 구현하는 대표적인 컴포넌트의 예이다.

`@Configuration` 이름처럼 **외부 클래스의 설정을 Bean으로 등록하고자 할 때 사용**한다.

예를 들어, `@Configuration`을 사용하여 `DataSource`를 Bean으로 등록하면, `application.yaml` 등을 사용하지 않더라도 `DataSource`를 Bean으로 등록할 수 있다.
(사실 `application.yaml` 도 yaml을 읽어 Bean으로 등록하는 방식을 따르고 있으며, 이를 Spring 에서는 `AutoConfiguration`이라고 한다.)

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
```
