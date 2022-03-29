import { Users } from './../../socialLogin/entity/Users';
import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { RecruitPosts } from './../../recruit-post/entities/RecruitPosts';

export default class CreateInitialData implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const users = await factory(Users)().createMany(15);

    await factory(RecruitPosts)()
      .map(async (recruitPosts) => {
        recruitPosts.author2 = users[Math.floor(Math.random() * users.length)];
        return recruitPosts;
      })
      .createMany(100);
  }
}
