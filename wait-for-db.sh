#!/bin/sh

# Wait for the database to be ready
echo "Waiting for PostgreSQL to be ready..."
until nc -z db 5432; do
  sleep 1
done

echo "PostgreSQL is ready!"
