# Live of Interest Teams Bot

A Microsoft Teams bot that automatically extracts and tracks trading information from conversations, with real-time synchronization between Teams and a web dashboard.

## Features

- **Intelligent Extraction**: Uses Azure OpenAI (GPT-4) to extract customer, product, pricing, and delivery information from conversations
- **Adaptive Cards**: Interactive, editable cards in Teams for Live of Interest tracking
- **Real-time Sync**: Bidirectional synchronization between Teams and web dashboard using Socket.IO
- **Modification History**: Track all changes with complete audit trail
- **Fluent UI**: Modern, Microsoft Teams-style interface for the web dashboard

## Architecture

### Backend
- Node.js + TypeScript
- Bot Framework SDK v4
- Azure OpenAI for NLP
- PostgreSQL for data storage
- Socket.IO for real-time communication
- Express REST API

### Frontend
- React 18 + TypeScript
- Fluent UI React Components
- Socket.IO client
- Vite build tool

### Database
- PostgreSQL with UUID support
- Three main tables: `live_of_interests`, `modification_history`, `bot_conversation_state`

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- Azure Bot Service registration
- Azure OpenAI Service access
- Microsoft Teams (for testing)

## Setup

### 1. Database Setup

```bash
# Create database
createdb loi_database

# Run schema
psql loi_database < database/schema.sql
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your credentials:
# - MICROSOFT_APP_ID and MICROSOFT_APP_PASSWORD (from Azure Bot Service)
# - AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY, AZURE_OPENAI_DEPLOYMENT_NAME
# - DATABASE_URL (PostgreSQL connection string)

# Run in development mode
npm run dev

# Or build and run in production
npm run build
npm start
```

The backend will start two servers:
- Bot endpoint: http://localhost:3978/api/messages
- API & Socket.IO: http://localhost:3000

### 3. Frontend Setup

```bash
cd frontend
npm install

# Copy environment file
cp .env.example .env
# Edit .env if needed (defaults should work for local development)

# Run development server
npm run dev

# Or build for production
npm run build
npm run preview
```

The frontend will be available at: http://localhost:3001

### 4. Azure Bot Service Configuration

1. Create a Bot Registration in Azure Portal
2. Copy the App ID and Password to your backend `.env` file
3. Configure the messaging endpoint: `https://your-domain.com/api/messages`
4. Enable Teams channel
5. Add the bot to your Teams tenant

## Usage

### In Microsoft Teams

1. Add the bot to a group chat
2. Have a conversation about a trade:
   ```
   Sales Manager: Customer Lindt wants to buy 100 MT cocoa butter at 2.56 FOB H1 2026. Is this offer ok?
   Director: No, offer 2.78 FOB.
   Sales Manager: Ok.
   ```
3. Mention the bot:
   - `@BotName` - Analyze messages since last card
   - `@BotName last 50` - Analyze last 50 messages
   - `@BotName since 2 hours ago` - Analyze messages from last 2 hours
4. Review the preview card and click "Confirm"
5. The Live of Interest card appears in the group chat
6. Edit any field and click "Save Changes" to update

### In Web Dashboard

1. Open http://localhost:3001
2. Enter your name
3. View all Live of Interests
4. Create, edit, or delete LOIs
5. All changes sync in real-time with Teams

## Project Structure

```
TeamsBot/
├── backend/
│   ├── src/
│   │   ├── bot/                    # Bot logic
│   │   │   ├── bot.ts             # Main bot class
│   │   │   ├── messageHandler.ts  # Message processing
│   │   │   ├── actionHandler.ts   # Card action handling
│   │   │   └── cardGenerator.ts   # Adaptive card templates
│   │   ├── services/
│   │   │   ├── openai.service.ts  # Azure OpenAI integration
│   │   │   ├── teams.service.ts   # Teams API helpers
│   │   │   ├── loi.service.ts     # LOI business logic
│   │   │   └── sync.service.ts    # Real-time sync
│   │   ├── database/
│   │   │   ├── connection.ts      # PostgreSQL connection
│   │   │   └── models/            # Data models
│   │   ├── api/
│   │   │   └── routes.ts          # REST API endpoints
│   │   ├── socket/
│   │   │   └── socketHandler.ts   # Socket.IO setup
│   │   └── index.ts               # Entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LOIDashboard.tsx   # Main dashboard
│   │   │   ├── LOIForm.tsx        # Create/edit form
│   │   │   └── LOIListItem.tsx    # List item card
│   │   ├── services/
│   │   │   ├── api.ts             # API client
│   │   │   └── socket.ts          # Socket.IO client
│   │   ├── App.tsx                # Root component
│   │   └── main.tsx               # Entry point
│   ├── package.json
│   └── vite.config.ts
├── database/
│   └── schema.sql                 # Database schema
└── README.md
```

## API Endpoints

### REST API

- `GET /api/lois` - Get all LOIs
- `GET /api/lois/:id` - Get LOI by ID
- `POST /api/lois` - Create new LOI
- `PUT /api/lois/:id` - Update LOI
- `DELETE /api/lois/:id` - Delete LOI
- `GET /api/lois/:id/history` - Get modification history
- `GET /api/health` - Health check

### Socket.IO Events

**Server → Client:**
- `loi:created` - New LOI created
- `loi:updated` - LOI updated
- `loi:deleted` - LOI deleted
- `notification` - General notification

**Client → Server:**
- `join:conversation` - Join conversation room
- `leave:conversation` - Leave conversation room
- `loi:web-update` - Notify web update
- `ping` - Connection health check

## Deployment

### Azure Deployment

1. **Azure Bot Service**: Already configured during setup
2. **Azure App Service**: Deploy backend (Node.js)
   ```bash
   az webapp up --name loi-bot-backend --resource-group YourResourceGroup
   ```
3. **Azure Database for PostgreSQL**: Provision managed PostgreSQL
4. **Azure Static Web Apps**: Deploy frontend
   ```bash
   az staticwebapp create --name loi-frontend --resource-group YourResourceGroup
   ```
5. **Azure OpenAI Service**: Already configured during setup

### Environment Variables for Production

Update your Azure App Service configuration with:
- `MICROSOFT_APP_ID`, `MICROSOFT_APP_PASSWORD`
- `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_KEY`, `AZURE_OPENAI_DEPLOYMENT_NAME`
- `DATABASE_URL` (from Azure PostgreSQL)
- `FRONTEND_URL` (from Azure Static Web Apps)
- `NODE_ENV=production`

## Development

### Run Tests
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Database Migrations

To reset the database:
```bash
psql loi_database < database/schema.sql
```

## Troubleshooting

### Bot not responding in Teams
- Check Bot Service messaging endpoint configuration
- Verify App ID and Password in `.env`
- Check backend logs for errors

### Socket.IO not connecting
- Verify CORS settings match your frontend URL
- Check firewall/network settings
- Ensure Socket.IO port is accessible

### Database connection errors
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database and schema exist

## License

MIT

## Support

For issues and questions, please open an issue in the repository.

