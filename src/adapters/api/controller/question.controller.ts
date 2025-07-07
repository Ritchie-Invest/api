import { Body, Controller, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CompleteQuestionUseCase } from '../../../core/usecases/complete-question.usecase';
import { CompleteQuestionRequest } from '../request/complete-question.request';
import { CompleteQuestionResponse } from '../response/complete-question.response';
import { CompleteQuestionMapper } from '../mapper/complete-question.mapper';

@ApiTags('Questions')
@Controller('/v1/users')
export class QuestionController {
  constructor(
    private readonly completeQuestionUseCase: CompleteQuestionUseCase,
  ) {}

  @Post('/:userId/questions/:questionId/complete')
  @ApiOperation({ summary: 'Complete a question with an answer' })
  @ApiParam({
    name: 'userId',
    description: 'The ID of the user',
    example: 'user-123',
  })
  @ApiParam({
    name: 'questionId',
    description: 'The ID of the question (game module)',
    example: 'question-456',
  })
  @ApiCreatedResponse({
    description: 'Question completed successfully',
    type: CompleteQuestionResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid or empty answer provided',
  })
  @ApiNotFoundResponse({
    description: 'Question not found',
  })
  async completeQuestion(
    @Param('userId') userId: string,
    @Param('questionId') questionId: string,
    @Body() request: CompleteQuestionRequest,
  ): Promise<CompleteQuestionResponse> {
    const command = CompleteQuestionMapper.toDomain(userId, questionId, request);
    const result = await this.completeQuestionUseCase.execute(command);
    return CompleteQuestionMapper.fromDomain(result);
  }
}
