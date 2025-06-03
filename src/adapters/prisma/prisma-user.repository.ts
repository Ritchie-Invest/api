import { UserRepository } from '../../core/domain/repository/user.repository';
import { User } from '../../core/domain/model/User';
import { PrismaService } from './prisma.service';
import { PrismaUserMapper } from './mapper/prisma-user.mapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  private mapper: PrismaUserMapper = new PrismaUserMapper();

  constructor(private readonly prisma: PrismaService) {
    this.mapper = new PrismaUserMapper();
  }

  async create(user: User): Promise<User> {
    const entity = this.mapper.fromDomain(user);
    const createdEntity = await this.prisma.user.create({ data: entity });
    return this.mapper.toDomain(createdEntity);
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.prisma.user.findUnique({ where: { id } });
    if (!entity) {
      return null;
    }
    return this.mapper.toDomain(entity);
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.prisma.user.findUnique({ where: { email } });
    if (!entity) {
      return null;
    }
    return this.mapper.toDomain(entity);
  }

  async findAll(): Promise<User[]> {
    const entities = await this.prisma.user.findMany();
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async update(id: string, user: User): Promise<User | null> {
    const entity = this.mapper.fromDomain(user);
    const updatedEntity = await this.prisma.user.update({
      where: { id },
      data: entity,
    });
    if (!updatedEntity) {
      return null;
    }
    return this.mapper.toDomain(updatedEntity);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  removeAll(): Promise<void> | void {
    throw new Error('Method not implemented.');
  }
}
