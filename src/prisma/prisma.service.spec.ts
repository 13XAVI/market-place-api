import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { PrismaClient } from '@prisma/client';

describe('PrismaService', () => {
  let prismaService: PrismaService;
  let configService: ConfigService;

  const mockPrismaClientMethods = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest
      .spyOn(PrismaClient.prototype, '$connect')
      .mockImplementation(mockPrismaClientMethods.$connect);
    jest
      .spyOn(PrismaClient.prototype, '$disconnect')
      .mockImplementation(mockPrismaClientMethods.$disconnect);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize PrismaClient with DATABASE_URL from ConfigService', () => {
      const databaseUrl = process.env.DATA_BASE_MOCK_UL;
      mockConfigService.get.mockReturnValue(databaseUrl);

      const service = new PrismaService(configService as any);

      expect(configService.get).toHaveBeenCalledWith('DATABASE_URL', {
        infer: true,
      });
      expect(service).toBeInstanceOf(PrismaClient);
    });
  });

  describe('onModuleInit', () => {
    it('should connect to the database and log success', async () => {
      mockPrismaClientMethods.$connect.mockResolvedValue(undefined);
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await prismaService.onModuleInit();

      expect(mockPrismaClientMethods.$connect).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Prisma connected to database',
      );
      consoleLogSpy.mockRestore();
    });

  });

  describe('onModuleDestroy', () => {
    it('should disconnect from the database and log success', async () => {
        
        mockPrismaClientMethods.$disconnect.mockResolvedValue(undefined);
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  
        await prismaService.onModuleDestroy();
  
        expect(mockPrismaClientMethods.$disconnect).toHaveBeenCalled();
        expect(consoleLogSpy).toHaveBeenCalledWith('Prisma disconnected from database');
        consoleLogSpy.mockRestore();
      });

    it('should handle disconnection errors ', async () => {
      const error = new Error('Disconnection failed');
      mockPrismaClientMethods.$disconnect.mockRejectedValue(error);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(prismaService.onModuleDestroy()).resolves.toBeUndefined();
      expect(mockPrismaClientMethods.$disconnect).toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
});
