---
title: Erkundung der Unterschiede zwischen den Spring-Anmerkungen @Configuration und @Component
type: blog
date: 2024-07-09
comments: true
translated: true
---
<img src="/images/spring/spring-configuration-vs-component-1720537043936.png" width="500"/>

Es gibt grundsätzlich zwei Möglichkeiten, wie man in Spring Abhängigkeiten (auch Bean-Klassen genannt) registrieren kann: `@Configuration` und `@Component`, die wir im Folgenden erläutern werden.

Ein Bean ist, wie in [einem früheren Beitrag](/blog/spring/spring-bean/) erklärt, ein Objekt, das vom Spring IoC-Container verwaltet wird.

`@Configuration` und `@Component` sind Möglichkeiten, genau diese Beans zu registrieren. Lassen Sie uns die Unterschiede zwischen diesen beiden Anmerkungen erkunden.

## Verwendung von `@Component`
`@Component` ist eine der Möglichkeiten, um Beans im Spring IoC-Container zu registrieren.

Schauen wir uns die Registrierung der folgenden drei Komponenten an:
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
		System.out.println("CPU Hersteller:" + cpu.manufacturer);
		System.out.println("Hauptplatine Name:" + mainBoard.name);
		System.out.println("Hauptplatine Hersteller:" + mainBoard.manufacturer);
	}
}
```

```java{filename=MainBoard.java}
@Component
public class MainBoard {
	String name; // Produktname
	String manufacturer; // Hersteller

	// Konstruktor
	public MainBoard() {
		this.name = "B760M Pro RS D5";
		this.manufacturer = "ASRock";
	}
}
```

```java{filename=CPU.java}
@Component
class CPU {
	String name; // Produktname
	String manufacturer; // Hersteller

	// Konstruktor
	public CPU() {
		this.name = "Ryzen7 PRO 8700GE";
		this.manufacturer = "AMD";
	}
}
```

Mit dieser Methode werden die `Computer`, `MainBoard` und `CPU` Klassen jeweils im IoC-Container als Beans registriert.

Diese Komponenten werden zum Zeitpunkt der Ausführung der Applikation registriert, und wenn wir die Abhängigkeiten in einem Diagramm darstellen, sieht es folgendermaßen aus:

![image](/images/spring/spring-configuration-vs-component-1720536036710.png)

## Verwendung von `@Configuration` und `@Bean`
`@Configuration` ist eine weitere Methode zur Registrierung von Beans im Spring IoC-Container.

Im Gegensatz zur Deklaration mit `@Component`, bei der die als Member-Variablen deklarierten Namen, Hersteller usw. vorab initialisiert sein müssen, tritt ein Fehler auf, wenn String-Variablen nicht initialisiert wurden:

```java
Field name in com.example.demo.product.domain.MainBoard required a bean of type 'java.lang.String' that could not be found.
```

Obwohl ein Fehler vermieden werden kann, indem ein String-Typ als Bean registriert wird, ist der String an sich zu umfangreich, um als Bean verwendet zu werden.

Muss man die Membervariablen daher zwingend vorab initialisieren?

Nein, das ist nicht der Fall.

Mit `@Configuration` können Sie die Beans registrieren, während Sie die Parameter im Konstruktormethode beibehalten.

Unten sind die drei Klassen beschrieben, ohne `@Component`, dafür werden die Parameter in den Konstruktormethoden zur Initialisierung verwendet:

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
		System.out.println("CPU Hersteller:" + cpu.manufacturer);
		System.out.println("Hauptplatine Name:" + mainBoard.name);
		System.out.println("Hauptplatine Hersteller:" + mainBoard.manufacturer);
	}
}
```

```java{filename=MainBoard.java}
public class MainBoard {
	String name; // Produktname
	String manufacturer; // Hersteller

	// Konstruktor
	public MainBoard(String name, String manufacturer) {
		this.name = name;
		this.manufacturer = manufacturer;
	}
}
```

```java{filename=CPU.java}
class CPU {
	String name; // Produktname
	String manufacturer; // Hersteller

	// Konstruktor
	public CPU(String name, String manufacturer) {
		this.name = name;
		this.manufacturer = manufacturer;
	}
}
```

Erstellen Sie nun eine Klasse namens ComputerConfig, deklarieren Sie `@Configuration` und registrieren Sie die Beans mit `@Bean`.

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

Durch die Verwendung von `@Configuration` können Sie die Beans registrieren, während Sie die Parameter im Konstruktormethode beibehalten.

Die Unterschiede in der Registrierung der Beans selbst sind kein großes technisches Problem.

## Wann verwendet man welches?
`@Component` wird häufig für selbst erstellte Komponenten verwendet. Beispiele hierfür sind `@Controller`, `@Repository`, `@Service`, die typische Beispiele für vom Benutzer implementierte Komponenten sind.

`@Configuration` wird entsprechend seinem Namen verwendet, wenn **Einstellungen von externen Klassen als Beans registriert werden sollen**.

Zum Beispiel kann `@Configuration` verwendet werden, um `DataSource` als Bean zu registrieren, auch ohne Verwendung von `application.yaml` Datei.
(Tatsächlich folgt auch `application.yaml` dem Prinzip, indem es YAML als Bean registriert, was in Spring als `AutoConfiguration` bezeichnet wird.)

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
