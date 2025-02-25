---
title: Découvrir la différence entre les annotations @Configuration et @Component dans Spring
type: blog
date: 2024-07-09
comments: true
translated: true
---
<img src="/images/spring/spring-configuration-vs-component-1720537043936.png" width="500"/>

Il existe principalement deux façons de déclarer les dépendances (également appelées classes Bean) dans Spring : `@Configuration` et `@Component`, comme expliqué ci-dessous.

Un Bean est un objet géré par le conteneur Spring IoC, comme expliqué dans [un article précédent](/blog/spring/spring-bean/).

Et `@Configuration` et `@Component` sont les moyens de déclarer ces Beans. Voyons la différence entre les deux.

## Utilisation de `@Component`
`@Component` est l'une des méthodes pour enregistrer des Beans dans le conteneur Spring IoC.

Voyons comment enregistrer trois composants de cette manière :
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
		System.out.println("Nom du CPU:" + cpu.name);
		System.out.println("Fabricant du CPU:" + cpu.manufacturer);
		System.out.println("Nom de la carte mère:" + mainBoard.name);
		System.out.println("Fabricant de la carte mère:" + mainBoard.manufacturer);
	}
}
```

```java{filename=MainBoard.java}
@Component
public class MainBoard {
	String name; // Nom du produit
	String manufacturer; // Fabricant

	// Constructeur
	public MainBoard() {
		this.name = "B760M Pro RS D5";
		this.manufacturer = "ASRock";
	}
}
```

```java{filename=CPU.java}
@Component
class CPU {
	String name; // Nom du produit
	String manufacturer; // Fabricant

	// Constructeur
	public CPU() {
		this.name = "Ryzen7 PRO 8700GE";
		this.manufacturer = "AMD";
	}
}
```

De cette manière, les classes `Computer`, `MainBoard`, et `CPU` sont chacune enregistrées en tant que Beans dans le conteneur IoC.

Chaque composant a ses dépendances enregistrées au moment de l'exécution de l'application. Voici un diagramme illustrant l'injection de dépendances pour ces trois classes :

![image](/images/spring/spring-configuration-vs-component-1720536036710.png)


## Utilisation de `@Configuration` et `@Bean`
`@Configuration` est une autre méthode pour enregistrer des Beans dans le conteneur Spring IoC.

Lorsque nous utilisons `@Component`, nous devons initialiser à l'avance les variables membres telles que name et manufacturer. Sinon, si nous ne le faisons pas pour les variables de type String, nous rencontrerons l'erreur suivante :

```java
Field name in com.example.demo.product.domain.MainBoard required a bean of type 'java.lang.String' that could not be found.
```

Bien sûr, si nous enregistrons le type String en tant que Bean, il n'y aurait pas d'erreur, mais String lui-même est trop général pour être utilisé comme Bean.

Alors, les variables membres doivent-elles toujours être initialisées à l'avance pour être utilisées ? Non, ce n'est pas nécessaire.

Avec `@Configuration`, vous pouvez enregistrer des Beans tout en maintenant les paramètres dans le constructeur de la méthode.

Les trois classes décrites ci-dessous retirent `@Component` que nous avons défini auparavant et utilisent les paramètres de constructeur pour chaque classe pour l'initialisation.

```java{filename=Computer.java}
public class Computer {
	MainBoard mainBoard;
	CPU cpu;

	public Computer(MainBoard mainboard, CPU cpu) {
		this.cpu = cpu;
		this.mainBoard = mainBoard;
	}

	void printComputerInfo() {
		System.out.println("Nom du CPU:" + cpu.name);
		System.out.println("Fabricant du CPU:" + cpu.manufacturer);
		System.out.println("Nom de la carte mère:" + mainBoard.name);
		System.out.println("Fabricant de la carte mère:" + mainBoard.manufacturer);
	}
}
```

```java{filename=MainBoard.java}
public class MainBoard {
	String name; // Nom du produit
	String manufacturer; // Fabricant

	// Constructeur
	public MainBoard(String name, String manufacturer) {
		this.name = name;
		this.manufacturer = manufacturer;
	}
}
```

```java{filename=CPU.java}
class CPU {
	String name; // Nom du produit
	String manufacturer; // Fabricant

	// Constructeur
	public CPU(String name, String manufacturer) {
		this.name = name;
		this.manufacturer = manufacturer;
	}
}
```

Créons maintenant une classe appelée ComputerConfig où nous déclarons `@Configuration` et enregistrons chaque classe en tant que Bean via `@Bean`.

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

En utilisant `@Configuration`, vous pouvez enregistrer des Beans tout en conservant les paramètres dans le constructeur de la méthode.

C'est une question de différence de méthode pour enregistrer des Beans, mais techniquement, il n'y a pas de grande différence.

## Quand utiliser chacun d'eux ?
`@Component` est couramment utilisé pour les composants propres à l'utilisateur. Par exemple, `@Controller`, `@Repository`, `@Service` sont des exemples de composants couramment implantés par les utilisateurs.

`@Configuration` est, comme son nom l'indique, utilisé pour **enregistrer les configurations de classes externes en tant que Bean**.

Par exemple, en utilisant `@Configuration` pour enregistrer un `DataSource` en tant que Bean, il n'est pas nécessaire de passer par `application.yaml` pour faire cela.
(En réalité, `application.yaml` suit également cette méthode de lecture YAML et son enregistrement sous forme de Bean, que Spring appelle `AutoConfiguration`.)

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
