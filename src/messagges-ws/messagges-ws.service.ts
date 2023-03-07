import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Socket } from 'socket.io';
import { User, UserDocument } from '../modules/auth/user.entity';

interface ConnectedClients {
    [id: string]: {
        socket: Socket,
        user: User
    }
}

@Injectable()
export class MessaggesWsService {

    private connectedClients: ConnectedClients = {};

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) {}

    async registerClient(client: Socket, userId: string) {
        const user = await this.userModel.findOne({ userId });
        if (!user) throw new Error('user not found');

        this.checkUserConnection(user);
        this.connectedClients[client.id] = { socket: client, user } ;
    }
    
    removeClient(clientId: string) {
        delete this.connectedClients[clientId];
    }

    getConnectedClients(): string[] {
        return Object.values(this.connectedClients).map((obj) => obj.user.name);
    }

    getUserName(clientId: string) {
        return this.connectedClients[clientId].user.name;
    }

    private checkUserConnection(user: User) {
        for (const [clientId, obj] of Object.entries(this.connectedClients)) {
            // Here we disconnect the old socket 
            if (obj.user.userId === user.userId) {
                this.connectedClients[clientId].socket.disconnect(true);
                break;
            }
        }
    }
}
