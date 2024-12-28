# Nx-Nestjs-Boilerplate-Server


## Initial Setup

### 1. Install Nx CLI

If you haven't installed the Nx CLI globally yet, run the following command:
```bash
npm install -g nx
```

### 2. Create a New Nx Workspace

If you don't already have a workspace, create one using:
```bash
npx create-nx-workspace@latest microservices-project
cd microservices-project
```

Open apps directory:
```bash
cd apps
```

Then, generate a new application:
```bash
nx generate @nx/node:application api-gateway --docker
```

You can check the structure of your new workspace using:
```bash
tree -I node_modules
```

### 3. Add NestJS Dependency Packages

To set up NestJS in your project, install the following dependencies:

`dependencies`
```bash
npm install @nestjs/common @nestjs/core @nestjs/microservices @nestjs/platform-express rxjs reflect-metadata
```

Install the development dependencies:

`devDependencies`
```bash
npm install --save-dev @nestjs/cli @nestjs/schematics @nestjs/testing @nx/nest
```

---

## Adding New Services to the Project

### 4. Generate a New Service Workspace

To generate a new service like `api-gateway`:

```bash
nx generate @nx/node:application api-gateway --docker
```

### 5. Generate Modules, Controllers, and Services

Install the NestJS plugin for Nx:
```bash
npm install @nrwl/nest --save-dev
```

Then, navigate to your application directory:
```bash
cd apps/api-gateway
```

Generate a `pool` module:
```bash
nx g @nrwl/nest:module pool --project=api-gateway
```

Generate the `pool` controller:
```bash
nx g @nrwl/nest:controller pool --project=api-gateway
```

Generate the `pool` service:
```bash
nx g @nrwl/nest:service pool --project=api-gateway
```

### Generate the `app.module` file

To unify all modules, generate an app module:
```bash
cd apps/api-gateway/src/app
nx g @nrwl/nest:module app
```

To make the library buildable, use the following command:


Generate a new library/packages:
```bash
nx g @nx/nest:lib libs/my-nest-lib --buildable
```

---

## Running the Application

To start the development server, run:
```bash
npx nx serve api.gateway
```

---

## Building for Production

To build the application for production, run:
```bash
npx nx build api.gateway
```

---

## Running Nx Tasks

You can use Nx to run various tasks for your applications.

### Run a Single Target:
```bash
npx nx <target> <project> <...options>
```

### Run Multiple Targets:
```bash
npx nx run-many -t <target1> <target2>
```

You can also filter the projects using `-p`:
```bash
npx nx run-many -t <target1> <target2> -p <proj1> <proj2>
```

---

## Docker Commands

### Start Docker Containers
To start and build Docker containers:
```bash
make docker-up
```

### Stop Docker Containers
To stop Docker containers:
```bash
make docker-down
```

### Kill and Remove Docker Resources
To stop and remove all Docker containers, images, volumes, and networks:
```bash
make kill-dockers
```

---

## Generate gRPC Code

To generate gRPC code from `.proto` files:
```bash
make grpc-build
```

---

## PostgreSQL Database Commands

### Drop the PostgreSQL Database:
```bash
make dropdb
```

### Create the PostgreSQL Database:
```bash
make createdb
```

---

## Managing Ports

### List Running Processes on Specific Ports:
```bash
make list-ports
```

### Kill Processes Running on Specific Ports:
```bash
make kill-ports
```

---

## Kafka Listening

To listen to a Kafka topic:
```bash
make kcat TOPIC=<topic-name>
```

---

## CI Setup

### Nx Cloud
- Set up [Nx Cloud](https://nx.dev/nx-cloud) to share your workspace's cache and distribute tasks across multiple machines.

### Nx Graph
To explore the project graph and task dependencies:
```bash
nx graph
```

---

## Makefile Commands Overview

This project includes several Makefile commands to streamline common tasks.

### Available Commands:

| Command                | Description                                     |
|------------------------|-------------------------------------------------|
| `make run-all`          | Run all projects using the Nx CLI               |
| `make run PROJECT=<name>`| Run a single project using the Nx CLI           |
| `make grpc-build`       | Generate gRPC code from `.proto` files          |
| `make docker-up`        | Run Docker Compose up                           |
| `make docker-down`      | Run Docker Compose down                         |
| `make kill-dockers`     | Kill and remove all Docker resources            |
| `make nx-reset`         | Reset Nx cache and daemon                       |
| `make kill PORT=<number>`| Kill the process running on the specified port  |
| `make dropdb`           | Drop the PostgreSQL database                    |
| `make createdb`         | Create the PostgreSQL database                  |
| `make kcat TOPIC=<name>`| Listen to a Kafka topic using `kcat`            |
| `make tree`             | Show the project structure                      |
| `make generate-schema SCHEMA=<name>` | Generate and apply schema from DBML |
| `make dbdocs-build SCHEMA=<name>` | Generate DBML documentation            |
| `make list-ports`       | List processes running on the specified ports   |
| `make kill-ports`       | Kill processes running on the specified ports   |

---





## Finish your CI setup

[Click here to finish setting up your workspace!](https://cloud.nx.app/connect/aH5xmx6phn)


## Run tasks

To run the dev server for your app, use:

```sh
npx nx serve api-gateway
```

To create a production bundle:

```sh
npx nx build api-gateway
```

To see all available targets to run for a project, run:

```sh
npx nx show project api-gateway
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/features/generate-code?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) feature.

Use the plugin's generator to create new projects.

To generate a new application, use:

```sh
npx nx g @nx/node:app demo
```

To generate a new library, use:

```sh
npx nx g @nx/node:lib mylib
```

You can use `npx nx list` to get a list of installed plugins. Then, run `npx nx list <plugin-name>` to learn about more specific capabilities of a particular plugin. Alternatively, [install Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) to browse plugins and generators in your IDE.

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)


[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

