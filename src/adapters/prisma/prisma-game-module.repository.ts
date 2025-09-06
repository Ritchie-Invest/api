import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { GameModuleRepository } from '../../core/domain/repository/game-module.repository';
import { GameModule } from '../../core/domain/model/GameModule';
import { McqModule } from '../../core/domain/model/McqModule';
import { MatchModule } from '../../core/domain/model/MatchModule';
import { PrismaGameModuleMapper } from './mapper/prisma-game-module.mapper';

@Injectable()
export class PrismaGameModuleRepository implements GameModuleRepository {
  private mapper: PrismaGameModuleMapper = new PrismaGameModuleMapper();

  constructor(private readonly prisma: PrismaService) {}

  async create(data: GameModule): Promise<GameModule> {
    if (data instanceof McqModule) {
      return this.createMcqModule(data);
    }
    if (data instanceof MatchModule) {
      return this.createMatchModule(data);
    }
    throw new Error('Unsupported module type');
  }

  findAll(): GameModule[] | Promise<GameModule[]> {
    throw new Error('Method not implemented.');
  }

  async findById(id: string): Promise<GameModule | null> {
    const entity = await this.prisma.gameModule.findUnique({
      where: { id },
      include: { mcq: true, match: true },
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
    if (gameModule instanceof MatchModule) {
      return this.updateMatchModule(gameModuleId, gameModule);
    }
    throw new Error('Unsupported module type');
  }

  remove(): void {
    throw new Error('Method not implemented.');
  }

  async removeAll(): Promise<void> {
    await this.prisma.mcqModule.deleteMany();
    await this.prisma.matchModule.deleteMany();
    await this.prisma.gameModule.deleteMany();
  }

  async findByLessonId(lessonId: string): Promise<GameModule[]> {
    const entities = await this.prisma.gameModule.findMany({
      where: { lessonId },
      include: { mcq: true, match: true },
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
      include: { mcq: true, match: true },
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
      include: { mcq: true, match: true },
    });

    if (!updatedEntity) {
      return null;
    }

    return this.mapper.toDomain(updatedEntity) as McqModule;
  }

  private async createMatchModule(data: MatchModule): Promise<MatchModule> {
    const createdEntity = await this.prisma.gameModule.create({
      data: {
        id: data.id,
        lessonId: data.lessonId,
        match: {
          create: {
            instruction: data.instruction,
            matches: data.matches.map((match) => ({
              id: match.id,
              value1: match.value1,
              value2: match.value2,
            })),
          },
        },
      },
      include: { mcq: true, match: true },
    });
    return this.mapper.toDomain(createdEntity) as MatchModule;
  }

  private async updateMatchModule(
    gameModuleId: string,
    data: MatchModule,
  ): Promise<MatchModule | null> {
    const updatedEntity = await this.prisma.gameModule.update({
      where: { id: gameModuleId },
      data: {
        match: {
          update: {
            instruction: data.instruction,
            matches: data.matches.map((match) => ({
              id: match.id,
              value1: match.value1,
              value2: match.value2,
            })),
          },
        },
      },
      include: { mcq: true, match: true },
    });

    if (!updatedEntity) {
      return null;
    }

    return this.mapper.toDomain(updatedEntity) as MatchModule;
  }
}
