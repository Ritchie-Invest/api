import { EntityMapper } from '../../../core/base/entity-mapper';
import { Game } from '../../../core/domain/model/Game';
import { Game as GameEntity, GameType as PrismaGameType, Prisma } from '@prisma/client';
import { GameType } from '../../../core/domain/type/Game/GameType';
import { GameRules } from '../../../core/domain/type/Game/GameRules';
import { Question } from '../../../core/domain/type/Game/Question';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaGameMapper implements EntityMapper<Game, GameEntity> {
  fromDomain(model: Game): Omit<GameEntity, 'id'> & { id: string } {
    return {
      id: model.id,
      type: this.mapDomainTypeToPrismaType(model.type),
      rules: JSON.parse(JSON.stringify(model.rules)), // Assurer la compatibilité JSON
      questions: JSON.parse(JSON.stringify(model.questions)), // Assurer la compatibilité JSON
      lessonId: model.lessonId,
      order: model.order ?? 0,
      isPublished: model.isPublished,
      updatedAt: model.updatedAt,
      createdAt: model.createdAt,
    };
  }

  fromDomainForCreate(model: Game): Prisma.GameCreateInput {
    return {
      id: model.id,
      type: this.mapDomainTypeToPrismaType(model.type),
      rules: model.rules as unknown as Prisma.InputJsonValue,
      questions: model.questions as unknown as Prisma.InputJsonValue,
      order: model.order ?? 0,
      isPublished: model.isPublished,
      updatedAt: model.updatedAt,
      createdAt: model.createdAt,
      lesson: {
        connect: { id: model.lessonId }
      }
    };
  }

  fromDomainForUpdate(model: Game): Prisma.GameUpdateInput {
    return {
      type: this.mapDomainTypeToPrismaType(model.type),
      rules: model.rules as unknown as Prisma.InputJsonValue,
      questions: model.questions as unknown as Prisma.InputJsonValue,
      order: model.order ?? 0,
      isPublished: model.isPublished,
      updatedAt: model.updatedAt,
      lesson: {
        connect: { id: model.lessonId }
      }
    };
  }

  toDomain(entity: GameEntity): Game {
    return new Game(
      entity.id,
      this.mapPrismaTypeToDomainType(entity.type),
      entity.rules as unknown as GameRules,
      entity.questions as unknown as Question[],
      entity.lessonId,
      entity.order,
      entity.isPublished,
      entity.updatedAt,
      entity.createdAt,
    );
  }

  private mapDomainTypeToPrismaType(domainType: GameType): PrismaGameType {
    const typeMap: Record<GameType, PrismaGameType> = {
      [GameType.QCM]: 'QCM' as PrismaGameType,
      [GameType.PHRASES_A_TROUS]: 'PHRASES_A_TROUS' as PrismaGameType,
      [GameType.MATCH_THE_WORD]: 'MATCH_THE_WORD' as PrismaGameType,
      [GameType.TRUE_OR_FALSE]: 'TRUE_OR_FALSE' as PrismaGameType,
      [GameType.GAUGE]: 'GAUGE' as PrismaGameType,
      [GameType.CHOOSE_AN_ORDER]: 'CHOOSE_AN_ORDER' as PrismaGameType,
    };
    
    return typeMap[domainType];
  }

  private mapPrismaTypeToDomainType(prismaType: PrismaGameType): GameType {
    const typeMap: Record<PrismaGameType, GameType> = {
      'QCM': GameType.QCM,
      'PHRASES_A_TROUS': GameType.PHRASES_A_TROUS,
      'MATCH_THE_WORD': GameType.MATCH_THE_WORD,
      'TRUE_OR_FALSE': GameType.TRUE_OR_FALSE,
      'GAUGE': GameType.GAUGE,
      'CHOOSE_AN_ORDER': GameType.CHOOSE_AN_ORDER,
    };
    
    return typeMap[prismaType];
  }
}
