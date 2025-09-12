import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UserType } from '../core/domain/type/UserType';

type AuthenticatedUser = {
  id: string;
  email: string;
  type: UserType;
};

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(
    req: Request & { user?: AuthenticatedUser },
    res: Response,
    next: NextFunction,
  ) {
    const now = Date.now();
    const { method, baseUrl } = req;
    const ip = req?.ip || req?.socket?.remoteAddress;
    const userId = req?.user?.id || 'anonymous';

    const statusCode = res?.statusCode;
    const duration = Date.now() - now;

    if (statusCode >= 500) {
      this.logger.error(
        `[${statusCode}] ${method} ${baseUrl} (${duration}ms) - user:${userId} - ip:${ip}`,
      );

      return next();
    }

    this.logger.log(
      `[${statusCode}] ${method} ${baseUrl} (${duration}ms) - user:${userId} - ip:${ip}`,
    );

    return next();
  }
}
