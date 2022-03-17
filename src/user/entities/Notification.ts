import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from '../../socialLogin/entity/Users';

@Index('notificationReceiver', ['notificationReceiver'], {})
@Index('notificationSender', ['notificationSender'], {})
@Entity('notification', { schema: 'test' })
export class Notification {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'notificationId',
    unsigned: true,
  })
  notificationId: number;

  @Column('varchar', {
    name: 'notificationReceiver',
    nullable: true,
    length: 50,
  })
  notificationReceiver: string | null;

  @Column('varchar', { name: 'notificationSender', nullable: true, length: 50 })
  notificationSender: string | null;

  @Column('int', { name: 'eventType', nullable: true, unsigned: true })
  eventType: number | null;

  @Column('varchar', { name: 'eventContent', nullable: true, length: 100 })
  eventContent: string | null;

  @Column('int', { name: 'targetId', nullable: true, unsigned: true })
  targetId: number | null;

  @Column('tinyint', { name: 'isRead', nullable: true, width: 1 })
  isRead: boolean | null;

  @Column('timestamp', {
    name: 'createdAt',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date | null;

  @ManyToOne(() => Users, (users) => users.notifications, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([
    { name: 'notificationReceiver', referencedColumnName: 'userId' },
  ])
  notificationReceiver2: Users;

  @ManyToOne(() => Users, (users) => users.notifications2, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'notificationSender', referencedColumnName: 'userId' }])
  notificationSender2: Users;
}
