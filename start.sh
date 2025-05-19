#!/bin/sh
echo "Waiting for MongoDB to be ready..."
sleep 10
echo "Running database seeding..."
node seedProducts.js
echo "Starting the application..."
node index.js 