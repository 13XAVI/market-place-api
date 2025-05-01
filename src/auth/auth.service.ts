import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthCredentialsDto, CreateUserDto } from '../dtos';
import * as argon from 'argon2';
import { CustomError, CustomResponse } from 'src/utils/customClass';
import { JwtService } from '@nestjs/jwt';
import { ROLES } from 'src/utils/enum';
import * as crypto from 'crypto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private jwt: JwtService,
  ) {}

  async userlogin(authDto: AuthCredentialsDto): Promise<CustomResponse<any>> {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: authDto.email },
      });

      if (!existingUser) {
        throw new CustomError(404, 'User not found');
      }

      if (!existingUser.password) {
        throw new CustomError(500, 'User password not set');
      }

      const validPassword = await argon.verify(
        existingUser.password,
        authDto.password,
      );
      if (!validPassword) {
        throw new CustomError(400, 'Invalid password');
      }

      const token = this.jwt.sign(
        {
          sub: existingUser.id,
          email: existingUser.email,
          role: existingUser.roleId,
        },
        { expiresIn: '2d' },
      );

      return {
        message: 'Logged in successfully',
        data: { accessToken: token },
      };
    } catch (error) {
      console.log(error, '***************************');
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      const errorMessage =
        error instanceof CustomError
          ? error.message
          : 'Unexpected error occurred';

      throw new CustomError(statusCode, errorMessage);
    }
  }

  async createUser(userDto: CreateUserDto): Promise<CustomResponse<any>> {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: userDto.email },
      });

      if (existingUser) {
        throw new CustomError(400, 'Email already exists');
      }

      const hashedPassword = await argon.hash(userDto.password);

      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpires = new Date(
        Date.now() + 1 * 60 * 60 * 1000,
      );
      const user = await this.prisma.user.create({
        data: {
          ...userDto,
          password: hashedPassword,
          verificationToken: verificationToken,
          verificationTokenExpires: verificationTokenExpires,
          role: {
            connect: {
              name: userDto.role || ROLES.SHOPPER,
            },
          },
        },
      });

      await this.emailService.sendVerificationEmail(
        user.email,
        verificationToken,
      );

      return {
        message: 'Sucessfully Created User',
        data: user,
        error: '',
      };
    } catch (error) {
      console.log(error, 'Errs');
      if (error instanceof CustomError) {
        throw error;
      }

      if (error.code === 'P2002') {
        throw new CustomError(400, 'Email already exists');
      }

      if (error.code === 'P2011') {
        throw new CustomError(400, 'Required field is missing');
      }

      throw new CustomError(500, 'Unexpected error occurred');
    }
  }
}
