import { Users } from 'src/socialLogin/entity/Users';
import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';

export default class CreateUsers implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(Users)
      .values([{}, {}])
      .execute();
  }
}
