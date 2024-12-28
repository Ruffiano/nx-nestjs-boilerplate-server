# Define variables
DOCKER_COMPOSE_FILE=docker-compose.yml
KILL_DOCKERS_SCRIPT=kill-dockers.sh
DEFAULT_SCHEMA=schema

# Load environment variables from .env file
include .env
export $(shell sed 's/=.*//' .env)

# Default target: show help
.PHONY: help
help:
	@clear
	@echo "Available commands:"
	@echo "------------------------------------------------------------------------------------------------"
	@printf "| %-40s | %-50s |\n" "Command" "Description"
	@echo "------------------------------------------------------------------------------------------------"
	@printf "| %-40s | %-50s |\n" "make run-all" "Run all projects using Nx CLI"
	@printf "| %-40s | %-50s |\n" "make run PROJECT=<name>" "Run a single project using Nx CLI"
	@printf "| %-40s | %-50s |\n" "make grpc-build" "Generate gRPC code from proto files"
	@printf "| %-40s | %-50s |\n" "make docker-up" "Run docker-compose up"
	@printf "| %-40s | %-50s |\n" "make docker-down" "Run docker-compose down"
	@printf "| %-40s | %-50s |\n" "make kill-dockers" "Run the kill-dockers.sh script"
	@printf "| %-40s | %-50s |\n" "make nx-reset" "Reset Nx cache and daemon"
	@printf "| %-40s | %-50s |\n" "make kill PORT=<number>" "Kill the process running on the specified port"
	@printf "| %-40s | %-50s |\n" "make dropdb" "Drop the PostgreSQL database"
	@printf "| %-40s | %-50s |\n" "make createdb" "Create the PostgreSQL database"
	@printf "| %-40s | %-50s |\n" "make kcat TOPIC=<name>" "Run kcat to listen to a Kafka topic"
	@printf "| %-40s | %-50s |\n" "make tree" "Show the project structure"
	@printf "| %-40s | %-50s |\n" "make generate-schema SCHEMA=<name>" "Generate and apply schema from DBML"
	@printf "| %-40s | %-50s |\n" "make dbdocs-build SCHEMA=<name>" "Generate DBML documentation"
	@printf "| %-40s | %-50s |\n" "make list-ports" "List processes running on the specified ports"
	@printf "| %-40s | %-50s |\n" "make kill-ports" "Kill processes running on the specified ports"
	@echo "------------------------------------------------------------------------------------------------"


# Run all projects using Nx CLI
.PHONY: run-all
run-all:
	nx run-many --target=serve --all --parallel --maxParallel=11

# Run a single project using Nx CLI
.PHONY: run
run:
ifndef PROJECT
	$(error PROJECT is undefined. Use 'make run PROJECT=<name>' to specify a project)
endif
	nx serve $(PROJECT)

# Generate gRPC code from proto files
.PHONY: grpc-build
grpc-build:
	npm run proto:generate

# Run docker-compose up
.PHONY: docker-up
docker-up:
	docker-compose -f $(DOCKER_COMPOSE_FILE) up --build -d

# Run docker-compose down
.PHONY: docker-down
docker-down:
	docker-compose -f $(DOCKER_COMPOSE_FILE) down

# Run the kill-dockers.sh script
.PHONY: kill-dockers
kill-dockers:
	./$(KILL_DOCKERS_SCRIPT)

# Reset Nx cache and daemon
.PHONY: nx-reset
nx-reset:
	nx reset

# Kill the process running on the specified port
.PHONY: kill
kill:
ifndef PORT
	$(error PORT is undefined. Use 'make kill PORT=<number>' to specify a port)
endif
	sudo kill -9 `sudo lsof -t -i:$(PORT)`

# Drop the PostgreSQL database
.PHONY: dropdb
dropdb:
	@echo "Dropping the PostgreSQL database..."
	@echo "Current databases:"
	docker exec -it postgres psql -U ${POSTGRES_USER} -d postgres -c "\l"
	docker exec -it postgres psql -U ${POSTGRES_USER} -d postgres -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '${POSTGRES_DB}' AND pid <> pg_backend_pid();"
	docker exec -it postgres psql -U ${POSTGRES_USER} -d postgres -c "DROP DATABASE IF EXISTS \"${POSTGRES_DB}\";"

# Create the PostgreSQL database
.PHONY: createdb
createdb:
	@echo "Creating the PostgreSQL database..."
	docker exec -it postgres psql -U ${POSTGRES_USER} -d postgres -c "CREATE DATABASE \"${POSTGRES_DB}\";"

# Listen to a Kafka topic using kcat
.PHONY: kcat
kcat:
ifndef TOPIC
	$(error TOPIC is undefined. Use 'make kcat TOPIC=<name>' to specify a topic)
endif
	kcat -b localhost:9093 -t $(TOPIC) -C -o beginning -f '\nKey: %k\nValue: %s\n'

# Show the project structure
.PHONY: tree
tree:
	tree -I 'node_modules|dist|coverage|tmp|*.log|*.pid|*.sock'

# Generate and apply schema from DBML
.PHONY: generate-schema
generate-schema:
	 make dropdb
	 make createdb
	./generate-schema.sh $(if $(SCHEMA),$(SCHEMA),$(DEFAULT_SCHEMA))

# Generate DBML documentation
.PHONY: dbdocs-build
dbdocs-build:
	dbdocs build packages/sqlml/src/lib/schema/$(if $(SCHEMA),$(SCHEMA),$(DEFAULT_SCHEMA)).dbml



# Kill processes running on the specified ports
# List of services and their ports from the .env file
PORTS := $(API_GATEWAY_HTTP_PORT) $(ADMIN_SERVICE_GRPC_PORT) $(AUTH_SERVICE_GRPC_PORT) \
         $(POOL_MANAGER_GRPC_PORT) $(FILE_MANAGER_GRPC_PORT) $(WEB3_STORAGE_EVEN_GRPC_PORT) \
         $(NOTIFICATION_SERVICE_GRPC_PORT) $(WEB3_STORAGE_PROVIDER_SERVICE_GRPC_PORT)

SERVICE_NAMES := API-Gateway Admin-Service Authentication-Service Pool-Manager-Service \
                 File-Manager-Service Web3-Storage-Event-Service Notification-Service \
                 Web3-Storage-Provider-Service

# Command to list processes running on the specified ports
list-ports:
	@printf "| %-5s | %-5s | %-15s | %-30s | %-20s |\n" "Port" "PID" "Process Name" "Service Name" "Status"
	@printf "| %-5s | %-5s | %-15s | %-30s | %-20s |\n" "-----" "-----" "---------------" "------------------------------" "-------------------"
	@i=0; for port in $(PORTS); do \
		pid=$$(sudo lsof -t -i:$$port 2>/dev/null); \
		service_name=$$(echo $(SERVICE_NAMES) | cut -d ' ' -f $$((i+1))); \
		if [ -n "$$pid" ]; then \
			process_name=$$(ps -p $$pid -o comm=); \
			printf "| %-5s | %-5s | %-15s | %-30s | %-20s |\n" "$$port" "$$pid" "$$process_name" "$$service_name" "Running"; \
		else \
			printf "| %-5s | %-5s | %-15s | %-30s | %-20s |\n" "$$port" "-" "-" "$$service_name" "No process running"; \
		fi; \
		i=$$((i+1)); \
	done

# Command to kill processes running on the specified ports with a structured table
kill-ports:
	@printf "| %-5s | %-5s | %-15s | %-30s | %-25s |\n" "Port" "PID" "Process Name" "Service Name" "Action"
	@printf "| %-5s | %-5s | %-15s | %-30s | %-25s |\n" "-----" "-----" "---------------" "------------------------------" "-------------------------"
	@i=0; for port in $(PORTS); do \
		pid=$$(sudo lsof -t -i:$$port 2>/dev/null); \
		service_name=$$(echo $(SERVICE_NAMES) | cut -d ' ' -f $$((i+1))); \
		if [ -n "$$pid" ]; then \
			process_name=$$(ps -p $$pid -o comm=); \
			sudo kill -9 $$pid 2>/dev/null; \
			printf "| %-5s | %-5s | %-15s | %-30s | %-25s |\n" "$$port" "$$pid" "$$process_name" "$$service_name" "Killed"; \
		else \
			printf "| %-5s | %-5s | %-15s | %-30s | %-25s |\n" "$$port" "-" "-" "$$service_name" "No process on this port"; \
		fi; \
		i=$$((i+1)); \
	done

.PHONY: list-ports kill-ports