import { registerAs } from '@nestjs/config';
import { SequelizeModuleOptions } from '@nestjs/sequelize';

export default registerAs(
  'database',
  (): SequelizeModuleOptions => ({
    uri: process.env.DATABASE_URL, 
    dialect: 'postgres',
    autoLoadModels: true,
    logging: false,
    synchronize: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }),
);
