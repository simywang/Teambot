# Testing Guide for Live of Interest Teams Bot

This document provides instructions for testing the Live of Interest Teams Bot locally and in production.

## Local Testing Setup

### 1. Prerequisites

- Node.js 18+ installed
- PostgreSQL running locally
- Azure Bot Service registration (for Teams testing)
- ngrok or similar tunneling tool (for Teams testing)
- Azure OpenAI access

### 2. Database Setup

```bash
# Create database
createdb loi_database

# Initialize schema
psql loi_database < database/schema.sql

# Verify tables
psql loi_database -c "\dt"
```

### 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

Backend should start on:
- Bot endpoint: http://localhost:3978
- API endpoint: http://localhost:3000

### 4. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend should start on: http://localhost:3001

## Unit Testing

### Backend Tests

Create test files:

```typescript
// backend/src/services/loi.service.test.ts
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import loiService from '../services/loi.service';
import pool from '../database/connection';

describe('LOI Service', () => {
  beforeAll(async () => {
    // Setup test database
  });

  afterAll(async () => {
    // Cleanup
    await pool.end();
  });

  it('should create a new LOI', async () => {
    const loiData = {
      teams_conversation_id: 'test-conv-1',
      customer: 'Test Customer',
      product: 'Test Product',
      ratio: 2.5,
      incoterm: 'FOB',
      period: 'Jan-Jun 2026',
      quantity_mt: 100,
      created_by: 'Test User',
    };

    const loi = await loiService.createLOI(loiData);
    expect(loi).toBeDefined();
    expect(loi.customer).toBe('Test Customer');
  });

  it('should update an LOI', async () => {
    // Test update functionality
  });

  it('should retrieve LOI by ID', async () => {
    // Test retrieval
  });
});
```

Run tests:
```bash
cd backend
npm test
```

### Frontend Tests

```typescript
// frontend/src/components/LOIDashboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import LOIDashboard from './LOIDashboard';

describe('LOI Dashboard', () => {
  it('renders dashboard title', () => {
    render(
      <FluentProvider theme={webLightTheme}>
        <LOIDashboard />
      </FluentProvider>
    );
    expect(screen.getByText('Live of Interest Dashboard')).toBeInTheDocument();
  });

  it('loads and displays LOIs', async () => {
    // Test LOI loading
  });
});
```

Run tests:
```bash
cd frontend
npm test
```

## Integration Testing

### 1. Test REST API

```bash
# Health check
curl http://localhost:3000/api/health

# Get all LOIs
curl http://localhost:3000/api/lois

# Create LOI
curl -X POST http://localhost:3000/api/lois \
  -H "Content-Type: application/json" \
  -H "X-User-Name: Test User" \
  -d '{
    "teams_conversation_id": "test",
    "customer": "Lindt",
    "product": "cocoa butter",
    "ratio": 2.78,
    "incoterm": "FOB",
    "period": "Jan-Jun 2026",
    "quantity_mt": 100
  }'

# Update LOI
curl -X PUT http://localhost:3000/api/lois/<loi-id> \
  -H "Content-Type: application/json" \
  -H "X-User-Name: Test User" \
  -d '{
    "ratio": 2.80
  }'

# Delete LOI
curl -X DELETE http://localhost:3000/api/lois/<loi-id> \
  -H "X-User-Name: Test User"
```

### 2. Test Socket.IO Connection

Create a test client:

```javascript
// test-socket.js
const io = require('socket.io-client');

const socket = io('http://localhost:3000', {
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
  
  socket.on('loi:created', (data) => {
    console.log('LOI Created:', data);
  });
  
  socket.on('loi:updated', (data) => {
    console.log('LOI Updated:', data);
  });
  
  socket.emit('ping');
});

socket.on('pong', () => {
  console.log('Pong received');
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});
```

Run:
```bash
node test-socket.js
```

### 3. Test Azure OpenAI Integration

```bash
# Test OpenAI service directly
cd backend
node -e "
const openaiService = require('./dist/services/openai.service').default;

const messages = [
  'Sales Manager: Customer Lindt wants to buy 100 MT cocoa butter at 2.56 FOB H1 2026. Is this offer ok?',
  'Director: No, offer 2.78 FOB.',
  'Sales Manager: Ok.'
];

openaiService.extractLOIFromConversation(messages)
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(err => console.error(err));
"
```

## Teams Bot Testing

### 1. Local Testing with Bot Framework Emulator

Download: https://github.com/Microsoft/BotFramework-Emulator/releases

1. Start backend: `npm run dev`
2. Open Bot Framework Emulator
3. Connect to: `http://localhost:3978/api/messages`
4. Enter your Microsoft App ID and Password
5. Send test messages

### 2. Testing in Teams (Local Development)

#### Setup ngrok

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com/

# Start ngrok tunnel
ngrok http 3978
```

#### Update Bot Configuration

1. Go to Azure Portal → Bot Service
2. Update messaging endpoint to: `https://<ngrok-id>.ngrok.io/api/messages`
3. Save

#### Test in Teams

1. Add bot to a group chat
2. Send test messages:
   ```
   Sales: Customer ABC wants to buy 50 MT butter at 3.00 FOB Q1 2026
   Director: Approved
   ```
3. Mention bot: `@LOIBot`
4. Verify preview card appears
5. Click "Confirm"
6. Verify editable card appears in group chat
7. Edit fields and click "Save Changes"
8. Verify changes sync

### 3. Test Scenarios

#### Scenario 1: Basic LOI Creation

```
Steps:
1. Start conversation in group chat
2. Discuss trade details (customer, product, price, etc.)
3. Mention bot: @LOIBot
4. Wait for preview card
5. Click "Confirm"
6. Verify card appears in group

Expected Result:
- Preview card shows extracted information correctly
- Final card is editable
- All fields are populated
```

#### Scenario 2: LOI Editing in Teams

```
Steps:
1. Find existing LOI card
2. Modify customer name
3. Change ratio value
4. Click "Save Changes"

Expected Result:
- Card updates in place
- Notification message appears
- Changes sync to web dashboard
- Modification history is logged
```

#### Scenario 3: Web-to-Teams Sync

```
Steps:
1. Open web dashboard
2. Create or edit an LOI
3. Save changes
4. Check Teams group chat

Expected Result:
- Changes reflect in Teams card
- Notification appears in Teams (optional)
- Status updates correctly
```

#### Scenario 4: Command Parameters

```
Test commands:
- @LOIBot
- @LOIBot last 20
- @LOIBot last 50
- @LOIBot since 1 hours ago
- @LOIBot since 3 hours ago
- @LOIBot help

Expected Results:
- Each command processes correct message range
- Help command shows usage information
```

#### Scenario 5: Error Handling

```
Test cases:
1. Mention bot with no previous messages
2. Mention bot with non-trading conversation
3. Try to edit with invalid data
4. Network disconnection
5. Database connection failure

Expected Results:
- Appropriate error messages
- No crashes
- Graceful degradation
```

## Performance Testing

### Load Testing with Artillery

```bash
npm install -g artillery

# Create test script
cat > load-test.yml << EOF
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "API Load Test"
    flow:
      - get:
          url: "/api/lois"
      - post:
          url: "/api/lois"
          json:
            teams_conversation_id: "test"
            customer: "Test"
            product: "Product"
            ratio: 2.5
            incoterm: "FOB"
            period: "Q1 2026"
            quantity_mt: 100
          headers:
            X-User-Name: "Load Test"
EOF

# Run load test
artillery run load-test.yml
```

### Socket.IO Load Testing

```javascript
// socket-load-test.js
const io = require('socket.io-client');

const connections = [];
const targetConnections = 100;

for (let i = 0; i < targetConnections; i++) {
  setTimeout(() => {
    const socket = io('http://localhost:3000');
    socket.on('connect', () => {
      console.log(`Client ${i} connected`);
      connections.push(socket);
    });
  }, i * 100);
}
```

## End-to-End Testing

### Automated E2E Tests with Playwright

```typescript
// e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test('complete LOI workflow', async ({ page }) => {
  // Navigate to dashboard
  await page.goto('http://localhost:3001');
  
  // Enter name
  await page.fill('input[placeholder="Your name"]', 'Test User');
  await page.click('button:text("Continue")');
  
  // Wait for dashboard to load
  await expect(page.locator('text=Live of Interest Dashboard')).toBeVisible();
  
  // Click "New LOI"
  await page.click('button:text("New LOI")');
  
  // Fill form
  await page.fill('input[placeholder="Enter customer name"]', 'Test Customer');
  await page.fill('input[placeholder="e.g., cocoa butter"]', 'Cocoa Butter');
  await page.fill('input[placeholder="e.g., 2.78"]', '2.78');
  await page.fill('input[placeholder="e.g., FOB, CIF"]', 'FOB');
  await page.fill('input[placeholder="e.g., Jan-Jun 2026"]', 'Q1 2026');
  await page.fill('input[placeholder="e.g., 100"]', '100');
  
  // Submit
  await page.click('button:text("Create")');
  
  // Verify LOI appears
  await expect(page.locator('text=Test Customer')).toBeVisible();
});
```

Run E2E tests:
```bash
cd frontend
npx playwright test
```

## Monitoring and Debugging

### Enable Debug Logging

Backend:
```bash
DEBUG=* npm run dev
```

Frontend:
```bash
# In browser console
localStorage.debug = '*'
```

### Common Issues

1. **Bot not responding**
   - Check ngrok tunnel is active
   - Verify Bot Service endpoint
   - Check backend logs

2. **Socket.IO not connecting**
   - Verify CORS settings
   - Check firewall
   - Test connection directly

3. **Database errors**
   - Check connection string
   - Verify PostgreSQL is running
   - Check schema is initialized

4. **OpenAI errors**
   - Verify API key
   - Check deployment name
   - Monitor rate limits

## Test Checklist

Before deployment:

- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] Bot responds in Teams
- [ ] Cards display correctly
- [ ] Editing works in Teams
- [ ] Web dashboard loads
- [ ] CRUD operations work
- [ ] Real-time sync works (both directions)
- [ ] Error handling is graceful
- [ ] Help command works
- [ ] Command parameters work
- [ ] Performance is acceptable
- [ ] Database migrations work
- [ ] Security tests pass

## Continuous Testing

### GitHub Actions CI

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: loi_database_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Run backend tests
        run: |
          cd backend
          npm ci
          npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/loi_database_test

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Run frontend tests
        run: |
          cd frontend
          npm ci
          npm test
```

## Support

For testing issues, refer to:
- Backend logs: `backend/logs/`
- Frontend console
- Bot Framework Emulator logs
- Teams developer portal

