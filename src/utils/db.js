import { getConnectionOptions, createConnection } from 'typeorm';
import User from '../entity/User';

const db = async () => {
  try {
    const connectionOptions = await getConnectionOptions();
    await createConnection({
      ...connectionOptions,
      entities: [User],
      name: 'default',
    });
  } catch (err) {
    console.log(err);
  }
};

export default db;
