import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/socialLogin/entity/Users';
import { Repository } from 'typeorm';
import { CreateUserProfileDTO } from './dto/createUserProfile.dto';
import { UserReputation } from './entities/UserReputation';
import * as AWS from 'aws-sdk';
import path from 'path';
@Injectable()
export class UserService {
  private readonly awsS3: AWS.S3;
  public readonly S3_BUCKET_NAME: string;
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Users) private readonly userRepository: Repository<Users>,
    @InjectRepository(UserReputation)
    private readonly userReputation: Repository<UserReputation>,
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

  async getLovePosts(userId: string) {
    const getUser = await this.userRepository.createQueryBuilder('user');
    const lovePosts = getUser.leftJoinAndSelect(
      'user.informationLoves',
      'informationLoves',
    );

    const totalLovePosts = [];

    const informationPostIdOfLoves = getUser
      .select(['informationLoves.informationPostId'])
      .leftJoinAndSelect(
        'informationLoves.informationPosts',
        'informationPosts',
      )
      .where('user.userId=:userId', { userId })
      .getRawMany();

    for (const id in informationPostIdOfLoves) {
      totalLovePosts.push(
        lovePosts
          .select(['informationPosts.title', 'informationPosts.createdAt'])
          .where('informationPosts.informationPostId=:informationPostId', {
            inforationPostId: id,
          }),
      );
    }
    return totalLovePosts;
  }

  async getKeepPosts(userId: string) {
    // 먼저 recruitKeeps 테이블의 recruitPostId를 뽑아낸다. 그리고 그 값들을 반복문을 통해 where문 조건값에 넣는다.
    const getUser = await this.userRepository.createQueryBuilder('user');
    const keepPosts = getUser.leftJoinAndSelect(
      'user.recruitKeeps',
      'recruitKeeps',
    );
    const totalKeepPosts = [];

    const recruitPostIdOfKeeps = getUser
      .select(['recruitKeep.recruitPostId'])
      .leftJoinAndSelect('recruitKeeps.recruitPosts', 'recruitPosts')
      .where('user.userId=:userId', { userId })
      .getRawMany();

    for (const id in recruitPostIdOfKeeps) {
      totalKeepPosts.push(
        keepPosts
          .select(['recruitPosts.title', 'recruitPosts.createdAt'])
          .where('recruitPosts.recruitPostId=:recruitPostId', {
            recruitPostId: id,
          }),
      );
    }

    return totalKeepPosts;
  }

  async getMyProfile(userId: string) {}
}
