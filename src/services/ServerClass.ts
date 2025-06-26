
import { Client } from 'colyseus.js';

export class ServerClass {
  private static instance: ServerClass;
  private client: Client;
  public server: any = {};

  private constructor() {
    this.client = new Client('https://ca-yto-8b3f79b2.colyseus.cloud');
  }

  public static getInstance(): ServerClass {
    if (!ServerClass.instance) {
      ServerClass.instance = new ServerClass();
    }
    return ServerClass.instance;
  }

  public getClient(): Client {
    return this.client;
  }

  async connectToColyseusServer(colyseusRoomID: string, isModerator: boolean = false) {
    console.log('🔌 Attempting to connect to Colyseus server');
    console.log('📋 Room ID:', colyseusRoomID);
    console.log('👑 Is Moderator:', isModerator);

    // First, test server connectivity
    try {
      console.log('🌐 Testing server connectivity...');
      const testResponse = await fetch('https://ca-yto-8b3f79b2.colyseus.cloud', {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      console.log('✅ Server is reachable, status:', testResponse.status);
    } catch (fetchError) {
      console.error('❌ Server connectivity test failed:', fetchError);
      throw new Error(
        `Cannot reach Colyseus server. Is the server running? Error: ${
          fetchError?.message || 'Unknown network error'
        }`
      );
    }

    try {
      console.log('🔍 Attempting to join or create room...');
      
      // Try joinOrCreate first, then fallback to joinById if that fails
      let joinPromise;
      try {
        console.log('🚀 Trying joinOrCreate method...');
        joinPromise = this.client.joinOrCreate(colyseusRoomID, {
          type: 'videoSession',
          moderator: isModerator,
        });
      } catch (joinOrCreateError) {
        console.log('⚠️ joinOrCreate failed, trying joinById...', joinOrCreateError);
        joinPromise = this.client.joinById(colyseusRoomID, {
          type: 'videoSession',
          moderator: isModerator,
        });
      }

      console.log('⏳ Join promise created, adding listeners...');

      const tempRoom = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.error('⏰ Connection timeout after 20 seconds');
          reject(new Error('Connection timeout after 20 seconds'));
        }, 20000);

        joinPromise
          .then((room) => {
            console.log('✅ Join promise resolved, room object received');
            console.log('🏠 Room details:', {
              roomId: room.roomId,
              sessionId: room.sessionId,
              name: room.name,
            });

            // Set up event listeners
            room.onStateChange.once((state: any) => {
              console.log('🎯 FIRST state change received');
            });

            room.onMessage('broadcast', (message: any) => {
              console.log('📨 Broadcast message received:', message);
            });

            room.onError((code: any, message: any) => {
              console.error('❌ Room error occurred:', { code, message });
            });

            room.onLeave((code: any) => {
              console.log('👋 Left room with code:', code);
            });

            clearTimeout(timeout);
            resolve(room);
          })
          .catch((error) => {
            console.error('💥 Join promise rejected:', error);
            console.error('🔍 Error details:', {
              type: error.constructor.name,
              message: error.message,
              isProgressEvent: error instanceof ProgressEvent,
            });

            // Handle ProgressEvent specifically (WebSocket connection failure)
            if (error instanceof ProgressEvent) {
              clearTimeout(timeout);
              reject(new Error('WebSocket connection failed. The server may not be running or may not accept WebSocket connections.'));
              return;
            }

            clearTimeout(timeout);
            reject(error);
          });
      });

      this.server.room = tempRoom;
      console.log('🎯 Connection established successfully');
      return tempRoom;
    } catch (error) {
      console.error('💥 Failed to connect to Colyseus server:', error);
      throw error;
    }
  }

  sendState(payload: any) {
    console.log('📤 Sending state:', payload);
    if (!this.server.room) {
      console.error('❌ Cannot send state: room not connected');
      throw new Error('Cannot send stateUpdate message as room does not exist');
    }
    this.server.room.send('stateUpdate', payload);
  }

  sendEvent(payload: any) {
    console.log('📡 Attempting to send event:', payload);
    if (!this.server.room) {
      console.error('❌ Cannot send event: room not connected');
      throw new Error('Cannot send event: room not connected');
    }

    try {
      this.server.room.send('broadcast', payload);
      console.log('✅ Successfully sent event:', payload.type);
    } catch (error) {
      console.error('❌ Failed to send event:', error);
      throw error;
    }
  }
}
