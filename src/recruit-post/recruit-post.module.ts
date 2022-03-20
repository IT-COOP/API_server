import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { RecruitPostService } from './recruit-post.service';
import { RecruitPostController } from './recruit-post.controller';
import { RecruitApplies } from './entities/RecruitApplies';
import { RecruitComments } from './entities/RecruitComments';
import { RecruitKeeps } from './entities/RecruitKeeps';
import { RecruitPosts } from './entities/RecruitPosts';
import { RecruitStacks } from './entities/RecruitStacks';
import { RecruitTasks } from './entities/RecruitTasks';
import { Users } from 'src/socialLogin/entity/Users';

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
    ]),
  ],
  controllers: [RecruitPostController],
  providers: [RecruitPostService],
})
export class RecruitPostModule {}
