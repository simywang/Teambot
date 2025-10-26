import { Server as SocketIOServer } from 'socket.io';
import { LiveOfInterest } from '../database/models/LiveOfInterest';

class SyncService {
  private io: SocketIOServer | null = null;

  setSocketIO(io: SocketIOServer) {
    this.io = io;
  }

  /**
   * Broadcast LOI created event to all connected web clients
   */
  broadcastLOICreated(loi: LiveOfInterest) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    this.io.emit('loi:created', {
      loi,
      timestamp: new Date(),
    });

    console.log(`Broadcasted LOI created: ${loi.id}`);
  }

  /**
   * Broadcast LOI updated event to all connected web clients
   */
  broadcastLOIUpdated(
    loi: LiveOfInterest,
    updatedBy: string,
    source: 'teams' | 'web',
    changes: any
  ) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    this.io.emit('loi:updated', {
      loi,
      updatedBy,
      source,
      changes,
      timestamp: new Date(),
    });

    console.log(`Broadcasted LOI updated: ${loi.id} by ${updatedBy} from ${source}`);
  }

  /**
   * Broadcast LOI deleted event to all connected web clients
   */
  broadcastLOIDeleted(loiId: string, deletedBy: string) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    this.io.emit('loi:deleted', {
      loiId,
      deletedBy,
      timestamp: new Date(),
    });

    console.log(`Broadcasted LOI deleted: ${loiId}`);
  }

  /**
   * Send notification to specific room/conversation
   */
  sendNotificationToRoom(conversationId: string, message: string, data?: any) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    this.io.to(conversationId).emit('notification', {
      message,
      data,
      timestamp: new Date(),
    });
  }
}

export const syncService = new SyncService();

