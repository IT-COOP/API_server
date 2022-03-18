import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/socialLogin/entity/Users';
import { Connection, Repository } from 'typeorm';
import { RecruitApplies } from './entities/RecruitApplies';
import { RecruitComments } from './entities/RecruitComments';
import { RecruitKeeps } from './entities/RecruitKeeps';
import { RecruitPostImages } from './entities/RecruitPostImages';
import { RecruitPosts } from './entities/RecruitPosts';
import { RecruitStacks } from './entities/RecruitStacks';
import { RecruitTasks } from './entities/RecruitTasks';

@Injectable()
export class RecruitPostService {
  constructor(
    @InjectRepository(Users)
    private UsersRepository: Repository<Users>,
    @InjectRepository(RecruitApplies)
    private recruitAppliesRepository: Repository<RecruitApplies>,
    @InjectRepository(RecruitKeeps)
    private recruitKeepsRepository: Repository<RecruitKeeps>,
    @InjectRepository(RecruitComments)
    private recruitCommentsRepository: Repository<RecruitComments>,
    @InjectRepository(RecruitPostImages)
    private recruitPostImagesRepository: Repository<RecruitPostImages>,
    @InjectRepository(RecruitStacks)
    private recruitStacksRepository: Repository<RecruitStacks>,
    @InjectRepository(RecruitTasks)
    private recruitTasksRepository: Repository<RecruitTasks>,
    @InjectRepository(RecruitPosts)
    private recruitPostsRepository: Repository<RecruitPosts>,
    private connection: Connection,
  ) {}



  async ReadSpecificRecruits(recruitPostId: number) {
    try {
      console.log(typeof recruitPostId);

      const recruitPost = await this.recruitPostsRepository
        .createQueryBuilder('P')
        .leftJoinAndSelect('P.recruitStacks', 'S')
        .leftJoinAndSelect('P.recruitTasks', 'T')
        .leftJoinAndSelect('P.recruitPostImages', 'I')
        .leftJoinAndSelect('P.recruitComments', 'C')
        .leftJoin('C.user', 'U')
        .addSelect(['U.nickname', 'U.activityPoint', 'U.userId'])
        .andWhere('P.recruitPostId = :id', { id: recruitPostId })
        .orderBy('C.commentGroup', 'DESC')
        .addOrderBy('C.recruitCommentId', 'DESC')
        .getOne();
      recruitPost.viewCount = recruitPost.viewCount + 1;
      await this.recruitPostsRepository.save(recruitPost);

      console.log(typeof recruitPost.createdAt.toISOString());

      return recruitPost;
    } catch {
      throw new HttpException('다시 시도해주세요', 500);
    }
  }

  async createRecruit(
    recruitPost: RecruitPosts,
    imgUrls: string[],
    stacks: RecruitStacks[],
    tasks: RecruitTasks[],
  ) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const result: RecruitPosts = await queryRunner.manager
        .getRepository(RecruitPosts)
        .save(recruitPost);

      const recruitPostId: number = result.recruitPostId;
      const recruitPostImages = [];
      for (const imgUrl of imgUrls) {
        recruitPostImages.push({ recruitPostId, imgUrl });
      }
      const recruitStacks = this.mappingStacks(stacks, recruitPostId);
      const recruitTasks = this.mappingTasks(tasks, recruitPostId);

      await Promise.all([
        queryRunner.manager
          .getRepository(RecruitStacks)
          .createQueryBuilder()
          .insert()
          .into(RecruitStacks)
          .values(recruitStacks)
          .execute(),
        queryRunner.manager
          .getRepository(RecruitTasks)
          .createQueryBuilder()
          .insert()
          .into(RecruitTasks)
          .values(recruitTasks)
          .execute(),
        queryRunner.manager
          .getRepository(RecruitPostImages)
          .createQueryBuilder()
          .insert()
          .into(RecruitPostImages)
          .values(recruitPostImages)
          .execute(),
      ]);
      await queryRunner.commitTransaction();
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
