import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/socialLogin/entity/Users';
import { Connection, getRepository, Repository } from 'typeorm';
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

  // loginId: string, // 사용자가 좋아요 한 게시물을 위한
  // order: number, //정렬을 위한 0 = 최신순 정렬 , 1 = 킵잇 순 정렬
  // items: number, // 받아올 게시물 갯수
  // location: number | null, // 장소 필터링
  // task: number | null, // 직군 필터링
  // stacks: number[] | null, //직무 필터링 직군과 동시에 있으면 직무 우선 or 가능
  // lastId: number | null, // 커서 기반 페이지네이션을 위함
  async ReadAllRecruits() {
    try {
      // const cursorPost: RecruitPosts = !lastId
      //   ? null
      //   : await getRepository(RecruitPosts).findOne(lastId);

      // const cursorPostId = cursorPost.recruitPostId;
      // const lastPostKeepCount = cursorPost.recruitKeepCount;

      //쿼리 빌더 시작

      const recruitQuery = await this.recruitPostsRepository
        .createQueryBuilder('P')
        .leftJoinAndSelect('P.recruitKeeps', 'K', 'K.userId = :id', {
          id: 'cgh',
        })
        .leftJoin('P.recruitTasks', 'T')
        .leftJoin('P.recruitStacks', 'S')
        .leftJoin('P.recruitPostImages', 'I')
        .addSelect('I.recruitPostImageId', 'I.imgUrl')
        .addSelect([
          'S.recruitStackId',
          'S.recruitStack',
          'S.numberOfPeopleRequired',
          'S.numberOfPeopleSet',
          'T.recruitTaskId',
          'T.recruitTask',
          'T.numberOfPeopleRequired',
          'T.numberOfPeopleSet',
        ])
        .getMany();

      return recruitQuery;
      // // 필터링 할 것들 추가
      // let filterTaskOrStackRecruitQuery: any = recruitQuery;
      // if (stacks) {
      //   for (const stack in stacks) {
      //     filterTaskOrStackRecruitQuery = filterTaskOrStackRecruitQuery.orWhere(
      //       'S.recruitStack = :stack',
      //       { stack },
      //     );
      //   }
      // } else if (task) {
      //   filterTaskOrStackRecruitQuery = recruitQuery.andWhere(
      //     'T.recruitTask = :task',
      //     { task },
      //   );
      // }

      // let filterLocationRecruitQuery: any = filterTaskOrStackRecruitQuery;
      // if (location) {
      //   filterLocationRecruitQuery = filterTaskOrStackRecruitQuery.andWhere(
      //     'P.recruitLocation = :location',
      //     { location },
      //   );
      // }

      // console.log('필터 종료 & 정렬 시작');

      // let orderRecruitQuery: any;
      // if (!cursorPost) {
      //   orderRecruitQuery = filterLocationRecruitQuery
      //     .orderBy('P.recruitPostId', 'DESC')
      //     .take(items)
      //     .getMany();
      // } else if (order === 0) {
      //   orderRecruitQuery = filterLocationRecruitQuery
      //     .andWhere('P.recruitKeepCount > :cursorPostId', { cursorPostId })
      //     .orderBy('P.recruitPostId', 'DESC')
      //     .take(items)
      //     .getMany();
      // } else if (order === 1) {
      //   orderRecruitQuery = filterLocationRecruitQuery
      //     .andWhere('P.recruitKeepCount >= :lastPostKeepCount', {
      //       lastPostKeepCount,
      //     })
      //     .andWhere('P.recruitPostId < :lastPostId', { cursorPostId })
      //     .orderBy('P.recruitKeepCount', 'DESC')
      //     .addOrderBy('P.recruitPostId', 'DESC')
      //     .take(items)
      //     .getMany();
      // }

      // console.log('get 쿼리 끝', orderRecruitQuery);

      // return orderRecruitQuery;
    } catch (error) {
      throw new HttpException('다시 시도해주세요', 500);
    }
  }
  /*
  FROM test1 a LEFT JOIN test2 b
  ON (a.aa = b.aa)
  WHERE b.cc = 7;
  1, 조인할 테이블  stacks, tasks, post, comment
  2, 
  3,
  4,
  5,
  */
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

  async deleteComment(commentId: number) {
    /*
    1, KeepIt post와 조인해 가지고 delete할 apply가 있는지 확인 
    2, 있으면 지우고 없으면 error를 띄움 post에 comment 카운트를 낮추고 저장
    */
    try {
      const returnedComments = await this.recruitCommentsRepository
        .createQueryBuilder('C')
        .where('commentId = :commentId', { commentId })
        .getMany();

      if (returnedComments.length > 1) {
        await this.recruitCommentsRepository
          .createQueryBuilder()
          .update(RecruitComments)
          .set({ recruitCommentContent: null })
          .where('id = :id', { id: commentId })
          .execute();

        return;
      }

      await this.recruitCommentsRepository.delete(commentId);
    } catch (error) {
      throw new HttpException('다시 시도해주세요', 500);
    }
  }

  async deleteKeepIt(recruitKeepId: number) {
    /*
    1, KeepIt post와 조인해 가지고 delete할 apply가 있는지 확인 
    2, 있으면 지우고 없으면 error를 띄움 apply 카운트를 낮추고 저장
    */
    try {
      const isExist = await this.recruitKeepsRepository
        .createQueryBuilder('K')
        .leftJoinAndSelect('K.recruitPost', 'P')
        .getOne();
      console.log(isExist, isExist.recruitKeepId, '가나다');
      if (!isExist.recruitKeepId) {
        throw new HttpException('지울 데이터가 없어요', 400);
      }
      isExist.recruitPost.recruitKeepCount--;
      await Promise.all([this.recruitKeepsRepository.delete(recruitKeepId)]);
    } catch (error) {
      throw new HttpException('다시 시도해주세요', 500);
    }
  }

  async deleteApply(applyId: number) {
    /*
    1, applyId post와 조인해 가지고 delete할 apply가 있는지 확인 
    2, 있으면 지우고 없으면 error를 띄움
    */
    try {
      const isExist = await this.recruitAppliesRepository.findOne(applyId);
      if (isExist.recruitApplyId) {
        await this.recruitAppliesRepository.delete(applyId);
      }
    } catch (error) {
      throw new HttpException('다시 시도해주세요', 500);
    }
  }

  mappingImages(images: RecruitPostImages[], recruitPostId?: number) {
    const recruitPostImages = images.map((item: RecruitPostImages) => {
      const obj = new RecruitPostImages();
      obj.recruitPostImageId = item.recruitPostImageId;
      obj.recruitPostId = recruitPostId;
      obj.imgUrl = item.imgUrl;
      return obj;
    });
    return recruitPostImages;
  }

  mappingStacks(stacks: RecruitStacks[], recruitPostId?: number) {
    const recruitStacks = stacks.map((item: RecruitStacks) => {
      const obj = new RecruitStacks();
      obj.recruitPostId = recruitPostId;
      obj.numberOfPeopleRequired = item.numberOfPeopleRequired;
      obj.numberOfPeopleSet = item.numberOfPeopleSet;
      obj.recruitStack = item.recruitStack;
      return obj;
    });
    return recruitStacks;
  }

  mappingTasks(tasks: RecruitTasks[], recruitPostId?: number) {
    const recruitTasks = tasks.map((item: RecruitTasks) => {
      const obj = new RecruitTasks();

      obj.recruitPostId = recruitPostId;
      obj.numberOfPeopleRequired = item.numberOfPeopleRequired;
      obj.numberOfPeopleSet = item.numberOfPeopleSet;
      obj.recruitTask = item.recruitTask;
      return obj;
    });
    return recruitTasks;
  }
}
