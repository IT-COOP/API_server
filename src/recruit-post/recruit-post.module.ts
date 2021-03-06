import { AuthModule } from './../auth/auth.module';
import { ChatRooms } from './../socket/entities/ChatRooms';
import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef, Module } from '@nestjs/common';
import { RecruitPostService } from './recruit-post.service';
import { RecruitPostController } from './recruit-post.controller';
import { RecruitApplies } from './entities/RecruitApplies';
import { RecruitComments } from './entities/RecruitComments';
import { RecruitKeeps } from './entities/RecruitKeeps';
import { RecruitPosts } from './entities/RecruitPosts';
import { RecruitStacks } from './entities/RecruitStacks';
import { RecruitTasks } from './entities/RecruitTasks';
import { Users } from './../socialLogin/entity/Users';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecruitApplies,
      RecruitComments,
      RecruitKeeps,
      RecruitPosts,
      RecruitStacks,
      RecruitTasks,
      Users,
      ChatRooms,
    ]),
    AuthModule,
    forwardRef(() => SocketModule),
  ],
  controllers: [RecruitPostController],
  providers: [RecruitPostService],
})
export class RecruitPostModule {}
