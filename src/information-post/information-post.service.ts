import { UpdateInformationCommentDto } from './dto/update-information-comment.dto';
import { InformationPosts } from './entities/InformationPosts';
import { InformationPostImages } from './entities/InformationPostImages';
import { InformationLoves } from './entities/InformationLoves';
import { InformationKeeps } from './entities/InformationKeeps';
import { InformationComments } from './entities/InformationComments';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateInformationPostDto } from './dto/create-information-post.dto';
import { UpdateInformationPostDto } from './dto/update-information-post.dto';
import { CreateInformationCommentDto } from './dto/create-information-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class InformationPostService {
  constructor(
    @InjectRepository(InformationComments)
    private readonly informationCommentsRepository: Repository<InformationComments>,
    @InjectRepository(InformationKeeps)
    private readonly informationKeepsRepository: Repository<InformationKeeps>,
    @InjectRepository(InformationLoves)
    private readonly informationLovesRepository: Repository<InformationLoves>,
    @InjectRepository(InformationPostImages)
    private readonly informationPostImagesRepository: Repository<InformationPostImages>,
    @InjectRepository(InformationPosts)
    private readonly informationPostsRepository: Repository<InformationPosts>,
  ) {}
  async getAllPostsInTime(userId: string, type: number) {
    let posts: InformationPosts[];
    if (type !== 0) {
      posts = await this.informationPostsRepository.find({
        where: { type },
        relations: [
          'InformationKeeps',
          'InformationLoves',
          'InformationPostImages',
          'InformationComments',
        ],
        order: { informationPostId: 'DESC' },
      });
    } else {
      posts = await this.informationPostsRepository.find({
        where: { type },
        relations: [
          'InformationKeeps',
          'InformationLoves',
          'InformationPostImages',
          'InformationComments',
        ],
        order: { informationPostId: 'DESC' },
      });
    }
    return { posts };
  }

  async getAllPostsInBookmark(userId: string, type: number) {
    let posts: InformationPosts[];
    if (type !== 0) {
      posts = await this.informationPostsRepository.find({
        where: { type },
        relations: [
          'InformationKeeps',
          'InformationLoves',
          'InformationPostImages',
          'InformationComments',
        ],
        order: { informationKeepCount: 'DESC' },
      });
    } else {
      posts = await this.informationPostsRepository.find({
        relations: [
          'InformationKeeps',
          'InformationLoves',
          'InformationPostImages',
          'InformationComments',
        ],
        order: { informationKeepCount: 'DESC' },
      });
    }

    return { posts };
  }

  async getAllPostsInLike(userId: string, type: number) {
    let posts: InformationPosts[];
    if (type !== 0) {
      posts = await this.informationPostsRepository.find({
        where: { type, informationPostId: 'Less' },
        relations: [
          'InformationKeeps',
          'InformationLoves',
          'InformationPostImages',
          'InformationComments',
        ],
        order: { informationLoveCount: 'DESC' },
        take: 30,
      });
    } else {
      posts = await this.informationPostsRepository.find({
        where: { type },
        relations: [
          'InformationKeeps',
          'InformationLoves',
          'InformationPostImages',
          'InformationComments',
        ],
        order: { informationLoveCount: 'DESC' },
      });
    }
    return { posts };
  }

  async getOnePost(userId: string, informationPostId: number) {
    const post = await this.informationPostsRepository.findOne({
      where: { informationPostId },
      relations: [
        'InformationKeeps',
        'InformationLoves',
        'InformationPostImages',
        'InformationComments',
      ],
    });
    const informationPostComments =
      await this.informationCommentsRepository.find({
        where: { informationPostId },
        relations: ['Users'],
      });
    return { post, informationPostComments };
  }

  async putPost(
    userId: string,
    informationPostId: number,
    updateInformationPostDto: UpdateInformationPostDto,
  ) {
    // 이미지가 들어올 경우를 고려해야 함.
    const post = await this.informationPostsRepository.findOne({
      where: {
        informationPostId,
        author: userId,
      },
    });

    if (!post) {
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }

    for (const each in updateInformationPostDto) {
      post[each] = updateInformationPostDto[each];
    }

    const updatedPost = await this.informationPostsRepository.save(post);

    return { post: updatedPost };
  }

  async deletePost(userId: string, informationPostId: number) {
    const post = await this.informationPostsRepository.findOne({
      where: { informationPostId, author: userId },
    });
    if (!post) {
      throw new HttpException('Delete Post Error', HttpStatus.BAD_REQUEST);
    } else if (post.author !== userId) {
      throw new HttpException('Delete Post Error', HttpStatus.UNAUTHORIZED);
    }
    const result = await this.informationPostsRepository
      .createQueryBuilder()
      .where('author = :userId', { userId })
      .andWhere('InformationPostId = :InformationPostId', {
        informationPostId,
      })
      .delete()
      .execute();

    return result;
  }

  async createInformationPost(
    userId: string,
    createInformationPostDto: CreateInformationPostDto,
  ) {
    let result: InformationPosts;
    const post = this.informationPostsRepository.create({
      title: createInformationPostDto.title,
      informationContent: createInformationPostDto.informationContent,
      author: userId,
    });

    try {
      result = await this.informationPostsRepository.save(post);
    } catch (err) {
      throw new HttpException(
        `Post Upload Error, error:${err.name}, description:${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const values: any = [];

    for (const idx in createInformationPostDto.ImgUrl) {
      values.push({
        informationPostId: result.informationPostId,
        imgUrl: createInformationPostDto.ImgUrl[idx],
      });
    }

    await this.informationPostImagesRepository.save(values);

    return { post };
  }

  async postComment(
    userId: string,
    informationPostId: number,
    createInformationCommentDto: CreateInformationCommentDto,
  ) {
    const result = await this.informationCommentsRepository
      .createQueryBuilder()
      .insert()
      .values({
        userId,
        informationPostId,
        commentDepth: createInformationCommentDto.commentDepth,
        commentGroup: createInformationCommentDto.commentGroup,
        informationCommentContent:
          createInformationCommentDto.informationCommentContent,
      })
      .execute();
    return result;
  }

  async putComment(
    userId: string,
    informationPostId: number,
    informationCommentId: number,
    updateInformationCommentDto: UpdateInformationCommentDto,
  ) {
    const comment = await this.informationCommentsRepository.findOne({
      where: {
        informationCommentId,
      },
    });

    if (!comment) {
      throw new HttpException(
        'Put Comment Error No Such Comment',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (comment.userId !== userId) {
      throw new HttpException(
        'Put Comment Error Unauthorized',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const mySet = {};
    for (const property in updateInformationCommentDto) {
      mySet[property] = updateInformationCommentDto[property];
    }

    const result = this.informationCommentsRepository
      .createQueryBuilder()
      .where('informationCommentId = :informationCommentId', {
        informationCommentId,
      })
      .update()
      .set(mySet)
      .execute();
    return result;
  }

  async deleteComment(
    userId: string,
    informationPostId: number,
    informationCommentId: number,
  ) {
    const comment = await this.informationCommentsRepository.findOne({
      where: { informationCommentId },
    });
    if (!comment) {
      throw new HttpException('Delete Comment Error', HttpStatus.BAD_REQUEST);
    } else if (comment.userId !== userId) {
      throw new HttpException('Delete Comment Error', HttpStatus.UNAUTHORIZED);
    }
    const result = await this.informationCommentsRepository
      .createQueryBuilder()
      .select('informationComments')
      .where('InformationCommentId = :InformationCommentId', {
        informationCommentId,
      })
      .delete()
      .execute();

    return result;
  }

  async postKeepIt(userId: string, informationPostId: number) {
    const check = await this.informationKeepsRepository.findOne({
      where: {
        informationPostId,
        userId,
      },
    });
    if (check) {
      throw new HttpException(
        `Post KeepIt Error Already Kept The Post`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const novelKeep = this.informationKeepsRepository.create();
    novelKeep.informationPostId = informationPostId;
    novelKeep.userId = userId;
    const result = await this.informationKeepsRepository.save(novelKeep);

    return result;
  }

  async deleteKeepIt(userId: string, informationPostId: number) {
    const check = await this.informationKeepsRepository.findOne({
      where: {
        informationPostId,
        userId,
      },
    });
    if (!check) {
      throw new HttpException(
        `Post KeepIt Error Must KeepIt first`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const result = await this.informationKeepsRepository
      .createQueryBuilder()
      .where('informationKeepId = :informationKeepId', {
        informationKeepId: check.informationKeepId,
      })
      .delete()
      .execute();

    const post = await this.informationPostsRepository.findOne({
      where: { informationPostId },
    });
    post.informationKeepCount--;
    await this.informationPostsRepository.save(post);

    return result;
  }

  async postLoveIt(userId: string, informationPostId: number) {
    const check = await this.informationLovesRepository.findOne({
      where: {
        informationPostId,
        userId,
      },
    });
    if (check) {
      throw new HttpException(
        `Post LoveIt Error Already Loved The Post`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const novelLove = await this.informationLovesRepository.create();
    novelLove.informationPostId = informationPostId;
    novelLove.userId = userId;
    await this.informationLovesRepository.save(novelLove);

    const post = await this.informationPostsRepository.findOne({
      where: { informationPostId },
    });
    post.informationLoveCount--;
    await this.informationCommentsRepository.save(post);
    return post;
  }

  async deleteLoveIt(userId: string, informationPostId: number) {
    const check = await this.informationLovesRepository.findOne({
      where: {
        userId,
        informationPostId,
      },
    });

    if (!check) {
      throw new HttpException(
        `Post LoveIt Error Must LoveIt First`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.informationLovesRepository
      .createQueryBuilder()
      .where('informationLoveId = :informationLoveId', {
        informationLoveId: check.informationLoveId,
      })
      .delete()
      .execute();
    const post = await this.informationPostsRepository.findOne({
      where: { informationPostId: check.informationPostId },
    });
    post.informationLoveCount--;
    await this.informationPostsRepository.save(post);

    return result;
  }

  parseInt(postId: string) {
    const numberId = parseInt(postId);
    if (isNaN(numberId)) {
      throw new HttpException('Wrong Number', HttpStatus.BAD_REQUEST);
    }
    return numberId;
  }
}
