import { Module } from '@nestjs/common';
import { InformationPostService } from './information-post.service';
import { InformationPostController } from './information-post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InformationComments } from './entities/InformationComments';
import { InformationKeeps } from './entities/InformationKeeps';
import { InformationLoves } from './entities/InformationLoves';
import { InformationPosts } from './entities/InformationPosts';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InformationComments,
      InformationKeeps,
      InformationLoves,
      InformationPosts,
    ]),
  ],
  controllers: [InformationPostController],
  providers: [InformationPostService],
})
export class InformationPostModule {}
