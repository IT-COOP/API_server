import { RecruitApplies } from './../recruit-post/entities/RecruitApplies';
import { RecruitPosts } from './../recruit-post/entities/RecruitPosts';
import { RecruitKeeps } from './../recruit-post/entities/RecruitKeeps';
import { UpdateUserProfileDTO } from './dto/updateUserProfile.dto';
import {
  BadRequestException,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/socialLogin/entity/Users';
import { Repository } from 'typeorm';
import { UserReputation } from './entities/UserReputation';
import { RateUserDto } from './dto/rateUser.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(UserReputation)
    private readonly userReputationRepository: Repository<UserReputation>,
    @InjectRepository(RecruitKeeps)
    private readonly recruitKeepRepository: Repository<RecruitKeeps>,
    @InjectRepository(RecruitPosts)
    private readonly recruitPostRepository: Repository<RecruitPosts>,
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

    profile.technologyStack.split(',').map((each) => parseInt(each));
    return { profile };
  }

  // 다른 프로필 보기
  async getOthersProfile(id: string, userId: string) {
    const profile = await this.userRepository.findOne({
      where: { userId: id },
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
      throw new BadRequestException('There Is No Such User');
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
    });
    for (const each in updateUserProfileDTO) {
      profile[each] = updateUserProfileDTO[each];
    }
    const result = await this.userRepository.save(profile);
    return { result };
  }

  // 내가 keep한 게시물
  async getMyKeeps(userId: string) {
    const posts = await this.recruitKeepRepository
      .createQueryBuilder('K')
      .leftJoinAndSelect('K.recruitPost', 'P')
      .leftJoinAndSelect('P.recruitStacks', 'S')
      .leftJoinAndSelect('P.recruitTasks', 'T')
      .leftJoin('P.recruitComments', 'C')
      .addSelect('C.recruitCommentId')
      .where('K.userId = :userId', { userId })
      .orderBy('P.recruitPostId', 'DESC')
      .getMany();
    return { posts };
  }

  // 내가 love한 게시물
  async getMyLoves(userId: string) {
    throw new HttpException('Not Implemented Yet', HttpStatus.NOT_IMPLEMENTED);
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

  // 모집 중인 프로젝트 - 신청자 목록
  async getMyRecruitingProject(userId: string) {
    const posts = await this.recruitPostRepository
      .createQueryBuilder('P')
      .leftJoinAndSelect('P.recruitApplies', 'A')
      .leftJoin('P.author2', 'U')
      .leftJoin('P.recruitComments', 'C')
      .addSelect(['U.nickname', 'U.profileImgUrl'])
      .addSelect('C.recruitCommentId')
      .where('P.author = :userId', { userId })
      .andWhere('P.endAt = P.createdAt')
      .getMany();
    return { posts };
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
      throw new BadRequestException("You Can't Rate A User Twice");
    }

    const post = await this.recruitPostRepository
      .createQueryBuilder('P')
      .leftJoinAndSelect('P.chatRooms', 'C')
      .leftJoinAndSelect('C.chatMembers', 'M')
      .leftJoin('P.author2', 'U')
      .addSelect(['U.nickname', 'U.profileImgUrl'])
      .where('P.endAt != P.createdAt')
      .andWhere('P.endAt < :now', { now: new Date() })
      .andWhere('M.member = :userId', { userId })
      .andWhere('P.recruitPostId = :recruitPostId', { recruitPostId })
      .getOne();

    if (!post) {
      throw new BadRequestException("You Can't Rate The User");
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

    throw new BadRequestException("You Can't Rate The User");
  }

  async getOthersRecruitingProject(userId, anotherUserId) {
    const posts = await this.recruitPostRepository
      .createQueryBuilder('P')
      .leftJoin('P.author2', 'U')
      .leftJoin('P.recruitComments', 'C')
      .addSelect(['U.nickname', 'U.profileImgUrl'])
      .addSelect('C.recruitCommentId')
      .where('P.author = :anotherUserId', { anotherUserId })
      .andWhere('P.endAt = P.createdAt')
      .getMany();
    return { posts };
  }

  // 다른 사람 진행 중인 프로젝트
  async getOthersRunningProject(userId: string, anotherUserId: string) {
    const posts = await this.recruitPostRepository
      .createQueryBuilder('P')
      .leftJoinAndSelect('P.chatRooms', 'C')
      .leftJoinAndSelect('C.chatMembers', 'M')
      .leftJoin('P.author2', 'U')
      .addSelect(['U.nickname', 'U.profileImgUrl'])
      .andWhere('P.endAt > :now', { now: new Date() })
      .andWhere('M.member = :anotherUserId', { anotherUserId })
      .getMany();

    return { posts };
  }

  // 다른 사람 완료한 프로젝트
  async getOthersOverProject(userId: string, anotherUserId: string) {
    const posts = await this.recruitPostRepository
      .createQueryBuilder('P')
      .leftJoinAndSelect('P.chatRooms', 'C')
      .leftJoinAndSelect('C.chatMembers', 'M')
      .leftJoin('P.author2', 'U')
      .addSelect(['U.nickname', 'U.profileImgUrl'])
      .where('P.endAt != P.createdAt')
      .andWhere('P.endAt < :now', { now: new Date() })
      .andWhere('M.member = :anotherUserId', { anotherUserId })
      .getMany();
    return { posts };
  }

  // 다른 사람 완료한 프로젝트 갯수 보기
  async getOthersLevel(userId: string, anotherUserId: string) {
    const level = await this.recruitPostRepository
      .createQueryBuilder('P')
      .leftJoinAndSelect('P.chatRooms', 'C')
      .leftJoinAndSelect('C.chatMembers', 'M')
      .leftJoin('P.author2', 'U')
      .addSelect(['U.nickname', 'U.profileImgUrl'])
      .where('P.endAt != P.createdAt')
      .andWhere('P.endAt < :now', { now: new Date() })
      .andWhere('M.member = :anotherUserId', { anotherUserId })
      .getCount();
    return { level };
  }
}
//  // async createUserProfile(
//  //   folder: string,
//  //   userId: string,
//  //   file: Express.Multer.File,
//  //   createUserProfileDto: CreateUserProfileDTO,
//  // ) {
//  //   // 사진을 s3에 넣는 로직.. 먼저 DB profileImg 컬럼에 변수 key값을 넣는다.
//  //   try {
//  //     const key = `${folder}/${Date.now()}_${path.basename(
//  //       file.originalname,
//  //     )}`.replace(/ /g, '');
//  //     if (key) {
//  //       await this.userRepository
//  //         .createQueryBuilder('user')
//  //         .update(Users)
//  //         .set({
//  //           nickname: createUserProfileDto.nickname,
//  //           portfolioUrl: createUserProfileDto.portfolioUrl,
//  //           profileImgUrl: key,
//  //           selfIntroduction: createUserProfileDto.selfIntroduction,
//  //           technologyStack: createUserProfileDto.technologyStack,
//  //         })
//  //         .where('userId=:userId', { userId })
//  //         .execute();
//  //       await this.awsS3
//  //         .putObject({
//  //           Bucket: this.S3_BUCKET_NAME,
//  //           Key: key,
//  //           Body: file.buffer,
//  //           ACL: 'public-read',
//  //           ContentType: file.mimetype,
//  //         })
//  //         .promise();
//  //     }
//  //   } catch (e) {
//  //     throw new BadRequestException(`File upload failed : ${e}`);
//  //   }
//  // }
//
//  // async upsertMyProfiles(profile: User, userId?: string) {
//  //   await this.userRepository.upsert(profile, userId);
//  // }
//
//  // async readLovePosts(userId: string) {
//  //   const getUser = await this.userRepository.createQueryBuilder('U');
//  //   const lovePosts = getUser.leftJoinAndSelect(
//  //     'U.informationLoves',
//  //     'informationLoves',
//  //   );
//
//  //   const totalLovePosts = [];
//
//  //   const informationPostIdOfLoves = getUser
//  //     .select(['informationLoves.informationPostId'])
//  //     .leftJoinAndSelect(
//  //       'informationLoves.informationPosts',
//  //       'informationPosts',
//  //     )
//  //     .where('user.userId=:userId', { userId })
//  //     .getRawMany();
//
//  //   for (const id in informationPostIdOfLoves) {
//  //     totalLovePosts.push(
//  //       lovePosts
//  //         .select(['informationPosts.title', 'informationPosts.createdAt'])
//  //         .where('informationPosts.informationPostId=:informationPostId', {
//  //           informationPostId: id,
//  //         }),
//  //     );
//  //   }
//  //   return totalLovePosts;
//  // }
//
//  //킵 포스트
//  async readKeepPosts(userId: string) {
//    console.log('킵 포스트 서비스 도착');
//    // 먼저 recruitKeeps 테이블의 recruitPostId를 뽑아낸다. 그리고 그 값들을 반복문을 통해 where문 조건값에 넣는다.
//    const readMyKeepPosts = await this.userRepository
//      .createQueryBuilder('U')
//      .leftJoinAndSelect('U.recruitKeeps', 'K')
//      .leftJoinAndSelect('K.recruitPosts', 'P')
//      .where('U.userId=:userId', { userId })
//      .getOne();
//
//    return readMyKeepPosts;
//  }
//
//  //프로필 + 내 점수
//  async readMyProfile(userId: string) {
//    console.log('내 프로필 서비스 도착');
//    const profile = await this.userRepository.find({
//      where: {
//        userId,
//      },
//  select: [
//    'userId',
//    'nickname',
//    'profileImgUrl',
//    'technologyStack',
//    'activityPoint',
//    'selfIntroduction',
//    'portfolioUrl',
//  ],
//      relations: ['userReputations2'],
//    });
//    let ave = 0;
//    for (const prop in profile[0].userReputations2) {
//      ave += +profile[0].userReputations2[prop].userReputationPoint;
//    }
//    ave /= profile[0].userReputations2.length;
//    return { profile: profile[0], userReputationPoint: ave };
//  }
//
//  // 결과 확인 해보자
//  async readMyRecruit(userId: string) {
//    console.log('내 협업 서비스 도착');
//    const myRecruitPosts = await this.userRepository
//      .createQueryBuilder('U')
//      .leftJoinAndSelect('U.recruitApplies', 'A', 'A.isAccepted = 1')
//      .leftJoinAndSelect('A.recruitPost', 'P')
//      .where('U.userId = :userId', { userId })
//      .getOne();
//
//    return myRecruitPosts;
//  }
//
//  //업데이트 프로필
//  async updateMyProfile(
//    userId: string,
//    updateUserProfileDTO: UpdateUserProfileDTO,
//  ) {
//    console.log('업데이트 프로필 서비스 도착');
//    const result = await this.userRepository
//      .createQueryBuilder('U')
//      .update()
//      .set(updateUserProfileDTO)
//      .where('U.userId = :userId', { userId })
//      .execute();
//
//    if (!result.affected) {
//      throw new BadRequestException('Profile Update Failure');
//    }
//    return { success: true };
//  }
//
//  // 다른놈 프로필 훔쳐보기
//  async getAnotherUserProfile(anotherUserId) {
//    console.log('다른 사람 프로필 서비스 도착');
//    console.log(anotherUserId);
//    // const profile = await this.userRepository
//    //   .createQueryBuilder('U')
//    //   .leftJoinAndSelect('U.userReputations2', 'RR')
//    //   .addSelect('AVG(RR.userReputationPoint)', 'AVG')
//    //   .addSelect([
//    //     'U.nickname',
//    //     'U.profileImgUrl',
//    //     'U.technologyStack',
//    //     'U.activityPoint',
//    //     'U.selfIntroduction',
//    //     'U.portfolioUrl',
//    //   ])
//    //   .where('U.userId = :anotherUserId', { anotherUserId })
//    //   .getRawOne();
//
//    const profile = await this.userRepository.find({
//      where: {
//        userId: anotherUserId,
//      },
//      select: [
//        'userId',
//        'nickname',
//        'profileImgUrl',
//        'technologyStack',
//        'activityPoint',
//        'selfIntroduction',
//        'portfolioUrl',
//      ],
//      relations: ['userReputations2'],
//    });
//    let ave = 0;
//    for (const prop in profile[0].userReputations2) {
//      ave += +profile[0].userReputations2[prop].userReputationPoint;
//    }
//    ave /= profile[0].userReputations2.length;
//    return { profile: profile[0], userReputationPoint: ave };
//  }
