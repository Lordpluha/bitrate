import { AdminJSOptions } from 'adminjs';
import { getModelByName } from '@adminjs/prisma';
import { PrismaClient } from '@prisma/client';

import componentLoader from './component-loader.js';

const prisma = new PrismaClient();

const options: AdminJSOptions = {
  componentLoader,
  rootPath: '/',
  resources: [
    {
      resource: { model: getModelByName('User'), client: prisma },
      options: {
        navigation: {
          name: 'Users',
          icon: 'User',
        },
        properties: {
          id: {
            isVisible: {
              list: true,
              filter: true,
              show: true,
              edit: false,
              new: false,
            },
          },
        },
      },
    },
  ],
  databases: [],
};

export default options;
