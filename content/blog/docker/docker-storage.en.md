---
title: "[Docker] Exploring Docker Storage: Volume vs Bind Mount"
type: blog
date: 2022-07-15
weight: 4
comments: true
translated: true
---
# Docker Storage
In this chapter, we will delve into Docker Storage.

As the name suggests, Storage simply means storage space. However, if you use containers, it might feel slightly more challenging than what you usually handle.

This is because Storage is a crucial part of development, and it is also why many people still opt for a host OS-based `local` development environment over a container-based development environment.
> Some might say that it is better to `dockerize` only in the server where deployment actually occurs. However, I believe that the true value of Docker can be seen when applied to a `local` development environment.

![image](https://user-images.githubusercontent.com/59782504/179159615-2387ae9e-5beb-40c2-8b9d-f2bfed8d9a12.png)

The diagram above explains the Storage used in Docker.

# Bind Mount
A `bind mount` links the File System (FS) of the `Host OS` with that of the `Container`, enabling the **container to operate as if the `Host OS` files are located within it**.

It indeed functions in this way and can be seen as similar to the `ln` command among Linux commands.

Through this command, you can not only link the Host OS's FS but also make containers point to the same workspace, among other operations.

However, there is a drawback to this method.

Naturally, it is highly influenced by the `Host OS`.
> Especially, in the case of Windows File System, it usually starts with `C:\`, `D:\`, etc., requiring you to set it differently from Unix or Linux-type paths when configuring.

~~Windows while developing is always troublesome.~~

## `-v,  --volume`
In the previous chapter, we reviewed useful commands available in `docker` like `create, run, exec` along with their options. Among these, the option for performing a `bind mount` would be this one.

```shell
$ docker [create|run|exec...] ... -v [HOST_PATH]:[CONTAINER_PATH] ...
```
You can use it in the form above to connect the `HOST_OS`'s `Storage` with the `CONTAINER`'s `Storage`.

## `--mount`
Its usage and purpose are similar and it operates almost the same, except it does not execute and returns an exception if `[HOST_PATH]` does not exist.
The `-v` option, on the other hand, **automatically generates endpoint paths**.
```shell
# Example
# $(pwd): Refers to the current working directory path.
# -- when using mount
$ docker run -d \
  -it \
  --name devtest \
  --mount type=bind,source="$(pwd)"/target,target=/app \
  nginx:latest
  
# when using -v
 $ docker run -d \
  -it \
  --name devtest \
  -v "$(pwd)"/target:/app \
  nginx:latest
```
### Parameter
> The parameters used in the `--mount` option are as follows.

|Param|Description|
|:-------:|--------------------------------------|
|`type`|Indicates whether to use \[`volume`\|`bind`\] `volume` or `bind mount`|
|`source`|`HOST_PATH`|
|`target`|`CONTAINER_PATH`|

# Docker Volume
According to the [Docker official documentation](https://docs.docker.com/storage/volumes/), Docker Volume is **defined as the default mechanism to maintain data generated and used by containers**.

There is a similar concept we reviewed earlier, the `bind mount`.

However, the difference is that this concept does not directly use the Host OS's FS but rather the `Storage` managed by `Docker`.

In other words, storage space can be shared among containers regardless of the OS.

However, it would be more accurate to say that it is used when **multiple containers need to share files on the Volume** rather than linking with the Host OS.
> For instance, it could be certain configuration files. It can be useful for content that doesn't need to be updated in real-time upon changes.

## Advantages
The [Docker official documentation](https://docs.docker.com/storage/volumes/) outlines the following advantages of Docker Volume over bind mount:

1. Volumes are easier to back up or migrate than bind mounts.
2. You can manage volumes using Docker CLI commands or Docker API.
3. Volumes work with both Linux and Windows containers.
4. You can share volumes more safely across multiple containers.
5. Using volume drivers allows storing volumes on remote hosts or cloud providers, encrypting their contents or adding other functionalities.
6. The contents of a new volume can be pre-populated by the container.
7. Volumes on Docker Desktop are more performant than bind mounts from Mac and Windows hosts.

## Creation

Now, let's create a Docker Volume.
```shell
$ docker volume create my-vol
```
With the command above, you can easily create a Volume.
```shell
$ docker volume inspect my-vol
[
    {
        "CreatedAt": "2022-07-18T23:53:04Z",
        "Driver": "local",
        "Labels": {},
        "Mountpoint": "/var/lib/docker/volumes/my-vol/_data",
        "Name": "my-vol",
        "Options": {},
        "Scope": "local"
    }
]
```
The `docker volume inspect [VOL_NAME]` command checks the details of existing volumes.
## Deletion
```shell
$ docker volume rm my-vol
```
A simple command allows you to delete a Volume created earlier.
# Reference
* [Docker Official Documentation - Storage Overview](https://docs.docker.com/storage/)