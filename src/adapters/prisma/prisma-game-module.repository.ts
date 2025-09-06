import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { GameModuleRepository } from '../../core/domain/repository/game-module.repository';
import { GameModule } from '../../core/domain/model/GameModule';
import { McqModule } from '../../core/domain/model/McqModule';
import { GaugeModule } from '../../core/domain/model/GaugeModule';
import { ChooseAnOrderModule } from '../../core/domain/model/ChooseAnOrderModule';
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

  async findById(id: string): Promise<GameModule | null> {
    const entity = await this.prisma.gameModule.findUnique({
      where: { id },
      include: { 
        mcq: true,
        gauge: true,
        chooseAnOrder: true,
      },
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
    if (gameModule instanceof GaugeModule) {
      return this.updateGaugeModule(gameModuleId, gameModule);
    }
    if (gameModule instanceof ChooseAnOrderModule) {
      return this.updateChooseAnOrderModule(gameModuleId, gameModule);
    }
    throw new Error('Unsupported module type');
  }

  remove(): void {
    throw new Error('Method not implemented.');
  }

  async removeAll(): Promise<void> {
    await this.prisma.mcqModule.deleteMany();
    await this.prisma.gaugeModule.deleteMany();
    await this.prisma.chooseAnOrderModule.deleteMany();
    await this.prisma.gameModule.deleteMany();
  }

  async findByLessonId(lessonId: string): Promise<GameModule[]> {
    const entities = await this.prisma.gameModule.findMany({
      where: { lessonId },
      include: { 
        mcq: true,
        gauge: true,
        chooseAnOrder: true,
      },
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
      include: { 
        mcq: true,
        gauge: true,
        chooseAnOrder: true,
      },
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
      include: { 
        mcq: true,
        gauge: true,
        chooseAnOrder: true,
      },
    });

    if (!updatedEntity) {
      return null;
    }

    return this.mapper.toDomain(updatedEntity) as McqModule;
  }

  private async createGaugeModule(data: GaugeModule): Promise<GaugeModule> {
    const createdEntity = await this.prisma.gameModule.create({
      data: {
        id: data.id,
        lessonId: data.lessonId,
        gauge: {
          create: {
            question: data.question,
            value: data.value,
          },
        },
      },
      include: { 
        mcq: true,
        gauge: true,
        chooseAnOrder: true,
      },
    });
    return this.mapper.toDomain(createdEntity) as GaugeModule;
  }

  private async createChooseAnOrderModule(data: ChooseAnOrderModule): Promise<ChooseAnOrderModule> {
    const createdEntity = await this.prisma.gameModule.create({
      data: {
        id: data.id,
        lessonId: data.lessonId,
        chooseAnOrder: {
          create: {
            question: data.question,
            sentences: data.sentences.map((sentence) => ({
              sentence: sentence.sentence,
              value: sentence.value,
            })),
          },
        },
      },
      include: { 
        mcq: true,
        gauge: true,
        chooseAnOrder: true,
      },
    });
    return this.mapper.toDomain(createdEntity) as ChooseAnOrderModule;
  }

  private async updateGaugeModule(
    gameModuleId: string,
    data: GaugeModule,
  ): Promise<GaugeModule | null> {
    const updatedEntity = await this.prisma.gameModule.update({
      where: { id: gameModuleId },
      data: {
        gauge: {
          update: {
            question: data.question,
            value: data.value,
          },
        },
      },
      include: { 
        mcq: true,
        gauge: true,
        chooseAnOrder: true,
      },
    });

    if (!updatedEntity) {
      return null;
    }

    return this.mapper.toDomain(updatedEntity) as GaugeModule;
  }

  private async updateChooseAnOrderModule(
    gameModuleId: string,
    data: ChooseAnOrderModule,
  ): Promise<ChooseAnOrderModule | null> {
    const updatedEntity = await this.prisma.gameModule.update({
      where: { id: gameModuleId },
      data: {
        chooseAnOrder: {
          update: {
            question: data.question,
            sentences: data.sentences.map((sentence) => ({
              sentence: sentence.sentence,
              value: sentence.value,
            })),
          },
        },
      },
      include: { 
        mcq: true,
        gauge: true,
        chooseAnOrder: true,
      },
    });

    if (!updatedEntity) {
      return null;
    }

    return this.mapper.toDomain(updatedEntity) as ChooseAnOrderModule;
  }
}
