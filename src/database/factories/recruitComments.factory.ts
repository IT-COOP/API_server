import Faker from 'faker';
import { RecruitComments } from 'src/recruit-post/entities/RecruitComments';
import { define, factory } from 'typeorm-seeding';

define(RecruitComments, (faker: typeof Faker) => {
  const recruitComments = new RecruitComments();
  recruitComments.commentDepth = faker.datatype.number(5);
  recruitComments.commentGroup = faker.datatype.number(5);
  recruitComments.recruitCommentContent;
  return recruitComments;
});
