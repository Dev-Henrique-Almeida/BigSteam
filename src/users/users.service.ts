import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { NotFoundException } from '../common/exceptions/not-found.exception';
import { CreationFailedException } from '../common/exceptions/creation-failed.exception';
import { ConflictException } from '../common/exceptions/conflict.exception';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    try {
      data.password = await bcrypt.hash(data.password, 10);
      return await this.prisma.user.create({ data });
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        throw new ConflictException('Este email já está em uso!');
      }
      throw new CreationFailedException('Falha ao criar um novo usuário!');
    }
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    if (users.length === 0) {
      throw new NotFoundException('Nenhum usuário encontrado!');
    }
    return users;
  }

  async findOne(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID: ${id}, não encontrado!`);
    }
    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException(
        `Usuário com email: ${email}, não encontrado!`,
      );
    }
    return user;
  }

  async updateUser(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });
    if (!user) {
      throw new NotFoundException(`Usuário com ID: ${id}, não encontrado!`);
    }
    return user;
  }

  async removeUser(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID: ${id}, não encontrado!`);
    }
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async removeAllUsers(
    exceptUserId: number,
  ): Promise<{ idsRemovidos: number[] }> {
    /*  console.log(
      'Iniciando remoção de todos os usuários exceto o ID:',
      exceptUserId,
    ); */

    const usersToRemove = await this.prisma.user.findMany({
      where: {
        id: {
          not: exceptUserId,
        },
      },
      select: {
        id: true,
      },
    });

    const idsToRemove = usersToRemove.map((user) => user.id);

    await this.prisma.user.deleteMany({
      where: {
        id: {
          not: exceptUserId,
        },
      },
    });

    if (idsToRemove.length === 0) {
      throw new NotFoundException('Nenhum usuário encontrado para remoção!');
    }

    return { idsRemovidos: idsToRemove };
  }
}
