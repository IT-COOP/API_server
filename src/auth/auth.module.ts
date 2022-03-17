import { StrictGuard, LooseGuard } from './auth.guard';
import { ConfigModule } from '@nestjs/config';
import { Users } from '../socialLogin/entity/Users';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';

@Module({
  providers: [AuthService],
  imports: [ConfigModule, PassportModule, TypeOrmModule.forFeature([Users])],
  exports: [AuthService, StrictGuard, LooseGuard],
})
export class AuthModule {}
