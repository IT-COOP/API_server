import Faker from 'faker';
import { RecruitComments } from './../../recruit-post/entities/RecruitComments';
import { define } from 'typeorm-seeding';

define(RecruitComments, (faker: typeof Faker) => {
  const recruitComments = new RecruitComments();
  recruitComments.commentDepth = faker.datatype.number(1);
  recruitComments.commentGroup = faker.datatype.number(12);
  recruitComments.recruitCommentContent;
  return recruitComments;
});
