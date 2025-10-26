import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';

export function initializeSocketIO(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3001',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/socket.io',
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Handle client joining a conversation room
    socket.on('join:conversation', (conversationId: string) => {
      socket.join(conversationId);
      console.log(`Client ${socket.id} joined conversation: ${conversationId}`);
    });

    // Handle client leaving a conversation room
    socket.on('leave:conversation', (conversationId: string) => {
      socket.leave(conversationId);
      console.log(`Client ${socket.id} left conversation: ${conversationId}`);
    });

    // Handle web-initiated LOI updates (to notify other web clients and Teams)
    socket.on('loi:web-update', (data: { loiId: string; changes: any }) => {
      console.log(`Web update received for LOI ${data.loiId}:`, data.changes);
      // The actual update is handled through the REST API
      // This event is mainly for additional real-time coordination if needed
    });

    // Handle ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for client ${socket.id}:`, error);
    });
  });

  // Broadcast connection count periodically (optional)
  setInterval(() => {
    const connectionCount = io.engine.clientsCount;
    console.log(`Active connections: ${connectionCount}`);
  }, 60000); // Every minute

  return io;
}

