import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessaggesWsService } from './messagges-ws.service';
import { MessageFromClientDto } from './webSocket.dtos';

interface JwtPayload {
  name: string,
  email: string,
  role: string,
  userId: string
}

@WebSocketGateway({ cors: true })
export class MessaggesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() private wss: Server;
  private logger = new Logger('MessageWSGateway')

  constructor(
    private readonly messaggesWsService: MessaggesWsService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.headers?.authentication as string;
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify(token);
      await this.messaggesWsService.registerClient(client, payload.userId);
    } catch (err) {
      // if the token is invalid we disconnect the client
      this.logger.log('disconnecting client');
      client.disconnect(true);
      return;
    }

    // The web socketr server instance allow us to emit to all the clients
    this.wss.emit('clients-updated', this.messaggesWsService.getConnectedClients());
  };

  handleDisconnect(client: Socket) {
    this.messaggesWsService.removeClient(client.id);
    this.wss.emit('clients-updated', this.messaggesWsService.getConnectedClients());
  };

  // Nest provide out of the box a decorator to listen to events emitted from the client
  // The subscribe decorator enable the handler function to receive 2 params, the socket and the payload sent in th event

  // If we want to use DBs we can store the messages for instance
  @SubscribeMessage('client-message')
  handleClientMessage(client: Socket, payload: MessageFromClientDto) {

    // To emit a message just for the client who emitted the event
    // client.emit('server-message', { fullName: 'Placeholder', message: payload.message });

    // To emit to every other client except the one who sent the event
    // client.broadcast.emit('server-message', { fullName: 'Placeholder', message: payload.message });

    // To emit to all the clients
    this.wss.emit('server-message', { 
      fullName: this.messaggesWsService.getUserName(client.id), 
      message: payload.message 
    });
  }

}
