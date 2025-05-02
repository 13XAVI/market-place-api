import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private config: ConfigService<{ DATABASE_URL: string }, true>) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL', { infer: true }),
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Prisma connected to database');
    } catch (error) {
      console.error('Prisma failed to connect to database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Prisma disconnected from database');
  }

  // Suppress unused property warning
  private useConfig() {
    return this.config;
  }
}
