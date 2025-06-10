import { RefreshToken } from '../../core/domain/model/RefreshToken';
import { RefreshTokenRepository } from '../../core/domain/repository/refresh-token.repository';
import { PrismaRefreshTokenMapper } from './mapper/prisma-refresh-token.mapper';
import { PrismaService } from './prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  private mapper: PrismaRefreshTokenMapper = new PrismaRefreshTokenMapper();

  constructor(private readonly prisma: PrismaService) {
    this.mapper = new PrismaRefreshTokenMapper();
  }

  async create(refreshToken: RefreshToken): Promise<RefreshToken> {
    const entity = this.mapper.fromDomain(refreshToken);
    const createdEntity = await this.prisma.refreshToken.create({
      data: entity,
    });
    return this.mapper.toDomain(createdEntity);
  }

  async findAll() {
    return this.prisma.refreshToken.findMany();
  }

  async findById(id: string) {
    return this.prisma.refreshToken.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Partial<{ token: string; expiresAt: Date }>) {
    return this.prisma.refreshToken.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.refreshToken.delete({
      where: { id },
    });
  }

  async expireNow(token: string) {
    await this.prisma.refreshToken.updateMany({
      where: { token },
      data: { expiresAt: new Date() },
    });
  }

  async findByToken(token: string) {
    return this.prisma.refreshToken.findFirst({
      where: { token },
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  removeAll(): Promise<void> | void {
    throw new Error('Method not implemented.');
  }
}
