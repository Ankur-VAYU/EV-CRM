#!/bin/bash
echo "Setting up production build..."
npm install
npm run build
echo "Pushing updates to GitHub..."
git add .
git commit -m "Configure Supabase and Prepare for Production"
git push origin main
echo "Build and Push complete. You can now connect your repo to Vercel."
