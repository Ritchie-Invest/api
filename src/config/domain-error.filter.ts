import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { DomainError } from '../core/base/domain-error';
import { UserNotFoundError } from '../core/domain/error/UserNotFoundError';
import { UserAlreadyExistsError } from '../core/domain/error/UserAlreadyExistsError';
import { WrongEmailFormatError } from '../core/domain/error/WrongEmailFormatError';
import { WrongPasswordFormatError } from '../core/domain/error/WrongPasswordFormatError';
import { UserNotAllowedError } from '../core/domain/error/UserNotAllowedError';
import { TokenInvalidOrExpiredError } from '../core/domain/error/TokenInvalidOrExpiredError';

@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const response = ctx.getResponse();

    const status = this.mapErrorTypeToStatusCode(exception);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    response.status(status).json({
      statusCode: status,
      message: exception.message,
    });
  }

  private mapErrorTypeToStatusCode(exception: DomainError): number {
    if (
      exception instanceof WrongEmailFormatError ||
      exception instanceof WrongPasswordFormatError
    ) {
      return HttpStatus.BAD_REQUEST;
    }
    if (exception instanceof UserNotFoundError) {
      return HttpStatus.NOT_FOUND;
    }
    if (exception instanceof UserAlreadyExistsError) {
      return HttpStatus.CONFLICT;
    }
    if (exception instanceof UserNotAllowedError) {
      return HttpStatus.FORBIDDEN;
    }
    if (exception instanceof TokenInvalidOrExpiredError) {
      return HttpStatus.UNAUTHORIZED;
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
