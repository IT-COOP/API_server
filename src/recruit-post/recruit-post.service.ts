import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/socialLogin/entity/Users';
import { Connection, Repository } from 'typeorm';
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

  async ReadAllRecruits(
    loginId: string, // 사용자가 좋아요 한 게시물을 위한
    sort: number, //정렬을 위한 0 = 최신순 정렬 , 1 = 킵잇 순 정렬
    items: number, // 받아올 게시물 갯수
    location: number | null, // 장소 필터링
    task: number | null, // 직군 필터링
    stack: number[] | null, //직무 필터링 직군과 동시에 있으면 직무 우선 or 가능
    lastId: number | null, // 커서 기반 페이지네이션을 위함
  ) {
    try {
      const cursorPost: RecruitPosts = !lastId
        ? null
        : await this.recruitPostsRepository.findOne(lastId);

      //쿼리 빌더 시작

      const recruitQuery = await this.recruitPostsRepository
        .createQueryBuilder('P')
        .leftJoinAndSelect('P.recruitKeeps', 'K')
        .leftJoin('P.recruitTasks', 'T')
        .leftJoin('P.recruitStacks', 'S')
        .leftJoin('P.recruitPostImages', 'I')
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
        .where('K.userId = :id', {
          id: 'loginId',
        });

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

      const cursorKeepCount = cursorPost.recruitKeepCount;
      const cursorPostId = cursorPost.recruitPostId;
      // 페이지네이션
      let paginationQuery = filterQuery;
      if (cursorPost && sort === 0) {
        paginationQuery = paginationQuery
          .andWhere('P.recruitKeepCount >= :cursorKeepCount', {
            cursorKeepCount,
          })
          .andWhere('P.recruitPostId <:cursorPostId', { cursorPostId });
      }
      if (cursorPost && sort === 1) {
        paginationQuery = paginationQuery.andWhere(
          'P.recruitPostId <:cursorPostId',
          { cursorPostId },
        );
      }

      // 0 최신순 1 keepIt 순
      let sortQuery = paginationQuery;
      if (sort === 0) {
        sortQuery = paginationQuery.orderBy('P.recruitPostId', 'DESC');
      } else if (sort === 1) {
        sortQuery = sortQuery
          .orderBy('P.recruitKeepCount', 'DESC')
          .addOrderBy('P.recruitPostId', 'DESC');
      }

      const endQuery = sortQuery.take(items).getMany();
      return endQuery;
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
      const recruitPost = await this.recruitPostsRepository
        .createQueryBuilder('P')
        .leftJoinAndSelect('P.recruitStacks', 'S')
        .leftJoinAndSelect('P.recruitTasks', 'T')
        .leftJoinAndSelect('P.recruitPostImages', 'I')
        .leftJoinAndSelect('P.recruitComments', 'C')
        .leftJoin('C.user', 'U')
        .addSelect(['U.nickname', 'U.activityPoint', 'U.userId'])
        .andWhere('P.recruitPostId = :id', { id: recruitPostId })
        .orderBy('C.commentGroup', 'ASC')
        .addOrderBy('C.recruitCommentId', 'DESC')
        .getOne();
      recruitPost.viewCount = recruitPost.viewCount + 1;
      await this.recruitPostsRepository.save(recruitPost);

      return recruitPost;
    } catch {
      throw new HttpException('다시 시도해주세요', 500);
    }
  }

  //마무리
  async createRecruit(
    recruitPost: RecruitPosts,
    imgUrls: string[],
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

  async createComment(recruitPostId: number, comment: object) {
    try {
      const post: RecruitPosts = await this.recruitPostsRepository.findOne(
        recruitPostId,
      );
      post.recruitCommentCount = post.recruitCommentCount + 1;
      await Promise.all([
        this.recruitCommentsRepository.save(comment),
        this.recruitPostsRepository.save(post),
      ]);
    } catch (error) {
      throw new HttpException('다시 시도해주세요', 500);
    }
  }

  async createKeepIt(keepIt: RecruitKeeps) {
    try {
      const returned = await this.recruitKeepsRepository
        .createQueryBuilder('K')
        .leftJoinAndSelect('K.recruitPost', 'P')
        .getOne();
      if (returned) throw new HttpException('이미 킵잇되있어용~', 400);

      const post: RecruitPosts = returned.recruitPost;
      post.recruitKeepCount++;
      await Promise.all([
        this.recruitKeepsRepository
          .createQueryBuilder('K')
          .insert()
          .into('K')
          .values(keepIt)
          .execute(),
        this.recruitPostsRepository
          .createQueryBuilder('P')
          .insert()
          .into('P')
          .values(post)
          .execute(),
      ]);
    } catch (error) {
      throw new HttpException('다시 시도해주세요', 500);
    }
  }

  async createApply(apply: object) {
    try {
      await this.recruitAppliesRepository.save(apply);
    } catch (error) {
      throw new HttpException('다시 시도해주세요', 500);
    }
  }

  async updateRecruitPost(
    recruitPost: RecruitPosts,
    recruitPostImages: string[],
    recruitStacks: RecruitStacks[],
    recruitTasks: RecruitTasks[],
  ) {
    recruitPost;
    recruitPostImages;
    recruitStacks;
    recruitTasks;
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.commitTransaction();
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateComment(commentId: number, comment: object) {
    try {
      await this.recruitCommentsRepository.update(commentId, comment);
    } catch (error) {
      throw new HttpException('다시 시도해주세요', 500);
    }
  }

  //로직 변경
  async deleteComment(recruitPostId: number, commentId: number) {
    /*
    1, KeepIt post와 조인해 가지고 delete할 apply가 있는지 확인 
    2, 있으면 지우고 없으면 error를 띄움 post에 comment 카운트를 낮추고 저장
    */
    try {
      const returnedComments = await this.recruitCommentsRepository
        .createQueryBuilder('C')
        .where('commentId = :commentId', { commentId })
        .getOne();

      if (!returnedComments.recruitCommentId) {
        throw new HttpException('지울 데이터가 없어요', 400);
      }
      if (returnedComments.commentDepth === 1) {
        await this.recruitCommentsRepository.delete(returnedComments);
        return;
      }

      if (returnedComments) {
        await Promise.all([
          this.recruitCommentsRepository
            .createQueryBuilder()
            .update(RecruitComments)
            .set({ recruitCommentContent: null })
            .where('recruitCommentId = :commentId', { commentId })
            .execute(),
          this.recruitPostsRepository
            .createQueryBuilder()
            .update()
            .set({ recruitKeepCount: () => 'recruitKeepCount - 1' })
            .where('P.recruitPostId = :recruitPostId', { recruitPostId })
            .execute(),
        ]);
        return;
      }
    } catch (error) {
      throw new HttpException('다시 시도해주세요', 500);
    }
  }

  //마무리
  async deleteKeepIt(recruitPostId: number, recruitKeepId: number) {
    /*
    1, KeepIt post와 조인해 가지고 delete할 apply가 있는지 확인 
    2, 있으면 지우고 없으면 error를 띄움 apply 카운트를 낮추고 저장
    age: () => "age + 1"
    */
    try {
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
      await Promise.all([
        this.recruitKeepsRepository.delete(recruitKeepId),
        this.recruitPostsRepository
          .createQueryBuilder()
          .update()
          .set({ recruitKeepCount: () => 'recruitKeepCount - 1' })
          .where('P.recruitPostId = :recruitPostId', { recruitPostId })
          .execute(),
      ]);
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
      const isExist: RecruitApplies = await this.recruitAppliesRepository
        .createQueryBuilder('A')
        .where('A.applyId = :applyId', { applyId })
        .getOne();

      if (!isExist.recruitApplyId) {
        throw new HttpException('지울 데이터가 없어요', 400);
        return;
      }
      if (isExist.recruitPostId != recruitPostId) {
        throw new HttpException('잘못된 요청입니다.', 400);
        return;
      }
      await this.recruitKeepsRepository.delete(applyId);
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
