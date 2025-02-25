---
title: "[Docker] Let's Learn about Dockerfile."
type: blog
date: 2022-07-13
weight: 3
comments: true
translated: true
---
## 😡 Are You the Only One Feeling Uncomfortable?
If you've had a brief look at Docker's CLI, you know that creating and managing containers can be a hassle.

To make it easy for myself, I have to input numerous commands every time I create a container.

In fact, a bigger issue is that the image size can become indefinitely large the moment it's built.

Although it won't be extremely huge, it can range from at least 100MB to even over 1-2GB.

![img.png](https://blog.kakaocdn.net/dn/dg7HAJ/btq0ZLhsh0x/RXZPbihsD3h9ou7NviGfM1/img.png)

For companies managing numerous containers, this can be even more disastrous.

Even if we overlook the size, the time it takes to transfer the image and download it will be incredibly long.

## 📄 Dockerfile

Thus, Docker proposes a new way to create containers. 

The crux is to **share scripts for creating images instead of already made images**.

### 🚫 Don't Repeat Yourself

You'll end up writing it once anyway. ~~Maybe AI will automate this in the future..?~~
> _But you only need to do it once._

Since this is Docker's internal feature, it's much simpler, formal, and structured than writing commands and saving them as a text file.

Moreover, `Dockerfile` is essentially a text file as well, so it doesn’t take up a significant amount of space when stored.

Enough digression. Let's get to the main point.

### Then, How Do You Execute It?
When you create a `Dockerfile`, it pulls in images according to the file specifications and executes the commands.

Once the container is launched on Docker, the image is stored on the user’s local.

This process is called `build`, and it’s different from `commit` which involves turning a container into an image.

### `build [BUILD_PATH]`

The `build` command is based on the `Dockerfile` located at the specified path to create a container.

Since this command is performed recursively, you should never use the root directory as the path.

```shell
$ docker build / # (X)
```
Typically, as the `Dockerfile` is placed in the project root directory, the following command is used conventionally.
```shell
$ docker build .
```

### `-f [DOCKER_FILE_PATH]` Option

Traditionally, while `Dockerfile` is located at the root path of the project to be built, you can link it even if the root path and `Dockerfile` path differ by using the `-f` option.

```shell
$ docker build -f /path/to/a/Dockerfile .
```
> This makes the `Dockerfile` act as if it is in the current directory (`.`).

#### `-t` Option

When the build succeeds, you can specify the repository and tag to save the new image using the `-t` option.

```shell
$ docker build -t shykes/myapp .
```

To store the same image in multiple repositories or save multiple tags, you can specify multiple `-t` options for a single build.

```shell
$ docker build -t shykes/myapp:1.0.2 -t shykes/myapp:latest .
```

## Creating a `Dockerfile`
Creating a `Dockerfile` is simple. You just create a `Dockerfile`.

Now, let's look into the extensive settings required to write a `Dockerfile`.

#### `ARG`
This is a variable declaration statement used to maximize the reusability of variables within `Dockerfile`.

```dockerfile
# Usage of Definition
ARG [KEY]=[value]

# Usage of Call
${[KEY]}

# Example
ARG  CODE_VERSION=latest
FROM base:${CODE_VERSION}
CMD  /code/run-app

FROM extras:${CODE_VERSION}
CMD  /code/run-extras
```

#### `FROM`
```dockerfile
# - Usage
FROM [--platform=<platform>] <image> [AS <name>]
# or
FROM [--platform=<platform>] <image>[:<tag>] [AS <name>]
# or 
FROM [--platform=<platform>] <image>[@<digest>] [AS <name>]
```
This notation specifies the base image to be used.

You can consider this as filling out the `IMAGE` section looked at in the `run`, `create` commands of the previous chapter. 
The image written in this section is first searched locally, and if not found, it is searched and fetched from [Docker Hub](https://hub.docker.com).
> Of course, if you don’t have access to a repository or miswrite the image name, it cannot be fetched.

#### `WORKDIR`
Specifies the path where the work will be done inside the container.
It performs the same role as `-w`, `--workdir` that we looked at in the `run`, `create` commands of the previous chapter.

Subsequent `COMMAND` will be executed in the `WORKDIR`, and it’s set to the home directory (`~`) if not specified.

#### `RUN [COMMAND]`

This is different from the `run` command we saw in the previous chapter.
Instead, it falls under the `COMMAND` section and allows various commands to be entered using this keyword on the container.

**This command operates independently of the default commands of the image (similar to commands entered in `exec`).**

`RUN` supports two input formats.

```dockerfile
# Method 1
RUN <command>
# Method 2
RUN ["executable", "param1", "param2"]
```

`Method 2` may look difficult, but it's nothing more than a list of commands separated by spaces.

For example, the following two commands carry out absolutely identical actions.

```dockerfile
RUN ["/bin/bash", "-c", "echo hello"]
```

```dockerfile
RUN /bin/bash -c "echo hello"
```

#### Caution
When executing commands in a list format, there are cases where you input a path using a backslash (`\`).

Actual commands are executed in `JSON` format, and since the backslash is not recognized in `JSON`, specifically in `Windows`, where (`\`) is used as a separator, you should input the backslash (`\`) twice to escape it.

```dockerfile
RUN ["c:\windows\system32\tasklist.exe"] # (X)
RUN ["c:\\windows\\system32\\tasklist.exe"] # (O)
```

#### `ENTRYPOINT`
Executes a script or command when the container is run.

Think of it as being executed when a file is turned into a container and then started (`start`), or created and run at the same time (`run`).

It is not executed when you only send commands to a running container (`exec`).

Another distinctive feature is that `ENTRYPOINT` can be declared only once in a `Dockerfile`.

#### `CMD`
It performs a similar role to `RUN` but differs in that it is the `COMMAND` that is executed by default when `docker run` is run without a separate `COMMAND`.

```dockerfile
# Method 1
CMD ["executable","param1","param2"] # exec shape, recommended
# Method 2
CMD ["param1","param2"]
# Method 3
CMD command param1 param2
```
In Method 1, you can omit executable, in which case ENTRYPOINT must be defined.

#### `ENV`
Carries out the role of designating environment variables for the container and carries the same role as the `-e` option seen in the `run`, `create` commands.

```dockerfile
# Usage
ENV [KEY]=[VALUE]

# Example
ENV abc=hello
ENV abc=bye def=$abc
ENV ghi=$abc
```

#### `LABEL`
Used when you want to add metadata to a container.
```dockerfile
# Usage
LABEL <key>=<value> <key>=<value> <key>=<value> ...
```
It is stored as a key-value pair and, for example, can be written as follows.

```dockerfile
LABEL "com.example.vendor"="ACME Incorporated"
LABEL com.example.label-with-value="foo"
LABEL version="1.0"
LABEL description="This text illustrates \ # Multi-line can be input through the backslash (\) separator.
that label-values can span multiple lines."
LABEL multi.label1="value1" \
      multi.label2="value2" \
      other="value3"
```

To see the metadata, you can check the metadata of a specific image (`myimage`) with the command below.

```shell
$ docker image inspect --format='' myimage
{
  "com.example.vendor": "ACME Incorporated",
  "com.example.label-with-value": "foo",
  "version": "1.0",
  "description": "This text illustrates that label-values can span multiple lines.",
  "multi.label1": "value1",
  "multi.label2": "value2",
  "other": "value3"
}
```

#### `EXPOSE [PORT]/[PROTOCOL]`
`EXPOSE` specifies which port to listen to.

However, this doesn’t mean it is forwarded from Host.

It only specifies to which `PORT` the Host should send data when sending data to the `Container`.

Hence, the `-p` option cannot be automated solely with a `Dockerfile`.

`[PROTOCOL]` is a specification of which protocol to use for data transmission.

Choose between `tcp` and `udp`. The default is set to `tcp`, and it is recommended not to change it unless there are special cases.
> Because TCP ensures reliability during packet transmission.

#### `COPY [OPTION] [HOST_PATH] [CONTAINER_PATH]`
This command copies files in `HOST_PATH` to `CONTAINER_PATH`.
`HOST_PATH` can include not only the path but also file names, and wildcards like `?` _(one character)_, `*` _(several characters)_ can also be used.

#### Relative Path
When inputting a relative path for each `PATH`, `HOST_PATH` is based on the file's location, while `CONTAINER` is based on `WORKDIR`.

#### Wildcard Examples
* `home*`: All files and paths starting with `home`
* `*home*`: All files and paths containing `home`
* `?home`: All files and paths with one character before `home` (e.g., `1home`, `ahome`)

#### `--chown`
`--chown` option decides the owner of `CONTAINER_PATH`.

Since internally manipulated through the actual `chown` command, it can only be run on Linux-based containers.

#### `ADD [HOST_PATH] [CONTAINER_PATH]`
`ADD` can be considered as performing almost the same function as `COPY`.

The options and contents of `COPY` are retrospectively applied, with some added functionalities unique to `ADD`.
1. If the target of copying is a compressed file (`.tar`, `.tar.gz`), the file is uncompressed and copied.
2. Files from remote locations can be specified as copy targets via wget, etc.
> Note that files from remote locations have `600` permissions (readable only by the user).

## Does It Automate Options?
By now, there should be doubts among those who read this.

Can `Dockerfile` be said to specify the process of creating a `CONTAINER` entirely?

**The answer is, of course not.**

Although `Dockerfile` specifies the container, it doesn’t aim to automate the options for creating a container.

Just look at the `-p` option used in the `create`, `run` commands.

The `-p` option needs to specify both the Host OS's port and the Container’s port, but `EXPOSE` only specifies which port on the container to open.

`Dockerfile` fails to handle many Host OS options besides this.

This is because `build` is a specification of the container, not a specification of the Host.

Naturally, this inconvenience became a catalyst for the introduction of Docker Compose, which will be posted about later.

## Docker Ignore File
If you have used `git`, you might have used `.gitignore` at least once.

A `.dockerignore` file performs a similar role, of course.

While the `.gitignore` file mostly sets which files will not be committed, here, it defines the paths of files or folders in the Host OS that should not be copied via `ADD` or `COPY`.

```dockerignore
# Comment
*/temp*
*/*/temp*
temp?
```

## Reference
* [Docker Official Documentation - Dockerfile reference](https://docs.docker.com/engine/reference/builder/)
* [Leonard - [Docker] RUN vs CMD vs ENTRYPOINT in Dockerfile](https://blog.leocat.kr/notes/2017/01/08/docker-run-vs-cmd-vs-entrypoint)
* [Jae-Hong Lee's "Docker for the Really Impatient" Chapter 7 - 6. ENTRYPOINT](http://pyrasis.com/book/DockerForTheReallyImpatient/Chapter07/06)
* [Gaebeong Park - The Difference between ADD and COPY in Dockerfile](https://parkgaebung.tistory.com/44)