/* istanbul ignore file */
import { NestFactory } from '@nestjs/core';
import { AppCliModule } from './app-cli.module';
import { CreateSuperadminUseCase } from '../core/usecases/create-superadmin.use-case';

async function bootstrap() {
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      'Missing env vars: SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD are required',
    );
    process.exitCode = 1;
    return;
  }

  const appContext = await NestFactory.createApplicationContext(AppCliModule, {
    logger: ['error', 'warn', 'log'],
  });
  try {
    const useCase = appContext.get(CreateSuperadminUseCase);
    const user = await useCase.execute({ email, password });
    console.log(
      `Superadmin ensured for email ${user.email} (id=${user.id}, type=${user.type})`,
    );
  } catch (err) {
    console.error(
      'Failed to bootstrap superadmin:',
      err instanceof Error ? err.message : err,
    );
    process.exitCode = 1;
  } finally {
    await appContext.close();
  }
}

bootstrap();
