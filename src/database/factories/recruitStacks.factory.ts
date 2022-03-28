import Faker from 'faker';
import { RecruitStacks } from './../../recruit-post/entities/RecruitStacks';
import { define } from 'typeorm-seeding';

define(RecruitStacks, (faker: typeof Faker) => {
  const recruitStacks = new RecruitStacks();
  recruitStacks.numberOfPeopleSet = faker.datatype.number(4);
  recruitStacks.numberOfPeopleRequired = faker.datatype.number(4);
  recruitStacks.recruitStack = faker.random.arrayElement([300, 400]);
  return recruitStacks;
});
