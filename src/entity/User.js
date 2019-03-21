import { EntitySchema } from 'typeorm';
import User from '../models/User';

const UserSchema = new EntitySchema({
  name: 'User',
  target: User,
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: 'increment',
    },
    username: {
      type: 'varchar',
    },
    email: {
      type: 'varchar',
    },
    password: {
      type: 'varchar',
      nullable: false,
    },
    resetPasswordToken: {
      type: 'varchar',
      nullable: true,
    },
    resetPasswordExpires: {
      type: 'bigint',
      nullable: true,
    },
    createdAt: {
      type: 'timestamp',
    },
  },
  uniques: [
    {
      columns: ['username'],
    },
    {
      columns: ['email'],
    },
  ],
});

export default UserSchema;
