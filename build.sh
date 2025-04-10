#!/bin/bash

# Build and run the Titanium Manager application

echo "Building Titanium Manager..."
npm run build

if [ $? -eq 0 ]; then
  echo "Build successful! Starting the application..."
  npm start
else
  echo "Build failed. Please check the errors above."
  exit 1
fi 