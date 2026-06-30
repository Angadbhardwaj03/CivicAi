import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // For demo frontend connectivity
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    // Immediately tell the client that they are connected for Live Status feedback
    client.emit('connected', { status: 'success' });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('reportIssue')
  handleReportIssue(@MessageBody() data: any): void {
    this.logger.log('Broadcasting new civic issue...');
    this.server.emit('newIssueReported', data);
  }

  @SubscribeMessage('updateStatus')
  handleUpdateStatus(@MessageBody() data: any): void {
    this.logger.log('Status updated, broadcasting...');
    this.server.emit('issueStatusUpdated', data);
  }
}
