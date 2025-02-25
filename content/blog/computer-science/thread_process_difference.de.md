---
title: Lassen Sie uns Prozesse und Threads verstehen
type: blog
date: 2024-01-04
comments: true
translated: true
---
## Programm
Um einen Prozess zu verstehen, muss man wissen, was ein Programm ist.

Ein Programm ist ein Dokument, das die Vorgehensweise oder Reihenfolge angibt und auf einem Computer auf der Festplatte gespeichert ist.

## Prozess
Ein Prozess ist ein laufendes Programm, das von der Festplatte in den Speicher geladen wird und dem die CPU zugewiesen werden kann.

Ein Prozess besteht aus Ressourcen wie Daten und Speicher, die zur Ausführung des Programms erforderlich sind, sowie aus Threads.

![image](/images/computer_science/img.png)

### Beispiele für OS-Ressourcen, die dem Prozess zugewiesen werden
- **CPU-Zeit**
  - Die CPU-Zeit bezeichnet die Zeit, in der ein Prozess die CPU tatsächlich nutzt. Die CPU-Zeit wird in Benutzer-CPU-Zeit und Kernel-CPU-Zeit unterteilt.
    - **Benutzer-CPU-Zeit**: Zeit, die im Benutzermodus ausgeführt wird
    - **Kernel-CPU-Zeit**: Zeit, die im Kernelmodus ausgeführt wird
      - _Kernel: Der Kernbestandteil des Betriebssystems, der die Verbindung zwischen Hardware und Anwendungsprogrammen herstellt._
- **Speicher**
  - **Code**: Bereich, in dem der Programmkode gespeichert wird
    - Dies bedeutet den tatsächlich ausgeführten Code. Der Code hier bezieht sich auf den vom Compiler in Maschinensprache übersetzten Code, nicht auf den von einem Programmierer geschriebenen Code.
  - **Daten**: Bereich, in dem globale Variablen gespeichert werden
    - Globale Variablen sind Variablen, die im gesamten Programm verwendet werden. Diese werden im Datenbereich des Programms gespeichert.
  - **Stack**: Bereich, in dem lokale Variablen gespeichert werden
    - Lokale Variablen werden innerhalb einer Funktion deklariert, werden beim Aufruf der Funktion erstellt und verschwinden, wenn die Funktion beendet ist. Diese werden im Stack-Bereich gespeichert.
  - **Heap**: Bereich, in dem dynamisch zugewiesene Variablen gespeichert werden
    - Variablen, die der Benutzer direkt verwalten kann. Dynamisch zugewiesene Variablen werden im Heap-Bereich gespeichert.
- **Dateien und I/O-Geräte**
  - Ein Prozess lädt die benötigten Daten während der Ausführung in den Speicher und schreibt die Ausführungsergebnisse aus dem Speicher in eine Datei oder ein I/O-Gerät.

### Gemeinsame Speicherverwendung zwischen Prozessen
- Jeder Prozess verwendet einen ihm zugewiesenen, unabhängigen Speicherbereich. Daher kann ein Prozess nicht direkt auf den Speicher eines anderen Prozesses zugreifen.
- Daher muss zwischen Prozessen eine geeignete Kommunikationsmethode verwendet werden.

#### Kommunikationsmethoden zwischen Prozessen
- **Pipe**
  - Eine Pipe ermöglicht es einem Prozess, Daten von einem anderen Prozess zu empfangen. Eine Pipe ermöglicht nur unidirektionale Kommunikation.
- **Nachrichtenwarteschlange**
  - Eine Nachrichtenwarteschlange ermöglicht das Senden und Empfangen von Daten als Nachrichten. Nachrichtenwarteschlangen ermöglichen bidirektionale Kommunikation.
- **Gemeinsamer Speicher**
  - Gemeinsamer Speicher verwendet einen Speicher, der für beide Prozesse zugänglich ist. Da auf den gemeinsamen Speicher gleichzeitig von beiden Prozessen zugegriffen werden kann, können Synchronisationsprobleme auftreten.
- **Socket**
  - Eine Socket ermöglicht den Datenaustausch über Netzwerke. Sockets ermöglichen bidirektionale Kommunikation.
- **Signal**
  - Ein Signal informiert einen Prozess über ein aufgetretenes Ereignis. Der Prozess bearbeitet das Ereignis, sobald er das Signal erhält.
- **Datei**
  - Eine Datei ermöglicht das Lesen und Schreiben von auf einer Festplatte gespeicherten Daten. Dateien ermöglichen bidirektionale Kommunikation.

### Prozesszustände
Ein Prozess wird ausgeführt, während sich sein Zustand ändert. Er kann folgende Zustände haben:

- **Laufender Zustand**
  - Der Prozess belegt die CPU und führt die Anweisungen aus.
- **Bereit-Zustand**
  - Der Prozess nutzt die CPU nicht, ist aber bereit, jeden Moment ausgeführt zu werden, da ein anderer Prozess die CPU nutzt.
- **Warte-Zustand**
  - Der Prozess nutzt die CPU nicht und wartet auf Ereignisse wie Ein-/Ausgaben.
- **Erstellungszustand**
  - Der Prozess ist erstellt und hat Speicher zugewiesen bekommen.
- **Beendigungszustand**
  - Die Ausführung des Prozesses ist beendet und der Speicher wurde freigegeben.

## Thread
Ein Thread ist eine Einheit von mehreren parallelen Abläufen innerhalb eines Prozesses. Ein Thread ist die Einheit, die tatsächliche Arbeiten ausführt, unter Verwendung der einem Prozess zugewiesenen Ressourcen.

![img.png](/images/computer_science/process.png)

### Merkmale von Threads
- Jeder Thread im Prozess erhält einen eigenen Stack, während der Code-, Daten- und Heap-Bereich geteilt wird.
- Jeder Thread im Prozess verfügt über einen eigenen PC und SP.
- Jeder Thread im Prozess hat einen eigenen Satz von Registern.

### Vorteile von Threads
- Der Verbrauch von Systemressourcen wird reduziert.
  - Threads teilen die Ressourcen innerhalb eines Prozesses, was die Anzahl der für die Erstellung und Zuweisung von Ressourcen benötigten Systemaufrufe reduziert.
- Die Kommunikation zwischen Threads ist einfach.
  - Threads teilen Ressourcen innerhalb eines Prozesses, was die Kommunikation einfach macht.
- Der Kontextwechsel eines Threads ist schnell.
  - Da Threads nur separate Stacks haben und den Code-, Daten- und Heap-Bereich teilen, ist der Kontextwechsel schnell.
- Die Erstellung eines Threads ist schnell.
  - Da Threads Ressourcen innerhalb eines Prozesses teilen, ist die Erstellung eines Threads schneller als die eines Prozesses.
- Die Beendigung eines Threads ist schnell.
  - Da Threads Ressourcen innerhalb eines Prozesses teilen, ist die Beendigung eines Threads schneller als die eines Prozesses.
- Die Synchronisation von Threads ist einfach.
  - Da Threads Ressourcen innerhalb eines Prozesses teilen, ist die Synchronisation einfach.

## Epilog
- Bei einem Vorstellungsgespräch wollte ich auf bestimmte Fragen antworten, konnte mich aber nicht erinnern und war deshalb unzufrieden mit meiner Antwort. Diese Erkenntnisse teile ich in diesem Posting.
- _In der Zukunft soll mir so ein Fehler nicht mehr unterlaufen._