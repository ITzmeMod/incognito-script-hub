# INCOGNITO - Roblox Script Hub

A modern website for sharing Roblox scripts with secure owner-only access using Google Sign-In.

## Owner Access

This website is configured to recognize the following Google account as the owner:
- **Owner Email:** fortuitocliffordgwapo@gmail.com

When logged in with this Google account, you'll have full access to all administrative features.

## Setup Instructions

### 1. Create a Google OAuth Client ID

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Add your domain to the "Authorized JavaScript origins"
7. Click "Create"
8. Copy the Client ID

### 2. Configure the Website

1. Open `lib/google-auth-config.ts`
2. Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Google Client ID
3. The owner email is already set to "fortuitocliffordgwapo@gmail.com"

### 3. Deploy the Website

Deploy the website to Vercel, Netlify, or any other hosting provider.

### 4. (Optional) Deploy the Cloudflare Worker

For additional security with backend validation:

1. Sign up for a [Cloudflare Workers](https://workers.cloudflare.com/) account
2. Create a new Worker
3. Copy the code from `cloudflare-worker.js`
4. Update the `GOOGLE_CLIENT_ID` and `OWNER_EMAIL` variables
5. Deploy the Worker
6. Update the website to use the Worker for token validation

## Features

### For Regular Users (No Login Required)
- Browse all available scripts
- Download scripts using the provided links
- Filter scripts by category
- View script details and descriptions

### For Owner (Google Sign-In Required)
- Edit and manage all scripts
- Add new scripts
- Customize website settings
- Access the owner dashboard
- Monitor website analytics

## Security Features

- Google Sign-In for secure owner authentication
- Owner access restricted to fortuitocliffordgwapo@gmail.com
- Client-side token validation
- Secure token storage and handling
