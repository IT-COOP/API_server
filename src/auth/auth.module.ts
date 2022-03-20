import { StrictGuard, LooseGuard } from './auth.guard';
import { ConfigModule } from '@nestjs/config';
import { Users } from '../socialLogin/entity/Users';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';

@Module({
  providers: [AuthService, StrictGuard, LooseGuard],
  imports: [ConfigModule, TypeOrmModule.forFeature([Users])],
  exports: [AuthService, StrictGuard, LooseGuard],
})
export class AuthModule {}
