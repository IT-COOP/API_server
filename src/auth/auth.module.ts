import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  providers: [AuthService, ConfigService],
  controllers: [AuthController],
  imports: [HttpModule, ConfigModule],
})
export class AuthModule {}
