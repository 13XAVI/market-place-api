
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { JwtService } from '@nestjs/jwt';
import { CustomError } from '../utils/customClass';
import * as argon from 'argon2';
import * as crypto from 'crypto';
import { ROLES } from '../utils/enum';
import { AuthCredentialsDto, CreateUserDto } from '../dtos';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let emailService: EmailService;
  let jwtService: JwtService;

  // Mock dependencies
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockEmailService = {
    sendVerificationEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  jest.mock('argon2', () => ({
    hash: jest.fn(),
    verify: jest.fn(),
  }));


  jest.mock('crypto', () => ({
    randomBytes: jest.fn(),
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    emailService = module.get<EmailService>(EmailService);
    jwtService = module.get<JwtService>(JwtService);

    // Clear mocks before each test
    jest.clearAllMocks();
  });

  describe('userlogin', () => {
    const authDto: AuthCredentialsDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 'user-id-1',
      email: 'test@example.com',
      password: 'hashed-password',
      roleId: ROLES.ADMIN,
    };

    it('should log in successfully and return a JWT token', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (argon.verify as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token');

      // Act
      const result = await authService.userlogin(authDto);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: authDto.email },
      });
      expect(argon.verify).toHaveBeenCalledWith(mockUser.password, authDto.password);
      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          sub: mockUser.id,
          email: mockUser.email,
          role: mockUser.roleId,
        },
        { expiresIn: '2d' },
      );
      expect(result).toEqual({
        message: 'Logged in successfully',
        data: { accessToken: 'jwt-token' },
      });
    });

    it('should throw 404 if user is not found', async () => {

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(authService.userlogin(authDto)).rejects.toEqual(
        new CustomError(404, 'User not found'),
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: authDto.email },
      });
      expect(argon.verify).not.toHaveBeenCalled();
    });

    it('should throw 500 if user password is not set', async () => {

      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        password: null,
      });


      await expect(authService.userlogin(authDto)).rejects.toEqual(
        new CustomError(500, 'User password not set'),
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: authDto.email },
      });
      expect(argon.verify).not.toHaveBeenCalled();
    });

    it('should throw 400 if password is invalid', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (argon.verify as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(authService.userlogin(authDto)).rejects.toEqual(
        new CustomError(400, 'Invalid password'),
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: authDto.email },
      });
      expect(argon.verify).toHaveBeenCalledWith(mockUser.password, authDto.password);
    });

    it('should throw 500 for unexpected errors', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(authService.userlogin(authDto)).rejects.toEqual(
        new CustomError(500, 'Unexpected error occurred'),
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: authDto.email },
      });
    });
  });

  describe('createUser', () => {
    const createUserDto: CreateUserDto = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User',
      role: ROLES.SHOPPER,
    };

    const mockUser = {
      id: 'user-id-2',
      email: createUserDto.email,
      name: createUserDto.name,
      role: { name: ROLES.SHOPPER },
      verificationToken: 'mock-token',
      verificationTokenExpires: new Date(),
    };

    beforeEach(() => {
      // Mock crypto.randomBytes
      (crypto.randomBytes as jest.Mock).mockReturnValue({
        toString: jest.fn().mockReturnValue('mock-token'),
      });
    });

    it('should create a user successfully and send verification email', async () => {

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (argon.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockEmailService.sendVerificationEmail.mockResolvedValue(undefined);

 
      const result = await authService.createUser(createUserDto);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(argon.hash).toHaveBeenCalledWith(createUserDto.password);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...createUserDto,
          password: 'hashed-password',
          verificationToken: 'mock-token',
          verificationTokenExpires: expect.any(Date),
          role: {
            connect: {
              name: ROLES.SHOPPER,
            },
          },
        },
      });
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        mockUser.email,
        'mock-token',
      );
      expect(result).toEqual({
        message: 'Sucessfully Created User',
        data: mockUser,
        error: '',
      });
    });

    it('should throw 400 if email already exists', async () => {

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(authService.createUser(createUserDto)).rejects.toEqual(
        new CustomError(400, 'Email already exists'),
      );
    
      expect(argon.hash).not.toHaveBeenCalled();
    });

    it('should throw 400 for Prisma P2002 error (unique constraint)', async () => {

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (argon.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrismaService.user.create.mockRejectedValue({ code: 'P2002' });


      await expect(authService.createUser(createUserDto)).rejects.toEqual(
        new CustomError(400, 'Email already exists'),
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(argon.hash).toHaveBeenCalledWith(createUserDto.password);
    });

    it('should throw 400 for Prisma P2011 error (null constraint)', async () => {

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (argon.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrismaService.user.create.mockRejectedValue({ code: 'P2011' });

      await expect(authService.createUser(createUserDto)).rejects.toEqual(
        new CustomError(400, 'Required field is missing'),
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(argon.hash).toHaveBeenCalledWith(createUserDto.password);
    });

    it('should throw 500 for unexpected errors', async () => {

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (argon.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrismaService.user.create.mockRejectedValue(new Error('Database error'));

      await expect(authService.createUser(createUserDto)).rejects.toEqual(
        new CustomError(500, 'Unexpected error occurred'),
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(argon.hash).toHaveBeenCalledWith(createUserDto.password);
    });
  });
});