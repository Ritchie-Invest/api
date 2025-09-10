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
import { ChapterNotFoundError } from '../core/domain/error/ChapterNotFoundError';
import { ChapterInvalidDataError } from '../core/domain/error/ChapterInvalidDataError';
import { ChapterOrderConflictError } from '../core/domain/error/ChapterOrderConflictError';
import { LessonNotFoundError } from '../core/domain/error/LessonNotFoundError';
import { LessonInvalidDataError } from '../core/domain/error/LessonInvalidDataError';
import { LessonOrderConflictError } from '../core/domain/error/LessonOrderConflictError';
import { GameModuleStrategyNotFoundError } from '../core/domain/error/GameModuleStrategyNotFoundError';
import { GameModuleNotFoundError } from '../core/domain/error/GameModuleNotFoundError';
import { InvalidAnswerError } from '../core/domain/error/InvalidAnswerError';
import { McqModuleInvalidDataError } from '../core/domain/error/McqModuleInvalidDataError';
import { ModuleAlreadyAttemptedError } from '../core/domain/error/ModuleAlreadyAttemptedError';
import { LessonNotFullyAttemptedError } from '../core/domain/error/LessonNotFullyAttemptedError';
import { LessonAlreadyCompletedError } from '../core/domain/error/LessonAlreadyCompletedError';
import { LessonAttemptNotFoundError } from '../core/domain/error/LessonAttemptNotFoundError';
import { LessonAttemptAlreadyFinishedError } from '../core/domain/error/LessonAttemptAlreadyFinishedError';

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
      exception instanceof WrongPasswordFormatError ||
      exception instanceof ChapterInvalidDataError ||
      exception instanceof LessonInvalidDataError ||
      exception instanceof GameModuleStrategyNotFoundError ||
      exception instanceof InvalidAnswerError ||
      exception instanceof McqModuleInvalidDataError ||
      exception instanceof LessonNotFullyAttemptedError
    ) {
      return HttpStatus.BAD_REQUEST;
    }
    if (
      exception instanceof UserNotFoundError ||
      exception instanceof ChapterNotFoundError ||
      exception instanceof LessonNotFoundError ||
      exception instanceof GameModuleNotFoundError ||
      exception instanceof LessonAttemptNotFoundError
    ) {
      return HttpStatus.NOT_FOUND;
    }
    if (
      exception instanceof UserAlreadyExistsError ||
      exception instanceof ChapterOrderConflictError ||
      exception instanceof LessonOrderConflictError ||
      exception instanceof ModuleAlreadyAttemptedError ||
      exception instanceof LessonAlreadyCompletedError ||
      exception instanceof LessonAttemptAlreadyFinishedError
    ) {
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
