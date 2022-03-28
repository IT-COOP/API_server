import Faker from 'faker';
import { RecruitApplies } from './../../recruit-post/entities/RecruitApplies';
import { RecruitComments } from './../../recruit-post/entities/RecruitComments';
import { RecruitKeeps } from './../../recruit-post/entities/RecruitKeeps';
import { RecruitPosts } from './../../recruit-post/entities/RecruitPosts';
import { RecruitStacks } from './../../recruit-post/entities/RecruitStacks';
import { RecruitTasks } from './../../recruit-post/entities/RecruitTasks';
import { Users } from './../../socialLogin/entity/Users';
import { define, factory } from 'typeorm-seeding';

define(RecruitPosts, (faker: typeof Faker) => {
  const recruitPosts = new RecruitPosts();
  recruitPosts.title = faker.lorem.word();
  recruitPosts.author = faker.name.firstName();
  recruitPosts.recruitContent = faker.lorem.text();
  recruitPosts.recruitKeepCount = 0;
  recruitPosts.recruitCommentCount = 0;
  recruitPosts.recruitLocation = faker.random.arrayElement([
    101, 102, 103, 104, 105, 106, 107, 108, 109,
  ]);
  recruitPosts.viewCount = 0;
  recruitPosts.recruitDurationDays = faker.random.arrayElement([
    7, 14, 21, 28, 35, 42,
  ]);
  recruitPosts.recruitApplies = factory(RecruitApplies)() as any;
  recruitPosts.recruitStacks = factory(RecruitStacks)() as any;
  recruitPosts.recruitTasks = factory(RecruitTasks)() as any;
  recruitPosts.recruitKeeps = factory(RecruitKeeps)() as any;
  recruitPosts.recruitComments = factory(RecruitComments)() as any;
  recruitPosts.author2 = factory(Users)() as any;
  return recruitPosts;
});
