import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { RecruitApplies } from './entities/RecruitApplies';
import { RecruitComments } from './entities/RecruitComments';
import { RecruitKeeps } from './entities/RecruitKeeps';
import { RecruitPosts } from './entities/RecruitPosts';
import { RecruitStacks } from './entities/RecruitStacks';
import { RecruitTasks } from './entities/RecruitTasks';

@Injectable()
export class RecruitPostService {
  constructor(
    @InjectRepository(RecruitApplies)
    private recruitAppliesRepository: Repository<RecruitApplies>,
    @InjectRepository(RecruitKeeps)
    private recruitKeepsRepository: Repository<RecruitKeeps>,
    @InjectRepository(RecruitComments)
    private recruitCommentsRepository: Repository<RecruitComments>,
    @InjectRepository(RecruitPosts)
    private recruitPostsRepository: Repository<RecruitPosts>,
    private connection: Connection,
  ) {}

  //해봐야 알듯?
  async ReadAllRecruits(
    loginId: string, // 사용자가 좋아요 한 게시물을 위한
    sort: number, //정렬을 위한 0 = 최신순 정렬 , 1 = 킵잇 순 정렬
    items: number, // 받아올 게시물 갯수
    location: number | null, // 장소 필터링
    task: number | null, // 직군 필터링
    stack: number | null, //직무 필터링 직군과 동시에 있으면 직무 우선 or 가능
    lastId: number | null, // 커서 기반 페이지네이션을 위함
  ) {
    const id = lastId ? lastId : 21000000;
    const cursorPost: RecruitPosts = await this.recruitPostsRepository
      .createQueryBuilder('R')
      .where('R.recruitPostId <= :id', { id })
      .orderBy('R.recruitPostId', 'DESC')
      .take(1)
      .getMany()[0];

    //쿼리 빌더 시작
    console.log('서비스 진입함');
    const recruitQuery = this.recruitPostsRepository
      .createQueryBuilder('P')
      .leftJoinAndSelect('P.recruitKeeps', 'K', 'K.userId = :id', {
        id: loginId,
      })
      .leftJoin('P.recruitTasks', 'T')
      .leftJoin('P.recruitStacks', 'S')
      .addSelect([
        'S.recruitStackId',
        'S.recruitStack',
        'S.numberOfPeopleRequired',
        'S.numberOfPeopleSet',
        'T.recruitTaskId',
        'T.recruitTask',
        'T.numberOfPeopleRequired',
        'T.numberOfPeopleSet',
      ]);

    console.log(123412341234);

    // .where("P.recruitLocation IN (:..location)", { location: [locations] })
    let filterQuery = recruitQuery;
    if (location) {
      filterQuery = filterQuery.andWhere('P.recruitLocation = :location', {
        location,
      });
    }
    if (task) {
      filterQuery = filterQuery.andWhere('T.recruitTask = :task', { task });
    }
    if (stack) {
      filterQuery = filterQuery = recruitQuery.andWhere(
        'S.recruitStack = :stack',
        { stack },
      );
    }
    console.log(456456789);

    const cursorKeepCount = cursorPost.recruitKeepCount;
    const cursorPostId = cursorPost.recruitPostId;
    // 페이지네이션
    let paginationQuery = filterQuery;
    if (cursorPost && sort === 1) {
      paginationQuery = paginationQuery.andWhere(
        'P.recruitKeepCount <= :cursorKeepCount',
        {
          cursorKeepCount,
        },
      );
    }
    paginationQuery = paginationQuery.andWhere(
      'P.recruitPostId <:cursorPostId',
      { cursorPostId },
    );

    // 0 최신순 1 keepIt 순
    let sortQuery = paginationQuery;
    if (sort === 0) {
      sortQuery = paginationQuery.orderBy('P.recruitPostId', 'DESC');
    } else if (sort === 1) {
      sortQuery = sortQuery
        .orderBy('P.recruitKeepCount', 'DESC')
        .addOrderBy('P.recruitPostId', 'DESC');
    }
    console.log(987989598798213);

    const endQuery = await sortQuery.take(items).getMany();

    console.log(1111111111111111);
    return endQuery;
  }

  //마무리
  async ReadSpecificRecruits(recruitPostId: number) {
    try {
      const recruitPost = await this.recruitPostsRepository
        .createQueryBuilder('P')
        .leftJoinAndSelect('P.recruitStacks', 'S')
        .leftJoinAndSelect('P.recruitTasks', 'T')
        .leftJoinAndSelect('P.recruitComments', 'C')
        .leftJoin('C.user', 'U')
        .addSelect(['U.nickname', 'U.activityPoint', 'U.userId'])
        .andWhere('P.recruitPostId = :id', { id: recruitPostId })
        .orderBy('C.commentGroup', 'ASC')
        .addOrderBy('C.recruitCommentId', 'DESC')
        .getOne();
      recruitPost.viewCount = recruitPost.viewCount + 1;
      await this.recruitPostsRepository
        .createQueryBuilder()
        .insert()
        .into(RecruitPosts)
        .values(recruitPost)
        .execute();

      return recruitPost;
    } catch {
      return new HttpException('다시 시도해주세요', 500);
    }
  }

  //마무리
  async createRecruit(
    recruitPost: RecruitPosts,
    stacks: RecruitStacks[],
    tasks: RecruitTasks[],
  ) {
    /*
    1,  
    2, 
    */
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const result: RecruitPosts = await queryRunner.manager
        .getRepository(RecruitPosts)
        .save(recruitPost);

      const recruitPostId: number = result.recruitPostId;
      const recruitStacks = this.mappingStacks(stacks, recruitPostId);
      const recruitTasks = this.mappingTasks(tasks, recruitPostId);

      await queryRunner.manager
        .getRepository(RecruitStacks)
        .createQueryBuilder()
        .insert()
        .into(RecruitStacks)
        .values(recruitStacks)
        .execute();
      await queryRunner.manager
        .getRepository(RecruitTasks)
        .createQueryBuilder()
        .insert()
        .into(RecruitTasks)
        .values(recruitTasks)
        .execute();
      await queryRunner.commitTransaction();
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  //마무리
  async createComment(recruitPostId: number, comment: RecruitComments) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager
        .getRepository(RecruitComments)
        .createQueryBuilder()
        .insert()
        .into(RecruitComments)
        .values(comment)
        .execute();
      await queryRunner.manager
        .getRepository(RecruitComments)
        .createQueryBuilder()
        .update(RecruitPosts)
        .set({ recruitCommentCount: () => 'recruitCommentCount + 1' })
        .where('recruitPostId = :recruitPostId', { recruitPostId })
        .execute();
    } catch (error) {
      return new HttpException('다시 시도해주세요', 500);
    }
  }

  //마무리
  async createKeepIt(recruitPostId: number, keepIt: RecruitKeeps) {
    try {
      const returned = await this.recruitKeepsRepository.findOne(recruitPostId);
      if (returned.recruitKeepId)
        return new HttpException('이미 킵잇되있어용~', 400);

      await this.recruitKeepsRepository
        .createQueryBuilder()
        .insert()
        .into(RecruitKeeps)
        .values(keepIt)
        .execute();
      this.recruitPostsRepository
        .createQueryBuilder()
        .update('RecruitPosts')
        .set({ recruitKeepCount: () => 'recruitKeepCount + 1' })
        .where('recruitPostId = :recruitPostId', { recruitPostId })
        .execute();
    } catch (error) {
      return new HttpException('다시 시도해주세요', 500);
    }
  }

  //마무리
  async createApply(recruitPostId: number, apply: RecruitApplies) {
    try {
      const returnedApply = await this.recruitAppliesRepository.findOne(
        recruitPostId,
      );

      if (returnedApply.recruitApplyId) {
        return new HttpException('이미 신청했어요', 400);
      } else {
        await this.recruitAppliesRepository
          .createQueryBuilder('A')
          .insert()
          .into('A')
          .values(apply)
          .execute();
      }
    } catch (error) {
      return new HttpException('다시 시도해주세요', 500);
    }
  }

  //아직
  async updateRecruitPost(
    recruitPost: RecruitPosts,
    recruitStacks: RecruitStacks[],
    recruitTasks: RecruitTasks[],
  ) {
    recruitPost;
    recruitStacks;
    recruitTasks;
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager
        .getRepository(RecruitPosts)
        .createQueryBuilder()
        .update()
        .set(recruitPost)
        .where('recruitPostId = :id', { id: recruitPost.recruitPostId })
        .execute();
      // await queryRunner.manager
      //   .getRepository(RecruitStacks)
      //   .createQueryBuilder()
      //   .update()
      //   .set(recruitStacks)
      //   .where('recruitPostId = :id', { id: recruitPost.recruitPostId })
      //   .execute();
      // await queryRunner.manager
      //   .getRepository(RecruitTasks)
      //   .createQueryBuilder()
      //   .update()
      //   .set(recruitTasks)
      //   .where('recruitPostId = :id', { id: recruitPost.recruitPostId })
      //   .andWhere('recruitStack = :stack')
      //   .execute();
      await queryRunner.commitTransaction();
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  //마무리
  async updateComment(commentId: number, comment: object) {
    await this.recruitCommentsRepository.upsert(comment, ['commentId']);
  }

  async deleteRecruitPost(postId: number) {
    await this.recruitAppliesRepository.delete(postId);
  }
  //로직 변경 논의
  //마무리
  async deleteComment(recruitPostId: number, commentId: number) {
    /*
    1, KeepIt post와 조인해 가지고 delete할 apply가 있는지 확인 
    2, 있으면 지우고 없으면 error를 띄움 post에 comment 카운트를 낮추고 저장
    3, 
    */
    try {
      const returnedComments = await this.recruitCommentsRepository
        .createQueryBuilder('C')
        .where('commentId = :commentId', { commentId })
        .getOne();

      if (!returnedComments.recruitCommentId) {
        return new HttpException('지울 데이터가 없어요', 400);
      }

      await this.recruitCommentsRepository.delete(returnedComments);

      const queryRunner = this.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        if (returnedComments) {
          await queryRunner.manager
            .getRepository(RecruitComments)
            .createQueryBuilder()
            .update(RecruitComments)
            .set({ recruitCommentContent: null })
            .where('recruitCommentId = :commentId', { commentId })
            .execute();
          await queryRunner.manager
            .getRepository(RecruitPosts)
            .createQueryBuilder()
            .update()
            .set({ recruitKeepCount: () => 'recruitKeepCount - 1' })
            .where('P.recruitPostId = :recruitPostId', { recruitPostId })
            .execute();

          return;
        }
        await queryRunner.commitTransaction();
      } catch (error) {
        console.error(error);
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      throw new HttpException('다시 시도해주세요', 500);
    }
  }

  //트렌젝션 걸어야함
  async deleteKeepIt(recruitPostId: number, recruitKeepId: number) {
    /*
    1, KeepIt post와 조인해 가지고 delete할 apply가 있는지 확인 
    2, 있으면 지우고 없으면 error를 띄움 apply 카운트를 낮추고 저장
    age: () => "age + 1"
    */
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const isExist = await queryRunner.manager
        .getMongoRepository(RecruitKeeps)
        .createQueryBuilder('K')
        .where('K.recruitKeepId = :recruitKeepId', { recruitKeepId })
        .getOne();

      if (isExist.recruitPostId != recruitPostId) {
        return new HttpException('잘못된 요청입니다.', 400);
      }
      if (!isExist.recruitKeepId) {
        return new HttpException('지울 데이터가 없어요', 400);
      }
      await this.recruitKeepsRepository.delete(recruitKeepId);
      await this.recruitPostsRepository
        .createQueryBuilder()
        .update(RecruitPosts)
        .set({ recruitKeepCount: () => 'recruitKeepCount - 1' })
        .where('P.recruitPostId = :recruitPostId', { recruitPostId })
        .execute();
    } catch (error) {
      throw new HttpException('다시 시도해주세요', 500);
    }
  }

  //마무리
  async deleteApply(recruitPostId: number, applyId: number) {
    /*
    1, applyId post와 조인해 가지고 delete할 apply가 있는지 확인 
    2, 있으면 지우고 없으면 error를 띄움
    */
    try {
      const isExist: RecruitApplies =
        await this.recruitAppliesRepository.findOne(applyId);

      if (!isExist.recruitApplyId) {
        return new HttpException('지울 데이터가 없어요', 400);
      }
      if (isExist.recruitPostId != recruitPostId) {
        return new HttpException('잘못된 요청입니다.', 400);
      }
      if (isExist.isAccepted) {
        await this.recruitAppliesRepository.delete({
          recruitApplyId: isExist.recruitApplyId,
        });
      }

      await this.recruitKeepsRepository.delete(applyId);
    } catch (error) {
      return new HttpException('다시 시도해주세요', 500);
    }
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
