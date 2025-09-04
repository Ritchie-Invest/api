import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { GameModuleRepository } from '../../core/domain/repository/game-module.repository';
import { GameModule } from '../../core/domain/model/GameModule';
import { McqModule } from '../../core/domain/model/McqModule';
import { PrismaGameModuleMapper } from './mapper/prisma-game-module.mapper';
import { FillInTheBlankModule } from '../../core/domain/model/FillInTheBlankModule';
import { TrueOrFalseModule } from '../../core/domain/model/TrueOrFalseModule';

@Injectable()
export class PrismaGameModuleRepository implements GameModuleRepository {
  private mapper: PrismaGameModuleMapper = new PrismaGameModuleMapper();

  constructor(private readonly prisma: PrismaService) {}

  async create(data: GameModule): Promise<GameModule> {
    if (data instanceof McqModule) {
      return this.createMcqModule(data);
    }
    if (data instanceof FillInTheBlankModule) {
      return this.createFillInTheBlankModule(data);
    }
    if (data instanceof TrueOrFalseModule) {
      return this.createTrueOrFalseModule(data);
    }
    throw new Error('Unsupported module type');
  }

  findAll(): GameModule[] | Promise<GameModule[]> {
    throw new Error('Method not implemented.');
  }

  async findById(id: string): Promise<GameModule | null> {
    const entity = await this.prisma.gameModule.findUnique({
      where: { id },
      include: { mcq: true, fillBlank: true, trueOrFalse: true },
    });

    if (!entity) {
      return null;
    }

    return this.mapper.toDomain(entity);
  }

  update(
    gameModuleId: string,
    gameModule: GameModule,
  ): Promise<GameModule | null> {
    if (gameModule instanceof McqModule) {
      return this.updateMcqModule(gameModuleId, gameModule);
    }
    if (gameModule instanceof FillInTheBlankModule) {
      return this.updateFillInTheBlankModule(gameModuleId, gameModule);
    }
    if (gameModule instanceof TrueOrFalseModule) {
      return this.updateTrueOrFalseModule(gameModuleId, gameModule);
    }
    throw new Error('Unsupported module type');
  }

  remove(): void {
    throw new Error('Method not implemented.');
  }

  async removeAll(): Promise<void> {
    await this.prisma.mcqModule.deleteMany();
    await this.prisma.fillInTheBlankModule.deleteMany();
    await this.prisma.trueOrFalseModule.deleteMany();
    await this.prisma.gameModule.deleteMany();
  }

  async findByLessonId(lessonId: string): Promise<GameModule[]> {
    const entities = await this.prisma.gameModule.findMany({
      where: { lessonId },
      include: { mcq: true, fillBlank: true, trueOrFalse: true },
      orderBy: { createdAt: 'asc' },
    });
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  private async createMcqModule(data: McqModule): Promise<McqModule> {
    const createdEntity = await this.prisma.gameModule.create({
      data: {
        id: data.id,
        lessonId: data.lessonId,
        mcq: {
          create: {
            question: data.question,
            choices: data.choices.map((choice) => ({
              id: choice.id,
              text: choice.text,
              isCorrect: choice.isCorrect,
              correctionMessage: choice.correctionMessage,
            })),
          },
        },
      },
      include: { mcq: true, fillBlank: true, trueOrFalse: true },
    });
    return this.mapper.toDomain(createdEntity) as McqModule;
  }

  private async updateMcqModule(
    gameModuleId: string,
    data: McqModule,
  ): Promise<McqModule | null> {
    const updatedEntity = await this.prisma.gameModule.update({
      where: { id: gameModuleId },
      data: {
        mcq: {
          update: {
            question: data.question,
            choices: data.choices.map((choice) => ({
              id: choice.id,
              text: choice.text,
              isCorrect: choice.isCorrect,
              correctionMessage: choice.correctionMessage,
            })),
          },
        },
      },
      include: { mcq: true, fillBlank: true, trueOrFalse: true},
    });
    

    if (!updatedEntity) {
      return null;
    }

    return this.mapper.toDomain(updatedEntity) as McqModule;
  }

  private async createFillInTheBlankModule(data: FillInTheBlankModule): Promise<FillInTheBlankModule> {
    const createdEntity = await this.prisma.gameModule.create({
      data: {
        id: data.id,
        lessonId: data.lessonId,
        fillBlank: {
          create: {
            firstText: data.firstText,
            secondText: data.secondText,
            blanks: data.blanks.map((blank) => ({
              id: blank.id,
              text: blank.text,
              isCorrect: blank.isCorrect,
              correctionMessage: blank.correctionMessage,
            })),
          },
        },
      },
      include: { mcq: true, fillBlank: true, trueOrFalse: true },
    });
    return this.mapper.toDomain(createdEntity) as FillInTheBlankModule;
  }

  private async updateFillInTheBlankModule(
    gameModuleId: string,
    data: FillInTheBlankModule,
  ): Promise<FillInTheBlankModule | null> {
    const updatedEntity = await this.prisma.gameModule.update({
      where: { id: gameModuleId },
      data: {
        fillBlank: {
          update: {
            firstText: data.firstText,
            secondText: data.secondText,
            blanks: data.blanks.map((blank) => ({
              id: blank.id,
              text: blank.text,
              isCorrect: blank.isCorrect,
              correctionMessage: blank.correctionMessage,
            })),
          },
        },
      },
      include: { mcq: true, fillBlank: true, trueOrFalse: true },
    });

    if (!updatedEntity) {
      return null;
    }

    return this.mapper.toDomain(updatedEntity) as FillInTheBlankModule;
  }

  private async createTrueOrFalseModule(data: TrueOrFalseModule): Promise<TrueOrFalseModule> {
    const createdEntity = await this.prisma.gameModule.create({
      data: {
        id: data.id,
        lessonId: data.lessonId,
        trueOrFalse: {
          create: {
            questions: data.questions.map((question) => ({
              id: question.id,
              text: question.text,
              isCorrect: question.isCorrect,
              correctionMessage: question.correctionMessage,
            })),
          },
        },
      },
      include: { mcq: true, fillBlank: true, trueOrFalse: true },
    });
    return this.mapper.toDomain(createdEntity) as TrueOrFalseModule;
  }

  private async updateTrueOrFalseModule(
    gameModuleId: string,
    data: TrueOrFalseModule,
  ): Promise<TrueOrFalseModule | null> {
    const updatedEntity = await this.prisma.gameModule.update({
      where: { id: gameModuleId },
      data: {
        trueOrFalse: {
          update: {
            questions: data.questions.map((question) => ({
              id: question.id,
              text: question.text,
              isCorrect: question.isCorrect,
              correctionMessage: question.correctionMessage,
            })),
          },
        },
      },
      include: { mcq: true, fillBlank: true, trueOrFalse: true },
    });

    if (!updatedEntity) {
      return null;
    }

    return this.mapper.toDomain(updatedEntity) as TrueOrFalseModule;
  }
}
