import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './ai/ai.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [AiModule, EventsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
