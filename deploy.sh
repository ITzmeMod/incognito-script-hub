#!/bin/bash
# Deployment script for easy setup

echo "🚀 Deploying INCOGNITO Script Hub to Vercel..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🌐 Ready for Vercel deployment!"
else
    echo "❌ Build failed. Please check for errors."
    exit 1
fi
