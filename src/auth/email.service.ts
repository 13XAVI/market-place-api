import { Injectable } from '@nestjs/common';
import * as sendgrid from '@sendgrid/mail';
import { CustomError } from 'src/utils/customClass';

@Injectable()
export class EmailService {
  constructor() {
    sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string);
  }

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
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      const errorMessage =
        error instanceof CustomError
          ? error.message
          : 'Unexpected error occurred';

      throw new CustomError(statusCode, errorMessage);
    }
  }
}
