---
title: "[Docker] Exploring Docker"
type: blog
date: 2022-07-11
weight: 1
comments: true
translated: true
---

# What is Docker?

![img.png](/images/docker/img_9.png)

If we borrow the definition from [AWS](https://aws.amazon.com/), Docker is a software platform that allows you to quickly build, test, and deploy applications.

Docker uses a concept called containers to streamline applications running on traditional heavy operating systems and virtual machines, thereby resolving several issues.

Recently, Docker is used not only locally but also in various cloud environments.

For example, you can deploy using Docker images in AWS, and by installing Docker in Github Actions, you can automate deployments and perform tasks like simple deployments.

## What problems does Docker solve?
While setting up a development environment, we often encounter various issues.

During a previous project, I discovered that a module installation error occurred in the process of a team member trying to use `Maria DB` with `Python` by installing a module called `mysqlclient`, revealing how sensitive the Python language can be to its version.

At the start of the project, Python 3.8 was available, but by the time the issue arose, my friend was using Python 3.10.

We found out that the `mysqlclient` module was only available up to Python 3.9, while my friend was using version 3.10.

Such issues are not exclusive to the specific language environment of Python.

Especially when operating systems are different, or even just their versions, these situations can occur frequently. For example:

1. A Windows developer uses C in Visual Studio.
2. A Linux developer uses the GCC compiler.

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

In Visual Studio, the above function simply uses the first argument, num, to sum the subsequent parameters using variadic arguments.

However, in GCC, this notation is not supported and returns garbage values.

Although developers can align development environments, compilers, and versions through conventions and configuration files, this method is not necessarily optimal.

1. If a new version contains good features or security patches, it might prevent necessary updates. 
> In such cases, all developers would need to update their modules to match the version, which can be quite bothersome.
2. When a new developer joins, they would need to repeatedly set up the relevant version and development environment from scratch.
> Considering the high cost of developer salaries, this is a waste of resources.

# Virtual Machine (VM)
Then isn’t there an easier solution?

Initially, the alternative proposed was the **virtual machine**.

You can understand it simply as virtualizing an operating system to run independently on the CPU.
When using virtual machines, you can create and manage an operating system image with the developmental environment, specific modules, versions, etc., already installed.

While it appears to be a panacea, virtual machines have **problems** too.

_**It is a waste of resources.**_

Many operating systems include independent programs in addition to the tools and environments for development.
You might think of it as running an entire computer within your computer.

There is something called a `HyperVisor`. HyperVisor allocates a computer's infrastructure resources to each virtual machine.
Each virtual machine that is allocated infrastructure resources has an independent Guest OS.

![img_1.png](/images/docker/img_1.png)

Looking at the image above, the assigned OS for each VM stands out. This adds unnecessary resource weight mentioned earlier, leading to resource wastage.

# Container
What about containers then?
Containers are managed and run like **independent programs on the host OS they reside on**.

Since each container operates independently under the Docker engine, there is no need to create an OS or partition infrastructure independently, making it scalable and fast.

![img.png](/images/docker/img_0.png)

Additionally, migration, backup, and transfer are easy, since they are smaller in size compared to VMs.

**"Now, new developers do not need to worry about their computer slowing down due to multiple virtual machine installations."**

_~~Because they will manage the containers~~_

# Docker
Back to the main topic: what is Docker then?

Docker is one of the container-based open-source virtualization platforms mentioned earlier.
It is not just for the OS but also provides various infrastructures necessary for development like DB, Compiler, interpreter already in the form of images in Docker.
> _For just how incredible this infrastructure is, take a brief look at [Docker Hub](https://hub.docker.com/)_

![img_2.png](/images/docker/img_2.png)

#### Image
Docker containers provide functionality to package and execute each application.
> This is Docker's powerful `image`. An image is the output of a packaged container.

#### Volume, Bind
You can `bind` the host's storage directly for use, or make a `volume` in Docker's virtualized storage (which is actually the host's storage) to share with other containers.

What these powerful features narrate is that you can reflect development activities in real-time through a loose Link without directly inserting my development repository (Git, SVN) into a virtualized OS.

#### Docker Registry
Earlier, it was emphasized that you can download and use images built through Docker Hub. Docker Registry is a space that stores images, and Docker Hub is a public registry for users who use Docker.

# Reference
- [Container and Docker Conceptualization - geunwoobaek.log](https://velog.io/@geunwoobaek/%EC%BB%A8%ED%85%8C%EC%9D%B4%EB%84%88-%EB%B0%8F-%EB%8F%84%EC%BB%A4-%EA%B0%9C%EB%85%90%EC%A0%95%EB%A6%AC)
- [Docker Official Documentation](https://docs.docker.com/get-started/overview/)
- [A Beginner's Guide to Docker - What is Docker? - subicura](https://subicura.com/2017/01/19/docker-guide-for-beginners-1.html)
- [States of a Docker Container - baeldung](https://www.baeldung.com/ops/docker-container-states)