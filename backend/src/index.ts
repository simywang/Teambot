import dotenv from 'dotenv';
import restify from 'restify';
import express from 'express';
import { createServer } from 'http';
import {
  CloudAdapter,
  ConfigurationServiceClientCredentialFactory,
  createBotFrameworkAuthenticationFromConfiguration,
  TurnContext,
} from 'botbuilder';
import { LOIBot } from './bot/bot';
import apiRoutes from './api/routes';
import { initializeSocketIO } from './socket/socketHandler';
import { syncService } from './services/sync.service';
import pool from './database/connection';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'MICROSOFT_APP_ID',
  'MICROSOFT_APP_PASSWORD',
  'AZURE_OPENAI_ENDPOINT',
  'AZURE_OPENAI_KEY',
  'DATABASE_URL',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Create Bot adapter
const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
  MicrosoftAppId: process.env.MICROSOFT_APP_ID,
  MicrosoftAppPassword: process.env.MICROSOFT_APP_PASSWORD,
  MicrosoftAppType: process.env.MICROSOFT_APP_TYPE || 'MultiTenant',
});

const botFrameworkAuthentication = createBotFrameworkAuthenticationFromConfiguration(
  null,
  credentialsFactory
);

const adapter = new CloudAdapter(botFrameworkAuthentication);

// Error handler
adapter.onTurnError = async (context: TurnContext, error: Error) => {
  console.error(`\n [onTurnError] unhandled error: ${error}`);
  console.error(error);

  await context.sendTraceActivity(
    'OnTurnError Trace',
    `${error}`,
    'https://www.botframework.com/schemas/error',
    'TurnError'
  );

  await context.sendActivity('The bot encountered an error or bug.');
};

// Create bot instance
const bot = new LOIBot();

// Create Restify server for Bot endpoint
const botServer = restify.createServer();
botServer.use(restify.plugins.bodyParser());

botServer.listen(process.env.PORT || 3978, () => {
  console.log(`\n${botServer.name} listening on ${botServer.url}`);
  console.log('\nBot endpoint available at /api/messages');
});

// Bot messages endpoint
botServer.post('/api/messages', async (req, res) => {
  await adapter.process(req, res, (context) => bot.run(context));
});

// Health check for bot server
botServer.get('/health', (req, res, next) => {
  res.send({ status: 'ok', service: 'bot', timestamp: new Date() });
  next();
});

// Create Express server for API and Socket.IO
const apiApp = express();
apiApp.use(express.json());

// CORS middleware
apiApp.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3001');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Name');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// API routes
apiApp.use('/api', apiRoutes);

// Create HTTP server for Socket.IO
const httpServer = createServer(apiApp);

// Initialize Socket.IO
const io = initializeSocketIO(httpServer);
syncService.setSocketIO(io);

// Start API server
const API_PORT = process.env.API_PORT || 3000;
httpServer.listen(API_PORT, () => {
  console.log(`\nAPI and Socket.IO server listening on port ${API_PORT}`);
  console.log(`API endpoint: http://localhost:${API_PORT}/api`);
  console.log(`Socket.IO endpoint: http://localhost:${API_PORT}/socket.io`);
});

// Database connection test
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('\nDatabase connected successfully');
    console.log('Database time:', res.rows[0].now);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  
  // Close Socket.IO
  io.close();
  
  // Close database pool
  await pool.end();
  
  // Close servers
  botServer.close();
  httpServer.close();
  
  console.log('Shutdown complete');
  process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

