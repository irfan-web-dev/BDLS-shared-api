#!/bin/sh
set -e

echo "Running Shared DB migrations..."
npx sequelize-cli db:migrate

echo "Running conditional seed..."
node src/seed.js

echo "Starting Shared API server..."
exec node src/index.js
