import Faker from 'faker';
import { RecruitApplies } from 'src/recruit-post/entities/RecruitApplies';
import { RecruitComments } from 'src/recruit-post/entities/RecruitComments';
import { RecruitKeeps } from 'src/recruit-post/entities/RecruitKeeps';
import { RecruitPosts } from 'src/recruit-post/entities/RecruitPosts';
import { RecruitStacks } from 'src/recruit-post/entities/RecruitStacks';
import { RecruitTasks } from 'src/recruit-post/entities/RecruitTasks';
import { Users } from 'src/socialLogin/entity/Users';
import { define, factory } from 'typeorm-seeding';

define(RecruitPosts, (faker: typeof Faker) => {
  const recruitPosts = new RecruitPosts();
  recruitPosts.title = faker.lorem.word();
  recruitPosts.author = faker.name.firstName();
  recruitPosts.recruitContent = faker.lorem.text();
  recruitPosts.recruitKeepCount = 0;
  recruitPosts.recruitCommentCount = 0;
  recruitPosts.recruitLocation = faker.random.arrayElement([
    100, 200, 300, 400,
  ]);
  recruitPosts.viewCount = 0;
  recruitPosts.recruitDurationDays = faker.random.arrayElement([7, 14, 21, 28]);
  recruitPosts.recruitApplies = factory(RecruitApplies)() as any;
  recruitPosts.recruitStacks = factory(RecruitStacks)() as any;
  recruitPosts.recruitTasks = factory(RecruitTasks)() as any;
  recruitPosts.recruitKeeps = factory(RecruitKeeps)() as any;
  recruitPosts.recruitComments = factory(RecruitComments)() as any;
  recruitPosts.author2 = factory(Users)() as any;
  return recruitPosts;
});
