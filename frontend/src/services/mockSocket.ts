// Mock Socket service for demo mode

class MockSocketService {
  private listeners: Map<string, Set<Function>> = new Map();
  private connected: boolean = false;

  connect() {
    console.log('📡 Mock Socket: Connecting (demo mode)...');
    setTimeout(() => {
      this.connected = true;
      console.log('✅ Mock Socket: Connected (demo mode)');
      this.emit('connect', {});
    }, 500);
  }

  disconnect() {
    console.log('❌ Mock Socket: Disconnected (demo mode)');
    this.connected = false;
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.off(event, callback);
    };
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  joinConversation(conversationId: string) {
    console.log(`📥 Mock Socket: Joined conversation ${conversationId} (demo mode)`);
  }

  leaveConversation(conversationId: string) {
    console.log(`📤 Mock Socket: Left conversation ${conversationId} (demo mode)`);
  }

  notifyWebUpdate(loiId: string, changes: any) {
    console.log(`📢 Mock Socket: Web update for ${loiId} (demo mode)`, changes);
  }

  ping() {
    console.log('🏓 Mock Socket: Ping (demo mode)');
    setTimeout(() => {
      this.emit('pong', {});
    }, 100);
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Simulate receiving updates from Teams
  simulateTeamsUpdate(loi: any) {
    setTimeout(() => {
      this.emit('loi:updated', {
        loi,
        updatedBy: 'Teams User (Demo)',
        source: 'teams',
        changes: { ratio: loi.ratio },
        timestamp: new Date(),
      });
    }, 2000);
  }
}

export default new MockSocketService();

