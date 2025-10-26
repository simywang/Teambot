# Architecture Overview

## System Architecture

The Live of Interest Teams Bot consists of three main components:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Microsoft Teams                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Group Chat                                               │  │
│  │  ┌────────────┐  ┌─────────────┐  ┌──────────────────┐  │  │
│  │  │   User 1   │  │   User 2    │  │   LOI Bot        │  │  │
│  │  │            │  │             │  │  ┌────────────┐  │  │  │
│  │  │  @LOI Bot  │──┤  Conversation  ├─▶│ Adaptive   │  │  │  │
│  │  │            │  │             │  │  │   Card     │  │  │  │
│  │  └────────────┘  └─────────────┘  │  └────────────┘  │  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                           │                    ▲
                           │ Messages           │ Cards/Updates
                           ▼                    │
┌─────────────────────────────────────────────────────────────────┐
│                        Bot Backend                               │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Bot Framework SDK                                         │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │ │
│  │  │   Message    │  │   Action     │  │     Card       │  │ │
│  │  │   Handler    │  │   Handler    │  │   Generator    │  │ │
│  │  └──────┬───────┘  └──────┬───────┘  └────────┬───────┘  │ │
│  └─────────┼──────────────────┼───────────────────┼──────────┘ │
│            │                  │                   │             │
│  ┌─────────▼──────────────────▼───────────────────▼──────────┐ │
│  │                     Services Layer                         │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │ │
│  │  │   Teams      │  │   OpenAI     │  │     LOI        │  │ │
│  │  │   Service    │  │   Service    │  │   Service      │  │ │
│  │  └──────────────┘  └──────────────┘  └────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌───────────────────────────▼────────────────────────────────┐ │
│  │                      REST API                               │ │
│  │  /api/lois  |  /api/lois/:id  |  /api/lois/:id/history     │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌───────────────────────────▼────────────────────────────────┐ │
│  │                    Socket.IO Server                         │ │
│  │  Events: loi:created | loi:updated | loi:deleted           │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                           │          ▲
                           │          │
                           │          │ Real-time Sync
                           ▼          │
┌─────────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database                         │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  live_of_interests  |  modification_history  |  bot_state │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                           │          ▲
                           │          │
                           ▼          │
┌─────────────────────────────────────────────────────────────────┐
│                        Web Frontend                              │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                  React Application                         │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │ │
│  │  │     LOI      │  │     LOI      │  │     LOI        │  │ │
│  │  │  Dashboard   │  │     Form     │  │   List Item    │  │ │
│  │  └──────┬───────┘  └──────┬───────┘  └────────┬───────┘  │ │
│  └─────────┼──────────────────┼───────────────────┼──────────┘ │
│            │                  │                   │             │
│  ┌─────────▼──────────────────▼───────────────────▼──────────┐ │
│  │               Services Layer                               │ │
│  │  ┌──────────────────────┐  ┌──────────────────────┐       │ │
│  │  │    API Service       │  │   Socket Service     │       │ │
│  │  │  (Axios Client)      │  │  (Socket.IO Client)  │       │ │
│  │  └──────────────────────┘  └──────────────────────┘       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Fluent UI Components (Microsoft Teams-style design)            │
└─────────────────────────────────────────────────────────────────┘
                           │          ▲
                           └──────────┘
                        User Interactions
```

## Component Details

### 1. Teams Integration Layer

**Bot Framework SDK**
- Handles Teams-specific communication
- Manages bot lifecycle (onMessage, onMembersAdded, etc.)
- Processes @mentions and commands
- Sends/updates Adaptive Cards

**Message Handler**
- Parses commands (`last N`, `since N hours`)
- Retrieves conversation history
- Coordinates with OpenAI for extraction
- Manages bot conversation state

**Action Handler**
- Processes card actions (Confirm, Cancel, Update)
- Updates database
- Broadcasts changes via Socket.IO
- Updates cards in Teams

### 2. Backend Services

**Teams Service**
- Conversation history retrieval
- Command parameter parsing
- User information extraction
- Teams API integration

**OpenAI Service**
- Conversation analysis
- Information extraction (customer, product, ratio, etc.)
- Structured data generation
- Validation and enhancement

**LOI Service**
- CRUD operations for Live of Interests
- Modification history tracking
- Bot state management
- Database interactions

**Sync Service**
- Real-time event broadcasting
- Socket.IO room management
- Cross-platform synchronization

### 3. Data Layer

**PostgreSQL Database**

Tables:
- `live_of_interests`: Main LOI records
- `modification_history`: Audit trail
- `bot_conversation_state`: Bot processing state

Features:
- UUID primary keys
- Automatic timestamps
- JSONB for flexible change tracking
- Indexes for performance

### 4. API Layer

**REST API**
- Standard CRUD endpoints
- Modification history access
- Health checks
- CORS-enabled

**Socket.IO**
- Real-time event streaming
- Room-based broadcasting
- Connection health monitoring
- Reconnection handling

### 5. Frontend Application

**React + Fluent UI**
- Microsoft Teams-style design system
- Responsive layout
- Real-time updates
- Form validation

**Components**
- `LOIDashboard`: Main view with stats and filters
- `LOIForm`: Create/edit dialog
- `LOIListItem`: Card-based list display

**Services**
- `api.ts`: REST API client
- `socket.ts`: Socket.IO client

## Data Flow

### Flow 1: Creating LOI from Teams

```
1. User mentions bot in Teams
   │
   ├─▶ Bot receives message
   │
   ├─▶ Parse command parameters
   │
   ├─▶ Retrieve conversation history
   │
   ├─▶ Send to Azure OpenAI
   │
   ├─▶ Extract structured data
   │
   ├─▶ Generate preview card
   │
   └─▶ Send to user (private)

2. User clicks "Confirm"
   │
   ├─▶ Save to database
   │
   ├─▶ Generate editable card
   │
   ├─▶ Send to group chat
   │
   ├─▶ Broadcast via Socket.IO
   │
   └─▶ Web dashboard updates
```

### Flow 2: Editing LOI in Teams

```
1. User edits card fields
   │
   └─▶ Clicks "Save Changes"

2. Bot receives Action.Submit
   │
   ├─▶ Validate changes
   │
   ├─▶ Update database
   │
   ├─▶ Log modification history
   │
   ├─▶ Update card in Teams
   │
   ├─▶ Send notification
   │
   ├─▶ Broadcast via Socket.IO
   │
   └─▶ Web dashboard updates
```

### Flow 3: Editing LOI in Web

```
1. User edits form in web app
   │
   └─▶ Submits changes

2. API receives request
   │
   ├─▶ Validate changes
   │
   ├─▶ Update database
   │
   ├─▶ Log modification history
   │
   ├─▶ Broadcast via Socket.IO
   │
   └─▶ Bot updates Teams card
```

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Bot Framework SDK v4
- **Web Server**: Restify (Bot) + Express (API)
- **AI**: Azure OpenAI (GPT-4)
- **Database**: PostgreSQL 14+
- **Real-time**: Socket.IO
- **Testing**: Jest (optional)

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **UI Library**: Fluent UI React v9
- **Build Tool**: Vite
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Testing**: Vitest + Testing Library (optional)

### Infrastructure
- **Hosting**: Azure App Service
- **Database**: Azure Database for PostgreSQL
- **Bot**: Azure Bot Service
- **AI**: Azure OpenAI Service
- **Frontend**: Azure Static Web Apps
- **CI/CD**: GitHub Actions
- **Monitoring**: Azure Application Insights
- **Containerization**: Docker (optional)

## Security

### Authentication
- Bot: Microsoft App ID + Password
- API: Header-based user identification
- Database: Connection string with SSL

### Authorization
- Teams: Handled by Teams platform
- API: User-name based tracking
- Bot: Teams conversation context

### Data Protection
- SSL/TLS for all connections
- Environment variables for secrets
- Input validation
- SQL injection prevention (parameterized queries)

### Best Practices
- No sensitive data in logs
- Regular dependency updates
- Security scanning (Trivy)
- Rate limiting (recommended)

## Scalability

### Horizontal Scaling
- Stateless backend design
- Multiple bot/API instances
- Load balancer distribution
- Shared database

### Vertical Scaling
- App Service tier upgrades
- Database compute scaling
- Increased connection pools

### Performance Optimization
- Database indexes
- Connection pooling
- Caching (Redis - optional)
- CDN for frontend (built-in with Static Web Apps)

## Monitoring

### Application Insights
- Request/response times
- Error rates
- Custom events
- Dependency tracking

### Logging
- Structured logging
- Log levels (info, warn, error)
- Request correlation IDs
- Database query logging

### Health Checks
- `/health` endpoint
- Database connectivity
- OpenAI service status
- Socket.IO connections

## Deployment Architecture

### Development
```
Local Machine
├── PostgreSQL (Docker or local)
├── Backend (npm run dev)
├── Frontend (npm run dev)
└── ngrok (for Teams testing)
```

### Production
```
Azure Cloud
├── Azure Bot Service
│   └── Teams Channel
├── App Service (Backend)
│   ├── Bot endpoint (:3978)
│   └── API endpoint (:3000)
├── Azure Database for PostgreSQL
├── Azure OpenAI Service
└── Static Web Apps (Frontend)
```

## Extension Points

The architecture supports easy extension:

1. **New Data Fields**: Update models and database schema
2. **Additional AI Processing**: Add services in `services/`
3. **New API Endpoints**: Add routes in `api/routes.ts`
4. **Custom Cards**: Modify `bot/cardGenerator.ts`
5. **New UI Components**: Add to `frontend/src/components/`
6. **Integration with Other Systems**: Use webhooks or API calls
7. **Multi-language Support**: i18n in frontend
8. **Role-based Access**: Add auth middleware

## Future Enhancements

Potential improvements:

- [ ] Authentication with Azure AD
- [ ] Role-based permissions
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] Export to Excel/PDF
- [ ] Mobile app
- [ ] Integration with CRM systems
- [ ] Multi-tenant support
- [ ] Advanced search and filtering
- [ ] Audit log viewer
- [ ] Scheduled reports
- [ ] API rate limiting
- [ ] Caching layer (Redis)
- [ ] Message queuing (Service Bus)

