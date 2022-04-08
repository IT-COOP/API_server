import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './../socialLogin/entity/Users';
import { Connection, Repository } from 'typeorm';
import { RecruitApplies } from './entities/RecruitApplies';
import { RecruitComments } from './entities/RecruitComments';
import { RecruitKeeps } from './entities/RecruitKeeps';
import { RecruitPosts } from './entities/RecruitPosts';
import { RecruitStacks } from './entities/RecruitStacks';
import { RecruitTasks } from './entities/RecruitTasks';
import { recruitError } from './../common/error';
import { SocketGateway } from 'src/socket/socket.gateway';
import { CreateNotificationDto } from 'src/socket/dto/createNotification.dto';

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
    private readonly socketGateway: SocketGateway,
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
    try {
      if (lastId) {
        cursorPost = await this.connection
          .getRepository(RecruitPosts)
          .findOneOrFail(lastId);
      }
    } catch (error) {
      throw recruitError.WrongRequiredError;
    }

    try {
      let recruitQuery = this.recruitPostsRepository
        .createQueryBuilder('P')
        .leftJoinAndSelect('P.recruitTasks', 'T')
        .leftJoinAndSelect('P.recruitStacks', 'S')
        .leftJoinAndSelect('P.author2', 'U')
        .leftJoinAndSelect('P.recruitComments', 'C');
      if (!loginId) {
        recruitQuery = recruitQuery.leftJoinAndSelect('P.recruitKeeps', 'K');
      } else {
        recruitQuery = recruitQuery.leftJoinAndSelect(
          'P.recruitKeeps',
          'K',
          'K.userId = :id and P.recruitPostId = K.recruitPostId',
          {
            id: loginId,
          },
        );
      }
      let paginationQuery = recruitQuery;
      if (lastId && sort === 1) {
        const cursorKeepCount = cursorPost.recruitKeepCount;
        paginationQuery = paginationQuery
          .andWhere('P.recruitKeepCount < :cursorKeepCount', {
            cursorKeepCount,
          })
          .orWhere(
            'P.recruitKeepCount = :cursorKeepCount AND P.recruitPostId < :lastId',
            { cursorKeepCount, lastId },
          );
      }
      if (lastId && sort === 0) {
        paginationQuery = paginationQuery.andWhere(
          'P.recruitPostId < :lastId',
          {
            lastId,
          },
        );
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
        filterQuery = recruitQuery.andWhere('S.recruitStack = :stack', {
          stack,
        });
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
    } catch (error) {
      throw recruitError.DBqueryError;
    }
  }

  //마무리
  async ReadSpecificRecruits(recruitPostId: number, loginId: string) {
    try {
      if (!loginId) {
        const [recruitPost] = await Promise.all([
          this.recruitPostsRepository
            .createQueryBuilder('P')
            .leftJoinAndSelect('P.recruitStacks', 'S')
            .leftJoinAndSelect('P.recruitTasks', 'T')
            .leftJoinAndSelect('P.recruitComments', 'C')
            .leftJoin('P.author2', 'U')
            .leftJoin('C.user', 'CU')
            .addSelect(['CU.nickname', 'CU.profileImgUrl'])
            .addSelect(['U.nickname', 'U.profileImgUrl'])
            .where('P.recruitPostId = :id', { id: recruitPostId })
            .orderBy('C.recruitCommentId', 'ASC')
            .getOne(),
          this.recruitPostsRepository
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
          .leftJoinAndSelect('P.recruitApplies', 'A', 'A.applicant =:loginId', {
            loginId,
          })
          .leftJoinAndSelect('P.recruitKeeps', 'K', 'K.userId =:loginId', {
            loginId,
          })
          .leftJoin('P.author2', 'U')
          .leftJoin('C.user', 'CU')
          .addSelect(['CU.nickname', 'CU.profileImgUrl'])
          .addSelect(['U.nickname', 'U.profileImgUrl'])
          .where('P.recruitPostId = :id', { id: recruitPostId })
          .orderBy('C.recruitCommentId', 'ASC')
          .getOne(),
        this.recruitPostsRepository
          .createQueryBuilder('P')
          .update()
          .set({ viewCount: () => 'viewCount + 1' })
          .where('recruitPostId = :id', { id: recruitPostId })
          .execute(),
      ]);
      return recruitPost;
    } catch (error) {
      throw recruitError.DBqueryError;
    }
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
      throw recruitError.DBqueryError;
    } finally {
      await queryRunner.release();
    }
  }

  //마무리
  async createComment(comment: RecruitComments, nickname: string) {
    try {
      const returned = await this.recruitCommentsRepository
        .createQueryBuilder()
        .where('recruitPostId = :id', { id: comment.recruitPostId })
        .orderBy('commentGroup', 'DESC')
        .getMany();
      if (!returned.length) {
        comment.commentDepth = 0;
        comment.commentGroup = 1;
      } else if (!comment.commentGroup) {
        comment.commentDepth = 0;
        comment.commentGroup = returned[0].commentGroup + 1;
      } else {
        comment.commentDepth = 1;
      }
    } catch (error) {
      throw recruitError.WrongRequiredError;
    }

    try {
      await this.recruitCommentsRepository
        .createQueryBuilder()
        .insert()
        .into(RecruitComments)
        .values(comment)
        .execute();
    } catch (error) {
      throw recruitError.DBqueryError;
    }

    const returned = await this.recruitPostsRepository
      .createQueryBuilder('P')
      .leftJoinAndSelect(
        'P.recruitComments',
        'C',
        'P.recruitPostId = :postId',
        { postId: comment.recruitPostId },
      )
      .where('C.commentDepth = 0 and C.commentGroup = :group', {
        group: comment.commentGroup,
      })
      .getOne();

    const notifications = [];
    const toPostNotification = new CreateNotificationDto();
    toPostNotification.notificationReceiver = returned.author; //글 주인 /
    toPostNotification.notificationSender = comment.userId; //댓글 쓴 사람
    toPostNotification.eventType = comment.commentDepth ? 2 : 1; //
    toPostNotification.eventContent = comment.recruitCommentContent; //
    toPostNotification.targetId = comment.recruitPostId; //어디서
    toPostNotification.nickname = nickname;
    if (
      toPostNotification.notificationReceiver !=
      toPostNotification.notificationSender
    ) {
      notifications.push(toPostNotification);
    }
    if (comment.commentDepth) {
      const toCommentNotification = new CreateNotificationDto();
      toCommentNotification.notificationReceiver =
        returned.recruitComments[0].userId; //글 주인 / 댓글 주인
      toCommentNotification.notificationSender = comment.userId; //댓글 쓴 사람
      toCommentNotification.eventType = 2;
      toCommentNotification.eventContent = comment.recruitCommentContent; //
      toCommentNotification.targetId = comment.recruitPostId; //어디서
      toCommentNotification.nickname = nickname;
      if (
        toCommentNotification.notificationReceiver !=
        toCommentNotification.notificationSender
      ) {
        notifications.push(toPostNotification);
      }
    }
  }

  //마무리
  async createKeepIt(recruitPostId: number, keepIt: RecruitKeeps) {
    const returned = await this.recruitKeepsRepository
      .createQueryBuilder()
      .where('recruitPostId = :recruitPostId', { recruitPostId })
      .andWhere('userId = :userId', { userId: keepIt.userId })
      .getManyAndCount();

    if (returned[1]) {
      throw recruitError.DuplicateOneRecruitKeep;
    }
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
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
      await queryRunner.rollbackTransaction();
      throw recruitError.DBqueryError;
    } finally {
      await queryRunner.release();
    }
  }

  async createApply(
    recruitPostId: number,
    apply: RecruitApplies,
    nickname: string,
  ) {
    const returned = await this.recruitAppliesRepository
      .createQueryBuilder()
      .where('recruitPostId = :recruitPostId', { recruitPostId })
      .andWhere('applicant = :userId', { userId: apply.applicant })
      .getMany();
    if (returned.length) {
      throw recruitError.DuplicateOneRecruitApply;
    }

    await this.recruitAppliesRepository
      .createQueryBuilder()
      .insert()
      .into(RecruitApplies)
      .values(apply)
      .execute();

    const returnedPost = await this.recruitPostsRepository.findOne({
      recruitPostId,
    });

    const notifications = [];
    const applyNotification = new CreateNotificationDto();
    applyNotification.notificationReceiver = returnedPost.author; //글 주인 /
    applyNotification.notificationSender = apply.applicant; //댓글 쓴 사람
    applyNotification.eventType = 3; //
    applyNotification.eventContent = '프로젝트 참가 신청이 왔습니다.'; //
    applyNotification.targetId = recruitPostId; //어디서
    applyNotification.nickname = nickname;
    notifications.push(applyNotification);

    await this.socketGateway.sendNotification(notifications);
  }

  async updateRecruitPost(recruitPost: RecruitPosts, recruitPostId: number) {
    try {
      const returned = await this.recruitPostsRepository.findOneOrFail({
        recruitPostId,
      });
      if (returned.author !== recruitPost.author) {
        throw recruitError.WrongRequiredError;
      }
    } catch (error) {
      throw recruitError.WrongRequiredError;
    }
    try {
      await this.recruitPostsRepository
        .createQueryBuilder()
        .update()
        .set(recruitPost)
        .where('recruitPostId = :id', { id: recruitPostId })
        .execute();
    } catch (error) {
      throw recruitError.DBqueryError;
    }
  }

  //마무리
  async updateComment(commentId: number, comment: RecruitComments) {
    try {
      const returned = await this.recruitCommentsRepository.findOne({
        recruitCommentId: commentId,
      });
      if (returned.userId !== comment.userId) {
        throw recruitError.WrongRequiredError;
      }
    } catch (error) {
      throw recruitError.WrongRequiredError;
    }
    await this.recruitCommentsRepository
      .createQueryBuilder()
      .update(RecruitComments)
      .set(comment)
      .where('recruitCommentId=:commentId', { commentId })
      .execute();
  }

  async deleteRecruitPost(postId: number, userId: string) {
    try {
      const returned = await this.recruitPostsRepository.findOneOrFail({
        recruitPostId: postId,
      });
      if (returned.author !== userId) {
        throw recruitError.WrongAuthorError;
      }
      if (+returned.endAt !== +returned.createdAt) {
        throw recruitError.RunningProjectError;
      }
    } catch (error) {
      throw recruitError.WrongRequiredError;
    }
    try {
      await this.recruitPostsRepository.delete({ recruitPostId: postId });
    } catch (error) {
      throw recruitError.DBqueryError;
    }
  }

  //마무리
  async deleteComment(
    recruitPostId: number,
    commentId: number,
    userId: string,
  ) {
    /*
    1, KeepIt post와 조인해 가지고 delete할 apply가 있는지 확인 
    2, 있으면 지우고 없으면 error를 띄움 post에 comment 카운트를 낮추고 저장
    3, 
    */
    try {
      const returned = await this.recruitCommentsRepository
        .createQueryBuilder('C')
        .where('recruitCommentId = :commentId', { commentId })
        .getOneOrFail();
      if (returned.userId !== userId) {
        throw recruitError.WrongAuthorError;
      }
    } catch (error) {
      throw recruitError.WrongRequiredError;
    }

    try {
      await this.recruitCommentsRepository.delete(commentId);
    } catch (error) {
      throw recruitError.DBqueryError;
    }
  }

  //트렌젝션 걸어야함
  async deleteKeepIt(recruitPostId: number, keepId: number, userId: string) {
    /*
    1, KeepIt post와 조인해 가지고 delete할 apply가 있는지 확인 
    2, 있으면 지우고 없으면 error를 띄움 apply 카운트를 낮추고 저장
    */

    try {
      const returned = await this.recruitKeepsRepository
        .createQueryBuilder('K')
        .where('K.recruitKeepId = :keepId', { keepId })
        .getOneOrFail();
      if (returned.userId != userId) {
        throw recruitError.WrongAuthorError;
      }
    } catch (error) {
      throw recruitError.WrongRequiredError;
    }

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager
        .getRepository(RecruitKeeps)
        .delete({ recruitPostId });
      await queryRunner.manager
        .getRepository(RecruitKeeps)
        .createQueryBuilder()
        .update(RecruitPosts)
        .set({ recruitKeepCount: () => 'recruitKeepCount - 1' })
        .where('recruitPostId = :recruitPostId', { recruitPostId })
        .execute();
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw recruitError.DBqueryError;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteApply(recruitPostId: number, applyId: number, userId: string) {
    /*
    1, applyId post와 조인해 가지고 delete할 apply가 있는지 확인 
    2, apply가 true 이면 task, stack people set을 1씩 내리고 삭제
    3, apply가 false 이면 apply를 삭제
    */
    //
    let returned;
    try {
      returned = await this.recruitAppliesRepository.findOneOrFail(applyId);
      if (returned.applicant !== userId) {
        throw recruitError.WrongApplicantError;
      }
    } catch (error) {
      throw recruitError.WrongRequiredError;
    }

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (returned.isAccepted) {
        if (returned.task % 100 !== 0) {
          await queryRunner.manager
            .getRepository(RecruitStacks)
            .createQueryBuilder('S')
            .update('S')
            .set({ numberOfPeopleRequired: () => 'numberOfPeopleRequired - 1' })
            .where('S.recruitPostId = :recruitPostId', { recruitPostId })
            .andWhere('S.stack = :stack', { stack: returned.task })
            .execute();
          returned.task = returned.task > 300 ? 400 : 300;
        }
        await queryRunner.manager
          .getRepository(RecruitTasks)
          .createQueryBuilder('T')
          .update('T')
          .set({ numberOfPeopleRequired: () => 'numberOfPeopleRequired - 1' })
          .where('T.recruitPostId = :recruitPostId', { recruitPostId })
          .andWhere('T.task = :task', { task: returned.task })
          .execute();
      }

      await queryRunner.manager.getRepository(RecruitApplies).delete({
        recruitApplyId: applyId,
      });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw recruitError.DBqueryError;
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
