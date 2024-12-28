#!/bin/bash

# Load specific environment variables from .env file
export $(grep -E '^(POSTGRES_USER|POSTGRES_PASSWORD|POSTGRES_DB|POSTGRES_HOST|POSTGRES_PORT)=' .env | xargs)

# Check if schema name is provided as an argument
if [ -z "$1" ]; then
  echo "Usage: ./generate-schema.sh <schema_name>"
  exit 1
fi

SCHEMA_NAME=$1

# remove .sql and entities files
rm -rf ./packages/sqlml/src/lib/sql/$SCHEMA_NAME.sql
rm -rf ./packages/sqlml/src/lib/entities

DBML_PATH="packages/sqlml/src/lib/schema/$SCHEMA_NAME.dbml"
SQL_PATH="packages/sqlml/src/lib/sql/$SCHEMA_NAME.sql"
ENTITIES_PATH="packages/sqlml/src/lib/entities"

# Check if DBML file exists
if [ ! -f "$DBML_PATH" ]; then
  echo "Error: DBML file '$DBML_PATH' does not exist."
  exit 1
fi

# Generate SQL from DBML
dbml2sql $DBML_PATH -o $SQL_PATH
if [ $? -ne 0 ]; then
  echo "Error: Failed to convert DBML to SQL."
  exit 1
fi

# Check if SQL file was created
if [ ! -f "$SQL_PATH" ]; then
  echo "Error: SQL file '$SQL_PATH' was not created."
  exit 1
fi

# Apply the SQL to the database
PGPASSWORD=$POSTGRES_PASSWORD psql -U $POSTGRES_USER -d $POSTGRES_DB -h $POSTGRES_HOST -p $POSTGRES_PORT -f $SQL_PATH
if [ $? -ne 0 ]; then
  echo "Error: Failed to apply SQL file to the database."
  exit 1
fi

# Ensure the entities directory exists
mkdir -p $ENTITIES_PATH

# Generate TypeORM models from the database schema
npx sqlml -h $POSTGRES_HOST -d $POSTGRES_DB -u $POSTGRES_USER -x $POSTGRES_PASSWORD -e postgres -o $ENTITIES_PATH --noConfig true
if [ $? -ne 0 ]; then
  echo "Error: Failed to generate TypeORM models."
  exit 1
fi

echo "Schema generation complete."
