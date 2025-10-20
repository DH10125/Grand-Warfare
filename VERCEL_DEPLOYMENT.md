# Vercel Deployment Guide

This document provides detailed instructions for deploying Grand Warfare to Vercel and troubleshooting common issues.

## Prerequisites

- A GitHub account with this repository
- A Vercel account (free tier is sufficient)
- Node.js 18.18 or higher installed locally (for testing)

## Initial Deployment

### Method 1: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import this GitHub repository
4. Vercel should automatically detect Next.js - **DO NOT** change any settings
5. Click "Deploy"

### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to project directory
cd Grand-Warfare

# Deploy
vercel
```

## Vercel Project Settings

If you encounter issues, verify these settings in your Vercel project dashboard:

### General Settings

- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (leave empty/default)
- **Build Command**: `npm run build` (default)
- **Output Directory**: Leave empty (Next.js manages this)
- **Install Command**: `npm install` (default)

### Environment Variables

This project doesn't require any environment variables for basic deployment.

### Build & Development Settings

- **Node.js Version**: Should be 18.x or higher (auto-detected from `.node-version` file)
- Do NOT add custom build commands unless necessary
- Do NOT set a custom output directory

## Troubleshooting 404 Errors

If you get a 404 error after deployment, try these solutions in order:

### 1. Clear Build Cache and Redeploy

In your Vercel project dashboard:
1. Go to Settings → General
2. Scroll down to "Build & Development Settings"
3. Click "Clear Build Cache"
4. Go to Deployments tab
5. Click the three dots (⋯) on your latest deployment
6. Select "Redeploy"

### 2. Verify Framework Detection

1. Go to your project Settings → General
2. Check that "Framework Preset" shows "Next.js"
3. If it shows "Other" or something else:
   - Change it to "Next.js"
   - Redeploy

### 3. Check Build Logs

1. Go to Deployments tab
2. Click on your latest deployment
3. Click "Building" to view build logs
4. Look for any errors or warnings
5. Ensure the build completes successfully with "Build Completed"

### 4. Verify Node.js Version

1. Check the build logs for the Node.js version being used
2. It should be 18.x or higher
3. If it's lower, the `.node-version` file should force the correct version
4. You may need to redeploy after committing the `.node-version` file

### 5. Check for Custom Configurations

Ensure you don't have:
- A `vercel.json` file with `outputDirectory` set (this is incorrect for Next.js - the minimal `vercel.json` in this project only sets the framework preset, which is correct)
- Custom build scripts that might interfere
- Incorrect `output` setting in `next.config.js` (should be empty or omitted for Vercel)

### 6. Domain and Path Issues

- Try accessing the site with and without a trailing slash: `yoursite.vercel.app` and `yoursite.vercel.app/`
- Clear your browser cache or try incognito mode
- Verify you're accessing the correct deployment URL (check Deployments tab)

## Common Issues and Solutions

### Issue: "Build succeeded but site shows 404"

**Solution**: This usually means Vercel is treating the project as a static site instead of a Next.js app.

1. Delete the Vercel project completely
2. Re-import the repository
3. Let Vercel auto-detect the framework (don't manually select)
4. Deploy

### Issue: "Build fails with Node.js version error"

**Solution**: The project requires Node.js 18.18+

1. Ensure `.node-version` file exists in the repository
2. Commit and push if it was missing
3. Redeploy

### Issue: "Static files (images/SVGs) not loading"

**Solution**: Ensure files in the `public` directory are committed to git

```bash
git ls-files public/
# Should show all files in public directory
```

### Issue: "Previous attempts to fix made it worse"

**Solution**: Start fresh

1. Delete the Vercel project
2. Ensure your repository has:
   - `vercel.json` (minimal configuration)
   - `.node-version` file
   - `package.json` with engines specified
3. Re-import to Vercel
4. Let Vercel auto-configure everything

## Verifying Local Build

Before deploying, ensure the production build works locally:

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start
```

Open http://localhost:3000 and verify everything works.

## Getting Help

If you still encounter issues after trying all the above:

1. Check [Vercel's Next.js deployment documentation](https://vercel.com/docs/frameworks/nextjs)
2. Verify your repository has all necessary files committed
3. Share your build logs when asking for help

## What's Configured

This repository includes:

- ✅ `.node-version` - Forces Node.js 18.18.0
- ✅ `package.json` with `engines` field
- ✅ `vercel.json` with Next.js framework preset
- ✅ Standard Next.js 15 App Router structure
- ✅ All source files and assets committed

The deployment should work without any custom configuration.
