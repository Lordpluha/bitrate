import { app } from './app';

async function bootstrap() {
  // Use the PORT environment variable to set the port in production
  await app.listen();
}

bootstrap().catch(err => {
  console.error(err);
  process.exit(1);
});