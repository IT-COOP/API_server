import { RecruitStacks } from '../entities/RecruitStacks';
import { RecruitTasks } from '../entities/RecruitTasks';

export class ResDetailPostDTO {
  public recruitPostId: number;
  public userId: string;
  public nickname: string;
  public userProfileImgUrl: string;
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
  public applyId: number;
  public keepId: number;
  public recruitComments: object[];
  public recruitTasks: RecruitTasks[];
  public recruitStacks: RecruitStacks[];
}
