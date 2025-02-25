---
title: Exploring the Differences Between Spring @Configuration and @Component Annotations
type: blog
date: 2024-07-09
comments: true
translated: true
---
<img src="/images/spring/spring-configuration-vs-component-1720537043936.png" width="500"/>

In Spring, there are mainly two ways to register dependencies (also known as Bean classes). These are the `@Configuration` and `@Component`, which will be discussed below.

A Bean refers to an object managed by the Spring IoC Container, as explained in [a previous post](/blog/spring/spring-bean/).

`@Configuration` and `@Component` are methods for registering these Beans. Let's explore the differences between them.

## Using `@Component`
`@Component` is one method to register a Bean in the Spring IoC Container.

Let's look at the methods of registering the three components below:
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
    String name; // product name
    String manufacturer; // manufacturer

    // constructor
    public MainBoard() {
        this.name = "B760M Pro RS D5";
        this.manufacturer = "ASRock";
    }
}
```

```java{filename=CPU.java}
@Component
class CPU {
    String name; // product name
    String manufacturer; // manufacturer

    // constructor
    public CPU() {
        this.name = "Ryzen7 PRO 8700GE";
        this.manufacturer = "AMD";
    }
}
```

With this setup, the classes `Computer`, `MainBoard`, and `CPU` are each registered as Beans in the IoC container.

These components are registered when the application runs, and if you visualize the dependencies injected into each of the three classes, it would look like the chart below.

![image](/images/spring/spring-configuration-vs-component-1720536036710.png)

## Using `@Configuration` and `@Bean`
`@Configuration` is another method to register Beans in the Spring IoC Container.

When using `@Component`, you had to pre-initialize member variables such as name and manufacturer. If a String type variable was not initialized, the following error would occur:

```java
Field name in com.example.demo.product.domain.MainBoard required a bean of type 'java.lang.String' that could not be found.
```

Although registering a Bean of type String would prevent this error, the String type itself is too broad to be suitable for Bean registration.

So, do you have to pre-initialize member variables to use them?

Not necessarily.

When using `@Configuration`, you can register Beans while maintaining parameters in the constructor methods.

The following three class definitions remove `@Component` from earlier and initialize by receiving parameters in their constructors.

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
    String name; // product name
    String manufacturer; // manufacturer

    // constructor
    public MainBoard(String name, String manufacturer) {
        this.name = name;
        this.manufacturer = manufacturer;
    }
}
```

```java{filename=CPU.java}
class CPU {
    String name; // product name
    String manufacturer; // manufacturer

    // constructor
    public CPU(String name, String manufacturer) {
        this.name = name;
        this.manufacturer = manufacturer;
    }
}
```

Now, create a class called ComputerConfig, declare `@Configuration`, and register each class as a Bean using `@Bean`.

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

Using `@Configuration`, you can register Beans while maintaining parameters in the constructor methods.

The difference is essentially in the method of Bean registration, as there is no significant technical difference.

## When is each used?
`@Component` is often used for self-implemented components. Examples of components typically implemented by users are `@Controller`, `@Repository`, and `@Service`.

`@Configuration` is used to register the settings of external classes as Beans, as its name suggests.

For example, using `@Configuration` to register `DataSource` as a Bean allows it to be registered as a Bean without using `application.yaml`. (In fact, `application.yaml` also follows the method of reading yaml files and registering them as Beans, and this is called `AutoConfiguration` in Spring.)

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
