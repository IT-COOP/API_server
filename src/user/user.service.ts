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
  async putMyProfile(
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
      .addSelect('C.recruitCommentId')
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
    let isError = false;
    const { recruitPostId, applicant, isAccepted } = responseToApplyDto;
    const post = await this.recruitPostRepository.findOne({
      where: { recruitPostId: recruitPostId },
      select: ['author'],
    });
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
      .getOne();

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
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (apply.task % 100) {
        const task = apply.task / 100 < 3 ? 300 : 400;
        // 개발자임
        const [recruitStack, recruitTask] = await Promise.all([
          this.recruitStackRepository.findOne({
            where: {
              recruitPostId: apply.recruitPostId,
              recruitStack: apply.task,
            },
          }),
          this.recruitTaskRepository.findOne({
            where: {
              recruitPostId: apply.recruitPostId,
              recruitTask: task,
            },
          }),
        ]);
        if (
          !recruitStack ||
          !recruitTask ||
          recruitStack.numberOfPeopleRequired ===
            recruitStack.numberOfPeopleSet ||
          recruitTask.numberOfPeopleRequired === recruitTask.numberOfPeopleSet
        ) {
          // 이미 다 구함 에러처리 혹은 안 구하는 중
          throw myPageError.NotRecruitingError;
        }
        recruitStack.numberOfPeopleRequired++;
        recruitTask.numberOfPeopleRequired++;

        await Promise.all([
          queryRunner.manager.getRepository(RecruitStacks).save(recruitStack),
          queryRunner.manager.getRepository(RecruitTasks).save(recruitTask),
        ]).catch((err) => {
          throw new Error(err);
        });
      } else {
        // 기획자 혹은 디자이너임
        const recruitTask = await this.recruitTaskRepository.findOne({
          where: {
            recruitPostId: apply.recruitPostId,
            recruitTask: apply.task,
          },
        });
        if (
          !recruitTask ||
          recruitTask.numberOfPeopleSet === recruitTask.numberOfPeopleRequired
        ) {
          // 이미 다 구함 혹은 안 구함
          throw myPageError.NotRecruitingError;
        }
        recruitTask.numberOfPeopleRequired++;
        await queryRunner.manager.getRepository(RecruitTasks).save(recruitTask);
      }
    } catch (err) {
      await queryRunner.rollbackTransaction();
      isError = true;
    } finally {
      await queryRunner.release();
      if (isError) {
        throw new InternalServerErrorException(
          `Something Went Wrong. Please Try Again.`,
        );
      }
    }

    apply.isAccepted = true;
    await this.recruitApplyRepository.save(apply);
    const notification = new CreateNotificationDto();
    notification.notificationReceiver = apply.applicant;
    notification.notificationSender = userId;
    notification.eventType = EventType.recruitApplyAccepted;
    notification.eventContent = '';
    notification.targetId = apply.recruitPostId;
    notification.isRead = false;
    notification.nickname = apply.applicant2.nickname;
    this.socketGateway.sendNotification([notification]);

    return { success: true };
  }

  // 모집 중인 프로젝트 - 신청자 목록?
  async getMyRecruitingProject(userId: string, loginId: string) {
    console.log(userId, loginId);
    let posts: RecruitPosts[];
    if (userId === loginId) {
      posts = await this.recruitPostRepository
        .createQueryBuilder('P')
        .leftJoin('P.author2', 'U')
        .leftJoin('P.recruitComments', 'C')
        .leftJoin('P.recruitApplies', 'A')
        .leftJoin('A.applicant2', 'AP')
        .addSelect(['U.nickname', 'U.profileImgUrl'])
        .addSelect('C.recruitCommentId')
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
        .getMany();
      return { posts };
    } else {
      posts = await this.recruitPostRepository
        .createQueryBuilder('P')
        .leftJoin('P.author2', 'U')
        .leftJoin('P.recruitComments', 'C')
        .addSelect(['U.nickname', 'U.profileImgUrl'])
        .addSelect('C.recruitCommentId')
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
      .leftJoin('P.recruitComments', 'CM')
      .addSelect(['U.nickname', 'U.profileImgUrl'])
      .addSelect('CM.recruitCommentId')
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
      .leftJoin('P.recruitComments', 'CM')
      .addSelect(['U.nickname', 'U.profileImgUrl'])
      .addSelect('CM.recruitCommentId')
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
      .andWhere('R.recruitPostId = :', { recruitPostId })
      .getOne();
    if (isRated) {
      throw myPageError.UnableToRateTwiceError;
    }

    // 이거 orWhere하고 직접 뒤져보는 로직으로 조금 수정해야 할듯 함.
    const post = await this.recruitPostRepository
      .createQueryBuilder('P')
      .leftJoinAndSelect('P.chatRooms', 'C')
      .leftJoinAndSelect('C.chatMembers', 'M')
      .leftJoin('P.author2', 'U')
      .addSelect(['U.nickname', 'U.profileImgUrl'])
      .where('P.endAt != P.createdAt')
      .andWhere('P.endAt < :now', { now: new Date() })
      .andWhere('P.recruitPostId = :recruitPostId', { recruitPostId })
      .getOne();

    if (!post) {
      throw myPageError.UnableToRateError;
    }

    let canRate = 0;
    for (const member in post.chatRooms.chatMembers) {
      if (member === userId || member === receiver) canRate++;
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
    const post = await this.recruitPostRepository.findOne({
      where: {
        recruitPostId,
        author: userId,
      },
      relations: ['recruitTasks', 'recruitStacks'],
    });
    let isError = false;
    let createdRoom: ChatRooms;
    if (!post) {
      throw new BadRequestException('No Post To Run');
    }
    post.endAt.setDate(post.createdAt.getDate() + post.recruitDurationDays);
    let isRunnable = true;
    for (const each of post.recruitTasks) {
      isRunnable =
        isRunnable && each.numberOfPeopleRequired === each.numberOfPeopleSet;
    }
    for (const each of post.recruitStacks) {
      isRunnable =
        isRunnable && each.numberOfPeopleRequired === each.numberOfPeopleSet;
    }
    if (!isRunnable) {
      // 사람 덜 구했음 아 우리 사람 덜 구해도 되던가? 이거 물어보자
      throw new BadRequestException('Must Recruit People First');
    }
    const applies = await this.recruitApplyRepository
      .createQueryBuilder('A')
      .leftJoin('A.applicant2', 'U')
      .addSelect('U.nickname')
      .where('A.recruitPostId = :recruitPostId', { recruitPostId })
      .getMany();
    // 이제 사람들 찾았으니 채팅방 만들고, 멤버 추가하고, apply들 삭제해주면 됨. << false인 애들도 삭제해야함
    // endAt도 변경해줘야함.
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const chatRoom = this.chatRoomRepository.create({
        chatRoomId: recruitPostId,
        participantCount: applies.length,
        isValid: true,
      });
      const members: ChatMembers[] = [
        this.chatMemberRepository.create({
          member: userId,
          chatRoomId: recruitPostId,
        }),
      ];
      const notifications: CreateNotificationDto[] = [];
      for (const apply of applies) {
        if (!apply.isAccepted) continue;
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

      createdRoom = await queryRunner.manager
        .getRepository(ChatRooms)
        .save(chatRoom);
      await queryRunner.manager.getRepository(ChatMembers).save(members);
      await queryRunner.manager.getRepository(RecruitApplies).remove(applies);
      await queryRunner.manager.getRepository(RecruitPosts).save(post);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      isError = true;
    } finally {
      await queryRunner.release();
      if (isError) {
        throw new InternalServerErrorException(
          'Something Went Wrong Please Try Again',
        );
      }
      return {
        success: true,
        chatRoom: createdRoom,
      };
    }
  }
}
