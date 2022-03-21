import Faker from 'faker';
import { RecruitTasks } from './../../recruit-post/entities/RecruitTasks';
import { define } from 'typeorm-seeding';

define(RecruitTasks, (faker: typeof Faker) => {
  const recruitTasks = new RecruitTasks();
  recruitTasks.numberOfPeopleSet = faker.datatype.number(5);
  recruitTasks.numberOfPeopleRequired = faker.datatype.number(5);
  recruitTasks.recruitTask = faker.random.arrayElement([100, 200, 300, 400]);
  return recruitTasks;
});
