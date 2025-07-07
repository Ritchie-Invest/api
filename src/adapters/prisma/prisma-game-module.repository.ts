import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { GameModuleRepository } from '../../core/domain/repository/game-module.repository';
import { GameModule } from '../../core/domain/model/GameModule';
import { McqModule } from '../../core/domain/model/McqModule';
import { PrismaGameModuleMapper } from './mapper/prisma-game-module.mapper';

@Injectable()
export class PrismaGameModuleRepository implements GameModuleRepository {
  private mapper: PrismaGameModuleMapper = new PrismaGameModuleMapper();

  constructor(private readonly prisma: PrismaService) {}

  async create(data: GameModule): Promise<GameModule> {
    if (data instanceof McqModule) {
      return this.createMcqModule(data);
    }
    throw new Error('Unsupported module type');
  }

  findAll(): GameModule[] | Promise<GameModule[]> {
    throw new Error('Method not implemented.');
  }

  findById(id: string): GameModule | Promise<GameModule | null> | null {
    return this.findByIdAsync(id);
  }

  private async findByIdAsync(id: string): Promise<GameModule | null> {
    const entity = await this.prisma.gameModule.findUnique({
      where: { id },
      include: { mcq: true },
    });

    if (!entity) {
      return null;
    }

    return this.mapper.toDomain(entity);
  }

  update(): GameModule | Promise<GameModule | null> | null {
    throw new Error('Method not implemented.');
  }

  remove(): void {
    throw new Error('Method not implemented.');
  }

  async removeAll(): Promise<void> {
    await this.prisma.mcqModule.deleteMany();
    await this.prisma.gameModule.deleteMany();
  }

  async findByLessonId(lessonId: string): Promise<GameModule[]> {
    const entities = await this.prisma.gameModule.findMany({
      where: { lessonId },
      include: { mcq: true },
      orderBy: { createdAt: 'asc' }, // Order by creation time to maintain consistent ordering
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
      include: { mcq: true },
    });
    return this.mapper.toDomain(createdEntity) as McqModule;
  }
}
