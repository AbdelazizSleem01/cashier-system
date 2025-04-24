import { NextResponse } from 'next/server';
import { User } from '../../../../server/db/userSchema';
import  connectDB  from "../../../../server/db/connect";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';


export async function POST(request) {
  try {
    await connectDB();
    const { resetToken, newPassword } = await request.json();

    // Hash the token to match what's stored in DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() } // Check expiration
    });

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid or expired token. Please request a new password reset.' 
        },
        { status: 400 }
      );
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return NextResponse.json(
      { success: true, message: 'Password updated successfully' },
      { status: 200 }
    );

  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
