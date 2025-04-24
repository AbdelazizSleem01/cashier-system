import { NextResponse } from 'next/server';
import  connectDB  from "../../../../server/db/connect";
import crypto from 'crypto';
import { User } from '../../../../server/db/userSchema';
import { sendResetEmail } from '../../../../utils/emailService';


export function generateResetToken() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  const resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

  return { resetToken, resetPasswordToken, resetPasswordExpire };
}


export async function POST(request) {
  try {
    await connectDB();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }


    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    });
    if (!user) {
      return NextResponse.json(
        { success: true, message: 'If this email exists, a reset link will be sent' },
        { status: 200 }
      );
    }

    if (!user) {
      return NextResponse.json(
        {
          success: true,
          message: 'If this email exists in our system, you will receive a reset link'
        },
        { status: 200 }
      );
    }
    const { resetToken, resetPasswordToken, resetPasswordExpire } = generateResetToken();

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save();

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${resetToken}`;

    try {
      await sendResetEmail({
        to: user.email,
        subject: 'Reset Your Password - Cashier System',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 24px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Cashier System</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 24px;">
              <h2 style="color: #1e293b; font-size: 20px; margin-top: 0;">Password Reset Request</h2>
              
              <p style="color: #475569; line-height: 1.5;">
                We received a request to reset your password. Click the button below to proceed:
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" 
                   style="background-color: #4f46e5; color: white; padding: 12px 24px; 
                          border-radius: 6px; text-decoration: none; font-weight: 500;
                          display: inline-block;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #475569; line-height: 1.5;">
                If you didn't request this, please ignore this email. The link will expire in 
                <strong>15 minutes</strong>.
              </p>
              
              <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 14px; margin-bottom: 8px;">
                  Having trouble? Copy and paste this link into your browser:
                </p>
                <p style="color: #475569; font-size: 14px; word-break: break-all;">
                  ${resetUrl}
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
              <p style="margin: 0;">© ${new Date().getFullYear()} Cashier System. All rights reserved.</p>
            </div>
          </div>
        `,
      });

      return NextResponse.json(
        { success: true, message: 'Reset link sent to email if it exists' },
        { status: 200 }
      );
    } catch (emailErr) {
      console.error('Email sending error:', emailErr);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return NextResponse.json(
        { success: false, message: 'Failed to send reset email' },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json(
      { success: false, message: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
