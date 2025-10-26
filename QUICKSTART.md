# Quick Start Guide

Get the Live of Interest Teams Bot up and running in 15 minutes.

## Prerequisites Check

- [ ] Node.js 18+ installed
- [ ] PostgreSQL installed and running
- [ ] Azure Bot Service registration completed
- [ ] Azure OpenAI access configured
- [ ] Teams admin access (for installation)

## Step 1: Clone and Setup (2 minutes)

```bash
# Clone the repository (or you already have it)
cd TeamsBot

# Install all dependencies
npm run install:all

# Or install individually
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

## Step 2: Database Setup (3 minutes)

```bash
# Create database
createdb loi_database

# Initialize schema
psql loi_database < database/schema.sql

# Verify
psql loi_database -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"
```

Expected output: `live_of_interests`, `modification_history`, `bot_conversation_state`

## Step 3: Configure Backend (3 minutes)

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and fill in:

```env
# From Azure Bot Service
MICROSOFT_APP_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MICROSOFT_APP_PASSWORD=your-bot-password

# From Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_KEY=your-openai-key
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4

# Database (if different from defaults)
DATABASE_URL=postgresql://postgres:password@localhost:5432/loi_database
```

## Step 4: Start Services (2 minutes)

### Option A: Using the start script (recommended)

```bash
chmod +x start.sh
./start.sh
```

### Option B: Manual start

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### Option C: Using Docker

```bash
docker-compose up
```

## Step 5: Verify Local Setup (2 minutes)

Open these URLs in your browser:

- ✅ Backend Health: http://localhost:3978/health
- ✅ API Health: http://localhost:3000/api/health
- ✅ Frontend: http://localhost:3001

You should see:
- Backend: `{"status":"ok","service":"bot","timestamp":"..."}`
- API: `{"status":"ok","timestamp":"..."}`
- Frontend: Login page asking for your name

## Step 6: Configure Teams Bot (3 minutes)

### For Local Testing (using ngrok):

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com/

# Start tunnel
ngrok http 3978
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

Update Bot Service:
1. Go to Azure Portal → Your Bot Service
2. Configuration → Messaging endpoint
3. Enter: `https://abc123.ngrok.io/api/messages`
4. Save

### Create Teams App Package:

```bash
cd teams-app

# Edit manifest.json
# Replace YOUR_APP_ID_HERE with a new GUID
# Replace YOUR_BOT_APP_ID_HERE with your Microsoft Bot App ID

# Create package
zip -r loi-bot.zip manifest.json color.png outline.png
```

## Step 7: Install in Teams (2 minutes)

1. Open Microsoft Teams
2. Click **Apps** → **Manage your apps**
3. Click **Upload an app** → **Upload a custom app**
4. Select `loi-bot.zip`
5. Add to a group chat

## Step 8: Test the Bot (5 minutes)

### Test 1: Help Command

In Teams group chat:
```
@LOI Bot help
```

Expected: Bot responds with help information

### Test 2: Extract Information

Have a conversation:
```
Sales Manager: Customer Lindt wants to buy 100 MT cocoa butter at 2.56 FOB H1 2026. Is this offer ok?
Director: No, offer 2.78 FOB.
Sales Manager: Ok.
```

Then mention the bot:
```
@LOI Bot
```

Expected:
1. Preview card appears (only you see it)
2. Click "Confirm"
3. Editable card appears in group chat
4. Check web dashboard - new LOI should appear

### Test 3: Edit in Teams

1. Find the LOI card in Teams
2. Change the ratio field
3. Click "Save Changes"

Expected:
- Card updates
- Notification appears
- Web dashboard updates in real-time

### Test 4: Edit in Web

1. Open http://localhost:3001
2. Edit an LOI
3. Save changes
4. Check Teams

Expected:
- Card updates in Teams
- Changes reflected immediately

## Troubleshooting

### Backend won't start

```bash
# Check PostgreSQL is running
psql -l

# Check .env file exists and is configured
cat backend/.env

# Check logs
cd backend
npm run dev
```

### Bot not responding in Teams

```bash
# Verify ngrok is running
curl https://your-ngrok-url.ngrok.io/health

# Check Bot Service configuration
# Azure Portal → Bot Service → Configuration → Messaging endpoint

# Check bot logs
# Look at backend console for incoming requests
```

### Database connection failed

```bash
# Test connection
psql $DATABASE_URL

# If fails, check:
# - PostgreSQL is running: pg_isctl status
# - Database exists: psql -l
# - Credentials are correct
```

### Frontend not connecting to backend

```bash
# Check backend is running
curl http://localhost:3000/api/health

# Check Socket.IO
curl http://localhost:3000/socket.io/

# Open browser console for errors
```

### OpenAI extraction not working

```bash
# Test OpenAI connection
cd backend
node -e "
const openai = require('./dist/services/openai.service').default;
openai.extractLOIFromConversation(['test message'])
  .then(console.log)
  .catch(console.error);
"
```

## Next Steps

✅ **You're all set!** The bot is running locally.

Now you can:

1. **Customize**: Modify extraction prompts in `backend/src/services/openai.service.ts`
2. **Style**: Update Fluent UI themes in frontend
3. **Deploy**: Follow `DEPLOYMENT.md` for Azure deployment
4. **Test**: Follow `TESTING.md` for comprehensive testing

## Common Commands

```bash
# Start everything
./start.sh

# Start backend only
cd backend && npm run dev

# Start frontend only
cd frontend && npm run dev

# Build for production
npm run build:all

# Clean everything
npm run clean

# Database reset
psql loi_database < database/schema.sql
```

## Getting Help

- Check logs in terminal where services are running
- Review `README.md` for detailed documentation
- See `TESTING.md` for testing scenarios
- Refer to `DEPLOYMENT.md` for production setup

## Production Checklist

Before deploying to production:

- [ ] Update all environment variables
- [ ] Configure proper database (Azure PostgreSQL)
- [ ] Set up monitoring (Application Insights)
- [ ] Configure HTTPS/SSL
- [ ] Set up backups
- [ ] Review security settings
- [ ] Test all features end-to-end
- [ ] Update Teams app manifest with production URLs
- [ ] Submit app for review (if publishing)

---

**Estimated total time**: 15-20 minutes

Need help? Check the documentation or open an issue.

