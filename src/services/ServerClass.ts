
import { Client } from 'colyseus.js';

export class ServerClass {
  private static instance: ServerClass;
  private client: Client;

  private constructor() {
    this.client = new Client('ws://localhost:4001');
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
}
