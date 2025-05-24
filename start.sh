#!/bin/sh
echo "Waiting for MongoDB to be ready..."
sleep 10

# Ensure directories exist and have correct permissions
mkdir -p /app/invoices
chmod -R 755 /app/invoices

echo "Running database seeding..."
node seedProducts.js
node seedAccounts.js

echo "Generating invoices..."
node generateInvoices.js

echo "Starting the application..."
node index.js 