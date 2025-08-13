#!/bin/bash

# Movie Picker Backend Deployment Script
# This script helps deploy the backend to free hosting platforms

set -e

echo "🚀 Movie Picker Backend Deployment Script"
echo "=========================================="

# Check if we're in the backend directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Please create one from env.example"
    echo "   cp env.example .env"
    echo "   Then edit .env with your configuration"
    echo ""
fi

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist directory not found. Build may have failed."
    exit 1
fi

echo ""
echo "🎯 Deployment Options:"
echo "1. Railway (Recommended - Free PostgreSQL + Hosting)"
echo "2. Render (Free tier with limitations)"
echo "3. Local deployment"
echo "4. Exit"
echo ""

read -p "Choose an option (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🚂 Deploying to Railway..."
        echo "1. Go to https://railway.app/"
        echo "2. Create a new project"
        echo "3. Connect your GitHub repository"
        echo "4. Add a PostgreSQL database"
        echo "5. Set environment variables:"
        echo "   - DATABASE_URL (from PostgreSQL service)"
        echo "   - JWT_SECRET (your secret key)"
        echo "   - NODE_ENV=production"
        echo "   - CORS_ORIGIN (your frontend URL)"
        echo ""
        echo "✅ Railway will automatically deploy on git push!"
        ;;
    2)
        echo ""
        echo "🎨 Deploying to Render..."
        echo "1. Go to https://render.com/"
        echo "2. Create a new Web Service"
        echo "3. Connect your GitHub repository"
        echo "4. Add a PostgreSQL database"
        echo "5. Set build command: npm run build"
        echo "6. Set start command: npm start"
        echo "7. Set environment variables (same as Railway)"
        echo ""
        echo "✅ Render will automatically deploy on git push!"
        ;;
    3)
        echo ""
        echo "🏠 Local Deployment"
        echo "1. Ensure PostgreSQL is running"
        echo "2. Set up your .env file"
        echo "3. Run database migrations:"
        echo "   npm run db:generate"
        echo "   npm run db:push"
        echo "4. Seed the database:"
        echo "   npx ts-node src/utils/seeder.ts"
        echo "5. Start the server:"
        echo "   npm start"
        echo ""
        echo "✅ Server will be running on http://localhost:3001"
        ;;
    4)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid option. Please choose 1-4."
        exit 1
        ;;
esac

echo ""
echo "📚 For detailed instructions, see README.md"
echo "🔗 Health check endpoint: /health"
echo "🎬 Happy Movie Picking!"
