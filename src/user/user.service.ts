import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/socialLogin/entity/Users';
import { Repository } from 'typeorm';
import * as AWS from 'aws-sdk';

@Injectable()
export class UserService {
  private readonly awsS3: AWS.S3;
  public readonly S3_BUCKET_NAME: string;
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Users) private readonly userRepository: Repository<Users>,
  ) {
    this.awsS3 = new AWS.S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION'),
    });
    this.S3_BUCKET_NAME = this.configService.get('AWS_S3_BUCKET_NAME');
  }
  async createUserProfile(
    folder: string,
    userId: string,
    file: Express.Multer.File,
    createUserProfileDto: CreateUserProfileDTO,
  ) {
    // 사진을 s3에 넣는 로직.. 먼저 DB profileImg 컬럼에 변수 key값을 넣는다.
    try {
      const key = `${folder}/${Date.now()}_${path.basename(
        file.originalname,
      )}`.replace(/ /g, '');
      if (key) {
        await this.userRepository
          .createQueryBuilder('user')
          .update(Users)
          .set({
            nickname: createUserProfileDto.nickname,
            portfolioUrl: createUserProfileDto.portfolioUrl,
            profileImgUrl: key,
            selfIntroduction: createUserProfileDto.selfIntroduction,
            technologyStack: createUserProfileDto.technologyStack,
          })
          .where('userId=:userId', { userId })
          .execute();
        await this.awsS3
          .putObject({
            Bucket: this.S3_BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ACL: 'public-read',
            ContentType: file.mimetype,
          })
          .promise();
      }
    } catch (e) {
      throw new BadRequestException(`File upload failed : ${e}`);
    }
  }

  // async upsertMyProfiles(profile: User, userId?: string) {
  //   await this.userRepository.upsert(profile, userId);
  // }

  // async readLovePosts(userId: string) {
  //   const getUser = await this.userRepository.createQueryBuilder('U');
  //   const lovePosts = getUser.leftJoinAndSelect(
  //     'U.informationLoves',
  //     'informationLoves',
  //   );

  //   const totalLovePosts = [];

  //   const informationPostIdOfLoves = getUser
  //     .select(['informationLoves.informationPostId'])
  //     .leftJoinAndSelect(
  //       'informationLoves.informationPosts',
  //       'informationPosts',
  //     )
  //     .where('user.userId=:userId', { userId })
  //     .getRawMany();

  //   for (const id in informationPostIdOfLoves) {
  //     totalLovePosts.push(
  //       lovePosts
  //         .select(['informationPosts.title', 'informationPosts.createdAt'])
  //         .where('informationPosts.informationPostId=:informationPostId', {
  //           informationPostId: id,
  //         }),
  //     );
  //   }
  //   return totalLovePosts;
  // }

  //킵 포스트
  async readKeepPosts(userId: string) {
    try {
      // 먼저 recruitKeeps 테이블의 recruitPostId를 뽑아낸다. 그리고 그 값들을 반복문을 통해 where문 조건값에 넣는다.
      const readMyKeepPosts = await this.userRepository
        .createQueryBuilder('U')
        .leftJoinAndSelect('U.recruitKeeps', 'K')
        .leftJoinAndSelect('K.recruitPosts', 'P')
        .where('U.userId=:userId', { userId })
        .getOne();

      return readMyKeepPosts;
    } catch (error) {
      throw new HttpException('요청에 실패했어요', 500);
    }
  }

  //프로필 + 내 점수 + 마지막 프로젝트 정보(이건 합쳐야 구현 가능)
  async readMyProfile(userId: string) {
    try {
      const myProfile = await this.userRepository
        .createQueryBuilder('U')
        .leftJoinAndSelect(
          'U.userReputations2',
          'RR',
          'R.userReputationReceiver = :userId',
          { userId },
        )
        .addSelect('SUM(RR.userReputationPoint)', 'SUM')
        .where('U.userId = :userId', { userId })
        .getRawOne();
      return myProfile;
    } catch (error) {
      return new HttpException('요청에 실패했어요', 500);
    }
  }

  //결과 확인 해보자
  async readMyRecruit(userId: string) {
    try {
      const myRecruitPosts = await this.userRepository
        .createQueryBuilder('U')
        .leftJoinAndSelect('U.recruitApplies', 'A', 'A.isAccepted = 1')
        .leftJoinAndSelect('A.recruitPost', 'P')
        .where('U.userId = :userId', { userId })
        .getOne();

      return myRecruitPosts;
    } catch (error) {
      return new HttpException('다시 요청해주세요', 500);
    }
  }
}
