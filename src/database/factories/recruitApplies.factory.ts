import Faker from 'faker';
import { RecruitApplies } from 'src/recruit-post/entities/RecruitApplies';
import { define } from 'typeorm-seeding';

define(RecruitApplies, (faker: typeof Faker) => {
  const recruitApplies = new RecruitApplies();
  recruitApplies.applicant;
  recruitApplies.applyMessage;
  recruitApplies.isAccepted = false;
  recruitApplies.createdAt = faker.date.past(1);
  recruitApplies.updatedAt = faker.date.past(1);
  return recruitApplies;
});
