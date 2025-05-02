import { Injectable, UseFilters } from '@nestjs/common';
import * as sendgrid from '@sendgrid/mail';
import { CustomError, CustomExceptionFilter } from 'src/utils/customClass';
// import { Kafka } from 'kafkajs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
@UseFilters(CustomExceptionFilter)
export class EmailService {
  // private kafka: Kafka;
  // private consumer;

  constructor(private prisma: PrismaService) {
    // this.kafka = new Kafka({
    //   clientId: 'email-service',
    //   brokers: [process.env.KAFKA_BROKERS || 'kafka:9092'],
    // });
    // this.consumer = this.kafka.consumer({ groupId: 'email-group' });
    sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string);
  }

  // async onModuleInit() {
  //   await this.consumer.connect();
  //   await this.consumer.subscribe({
  //     topic: 'order-events',
  //     fromBeginning: false,
  //   });

  //   await this.consumer.run({
  //     eachMessage: async ({ message }) => {
  //       const event = JSON.parse(message.value.toString());
  //       if (event.eventType === 'ORDER_STATUS_UPDATED') {
  //         await this.sendOrderStatusUpdateEmail(
  //           event.orderId,
  //           event.status,
  //           event.userId,
  //         );
  //       }
  //     },
  //   });
  // }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verificationLink = `https://market-place-api-ns56.onrender.com/auth/verify-email?token=${token}`;
    const msg = {
      to,
      from: 'tresorxavier16@gmail.com',
      subject: 'Verify Your Email Address',
      text: `Please click this link to verify your email: ${verificationLink}`,
      html: `<p>Please click this link to verify your email: <a href="${verificationLink}">${verificationLink}</a></p>`,
    };

    try {
      await sendgrid.send(msg);
    } catch (error) {
      console.log(error, 'Erooooooooooooooooooooooooooooooooooooooooooooor');
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      const errorMessage =
        error instanceof CustomError
          ? error.message
          : 'Unexpected error occurred';
      throw new CustomError(statusCode, errorMessage);
    }
  }

  async sendOrderStatusUpdateEmail(
    orderId: string,
    status: string,
    userId: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user) {
      throw new CustomError(404, 'User not found');
    }

    const msg = {
      to: user.email,
      from: 'tresorxavier16@gmail.com',
      subject: `Order #${orderId} Status Update`,
      text: `Dear ${user.name},\n\nYour order #${orderId} has been updated to ${status}.\n\nThank you for shopping with us!`,
      html: `<p>Dear ${user.name},</p><p>Your order #${orderId} has been updated to <strong>${status}</strong>.</p><p>Thank you for shopping with us!</p>`,
    };

    try {
      await sendgrid.send(msg);
    } catch (error) {
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      const errorMessage =
        error instanceof CustomError
          ? error.message
          : 'Unexpected error occurred';
      throw new CustomError(statusCode, errorMessage);
    }
  }
}
