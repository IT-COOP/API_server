import { ChatMembers } from './../socket/entities/ChatMembers';
import { ChatRooms } from './../socket/entities/ChatRooms';
import { CreateNotificationDto } from './../socket/dto/createNotification.dto';
import { SocketGateway } from 'src/socket/socket.gateway';
import { myPageError } from './../common/error';
import { RecruitStacks } from './../recruit-post/entities/RecruitStacks';
import { RecruitTasks } from './../recruit-post/entities/RecruitTasks';
import { RecruitApplies } from './../recruit-post/entities/RecruitApplies';
import { ResponseToApplyDto } from './dto/responseToApply.dto';
import { RecruitPosts } from './../recruit-post/entities/RecruitPosts';
import { UpdateUserProfileDTO } from './dto/updateUserProfile.dto';
import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './../socialLogin/entity/Users';
import { Connection, Repository } from 'typeorm';
import { UserReputation } from './entities/UserReputation';
import { RateUserDto } from './dto/rateUser.dto';
import { EventType } from './../socket/enum/eventType.enum';
import { Response } from 'express';

@Injectable()
export class UserService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(UserReputation)
    private readonly userReputationRepository: Repository<UserReputation>,
    @InjectRepository(RecruitPosts)
    private readonly recruitPostRepository: Repository<RecruitPosts>,
    @InjectRepository(RecruitApplies)
    private readonly recruitApplyRepository: Repository<RecruitApplies>,
    @InjectRepository(RecruitTasks)
    private readonly recruitTaskRepository: Repository<RecruitTasks>,
    @InjectRepository(RecruitStacks)
    private readonly recruitStackRepository: Repository<RecruitStacks>,
    @InjectRepository(ChatRooms)
    private readonly chatRoomRepository: Repository<ChatRooms>,
    @InjectRepository(ChatMembers)
    private readonly chatMemberRepository: Repository<ChatMembers>,
    private readonly socketGateway: SocketGateway,
    private connection: Connection,
  ) {}
  // 내 프로필 보기
  async getMyProfile(res: Response) {
    const userId = res.locals.user.userId;
    const profile = await this.userRepository.findOne({
      where: { userId },
      select: [
        'userId',
        'nickname',
        'profileImgUrl',
        'technologyStack',
        'activityPoint',
        'selfIntroduction',
        'portfolioUrl',
      ],
      relations: ['userReputations2'],
    });

    const postCountPromise = this.recruitPostRepository
      .createQueryBuilder('P')
      .where('P.author = :userId', { userId })
      .andWhere('P.createdAt = P.endAt')
      .getCount();
    const projectCountPromise = this.recruitPostRepository
      .createQueryBuilder('P')
      .leftJoin('P.chatRooms', 'C')
      .leftJoin('C.chatMembers', 'M')
      .where('M.member = :userId', { userId })
      .andWhere('P.createdAt != P.endAt')
      .andWhere('P.endAt < :now', { now: new Date() })
      .getCount();
    const applyCountPromise = this.recruitApplyRepository
      .createQueryBuilder('A')
      .where('A.applicant = :userId', { userId })
      .getCount();

    Promise.all([
      postCountPromise,
      projectCountPromise,
      applyCountPromise,
    ]).then((values) => {
      const [postCount, projectCount, applyCount] = values;
      res.status(200).send({
        profile,
        postCount: postCount || 0,
        projectCount: projectCount || 0,
        applyCount: applyCount || 0,
      });
    });
  }

  // 다른 프로필 보기
  async getOthersProfile(userId: string) {
    const profile = await this.userRepository.findOne({
      where: { userId },
      select: [
        'userId',
        'nickname',
        'profileImgUrl',
        'technologyStack',
        'activityPoint',
        'selfIntroduction',
        'portfolioUrl',
      ],
      relations: ['userReputations2'],
    });
    if (!profile) {
      throw myPageError.MissingUserError;
    }
    const projectCount = await this.recruitPostRepository
      .createQueryBuilder('P')
      .leftJoin('P.chatRooms', 'C')
      .leftJoin('C.chatMembers', 'M')
      .where('M.member = :userId', { userId })
      .andWhere('P.createdAt != P.endAt')
      .andWhere('P.endAt < :now', { now: new Date() })
      .getCount();
    return { profile, projectCount };
  }

  // 내 프로필 수정하기
  async patchMyProfile(
    userId: string,
    updateUserProfileDTO: UpdateUserProfileDTO,
  ) {
    const profile = await this.userRepository.findOne({
      where: { userId },
      select: [
        'userId',
        'nickname',
        'profileImgUrl',
        'portfolioUrl',
        'selfIntroduction',
      ],
    });
    for (const each in updateUserProfileDTO) {
      profile[each] = updateUserProfileDTO[each];
    }
    await this.userRepository.save(profile);
    return { profile };
  }

  // 내가 keep한 게시물
  async getMyKeeps(userId: string, lastId: number, items: number) {
    const posts = await this.recruitPostRepository
      .createQueryBuilder('P')
      .leftJoinAndSelect('P.recruitKeeps', 'K')
      .leftJoinAndSelect('P.recruitStacks', 'S')
      .leftJoinAndSelect('P.recruitTasks', 'T')
      .leftJoin('P.recruitComments', 'C')
      .leftJoin('P.author2', 'U')
      .addSelect('C.recruitCommentId')
      .addSelect(['U.nickname', 'U.profileImgUrl'])
      .where('K.userId = :userId', { userId })
      .andWhere('P.recruitPostId < :lastId', { lastId })
      .orderBy('P.recruitPostId', 'DESC')
      .take(items)
      .getMany();
    return { posts };
  }

  // 진행 중인 프로젝트
  async getMyRunningProject(userId: string) {
    const posts = await this.recruitPostRepository
      .createQueryBuilder('P')
      .leftJoinAndSelect('P.chatRooms', 'C')
      .leftJoinAndSelect('C.chatMembers', 'M')
      .leftJoin('P.author2', 'U')
      .leftJoin('P.recruitComments', 'CM')
      .addSelect(['U.nickname', 'U.profileImgUrl'])
      .addSelect('CM.recruitCommentId')
      .andWhere('P.endAt > :now', { now: new Date() })
      .andWhere('M.member = :userId', { userId })
      .getMany();
    return { posts };
  }

  // 신청 중인 프로젝트
  async getMyAppliedProject(userId: string) {
    const posts = await this.recruitPostRepository
      .createQueryBuilder('P')
      .leftJoinAndSelect('P.recruitApplies', 'A')
      .leftJoin('P.author2', 'U')
      .leftJoin('P.recruitComments', 'C')
      .addSelect(['U.nickname', 'U.profileImgUrl'])
      .addSelect('C.recruitCommentId')
      .andWhere('A.applicant = :userId', { userId })
      .getMany();
    return { posts };
  }

  async responseToApply(
    userId: string,
    responseToApplyDto: ResponseToApplyDto,
  ) {
    const { recruitPostId, applicant, isAccepted } = responseToApplyDto;
    const post = await this.recruitPostRepository.findOne({
      where: { recruitPostId: recruitPostId },
      select: ['author'],
    });
    console.log(post);
    if (!post) {
      throw myPageError.MissingPostError;
    }
    if (post.author !== userId) {
      // 지가 적은 글도 아닌데 받으려고 함.
      throw myPageError.WrongAuthorError;
    }

    const apply = await this.recruitApplyRepository
      .createQueryBuilder('A')
      .leftJoin('A.applicant2', 'U')
      .select(['A.task', 'A.isAccepted', 'A.recruitApplyId'])
      .addSelect('U.nickname')
      .where('A.applicant = :applicant', { applicant })
      .andWhere('A.recruitPostId = :recruitPostId', { recruitPostId })
      .getOne();
    console.log(apply, '최초 apply 받자마자');

    if (!apply) {
      // 신청한 적도 없음!
      throw myPageError.NoApplyToResponseError;
    }
    if (!isAccepted) {
      // 거절했음
      await this.recruitApplyRepository.remove(apply);
      return { success: true };
    }
    if (apply.isAccepted) {
      // 이미 허락했음
      throw myPageError.AlreadyRespondedError;
    }
    apply.isAccepted = true;
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (apply.task % 100) {
        const task = apply.task < 300 ? 300 : 400;
        // 개발자임
        const recruitStack = await this.recruitStackRepository.findOne({
          where: {
            recruitPostId,
            recruitStack: apply.task,
          },
        });
        const recruitTask = await this.recruitTaskRepository.findOne({
          where: {
            recruitPostId,
            recruitTask: task,
          },
        });
        if (
          !recruitStack ||
          !recruitTask ||
          recruitStack.numberOfPeopleRequired ===
            recruitStack.numberOfPeopleSet ||
          recruitTask.numberOfPeopleRequired === recruitTask.numberOfPeopleSet
        ) {
          console.log([recruitStack, recruitTask]);
          // 이미 다 구함 에러처리 혹은 안 구하는 중
          throw myPageError.NotRecruitingError;
        }
        recruitStack.numberOfPeopleRequired++;
        recruitTask.numberOfPeopleRequired++;

        await queryRunner.manager
          .getRepository(RecruitStacks)
          .save(recruitStack);
        await queryRunner.manager.getRepository(RecruitTasks).save(recruitTask);
      } else {
        // 기획자 혹은 디자이너임
        const recruitTask = await this.recruitTaskRepository.findOne({
          where: {
            recruitPostId,
            recruitTask: apply.task,
          },
        });
        if (
          !recruitTask ||
          recruitTask.numberOfPeopleSet === recruitTask.numberOfPeopleRequired
        ) {
          console.log([recruitTask]);
          // 이미 다 구함 혹은 안 구함
          throw myPageError.NotRecruitingError;
        }
        recruitTask.numberOfPeopleRequired++;
        await queryRunner.manager.getRepository(RecruitTasks).save(recruitTask);
      }
      await queryRunner.manager.getRepository(RecruitApplies).save(apply);
      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch (err) {
      console.error(err);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        `Something Went Wrong. Please Try Again.`,
      );
    }
    console.log('마지막', apply);

    const notification = new CreateNotificationDto();
    notification.notificationReceiver = apply.applicant;
    notification.notificationSender = userId;
    notification.eventType = EventType.recruitApplyAccepted;
    notification.eventContent = '협업 신청이 수락되었습니다.';
    notification.targetId = apply.recruitPostId;
    notification.isRead = false;
    notification.nickname = apply.applicant2.nickname;
    this.socketGateway.sendNotification([notification]);

    return { success: true };
  }

  // 모집 중인 프로젝트 - 신청자 목록?
  async getMyRecruitingProject(userId: string, loginId: string) {
    let posts: RecruitPosts[];
    if (userId === loginId) {
      posts = await this.recruitPostRepository
        .createQueryBuilder('P')
        .leftJoin('P.author2', 'U')
        .leftJoin('P.recruitApplies', 'A')
        .leftJoin('A.applicant2', 'AP')
        .addSelect(['U.nickname', 'U.profileImgUrl'])
        .addSelect([
          'A.applicant',
          'A.task',
          'A.applyMessage',
          'A.isAccepted',
          'A.createdAt',
        ])
        .addSelect(['AP.nickname', 'AP.profileImgUrl'])
        .where('P.author = :loginId', { loginId })
        .andWhere('P.endAt = P.createdAt')
        .orderBy('A.recruitApplyId', 'DESC')
        .getMany();
      return { posts };
    } else {
      posts = await this.recruitPostRepository
        .createQueryBuilder('P')
        .leftJoin('P.author2', 'U')
        .addSelect(['U.nickname', 'U.profileImgUrl'])
        .where('P.author = :userId', { userId })
        .andWhere('P.endAt = P.createdAt')
        .getMany();
      return { posts };
    }
  }

  // 진행 완료한 프로젝트
  async getMyOverProject(userId: string) {
    const posts = await this.recruitPostRepository
      .createQueryBuilder('P')
      .leftJoinAndSelect('P.chatRooms', 'C')
      .leftJoinAndSelect('C.chatMembers', 'M')
      .leftJoin('P.author2', 'U')
      .addSelect(['U.nickname', 'U.profileImgUrl'])
      .where('P.endAt != P.createdAt')
      .andWhere('P.endAt < :now', { now: new Date() })
      .andWhere('M.member = :userId', { userId })
      .getMany();
    return { posts };
  }

  // 내가 완료한 프로젝트 갯수 보기
  async getMyLevel(userId: string) {
    const level = await this.recruitPostRepository
      .createQueryBuilder('P')
      .leftJoinAndSelect('P.chatRooms', 'C')
      .leftJoinAndSelect('C.chatMembers', 'M')
      .leftJoin('P.author2', 'U')
      .addSelect(['U.nickname', 'U.profileImgUrl'])
      .where('P.endAt != P.createdAt')
      .andWhere('P.endAt < :now', { now: new Date() })
      .andWhere('M.member = :userId', { userId })
      .getCount();
    return { level };
  }

  // 유저 평가하기
  async rateUser(userId: string, rateUserDto: RateUserDto) {
    const { point, receiver, recruitPostId } = rateUserDto;
    const isRated = await this.userReputationRepository
      .createQueryBuilder('R')
      .select('R.userReputationId')
      .where('R.userReputationSender = :receiver', { receiver })
      .andWhere('R.recruitPostId = :recruitPostId', { recruitPostId })
      .getOne();
    if (isRated) {
      console.log(isRated);

      throw myPageError.UnableToRateTwiceError;
    }

    // 이거 orWhere하고 직접 뒤져보는 로직으로 조금 수정해야 할듯 함.
    const post = await this.recruitPostRepository
      .createQueryBuilder('P')
      .leftJoin('P.chatRooms', 'CR')
      .leftJoin('CR.chatMembers', 'CM')
      .leftJoin('P.author2', 'U')
      .addSelect(['U.nickname', 'U.profileImgUrl'])
      .addSelect('CR.chatRoomId')
      .addSelect('CM.member')
      .where('P.endAt != P.createdAt')
      .andWhere('P.endAt < :now', { now: new Date() })
      .andWhere('P.recruitPostId = :recruitPostId', { recruitPostId })
      .getOne();

    if (!post) {
      throw myPageError.UnableToRateError;
    }

    let canRate = 0;
    for (const members of post.chatRooms.chatMembers) {
      if (members.member === userId || members.member === receiver) canRate++;
    }

    if (canRate === 2) {
      const result = await this.userReputationRepository.save(
        this.userReputationRepository.create({
          userReputationSender: userId,
          userReputationReceiver: receiver,
          userReputationPoint: Boolean(point),
          recruitPostId,
        }),
      );
      return { result };
      // 여기 평가 반영
    }

    throw myPageError.UnableToRateError;
  }

  // 모집을 마치고 이제 시작하기.
  // endAt을 바꿔줘야 함.
  // apply 다 삭제해야함
  // 채팅방 만들어줘야함.
  async completeRecruit(userId: string, recruitPostId: number) {
    const post = await this.recruitPostRepository
      .createQueryBuilder('P')
      .where('P.recruitPostId = :recruitPostId', { recruitPostId })
      .andWhere('P.author = :userId', { userId })
      .andWhere('P.endAt = P.createdAt')
      .getOne();
    if (!post) {
      throw new BadRequestException('No Post To Run');
    }
    const now = new Date();
    switch (post.recruitDurationDays) {
      case 7:
        post.recruitDurationDays = 1;
        break;
      case 14:
        post.recruitDurationDays = 5;
        break;
      case 21:
        post.recruitDurationDays = 10;
      case 28:
        post.recruitDurationDays = 20;
        break;
    }
    post.endAt = new Date(
      now.setMinutes(now.getMinutes() + post.recruitDurationDays),
    );

    let participantCount = 1;
    const applies = await this.recruitApplyRepository
      .createQueryBuilder('A')
      .leftJoin('A.applicant2', 'U')
      .addSelect('U.nickname')
      .where('A.recruitPostId = :recruitPostId', { recruitPostId })
      .getMany();

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const members: ChatMembers[] = [
        this.chatMemberRepository.create({
          member: userId,
          chatRoomId: recruitPostId,
        }),
      ];
      const notifications: CreateNotificationDto[] = [];
      for (const apply of applies) {
        if (!apply.isAccepted) continue;
        participantCount++;
        members.push(
          this.chatMemberRepository.create({
            member: apply.applicant,
            chatRoomId: recruitPostId,
          }),
        );
        if (userId === apply.applicant) continue;
        const notification = new CreateNotificationDto();
        notification.notificationReceiver = apply.applicant;
        notification.notificationSender = userId;
        notification.eventType = EventType.chatRoomCreation;
        notification.eventContent = '채팅방이 생성되었습니다.';
        notification.targetId = apply.recruitPostId;
        notification.isRead = false;
        notification.nickname = apply.applicant2.nickname;
        notifications.push(notification);
      }
      this.socketGateway.sendNotification(notifications);

      const createdRoom = await queryRunner.manager
        .getRepository(ChatRooms)
        .save(
          this.chatRoomRepository.create({
            chatRoomId: recruitPostId,
            participantCount: participantCount,
            isValid: true,
          }),
        );
      await queryRunner.manager.getRepository(ChatMembers).insert(members);
      await queryRunner.manager.getRepository(RecruitApplies).remove(applies);
      await queryRunner.manager.getRepository(RecruitPosts).save(post);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return {
        success: true,
        chatRoom: createdRoom,
      };
    } catch (err) {
      console.error(err);
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw new InternalServerErrorException(
        'Something Went Wrong Please Try Again',
      );
    }
  }

  // userId랑 recruitPostId 받아서 applies 돌려주기.
  // 재협업 희망률이랑 협업 횟수도
  async getRecruitApplies(
    userId: string,
    recruitPostId: number,
    isAccepted: number,
  ) {
    try {
      await this.recruitPostRepository
        .createQueryBuilder('P')
        .select('P.recruitPostId')
        .where('P.recruitPostId = :recruitPostId', { recruitPostId })
        .andWhere('P.author = :userId', { userId })
        .getOneOrFail();
    } catch (err) {
      throw new ForbiddenException('Not Your Post');
    }
    // 무언가 공약수가 곱해진 형태입니다...
    const projects = await this.recruitApplyRepository
      .createQueryBuilder('A')
      .select('A.recruitApplyId')
      .addSelect('Count(CR.recruitPost)', 'Projects')
      .groupBy('A.recruitApplyId')
      .leftJoin('A.applicant2', 'U')
      .leftJoin('U.chatMembers', 'CM')
      .leftJoin('CM.chatRoom', 'CR')
      .leftJoin('CR.recruitPost', 'RP', 'RP.endAt < now()')
      .where('A.recruitPostId = :recruitPostId', { recruitPostId })
      .andWhere('A.isAccepted = :isAccepted', { isAccepted })
      .andWhere('RP.endAt < now()')
      .orderBy('A.recruitApplyId', 'DESC')
      .getRawMany();

    const recruitApplies = await this.recruitApplyRepository
      .createQueryBuilder('A')
      .addSelect([
        'A.recruitApplyId',
        'A.recruitPostId',
        'A.task',
        'A.applyMessage',
        'A.isAccepted',
      ])
      .addSelect('UR.userReputationPoint')
      .addSelect([
        'U.nickname',
        'U.profileImgUrl',
        'U.portfolioUrl',
        'U.userId',
      ])
      .groupBy('A.recruitApplyId')
      .addGroupBy('UR.userReputationId')
      .leftJoin('A.applicant2', 'U')
      .leftJoin('U.userReputations2', 'UR')
      .where('A.recruitPostId = :recruitPostId', { recruitPostId })
      .andWhere('A.isAccepted = :isAccepted', { isAccepted })
      .orderBy('A.recruitApplyId', 'DESC')
      .getMany();
    let m = 0;
    const projectCount = [];
    for (let idx = 0; idx < recruitApplies.length; idx++) {
      if (m === projects.length) {
        projectCount.push(0);
      } else if (
        recruitApplies[idx].recruitApplyId === projects[m].A_recruitApplyId
      ) {
        projectCount.push(parseInt(projects[m].Projects));
        m++;
      } else {
        projectCount.push(0);
      }
    }
    return {
      recruitApplies,
      projectCount,
    };
  }

  // 협업 신청 수락된 사람들 숫자 보기
  async getRecruitAppliesProfileImgUrl(userId: string, recruitPostId: number) {
    try {
      await this.recruitPostRepository
        .createQueryBuilder('P')
        .select('P.recruitPostId')
        .where('P.recruitPostId = :recruitPostId', { recruitPostId })
        .andWhere('P.author = :userId', { userId })
        .getOneOrFail();
    } catch (err) {
      throw new ForbiddenException('Not Your Post');
    }
    const acceptedAppliesCount = await this.recruitApplyRepository
      .createQueryBuilder('A')
      .leftJoin('A.recruitPost', 'P')
      .leftJoin('A.applicant2', 'U')
      .addSelect('A.recruitApplyId')
      .addSelect('P.recruitPostId')
      .addSelect(['U.userId'])
      .where('A.recruitPostId = :recruitPostId', { recruitPostId })
      .andWhere('A.isAccepted = 1')
      .andWhere('P.author = :userId', { userId })
      .getCount();
    return {
      acceptedAppliesCount,
    };
  }

  async getRecruitReputation(userId: string, recruitPostId: number) {
    console.log(recruitPostId, '00000000000000000000000');
    try {
      const [reputations, members] = await Promise.all([
        this.userReputationRepository.find({
          where: {
            recruitPostId: recruitPostId,
          },
        }),
        this.chatMemberRepository.find({ chatRoomId: recruitPostId }),
      ]);
      const existReputation = new Set();
      const unratedUser = [];
      for (let i = 0; i < reputations.length; i++) {
        if (reputations[i].userReputationSender === userId)
          existReputation.add(reputations[i].userReputationReceiver);
      }
      for (let i = 0; i < members.length; i++) {
        if (
          !existReputation.has(members[i].member) &&
          userId !== members[i].member
        ) {
          unratedUser.push(members[i].member);
        }
      }
      const unratedProjectMembers = await this.userRepository.findByIds(
        unratedUser,
        {
          select: ['userId', 'nickname', 'profileImgUrl', 'activityPoint'],
        },
      );
      return unratedProjectMembers;
    } catch (e) {
      throw new BadRequestException('Try again');
    }
  }
}
