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
  @PrimaryGeneratedColumn({ type: 'int', name: 'notificationId' })
  notificationId: number;

  @Column('varchar', { name: 'notificationReceiver', length: 50 })
  notificationReceiver: string;

  @Column('varchar', { name: 'notificationSender', length: 50 })
  notificationSender: string;

  @Column('int', { name: 'eventType', nullable: true })
  eventType: number | null;

  @Column('varchar', { name: 'eventContent', nullable: true, length: 100 })
  eventContent: string | null;

  @Column('int', { name: 'targetId', nullable: true })
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
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([
    { name: 'notificationReceiver', referencedColumnName: 'userId' },
  ])
  notificationReceiver2: Users;

  @ManyToOne(() => Users, (users) => users.notifications2, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'notificationSender', referencedColumnName: 'userId' }])
  notificationSender2: Users;
}
