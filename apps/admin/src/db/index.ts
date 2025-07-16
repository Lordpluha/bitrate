import { Database, Resource } from '@adminjs/prisma';
import { PrismaClient } from '@prisma/client/extension';
import AdminJS from 'adminjs';

export const prisma = new PrismaClient();

AdminJS.registerAdapter({ Database, Resource });

const initialize = async () => ({ prisma });

export default initialize;
