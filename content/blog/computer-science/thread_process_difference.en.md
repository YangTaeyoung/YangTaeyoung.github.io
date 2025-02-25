---
title: Understanding Process and Thread
type: blog
date: 2024-01-04
comments: true
translated: true
---
## Program
To understand a process, we need to know what a program is.

A program is a document that specifies procedures or sequences and is stored in the hard disk on a computer.

## Process
A process is a running program that is loaded into memory from the disk and can be allocated by the CPU.

A process consists of resources such as data and memory required to execute a program and is also composed of threads.

![image](/images/computer_science/img.png)

### Examples of OS resources allocated to a process
- **CPU Time**
  - CPU time refers to the time a process actually uses the CPU. CPU time is mainly divided into user CPU time and kernel CPU time.
    - **User CPU Time**: Time executed in user mode
    - **Kernel CPU Time**: Time executed in kernel mode
      - _Kernel: The core part of the operating system that connects hardware and applications._
- **Memory**
  - **Code**: Area where program code is stored
    - It refers to the executing code itself. Here, the code means the code translated into machine language by the compiler, not the code written by the programmer.
  - **Data**: Area where global variables are stored
    - Global variables are used throughout the program. These variables are stored in the program's data area.
  - **Stack**: Area where local variables are stored
    - Local variables are declared within a function, created when the function is called, and destroyed when the function ends. They are stored in the stack area.
  - **Heap**: Area where dynamically allocated variables are stored
    - These are variables that can be managed directly by the user. Dynamic allocation variables are stored in the heap area.
- **Files and I/O Devices**
  - During execution, a process loads necessary data into memory and writes the execution results from memory to files or I/O devices.

### Memory Sharing Between Processes
- Each process is allocated and uses an independent memory area, so processes cannot directly access the memory of other processes.
- Therefore, appropriate communication methods must be used between processes.

#### Methods of Inter-process Communication
- **Pipe**
  - A pipe allows one process to receive data from another process. Communication through a pipe is one-way.
- **Message Queue**
  - A message queue allows data to be sent and received as units called messages. It supports two-way communication.
- **Shared Memory**
  - Shared memory is a method where two processes use memory accessible to both. Since both processes can access shared memory simultaneously, synchronization issues may arise.
- **Socket**
  - A socket allows data to be sent and received over a network. It supports two-way communication.
- **Signal**
  - A signal informs a process when an event occurs. The process handles the event when it receives the signal.
- **File**
  - A file allows reading and writing of data stored on a hard disk. It supports two-way communication.

### Process States
A process executes by transitioning between states. It has the following states:

- **Running State**
  - The process is occupying the CPU and executing instructions.
- **Ready State**
  - The process is not currently using the CPU but can be executed as soon as the CPU becomes available.
- **Blocked State**
  - The process is not using the CPU and is waiting for events like input/output.
- **New State**
  - The process is created and has been allocated memory.
- **Exit State**
  - The process execution is terminated, and its memory is released.

## Thread
A thread is a unit of execution that runs within a process. A thread is the actual entity that performs tasks using the resources allocated to a process.

![img.png](/images/computer_science/process.png)

### Characteristics of Threads
- Each thread within a process is allocated a separate stack but shares the code, data, and heap areas.
- Each thread has its own PC and SP within the process.
- Each thread has a separate set of registers within the process.

### Advantages of Threads
- They reduce system resource consumption.
  - Threads share the process's resources, reducing system calls needed for resource allocation compared to creating processes.
- Communication between threads is simple.
  - Threads share the process's resources, making communication easy.
- Context switching between threads is fast.
  - Threads are fast due to shared code, data, and heap areas and only separate stack allocation.
- Thread creation is fast.
  - Threads are created faster than processes because they share the process's resources.
- Thread termination is fast.
  - Thread termination is faster than process termination because they share the process's resources.
- Synchronization between threads is simple.
  - Simplified due to shared resources within the process.

## Epilogue
- During an interview, I couldn't recall the information well, leaving a sense of regret, leading to this posting.
- _I must not make that mistake again._
