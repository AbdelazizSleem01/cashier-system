import crypto from 'crypto';

export function generateResetToken() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  const resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return { resetToken, resetPasswordToken, resetPasswordExpire };
}