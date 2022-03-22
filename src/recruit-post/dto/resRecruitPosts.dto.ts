import { RecruitStacks } from '../entities/RecruitStacks';
import { RecruitTasks } from '../entities/RecruitTasks';

export class ResRecruitPostsDTO {
  public recruitPostId: number;
  public author: string;
  public thumbImgUrl: string;
  public title: string;
  public recruitContent: string;
  public viewCount: number;
  public recruitLocation: number;
  public recruitKeepCount: number;
  public recruitCommentCount: number;
  public recruitDurationWeeks: number;
  public endAt: string;
  public createdAt: string;
  public isKeeps: boolean;
  public recruitTasks: RecruitTasks[];
  public recruitStacks: RecruitStacks[];
}
