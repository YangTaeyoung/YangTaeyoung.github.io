---
title: "[Docker] Let's Learn About Docker Compose"
type: blog
date: 2022-07-21
weight: 5
comments: true
translated: true
---
## Brothers, am I the only one uncomfortable?
This is the second brothers. There are actually many uncomfortable things.

## Use of Docker
When did they say we use Docker?

It would be when you want to use the core technology of Docker, Container.
> In other words, for reuse.

The `Dockerfile` we learned earlier automated many parts required to create a container.

However, there are also disadvantages to `Dockerfile`.

As discussed in the [previous post](/docs/docker/04.dockerfile/), there were limitations in automating the settings of the Host OS.

For example, it couldn't reach port forwarding of the Host OS or mounting the path of the volume.

Eventually, many developers would create a `Dockerfile`, connect containers created through `build`, and mount `volume`.

## Docker Compose
![img.png](https://miro.medium.com/max/1000/1*JK4VDnsrF6YnAb2nyhMsdQ.png)

Docker Compose solves the above issues.

The details that can be defined in `docker-compose.yml` include `volume`, `port`, `env` as well as support for performing various operations to define containers.

It also not only defines a single container, but also **supports the definition of multiple containers and setting relationships between containers.**

The [official Docker documentation](https://docs.docker.com/compose/compose-file/) introduces Compose as a **container-based application that is platform-agnostic.**

### `.yml`, `.yaml`
Before learning about Docker Compose, there is something to know.

![img2](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/YAML_Logo.svg/1200px-YAML_Logo.svg.png)

Earlier, it was stated that `docker-compose.yml` can be used to set commands for multiple containers.

So, what is a `.yml` file?

Files with `.yml`, `.yaml` extensions are a form of markup language called Yet Another Markup Language.

It forms a hierarchy through colons and indentation like Python, allowing easy writing of specific objects, configuration values, etc.

To intuitively understand, let's look at the example below.
```yaml
car:
  name: "bus"
  color: "red"
  door: 4
  capability:
    max_weight: "4T"
    human: 10
  customers:
    - name: "Alice"
      age: 14
    - name: "Ban"
      age: 16
    - name: "Yang"
      age: 26
```

This form of `.yaml` can also be expressed in the same `JSON` format as below.

```json
{
  "car": {
    "name": "bus",
    "color": "red",
    "door": 4,
    "capability": {
      "max_weight": "4T"
    }
  }
}
```

In this way, `.yml` is a file format that is convenient to use when expressing data in a hierarchical form, using existing formats such as `JSON` and `XML`.

### `docker-compose.yml`
Now let's create `docker-compose.yml` and specify the containers we will use.

#### `services`
First, the specification for each container we define is defined as a unit called `service`.

If you explain using the `.yml` format, it would be this format.
```yaml
services:
  container_1:
    ...
  container_2:
    ...
```

#### `image`
This is the part where the image to be retrieved is specified.

There are various ways to retrieve the desired image.

```yaml
# Image name
image: redis
# Image name: tag name
image: redis:5
# Image name@sha256: IMAGE ID
image: redis@sha256:0ed5d5928d4737458944eb604cc8509e245c3e19d02ad83935398bc4b991aac7
# Repository name/image name
image: library/redis
# Registry name/repository name/image name
image: docker.io/library/redis
# Private registry address:port/image name
image: my_private.registry:5000/redis
```

#### `build`
This is used when you want to create a container through `Dockerfile`.

```yaml
services:
  frontend:
    image: awesome/webapp
    build: ./webapp # Acts as context if sub-levels are not specified

  backend:
    image: awesome/database
    build:
      context: backend # Path to search for Dockerfile
      dockerfile: ../backend.Dockerfile # Specify the file name if it is not Dockerfile

  custom:
    build: ~/custom # "~" can also be used to specify the home directory
```

1. The `awesome/webapp` image is built using the `./webapp` subdirectory in the same folder as the Compose file as the docker build context.
An error occurs if there is no `Dockerfile` in this folder.
2. The `awesome/database` image is built using the `./backend` subdirectory in the same folder as the Compose file.
The `backend.Dockerfile` file is used to define the build stage, and this file (`backend.Dockerfile`) is defined based on the context path (`./backend`).
In this sample, it is interpreted as the parent folder of the Compose file, so the sibling `Dockerfile` of `backend.Dockerfile` is also a search target.
3. The `custom` service is built using `custom` directory in the user's `HOME` directory as the `context`.

#### When `image` and `build` are both present
It was said that `image` creates a container based on the specified image, and `build` creates a container using `Dockerfile`.

However, since it is possible to retrieve an image through the `FROM` keyword in `Dockerfile`, one might worry whether these properties might conflict.

You can also find a [section on this](https://docs.docker.com/compose/compose-file/build/#consistency-with-image) in the official Docker documentation,
confirming our worry that there is no guarantee of which image will be used.

Unless indicated otherwise by the user, it states that it first retrieves the image defined in `image` and builds the image from the `Dockerfile` if an image cannot be found in the registry.

#### `depends-on`
When defining multiple services in `docker-compose.yml`, if a certain service needs to start after a particular service has started, you can specify it with `depends_on: service name`.
```yaml
services:
  seviceA:
    ...
    depends_on: serviceB
    
  serviceB:
    ...
```

#### `entrypoint`
Performs the same role as `ENTRYPOINT` discussed in the [Dockerfile](/docs/docker/04.dockerfile).

In other words, it defines the initial command to execute when the Docker container runs.
> As covered in the previous chapter, since this command can be declared only once, if `ENTRYPOINT` is also specified in the Dockerfile through the `build` option, one (or both) must be deleted.

> In many cases, it seems that it is used to define which shell to use initially.

```yaml
entrypoint: /code/entrypoint.sh
```

#### `labels`
As covered in the `LABEL` section of the [Dockerfile](/docs/docker/04.dockerfile/), it's an item that allows adding metadata to the container.

### `environment`
It's used when defining environment variables to be used in the container.

Two methods can be used.

1. Map method
```yaml
environment:
  RACK_ENV: development
  SHOW: "true"
  USER_INPUT: "hello"
```

2. Array method
```yaml
environment:
  - RACK_ENV=development
  - SHOW=true
  - USER_INPUT=hello
```

#### `env_file`
If you want to define environment variables in a file rather than direct definition, use this option.

```yaml
env_file: some_env.env
```

```
# some_env.env
RACK_ENV=development
VAR="quoted"
```

When using this method, you can manage environment variables in the form of a file, which has the advantage of easier management.

#### `command`
Like we learned in the `CMD` section of the `Dockerfile`, it's the part where we define commands to give to the container responsible for the service.
```yaml
command: ls -al
```
Since I'm a backend developer, I'll describe the difference between the two commands (`Dockerfile`:`CMD`, `docker-compose.yml`:`command`) from a backend developer's perspective.

`CMD` of the `Dockerfile` is generally used for commands to install basic components to configure the server such as `pip install`, `gradle build`.
> Think of it as making it in a form that can run the container _(but it's not mandatory to follow this strictly)_.

`command` of `docker-compose.yml` is often used for commands that deploy servers (e.g. `... run serve`) as in commands that run the service.

#### `volumes`
`volumes` is used to define connecting the user's created Docker Volume or Host Path and Container Path, or declaring a volume itself.

##### Specification of volume
The method to define the sub-elements of `volumes` combines two types of notation: shorthand and normal syntax.

Generally, shorthand is used but the standard syntax can also be used depending on the circumstances or user's preference.
1. Normal syntax elements

|Element| Description|
|:--------:|---------------|
|`type`|Specifies whether to use Docker Volume (`volume`) or to bind (`bind`) with a Host OS path.|
|`source`|Specify the Volume name or ID, or the Path of the Host OS to be bound.|
|`target`|Enter the Path of the Container.|
|`read_only`| Set if you want to specify it as read-only.

```yaml
    ...
    volumes:
      - type: volume
        source: db-data
        target: /data
    ...
```

2. Shorthand notation

Designate using the format `VOLUME:CONTAINER_PATH:ACCESS_MODE`.
> `ACCESS_MODE` is set to `rw` by default. 

```yaml
services:
  service_1:
    image: some/image
    # Connecting Docker Volume and Container Path
    volumes:
      - db-data:/etc/data

  service_2:
    image: some/image
    # Connecting Host OS's Path and Container Path
    volumes:
      - .:/var/lib/backup/data

  service_3:
    image: some/image
    # Connecting Host OS's Path and Container Path and setting Container Path to read-only
    volumes:
      - .:/var/lib/backup/data:ro
```

#### Defining Volume
If you want to define a Volume through `volumes`, place `volumes` as the top-level element of `docker-compose.yml`.
```yaml
# Define Docker Volume
volumes:
  db-data:
```

### `ports`
Operates in the same way as the `-p` option used in `run` and `create` of the Docker CLI.
It maps the Port of Host OS and Port of Container Path.

```yaml 
    ...
    ports:
      - "8000:8000"
    ...
```

In the configuration above, all requests coming to port `8000` of the Host OS will instead be forwarded to port `8000` of the Container.

## Docker Compose CLI
Now all that's left is to create the container. 

Using the `docker-compose up` command will find and automatically execute the `docker-compose.yml` file in the specified directory.

In the newly released Docker Compose V2, it specifies to use the `docker compose` keyword to execute, so keep this in mind if using V2.

The `-d` option enables the service to run in background mode. (Commonly used)

The `-f [COMPOSE_FILE_NAME]` option allows you to run Docker Compose through a specific file other than `docker-compose.yml`.

The `docker-compose start [SERVICE_NAME]` command allows you to run a specific service within the services.

Conversely, the `docker-compose stop [SERVICE_NAME]` command is used to stop a specific service.

## Reference
* [Docker Official Documentation - Compose file Reference](https://docs.docker.com/compose/compose-file/)
* [Docker Official Documentation - Docker Compose CLI Reference](https://docs.docker.com/compose/reference/)