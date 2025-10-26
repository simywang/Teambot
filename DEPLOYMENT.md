# Deployment Guide for Live of Interest Teams Bot

This guide provides step-by-step instructions for deploying the Live of Interest Teams Bot to Azure.

## Prerequisites

- Azure subscription
- Azure CLI installed and logged in
- Node.js 18+ and npm
- Git repository
- Teams admin access

## Azure Resources Setup

### 1. Create Resource Group

```bash
az group create \
  --name loi-bot-rg \
  --location eastus
```

### 2. Create Azure Database for PostgreSQL

```bash
az postgres flexible-server create \
  --name loi-db-server \
  --resource-group loi-bot-rg \
  --location eastus \
  --admin-user dbadmin \
  --admin-password <your-secure-password> \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 14

# Allow Azure services to access
az postgres flexible-server firewall-rule create \
  --resource-group loi-bot-rg \
  --name loi-db-server \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Create database
az postgres flexible-server db create \
  --resource-group loi-bot-rg \
  --server-name loi-db-server \
  --database-name loi_database
```

Connection string format:
```
postgresql://dbadmin:<password>@loi-db-server.postgres.database.azure.com:5432/loi_database?sslmode=require
```

### 3. Initialize Database Schema

```bash
# Connect to the database
psql "postgresql://dbadmin:<password>@loi-db-server.postgres.database.azure.com:5432/loi_database?sslmode=require"

# Run schema script
\i database/schema.sql
```

### 4. Create Azure Bot Service

```bash
# Create Bot Registration
az bot create \
  --resource-group loi-bot-rg \
  --name loi-teams-bot \
  --kind registration \
  --endpoint https://loi-bot-backend.azurewebsites.net/api/messages \
  --app-type MultiTenant

# Get App ID and Password
az bot show --name loi-teams-bot --resource-group loi-bot-rg
```

After creation:
1. Go to Azure Portal → Bot Service → Configuration
2. Note down the Microsoft App ID
3. Create a new Client Secret and save it (this is your MICROSOFT_APP_PASSWORD)

### 5. Configure Azure OpenAI

If you don't have Azure OpenAI yet:

```bash
# Create Azure OpenAI resource
az cognitiveservices account create \
  --name loi-openai \
  --resource-group loi-bot-rg \
  --kind OpenAI \
  --sku S0 \
  --location eastus

# Deploy GPT-4 model
# This needs to be done through Azure Portal:
# Go to Azure OpenAI Studio → Deployments → Create new deployment
# Model: gpt-4, Deployment name: gpt-4
```

Get your credentials:
```bash
az cognitiveservices account keys list \
  --name loi-openai \
  --resource-group loi-bot-rg
```

Endpoint format: `https://loi-openai.openai.azure.com/`

### 6. Deploy Backend (App Service)

#### Create App Service Plan

```bash
az appservice plan create \
  --name loi-bot-plan \
  --resource-group loi-bot-rg \
  --sku B1 \
  --is-linux
```

#### Create Bot Web App

```bash
az webapp create \
  --resource-group loi-bot-rg \
  --plan loi-bot-plan \
  --name loi-bot-backend \
  --runtime "NODE:18-lts"
```

#### Configure Environment Variables

```bash
az webapp config appsettings set \
  --resource-group loi-bot-rg \
  --name loi-bot-backend \
  --settings \
    MICROSOFT_APP_ID="<your-app-id>" \
    MICROSOFT_APP_PASSWORD="<your-app-password>" \
    MICROSOFT_APP_TYPE="MultiTenant" \
    AZURE_OPENAI_ENDPOINT="https://loi-openai.openai.azure.com/" \
    AZURE_OPENAI_KEY="<your-openai-key>" \
    AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4" \
    DATABASE_URL="postgresql://dbadmin:<password>@loi-db-server.postgres.database.azure.com:5432/loi_database?sslmode=require" \
    PORT="3978" \
    API_PORT="3000" \
    NODE_ENV="production" \
    FRONTEND_URL="https://loi-frontend.azurestaticapps.net"
```

#### Deploy Backend Code

```bash
cd backend

# Build the project
npm install
npm run build

# Create deployment package
zip -r deploy.zip dist node_modules package.json

# Deploy to Azure
az webapp deployment source config-zip \
  --resource-group loi-bot-rg \
  --name loi-bot-backend \
  --src deploy.zip
```

Or use GitHub Actions (recommended):

```yaml
# .github/workflows/backend-deploy.yml
name: Deploy Backend

on:
  push:
    branches: [ main ]
    paths: [ 'backend/**' ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Build
        run: |
          cd backend
          npm ci
          npm run build
      - name: Deploy
        uses: azure/webapps-deploy@v2
        with:
          app-name: loi-bot-backend
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: backend
```

#### Create API Web App (separate instance for API/Socket.IO)

```bash
az webapp create \
  --resource-group loi-bot-rg \
  --plan loi-bot-plan \
  --name loi-api-backend \
  --runtime "NODE:18-lts"

# Configure same settings as bot backend
# Deploy same code (it serves both endpoints)
```

Or configure Bot backend to handle both (recommended for smaller deployments).

### 7. Deploy Frontend (Azure Static Web Apps)

```bash
# Create Static Web App
az staticwebapp create \
  --name loi-frontend \
  --resource-group loi-bot-rg \
  --location eastus2

# Get deployment token
az staticwebapp secrets list \
  --name loi-frontend \
  --resource-group loi-bot-rg
```

#### Configure Frontend Environment

Create `frontend/.env.production`:
```
VITE_API_URL=https://loi-bot-backend.azurewebsites.net
VITE_SOCKET_URL=https://loi-bot-backend.azurewebsites.net
```

#### Deploy Frontend

Using GitHub Actions (automatic):

```yaml
# .github/workflows/frontend-deploy.yml
name: Deploy Frontend

on:
  push:
    branches: [ main ]
    paths: [ 'frontend/**' ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Build
        run: |
          cd frontend
          npm ci
          npm run build
      - name: Deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "frontend"
          output_location: "dist"
```

Or manual deployment:
```bash
cd frontend
npm install
npm run build

# Install SWA CLI
npm install -g @azure/static-web-apps-cli

# Deploy
swa deploy ./dist \
  --deployment-token <your-deployment-token> \
  --app-name loi-frontend
```

### 8. Configure Teams Channel

1. Go to Azure Portal → Bot Service → Channels
2. Click on Teams icon
3. Click "Save"
4. Click "Open in Teams" to test

### 9. Create Teams App Package

Create `manifest.json`:
```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/teams/v1.16/MicrosoftTeams.schema.json",
  "manifestVersion": "1.16",
  "version": "1.0.0",
  "id": "<your-app-id>",
  "packageName": "com.yourcompany.loibot",
  "developer": {
    "name": "Your Company",
    "websiteUrl": "https://yourcompany.com",
    "privacyUrl": "https://yourcompany.com/privacy",
    "termsOfUseUrl": "https://yourcompany.com/terms"
  },
  "name": {
    "short": "LOI Bot",
    "full": "Live of Interest Bot"
  },
  "description": {
    "short": "Automatically track trading information",
    "full": "Live of Interest Bot automatically extracts and tracks trading information from conversations with real-time sync."
  },
  "icons": {
    "outline": "outline.png",
    "color": "color.png"
  },
  "accentColor": "#0078D4",
  "bots": [
    {
      "botId": "<your-bot-app-id>",
      "scopes": ["groupchat", "team"],
      "supportsFiles": false,
      "isNotificationOnly": false,
      "commandLists": [
        {
          "scopes": ["groupchat", "team"],
          "commands": [
            {
              "title": "help",
              "description": "Show help information"
            },
            {
              "title": "last 50",
              "description": "Analyze last 50 messages"
            }
          ]
        }
      ]
    }
  ],
  "permissions": ["identity", "messageTeamMembers"],
  "validDomains": []
}
```

Create app package:
```bash
# Create icons (color.png 192x192, outline.png 32x32)
# Then zip them with manifest
zip teams-app.zip manifest.json color.png outline.png
```

Upload to Teams:
1. Go to Teams → Apps → Manage your apps
2. Click "Upload an app" → "Upload a custom app"
3. Select teams-app.zip
4. Add to a team or group chat

## Post-Deployment Verification

### 1. Check Backend Health

```bash
curl https://loi-bot-backend.azurewebsites.net/health
```

### 2. Check API Health

```bash
curl https://loi-bot-backend.azurewebsites.net/api/health
```

### 3. Test Database Connection

Check App Service logs:
```bash
az webapp log tail \
  --name loi-bot-backend \
  --resource-group loi-bot-rg
```

### 4. Test in Teams

1. Add bot to a group chat
2. Send "@BotName help"
3. Have a conversation and mention the bot
4. Verify card appears

### 5. Test Web Dashboard

1. Open https://loi-frontend.azurestaticapps.net
2. Enter your name
3. Verify connection status shows "Connected"
4. Test CRUD operations

## Monitoring and Logging

### Enable Application Insights

```bash
# Create Application Insights
az monitor app-insights component create \
  --app loi-bot-insights \
  --location eastus \
  --resource-group loi-bot-rg

# Link to App Service
az monitor app-insights component connect-webapp \
  --app loi-bot-insights \
  --resource-group loi-bot-rg \
  --web-app loi-bot-backend
```

### View Logs

```bash
# Stream logs
az webapp log tail \
  --name loi-bot-backend \
  --resource-group loi-bot-rg

# Download logs
az webapp log download \
  --name loi-bot-backend \
  --resource-group loi-bot-rg \
  --log-file logs.zip
```

## Scaling

### Scale Backend

```bash
# Scale up (vertical)
az appservice plan update \
  --name loi-bot-plan \
  --resource-group loi-bot-rg \
  --sku P1V2

# Scale out (horizontal)
az webapp scale \
  --name loi-bot-backend \
  --resource-group loi-bot-rg \
  --instance-count 2
```

### Scale Database

```bash
az postgres flexible-server update \
  --resource-group loi-bot-rg \
  --name loi-db-server \
  --sku-name Standard_D2s_v3
```

## Troubleshooting

### Bot not responding
- Check Bot Service messaging endpoint
- Verify App ID and Password
- Check App Service logs
- Test /api/messages endpoint

### Database connection errors
- Verify firewall rules
- Check connection string
- Ensure SSL mode is enabled

### Socket.IO not connecting
- Check CORS configuration
- Verify WebSocket support is enabled on App Service
- Test Socket.IO endpoint directly

## Cost Estimation

Monthly costs (approximate):
- App Service B1: $13/month
- PostgreSQL Basic: $25/month
- Azure OpenAI: Pay per use (~$0.06/1K tokens)
- Static Web Apps: Free tier
- Bot Service: Free
- **Total: ~$50-100/month** (depending on usage)

## Security Recommendations

1. Use Azure Key Vault for secrets
2. Enable managed identities
3. Restrict database firewall to Azure IPs only
4. Enable HTTPS only
5. Implement rate limiting
6. Regular security updates
7. Monitor with Azure Security Center

## Backup and Recovery

### Database Backup

```bash
# Enable automated backups (default: 7 days)
az postgres flexible-server update \
  --resource-group loi-bot-rg \
  --name loi-db-server \
  --backup-retention 14

# Manual backup
pg_dump "postgresql://dbadmin:<password>@loi-db-server.postgres.database.azure.com:5432/loi_database?sslmode=require" > backup.sql
```

### Application Backup

Use Azure Backup or Git-based deployments for quick rollback.

## Support

For deployment issues, check:
1. App Service logs
2. Application Insights
3. Bot Service activity logs
4. Database logs

