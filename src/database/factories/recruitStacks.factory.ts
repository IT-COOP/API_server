import Faker from 'faker';
import { RecruitStacks } from 'src/recruit-post/entities/RecruitStacks';
import { define } from 'typeorm-seeding';

define(RecruitStacks, (faker: typeof Faker) => {
  const recruitStacks = new RecruitStacks();
  recruitStacks.numberOfPeopleSet = faker.datatype.number(5);
  recruitStacks.numberOfPeopleRequired = faker.datatype.number(5);
  recruitStacks.recruitStack = faker.random.arrayElement([300, 400]);
  return recruitStacks;
});
