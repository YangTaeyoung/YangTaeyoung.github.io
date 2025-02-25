---
title: Verwaltung von Config-Dateien in AWS mit AWS Secrets Manager
type: blog
date: 2023-03-01
comments: true
translated: true
---
## Einführung

![image](https://user-images.githubusercontent.com/110372475/221461996-0050ebf2-c12b-4409-9b08-9a37f4ef98a0.png)

Es gibt einige Probleme, die mir bisher nicht bewusst waren, aber ständig Unannehmlichkeiten verursacht haben. Alle Secrets, die auf dem Server verwendet werden, wurden in einer Datei namens `config.yaml` gespeichert.

"Kann man diese wirklich als Quelle in Github speichern?" fragte ich mich.

Github bietet die Möglichkeit, verschiedene Secrets zu verwalten, die in einem Repository verwendet werden, durch die Github Secrets Funktion. Trotzdem hatte ich das Gefühl, diese Informationen wären ungeschützt ausgesetzt.

## Erste Überlegung: Github Secrets
<img src="https://user-images.githubusercontent.com/110372475/221621596-913cfcac-2838-4fc8-927f-7e878e305699.png" width="700" >

- Ich habe darüber nachgedacht, alle Variablen, die beim Build benötigt werden, durch die Secrets-Funktion von Github zu verbergen.
- Diese Methode könnte zwar hilfreich sein, um bestimmte Variablen zu verbergen, allerdings ist es schwierig, später zu erkennen, wann diese Variablen injiziert werden. Zudem funktioniert es nur innerhalb der beschränkten Umgebung von Github, daher schien ein allgemeiner nutzbarer Ansatz notwendig.

### Ziel 
Während ich über verschiedene Ansätze nachdachte, legte ich folgende drei Kriterien fest, um ein Tool zur Verwaltung von Secrets zu wählen:
1. Es sollte einfach zu bedienen und der Einstieg so unkompliziert sein, dass andere Teammitglieder es sofort nutzen können.
2. Es sollte eine allgemeine Methode bieten, die in verschiedenen Services verwendet werden kann.
3. Overengineering sollte vermieden werden, und es sollte minimalen Änderungen erfordern, um `config` zu lesen und zu nutzen.

## ChatGPT
- Mir fehlte das Wissen, also musste ich zunächst nach Alternativen suchen. Früher hätte ich Google zu Rate gezogen, aber ich nutzte das Explorationstool ChatGPT.
  
  ![image](https://user-images.githubusercontent.com/110372475/221455824-51d03bb1-b435-4f42-bba1-5c8341b33fec.png)

- Vault und Key-Management-Systeme, die von anderen Cloud-Diensten bereitgestellt werden, fielen mir auf. Da Acloset viele der von AWS angebotenen Dienste nutzt, beschlossen wir, einen Blick auf den **AWS Secret Manager** zu werfen, der gut zu AWS passen könnte.

  ![image](https://user-images.githubusercontent.com/110372475/221455783-4bc87a38-8595-4e1b-a2ef-9c0f6ceb00ab.png)

- Ich erhielt einen Überblick über die Haupt- und Nebenfunktionen.

# AWS Secrets Manager
- Zögern bei der Entwicklung bringt nichts! Also habe ich es sofort ausprobiert.

    ![image](https://user-images.githubusercontent.com/110372475/221467919-61627571-0f44-4918-a441-139b1ef247a4.png)

## Schritte
- Es war nicht nur möglich, einfache Schlüssel-Wert-Speicher zu erstellen, sondern auch AWS RDS-Informationen und andere Datenbankinformationen durch Eingabe von Adresse und Port zu konfigurieren.

    ![image](https://user-images.githubusercontent.com/110372475/221456439-08cd0a8c-b1f8-4b98-9f42-d83c84d0a1d7.png)

- Da das Ziel darin besteht, die aktuell im Dienst verwendete `config.yaml` zu verschlüsseln, wählte ich eine andere Art von Sicherheitsschlüssel.

    ![image](https://user-images.githubusercontent.com/110372475/221456728-ea826bf5-3f66-4aa9-9478-1d2d7bf523bc.png)

- Wenngleich man durch die von AWS erstellten Schlüssel-Wert-Paare auch Verschlüsselungen erzeugen kann, entschied ich mich dafür, den gesamten Text der `config.yaml` einzugeben und klickte dazu auf Plain Text.

    ![image](https://user-images.githubusercontent.com/110372475/221456850-07141a1d-d107-46f5-a427-175296077547.png)

- Obwohl der Standardwert als `{}` eingegeben ist und man vielleicht denken könnte, dass nur das Json-Format möglich ist, ist eigentlich jeder Text möglich. Ich habe den kompletten Inhalt unserer Server-`config.yaml` dort eingefügt.
    
    <img width="805" alt="image" src="https://user-images.githubusercontent.com/59782504/222074513-7325db67-a963-4909-85ee-1740500d5b04.png">

- Anschließend folgt die Konfiguration des Sicherheitsschlüssels. Da der Name des Sicherheitsschlüssels der Schlüssel ist, der vom AWS-Client verwendet wird, um auf das Secret zuzugreifen, sollte dieser weise gewählt werden. Ich habe ihn als `someapp/config/dev` eingegeben.

    <img width="629" alt="image" src="https://user-images.githubusercontent.com/59782504/222074935-86ef9875-57c0-43f4-ad2f-b737b5478d87.png">

- Der letzte Schritt: Zurzeit wird kein Rotation Setting vorgenommen, aber es scheint eine nützliche Funktion zu sein, die man in Zukunft in einer Rotation-Umgebung oder für Schlüssel, die regelmäßig rotiert werden müssen, nutzen kann. Ohne zusätzliche Einstellungen wird gespeichert.

    ![image](https://user-images.githubusercontent.com/110372475/221457261-341c6d75-f4cb-4893-b6fe-f2eb4f47d51c.png)

### Secret Rotation
- Während einige Secrets, wie DB-Informationen oder Passwörter, statisch sind, gibt es auch dynamische Secrets, z.B. API-Token von externen Diensten.
- AWS Secrets Manager bietet eine komfortable Methode, um solche dynamischen Schlüssel regelmäßig zu aktualisieren und zu speichern, indem es AWS Lambda-Funktionen bereitstellt.

# Server
- Jetzt sind alle Configs im SecretManager, doch der AWS Access Key ID und AWS Secret Access Key werden auf dem Server verwaltet. Um darüber nachzudenken, wie sie zur Buildzeit injiziert werden können, entschied ich mich für Github Secrets.

## Injizierungsszenario
- Das grundlegende Geheimnisinjektionsszenario wurde wie folgt festgelegt:

  <img width="663" alt="image" src="https://user-images.githubusercontent.com/59782504/222076002-ac982043-c9a9-4478-8a7f-860bacb27cc8.png">

    
## Schritte
### Aktionen
Wir ändern die Argumente während des Builds in Github Actions.
```yaml
      - name: Build and push
        uses: docker/build-push-action@v2
        with:
          context: .
          push: true
	  {% raw %}
          tags: ${{ env.ECR_REGISTRY }}/${{ env.ECR_REPOSITORY }}:${{ env.IMAGE_TAG }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            ARG_ENVIRONMENT=${{ env.ENVIRONMENT }}
            ARG_AWS_REGION=${{ env.AWS_REGION }}
            ARG_AWS_ACCESS_KEY_ID=${{ secrets.AWS_ACCESS_KEY_ID }}
            ARG_AWS_SECRET_ACCESS_KEY=${{ secrets.AWS_SECRET_ACCESS_KEY }}
	  {% endraw %}
```
Anstatt den ursprünglichen CONFIG_FILE Pfad zu injizieren, erhielten wir die Informationen für den Zugriff auf AWS: Region, AWS Access Key ID, AWS Secret Access Key und Environment, die jenes kontrollieren, in dem das Build durchgeführt wird (z. B. `dev`).

### Dockerfile
Im Dockerfile werden die Argumente empfangen, damit die entsprechenden Schlüssel über Flags in den Server gelangen können.

```dockerfile
ARG ARG_ENVIRONMENT
ARG ARG_AWS_ACCESS_KEY_ID
ARG ARG_AWS_SECRET_ACCESS_KEY
ARG ARG_AWS_REGION

ENV ENVIRONMENT=$ARG_ENVIRONMENT
ENV AWS_ACCESS_KEY_ID=$ARG_AWS_ACCESS_KEY_ID
ENV AWS_SECRET_ACCESS_KEY=$ARG_AWS_SECRET_ACCESS_KEY
ENV AWS_REGION=$ARG_AWS_REGION

CMD ["sh", "-c", "/app/someapp \
    --aws-access-key-id $AWS_ACCESS_KEY_ID \
    --aws-secret-access-key $AWS_SECRET_ACCESS_KEY \
    --aws-region $AWS_REGION \
    --environment $ENVIRONMENT \
```

### Server 
Anstatt den Config-Pfad zu injizieren, haben wir es so verändert, dass AWS Access Key ID und Secret Access Key injiziert werden, und änderten die Flags, um jedes Environment zu injizieren.
```go
func ParseFlags() *Flags {
	flags := &Flags{}
	flag.StringVar(&flags.AWSAccessKeyID, "aws-access-key-id", "", "aws access key id")
	flag.StringVar(&flags.AWSSecretAccessKey, "aws-secret-access-key", "", "aws secret access key")
	flag.StringVar(&flags.AWSRegion, "aws-region", "", "aws region")
	flag.StringVar(&flags.Environment, "environment", "", "environment")
	flag.Parse()
	return flags
}
```

Die Reihenfolge der Dependency Injection wurde so geändert, dass AWS zuerst erstellt werden kann.
```go
	app := fx.New(
		fx.Provide(
			cli.ParseFlags,

			aws.NewAwsSession, // this!
			aws.NewAwsSecretsManager, // this!

			config.New,
			echoRouter.New,
      // ... (gekürzt)
```

In `config.New()` wird secretManager und `flags` injiziert, um `secretString` zu erhalten, und nach der Unmarshal Operation in YAML wird Config zurückgegeben.

```go
func New(flags *cli.Flags, secretsManager *secretsmanager.SecretsManager) *Config {
	var (
		config    Config // injizierte Config Struktur
		configKey = fmt.Sprintf(SecretManagerConfigKey, flags.Environment) // "someapp/config/dev"
	)

	result, err := secretsManager.GetSecretValue(&secretsmanager.GetSecretValueInput{
		SecretId:     aws.String(configKey),
		VersionStage: aws.String(versionStage),
	})
	if err != nil {
		log.New().Fatalf("err can not get config from secretsManager key: %v", configKey)
	}

	if err = yaml.Unmarshal([]byte(*result.SecretString), &config); err != nil {
		log.New().Fatalf("err unmarshal yaml from secretString err: %v", err)
	}

	return &config
}
```

# Ergebnis
Der Server wurde erfolgreich verbunden und läuft nun.

![image](https://user-images.githubusercontent.com/110372475/221461841-cfb5b024-7823-4e33-a977-5dbcd95f869b.png)