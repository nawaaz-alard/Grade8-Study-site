# SaaS Deployment Plan for Grade 8 Study Hub

This document outlines the architecture and steps to deploy your Grade 8 Study Hub as a SaaS offering on Azure using the lowest cost services.

## Architecture

We are using a **Serverless SaaS** architecture to minimize costs and maximize scalability.

- **Frontend**: **Azure Static Web Apps (SWA)**. Hosting the HTML/JS/CSS.
  - *Cost*: Free Tier.
- **Backend API**: **Azure Managed Functions** (integrated with SWA).
  - *Cost*: Included in Free Tier (up to limits).
- **Database**: **Azure Blob Storage** (JSON Files).
  - *Cost*: Extremely low (Standard LRS Hot/Cool).
  - *Data Model*: User profiles and data are stored as JSON files in a `users` container.
- **Authentication**: **Google Sign-In** (Client-side token + Server-side verification).
  - *Cost*: Free (Google Identity Services).
- **Payments**: **Paystack** (Subscription).
  - *Integration*: Frontend initiates payment -> Paystack -> Backend verifies and updates user status.

## Directory Structure

- `/` (Root): Frontend code (`index.html`, `main.js`, `style.css`).
- `/api`: Backend code (Azure Functions).
  - `/api/src/functions`: API Function endpoints (`auth-google`, `tasks`, `verifyPayment`).
  - `/api/src/shared`: Shared helpers for DB (`db.js`) and Auth (`auth.js`).

## Deployment Steps

### 1. Prerequisites
- An Azure Account (Free).
- A GitHub Repository (You are already here).
- Paystack Account (for API Keys).

### 2. Configure Azure Static Web App
1. Go to Azure Portal -> Create a resource -> **Static Web App**.
2. Select your subscription and create a resource group.
3. **Plan Type**: Choose **Free**.
4. **Deployment Details**:
   - Source: **GitHub**.
   - Sign in with GitHub and select this repository (`Grade8-Study-site`).
   - **Build Presets**: Choose **Custom**.
   - **App Location**: `/`
   - **Api Location**: `/api`
   - **Output Location**: `.` (or just leave blank if no build step).

### 3. Environment Variables
Once the resource is created, go to **Settings -> Environment variables** in the Azure Portal for your Static Web App. Add the following:

| Name | Value | Description |
|------|-------|-------------|
| `AZURE_STORAGE_CONNECTION_STRING` | *<Your Connection String>* | Get this from your Storage Account -> Access keys. |
| `PAYSTACK_SECRET_KEY` | *<Your Secret Key>* | Get this from Paystack Dashboard. |

### 4. Storage Account Setup
1. Create an **Storage Account** in Azure (Standard LRS).
2. Create a container named `users`.
3. Copy the Connection String and add it to the Environment Variables as shown above.

### 5. Google Auth Setup
1. In your **Google Cloud Console**, ensure your authorized origins include your Azure Static Web App URL (e.g., `https://brave-grass-....azurestaticapps.net`).

## API Endpoints

- **POST /api/auth/google**: Verifies Google credential, creates/updates user profile.
- **POST /api/tasks**: Creates a to-do task.
- **GET /api/tasks**: Retrieves user's tasks.
- **POST /api/verifyPayment**: Verifies a Paystack transaction and upgrades user to Premium.

## Development

To run locally, you need the **Azure Static Web Apps CLI**:
```bash
npm install -g @azure/static-web-apps-cli
swa start . --api-location ./api
```

This will emulate the production environment including the API proxy.
