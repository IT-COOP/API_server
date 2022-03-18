// import { RecruitPosts } from 'src/recruit-post/entities/RecruitPosts';
// import { Users } from 'src/socialLogin/entity/Users';
// import { define } from 'typeorm-seeding';

// define(Users, (faker: typeof Faker) => {
//   const userId = faker.
//   const firstName = faker.name.firstName(gender);
//   const lastName = faker.name.lastName(gender);
// });

// await factory(User)()
//   .map(async (user: User) => {
//     const pets: Pet[] = await factory(Pet)().createMany(2)
//     const petIds = pets.map((pet: Pet) => pet.Id)
//     await user.pets().attach(petIds)
//   })
//   .createMany(5)

// // pet.factory.ts
// define(Pet, (faker: typeof Faker) => {
//   const gender = faker.random.number(1);
//   const name = faker.name.firstName(gender);

//   const pet = new RecruitPosts();
//   pet.name = name;
//   pet.age = faker.random.number();
//   pet.user = factory(Users)() as any;
//   return pet;
// });
