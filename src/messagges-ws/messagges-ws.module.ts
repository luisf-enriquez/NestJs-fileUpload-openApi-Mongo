import { Module } from '@nestjs/common';
import { MessaggesWsService } from './messagges-ws.service';
import { MessaggesWsGateway } from './messagges-ws.gateway';
import { AuthModule } from '../modules/auth/auth.module';

@Module({
  providers: [MessaggesWsGateway, MessaggesWsService],
  imports: [AuthModule]
})
export class MessaggesWsModule {}
