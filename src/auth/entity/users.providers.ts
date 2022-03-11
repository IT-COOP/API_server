import { Users } from './users.entity';
import { Connection } from 'typeorm';

export const UsersProvider = [
  {
    provide: 'USER_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Users),
    inject: ['DATABASE_CONNECTION'],
  },
];
