---
title: Wie man lokale Geheimnisse mit AWS Secrets Manager effizient verwaltet
type: blog
date: 2023-09-23
comments: true
translated: true
---

![image](/images/aws/ca97b1f1a197a40a8559e7ec60c76f99.png)

Beim Teilen von Geheimnissen lokal in einem Unternehmen kommt es oft vor, dass diese über Messenger wie Slack oder KakaoTalk ausgetauscht werden.

Die Gründe dafür sind oft folgende:
1. Wenn aufgrund von Änderungen die bestehenden lokalen Geheimnisse aktualisiert werden müssen
2. Beim Eintritt neuer Mitarbeiter, um die initialen Geheimnisse festzulegen

Diese Methode hinterlässt sensible Informationen über Geheimnisse auf dem gemeinsamen Messenger-Kanal und ist aus verschiedenen sicherheitstechnischen Aspekten problematisch.

# AWS Secret Generator
Deswegen habe ich ein einfaches CLI-Tool entwickelt, das in Golang geschrieben ist. Es ermöglicht, über ein einfaches CLI Secret-Daten aus dem AWS Secrets Manager abzurufen und in Form einer Datei lokal zu speichern.

## Verwendung
### Voraussetzungen
- Es wird angenommen, dass AWS Access Key ID und AWS Secret Access Key im Voraus geteilt wurden.

- Einrichtung von AWS Secrets Manager
  - Gehen Sie zuerst in den Secrets Manager und richten Sie die Einstellungen ein. Wählen Sie in diesem Abschnitt „Neues Geheimnis speichern“ aus.
		![](../../assets/images/aws/87c03916f4df676c72ea8f2d4df1f931.png)
  - Wählen Sie den Typ des Geheimnisses aus. Ich habe ein gemischtes Konfigurationsszenario angenommen, das verschiedene Einstellungen umfasst, und einen anderen Geheimnistyp gewählt. (Wenn Sie ein bestimmtes Geheimnis eines AWS-bezogenen Dienstes einrichten möchten, können Sie auch einen anderen Geheimnistyp wählen.)
		![](../../assets/images/aws/183eaa88819bf03cd18361ee02299a67.png)
  - Leiten Sie in das Textformat über und kopieren Sie die derzeit verwendeten lokalen Geheimnisse in das Feld ein.
    - Es ist natürlich auch möglich, JSON-Format zu erzwingen, indem Sie Schlüsselwertpaare verwenden.
    - Ich nahm an, dass ein einfaches Geheimnis im YAML-Format wie `hello: world` verwendet wird.
      - Bei der Einrichtung der Konfiguration sollten Sie eine solche festlegen, die lokal funktionsfähig ist.
		![](../../assets/images/aws/1d235b2010321e4bf01dfc7af304db56.png)
  - Geben Sie den Namen und die Beschreibung des Geheimnisses ein. Der Name des Geheimnisses wird später der Schlüsselwert, den man im CLI-Programm auswählt, also merken Sie ihn sich gut.
		![](../../assets/images/aws/fe2928dc06e69bdefc2b21bdff858e7b.png)
  - Dies ist der Bereich, ob die eingerichteten Geheimnisse regelmäßig gegen andere Geheimnisse ausgetauscht werden sollen. Da ich davon ausgehe, dass diese Funktion nicht verwendet wird, habe ich keine Einstellungen vorgenommen.
		![](../../assets/images/aws/303a9ecff2da5bfb442749924e0d12ba.png)
  - Wenn Sie im nächsten Schritt auf die Speichern-Schaltfläche klicken, wird das Geheimnis erstellt.
		![](../../assets/images/aws/a9857abe3a02fef5b14cbd61281b8d1a.png)
- Für die allgemeine Installation des CLI folgen Sie der Beschreibung im folgenden Repository.
	- https://github.com/YangTaeyoung/aws-secret-gen
- Verwenden von aws-secret-gen
  - Geben Sie Folgendes in die Befehlszeile ein:
	```bash
	$ aws-secret-gen -o test-config.yaml{Pfad zur zu speichernden Datei}
	```
  - Daraufhin erscheint ein Fenster, in dem Sie die AWS Access Key ID, Secret Access Key und Region festlegen können.
    - Geben Sie die im Voraus vorbereiteten Schlüssel und die Region ein.
	```bash
	>  Enter AWS Access Key ID: {vorbereitete AWS Access Key ID}
	>  Secret AWS Secret Access Key: {vorbereiteter AWS Secret Access Key}
	>  Enter AWS Region: {AWS Region Schlüssel: Im Fall von Seoul ap-northeast-2}
	```
  - Daraufhin erscheint eine Liste der Geheimnisse. Wählen Sie das Geheimnis aus, das Sie erstellt haben.
	```bash
	Use the arrow keys to navigate: ↓ ↑ → ←
	? Select Secret:
		...
	  ▸ test-config
	```
  - Drücken Sie die Eingabetaste, um zu bestätigen, dass das Geheimnis ordnungsgemäß in dem von Ihnen angegebenen Pfad erstellt wurde.
	```bash
	$ cat ./test-config.yaml
	> hello: world
	```