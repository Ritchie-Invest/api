/* istanbul ignore file */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DomainErrorFilter } from './config/domain-error.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { ValidationPipe } from '@nestjs/common';
import { RolesGuard } from './adapters/api/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './adapters/api/guards/jwt-auth.guard';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new DomainErrorFilter());
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: [
      process.env.ADMIN_APP_BASE_URL || 'http://localhost:5173',
      process.env.MOBILE_APP_BASE_URL || 'http://localhost:8080',
    ],
    credentials: true,
  });

  app.use(cookieParser());
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          'script-src': ["'self'", 'https://cdn.jsdelivr.net'],
          'style-src': [
            "'self'",
            'https://cdn.jsdelivr.net',
            "'unsafe-inline'",
          ],
          'connect-src': [
            "'self'",
            'https://cdn.jsdelivr.net',
            'https://fonts.scalar.com',
          ],
          'img-src': ["'self'", 'data:'],
          'font-src': [
            "'self'",
            'https://fonts.scalar.com',
            'https://cdn.jsdelivr.net',
            'data:',
          ],
        },
      },
    }),
  );

  const reflector = app.get(Reflector);
  app.useGlobalGuards(
    new JwtAuthGuard(app.get('TokenService'), reflector),
    new RolesGuard(reflector),
  );

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  app.use('/health', (_req: any, res: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    res.status(200).json({
      status: 'ok',
      message: 'Server is running',
      timestamp: new Date().toISOString(),
    });
  });

  app.use(
    '/reference',
    apiReference({
      content: document,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
