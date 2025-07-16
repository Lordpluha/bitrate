import type { AdminJSOptions } from 'adminjs';
import componentLoader from './component-loader.js';
import { PrismaClient } from '@prisma/client/extension';

const prisma = new PrismaClient();

const options: AdminJSOptions = {
  componentLoader,
  rootPath: '/admin',
  resources: [
    {
      resource: prisma.user,
      options: {
      },
    },
    {
      resource: prisma.playlist,
      options: {
      },
    },
  ],
};

export default options;
