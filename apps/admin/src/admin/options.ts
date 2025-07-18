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
    {
      resource: { model: getModelByName('Album'), client: prisma },
      options: {
        navigation: {
          name: 'Albums',
          icon: 'Album',
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
    {
      resource: { model: getModelByName('Artist'), client: prisma },
      options: {
        navigation: {
          name: 'Artists',
          icon: 'Artist',
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
    {
      resource: { model: getModelByName('Playlist'), client: prisma },
      options: {
        navigation: {
          name: 'Playlists',
          icon: 'Playlist',
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
    {
      resource: { model: getModelByName('Session'), client: prisma },
      options: {
        navigation: {
          name: 'Sessions',
          icon: 'Session',
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
    {
      resource: { model: getModelByName('Track'), client: prisma },
      options: {
        navigation: {
          name: 'Tracks',
          icon: 'Track',
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
