import Faker from 'faker';
import { Users } from 'src/socialLogin/entity/Users';
import { define, factory } from 'typeorm-seeding';

define(Users, (faker: typeof Faker) => {
  const user = new Users();
  user.userId = faker.datatype.uuid();
  user.nickname = faker.name.lastName();
  user.profileImgUrl = faker.image.avatar();
  user.technologyStack = faker.random.arrayElement([100, 200, 300]);
  user.activityPoint = faker.datatype.number(1000);
  user.selfIntroduction = faker.lorem.text();
  user.portfolioUrl = faker.internet.url();
  user.loginType = faker.random.arrayElement([1, 2, 3]);
  user.indigenousKey = faker.datatype.string(80);
  user.refreshToken = faker.datatype.string(80);
  user.createdAt = faker.date.past(1);
  user.updatedAt = faker.date.past(1);
  return user;
});

// await factory(User)()
//   .map(async (user: User) => {
//     const pets: Pet[] = await factory(Pet)().createMany(2)
//     const petIds = pets.map((pet: Pet) => pet.Id)
//     await user.pets().attach(petIds)
//   })
//   .createMany(5)
