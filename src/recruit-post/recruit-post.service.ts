import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/socialLogin/entity/Users';
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
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    private connection: Connection,
  ) {}

  //해봐야 알듯?
  async ReadAllRecruits(
    loginId: string, // 사용자가 좋아요 한 게시물을 위한
    sort: number, //정렬을 위한 0 = 최신순 정렬 , 1 = 킵잇 순 정렬
    items: number, // 받아올 게시물 갯수
    location: number, // 장소 필터링
    task: number, // 직군 필터링
    stack: number, //직무 필터링 직군과 동시에 있으면 직무 우선 or 가능
    lastId: number, // 커서 기반 페이지네이션을 위함
    over: number, //
  ) {
    let cursorPost;
    if (lastId) {
      cursorPost = await this.connection
        .getRepository(RecruitPosts)
        .findOne(lastId);
      console.log(cursorPost);
      if (!cursorPost.recruitPostId) {
        throw new HttpException('잘못된 접근입니다', 400); //잘못되있으면 커서아이디가  리턴
      }
    }
    let recruitQuery = this.recruitPostsRepository
      .createQueryBuilder('P')
      .leftJoinAndSelect('P.recruitTasks', 'T')
      .leftJoinAndSelect('P.recruitStacks', 'S')
      .leftJoinAndSelect('P.author2', 'U')
      .leftJoinAndSelect('P.recruitComments', 'C');
    if (!loginId) {
      recruitQuery = recruitQuery
        .leftJoinAndSelect('P.recruitKeeps', 'K')
        .where('P.recruitPostId > 0');
    } else {
      recruitQuery = recruitQuery
        .leftJoinAndSelect('P.recruitKeeps', 'K', 'P.author = :id', {
          id: loginId,
        })
        .where('P.recruitPostId > 0');
    }

    let paginationQuery = recruitQuery;
    if (lastId && sort === 1) {
      const cursorKeepCount = cursorPost.recruitKeepCount;
      paginationQuery = paginationQuery
        .andWhere('P.recruitKeepCount < :cursorKeepCount', { cursorKeepCount })
        .orWhere(
          'P.recruitKeepCount = :cursorKeepCount AND P.recruitPostId < :lastId',
          { cursorKeepCount, lastId },
        );
    }
    if (lastId && sort === 0) {
      paginationQuery = paginationQuery.andWhere('P.recruitPostId < :lastId', {
        lastId,
      });
    }

    let filterQuery = paginationQuery;

    if (over) {
      filterQuery = filterQuery.andWhere('P.endAt = P.createdAt');
    }
    if (location) {
      filterQuery = filterQuery.andWhere('P.recruitLocation = :location', {
        location,
      });
    }
    if (stack) {
      filterQuery = recruitQuery.andWhere('S.recruitStack = :stack', { stack });
    } else if (task) {
      filterQuery = filterQuery.andWhere('T.recruitTask = :task', { task });
    }

    // 0 최신순 1 keepIt 순
    let sortQuery = filterQuery;
    if (!sort) {
      sortQuery = sortQuery.orderBy('P.recruitPostId', 'DESC');
    } else if (sort) {
      sortQuery = sortQuery
        .orderBy('P.recruitKeepCount', 'DESC')
        .addOrderBy('P.recruitPostId', 'DESC');
    }

    const endQuery = await sortQuery.take(items).getMany();

    return endQuery;
  }

  //마무리
  async ReadSpecificRecruits(recruitPostId: number, loginId: string) {
    if (!loginId) {
      const [recruitPost] = await Promise.all([
        this.recruitPostsRepository
          .createQueryBuilder('P')
          .leftJoinAndSelect('P.recruitStacks', 'S')
          .leftJoinAndSelect('P.recruitTasks', 'T')
          .leftJoinAndSelect('P.recruitComments', 'C')
          .leftJoin('P.author2', 'U')
          .leftJoin('C.user', 'CU')
          .leftJoinAndSelect('P.recruitKeeps', 'K')
          .addSelect(['CU.nickname', 'CU.profileImgUrl'])
          .addSelect(['U.nickname', 'U.profileImgUrl'])
          .where('P.recruitPostId = :id', { id: recruitPostId })
          .orderBy('C.recruitCommentId', 'ASC')
          .getOne(),
        await this.recruitPostsRepository
          .createQueryBuilder('P')
          .update()
          .set({ viewCount: () => 'viewCount + 1' })
          .where('recruitPostId = :id', { id: recruitPostId })
          .execute(),
      ]);

      return recruitPost;
    }

    const [recruitPost] = await Promise.all([
      this.recruitPostsRepository
        .createQueryBuilder('P')
        .leftJoinAndSelect('P.recruitStacks', 'S')
        .leftJoinAndSelect('P.recruitTasks', 'T')
        .leftJoinAndSelect('P.recruitComments', 'C')
        .leftJoin('P.author2', 'U')
        .leftJoin('C.user', 'CU')
        .leftJoinAndSelect('P.recruitKeeps', 'K', 'P.author =:loginId', {
          loginId,
        })
        .addSelect(['CU.nickname', 'CU.profileImgUrl'])
        .addSelect(['U.nickname', 'U.profileImgUrl'])
        .where('P.recruitPostId = :id', { id: recruitPostId })
        .orderBy('C.recruitCommentId', 'ASC')
        .getOne(),
      await this.recruitPostsRepository
        .createQueryBuilder('P')
        .update()
        .set({ viewCount: () => 'viewCount + 1' })
        .where('recruitPostId = :id', { id: recruitPostId })
        .execute(),
    ]);
    console.log(recruitPost);

    return recruitPost;
  }

  //마무리
  async createRecruit(
    recruitPost: RecruitPosts,
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
      const recruitStacks = this.mappingStacks(stacks, recruitPostId);
      const recruitTasks = this.mappingTasks(tasks, recruitPostId);

      if (recruitStacks.length) {
        await queryRunner.manager
          .getRepository(RecruitStacks)
          .createQueryBuilder()
          .insert()
          .into(RecruitStacks)
          .values(recruitStacks)
          .execute();
      }

      if (recruitTasks.length) {
        await queryRunner.manager
          .getRepository(RecruitTasks)
          .createQueryBuilder()
          .insert()
          .into(RecruitTasks)
          .values(recruitTasks)
          .execute();
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException({ message: 'Try again' }, 500);
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
      await queryRunner.commitTransaction();
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      throw new HttpException({ message: '서버 에러' }, 500);
    } finally {
      await queryRunner.release();
    }
  }

  //마무리
  async createKeepIt(recruitPostId: number, keepIt: RecruitKeeps) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const returned = await queryRunner.manager
        .getRepository(RecruitKeeps)
        .findOne(keepIt);
      if (returned.recruitKeepId)
        throw new HttpException({ message: '이미 킵잇된 게시물입니다.' }, 400);
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(RecruitKeeps)
        .values(keepIt)
        .execute();
      await queryRunner.manager
        .createQueryBuilder()
        .update('RecruitPosts')
        .set({ recruitKeepCount: () => 'recruitKeepCount + 1' })
        .where('recruitPostId = :recruitPostId', { recruitPostId })
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

  async readRecruitCount(userId) {
    const returned = await this.usersRepository
      .createQueryBuilder('U')
      .leftJoin('U.recruitPosts', 'P')
      .leftJoin('U.chatMembers', 'M')
      .leftJoin('U.recruitApplies', 'A')
      .select('COUNT(P.author)', 'postCount')
      .addSelect('COUNT(M.member)', 'projectCount')
      .addSelect('COUNT(A.applicant)', 'applyCount')
      .where('U.userId = :userId', { userId })
      .getRawOne();

    if (+returned.postCount)
      throw new BadRequestException('You can write only one post');
    if (
      +returned.projectCount + returned.projectCount + returned.projectCount >=
      3
    ) {
      throw new BadRequestException(' You can only apply for three projects.');
    }
    return returned;
  }

  async createApply(recruitPostId: number, apply: RecruitApplies) {
    const returned = await this.recruitAppliesRepository.findOne(recruitPostId);
    if (returned.recruitApplyId) {
      throw new HttpException({ message: '이미 신청했어요' }, 400);
    }

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager
        .getRepository(RecruitApplies)
        .createQueryBuilder('A')
        .insert()
        .into('A')
        .values(apply)
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

  //
  async updateRecruitPost(
    recruitPost: RecruitPosts,
    stacks: RecruitStacks[],
    tasks: RecruitTasks[],
  ) {
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
      const recruitPostId: number = recruitPost.recruitPostId;
      const recruitStacks = this.mappingStacks(stacks, recruitPostId);
      const recruitTasks = this.mappingTasks(tasks, recruitPostId);
      await queryRunner.manager
        .getRepository(RecruitStacks)
        .save(recruitStacks);
      await queryRunner.manager.getRepository(RecruitStacks).save(recruitTasks);
      await queryRunner.commitTransaction();
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      throw new HttpException({ message: '서버 에러' }, 500);
    } finally {
      await queryRunner.release();
    }
  }

  //마무리
  async updateComment(commentId: number, comment: object) {
    await this.recruitCommentsRepository
      .createQueryBuilder()
      .update(RecruitComments)
      .set(comment)
      .where('RecruitComments.recruitCommentId=:commentId', { commentId })
      .execute();
  }

  async deleteRecruitPost(postId: number) {
    await this.recruitPostsRepository.delete(postId);
  }

  //마무리
  async deleteComment(recruitPostId: number, commentId: number) {
    /*
    1, KeepIt post와 조인해 가지고 delete할 apply가 있는지 확인 
    2, 있으면 지우고 없으면 error를 띄움 post에 comment 카운트를 낮추고 저장
    3, 
    */
    const returnedComments = await this.recruitCommentsRepository
      .createQueryBuilder('C')
      .where('commentId = :commentId', { commentId })
      .getOne();

    if (!returnedComments.recruitCommentId) {
      throw new HttpException('지울 데이터가 없어요', 400);
    }
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (returnedComments.recruitCommentId) {
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
          .set({ recruitCommentCount: () => 'recruitCommentCount - 1' })
          .where('P.recruitPostId = :recruitPostId', { recruitPostId })
          .execute();
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  //트렌젝션 걸어야함
  async deleteKeepIt(recruitPostId: number, recruitKeepId: number) {
    /*
    1, KeepIt post와 조인해 가지고 delete할 apply가 있는지 확인 
    2, 있으면 지우고 없으면 error를 띄움 apply 카운트를 낮추고 저장
    age: () => "age + 1"
    */
    const isExist = await this.recruitKeepsRepository
      .createQueryBuilder('K')
      .where('K.recruitKeepId = :recruitKeepId', { recruitKeepId })
      .getOne();

    if (isExist.recruitPostId != recruitPostId) {
      throw new HttpException('잘못된 요청입니다.', 400);
    }
    if (!isExist.recruitKeepId) {
      throw new HttpException('지울 데이터가 없어요', 400);
    }
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.recruitKeepsRepository.delete(recruitKeepId);
      await this.recruitPostsRepository
        .createQueryBuilder()
        .update(RecruitPosts)
        .set({ recruitKeepCount: () => 'recruitKeepCount - 1' })
        .where('P.recruitPostId = :recruitPostId', { recruitPostId })
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

  async deleteApply(recruitPostId: number, applyId: number) {
    /*
    1, applyId post와 조인해 가지고 delete할 apply가 있는지 확인 
    2, apply가 true 이면 task, stack people set을 1씩 내리고 삭제
    3, apply가 false 이면 apply를 삭제
    */

    const isExist: RecruitApplies = await this.recruitAppliesRepository.findOne(
      applyId,
    );

    if (!isExist.recruitApplyId) {
      throw new HttpException({ message: '지울 데이터가 없어요' }, 400);
    }
    if (isExist.recruitPostId != recruitPostId) {
      throw new HttpException({ message: '잘못된 요청입니다.' }, 400);
    }
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (isExist.isAccepted) {
        await queryRunner.manager.getRepository(RecruitApplies).delete({
          recruitApplyId: isExist.recruitApplyId,
        });
        await queryRunner.manager
          .getRepository(RecruitStacks)
          .createQueryBuilder('S')
          .update('S')
          .set({ numberOfPeopleSet: () => 'numberOfPeopleSet - 1' })
          .where('S.recruitPostId = :recruitPostId', { recruitPostId })
          .execute();
        await queryRunner.manager
          .getRepository(RecruitTasks)
          .createQueryBuilder('T')
          .update('T')
          .set({ numberOfPeopleSet: () => 'numberOfPeopleSet - 1' })
          .where('T.recruitPostId = :recruitPostId', { recruitPostId })
          .execute();
        await queryRunner.manager.getRepository(RecruitApplies).delete({
          recruitApplyId: isExist.recruitApplyId,
        });
      } else {
        await this.recruitKeepsRepository.delete(applyId);
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  mappingStacks(stacks: RecruitStacks[], recruitPostId: number) {
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
