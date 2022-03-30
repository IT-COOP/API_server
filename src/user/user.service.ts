import { CreateNotificationDto } from './../socket/dto/createNotification.dto';
import { SocketGateway } from 'src/socket/socket.gateway';
import { myPageError } from './../common/error';
import { RecruitStacks } from './../recruit-post/entities/RecruitStacks';
import { RecruitTasks } from './../recruit-post/entities/RecruitTasks';
import { RecruitApplies } from './../recruit-post/entities/RecruitApplies';
import { ResponseToApplyDto } from './dto/responseToApply.dto';
import { RecruitPosts } from './../recruit-post/entities/RecruitPosts';
import { UpdateUserProfileDTO } from './dto/updateUserProfile.dto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './../socialLogin/entity/Users';
import { Repository } from 'typeorm';
import { UserReputation } from './entities/UserReputation';
import { RateUserDto } from './dto/rateUser.dto';
import { EventType } from 'src/socket/enum/eventType.enum';

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
    private readonly socketGateway: SocketGateway,
  ) {}
  // 내 프로필 보기
  async getMyProfile(userId: string) {
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

    const counts = await this.userRepository
      .createQueryBuilder('U')
      .leftJoin('U.recruitPosts', 'P')
      .leftJoin('U.chatMembers', 'M')
      .leftJoin('U.recruitApplies', 'A')
      .select('U.userId')
      .addSelect('COUNT(P.author)', 'postCount')
      .addSelect('COUNT(M.member)', 'projectCount')
      .addSelect('COUNT(A.applicant)', 'applyCount')
      .where('U.userId = :userId', { userId })
      .getRawOne();

    return {
      profile,
      postCount: parseInt(counts.postCount),
      projectCount: parseInt(counts.projectCount),
      applyCount: parseInt(counts.applyCount1),
    };
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
    return { profile };
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
    const post = await this.recruitPostRepository.findOne({
      where: { recruitPostId: responseToApplyDto.recruitPostId },
    });
    if (post.author !== userId) {
      // 지가 적은 글도 아닌데 받으려고 함.
      throw myPageError.WrongAuthorError;
    }
    const apply = await this.recruitApplyRepository.findOne({
      where: {
        recruitPostId: responseToApplyDto.recruitPostId,
        applicant: responseToApplyDto.applicant,
      },
    });
    if (!apply) {
      // 신청한 적도 없음!
      throw myPageError.NoApplyToResponseError;
    }
    if (!responseToApplyDto.isAccepted) {
      // 거절했음
      await this.recruitApplyRepository.delete(apply.recruitApplyId);
      return {
        success: true,
      };
    }
    if (apply.isAccepted) {
      // 이미 허락했음
      throw myPageError.AlreadyRespondedError;
    }
    if (apply.task % 100) {
      const task = apply.task / 100 < 3 ? 300 : 400;
      // 개발자임
      const recruitStack = await this.recruitStackRepository.findOne({
        where: {
          recruitPostId: apply.recruitPostId,
          recruitStack: apply.task,
        },
      });
      const recruitTask = await this.recruitTaskRepository.findOne({
        where: {
          recruitPostId: apply.recruitPostId,
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
        // 이미 다 구함 에러처리 혹은 안 구하는 중
        throw myPageError.NotRecruitingError;
      }
      recruitStack.numberOfPeopleRequired++;
      recruitTask.numberOfPeopleRequired++;
      await this.recruitStackRepository.save(recruitStack);
      await this.recruitTaskRepository.save(recruitTask);
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
      await this.recruitTaskRepository.save(recruitTask);
    }
    apply.isAccepted = true;
    await this.recruitApplyRepository.save(apply);
    const notification = new CreateNotificationDto();
    notification.notificationReceiver = apply.applicant;
    notification.notificationSender = userId;
    notification.eventType = EventType.recruitApplyAccepted;
    notification.eventContent = '';
    notification.targetId = apply.recruitPostId;
    this.socketGateway.sendNotification(notification);

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
        .where('P.author = :loginId', { loginId })
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
      .andWhere('M.member = :userId', { userId })
      .orWhere('M.member = :receiver', { receiver })
      .andWhere('P.recruitPostId = :recruitPostId', { recruitPostId })
      .getOne();

    if (!post) {
      throw myPageError.UnableToRateError;
    }
    let isOk = false;
    for (const members of post.chatRooms.chatMembers) {
      isOk = members.member === receiver || isOk;
    }

    if (isOk) {
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
}
