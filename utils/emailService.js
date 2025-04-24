import nodemailer from 'nodemailer';

export async function sendResetEmail({ to, subject, html }) {
  // 1. التحقق من وجود بيانات الاعتماد
  if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
    console.error('❌ Email credentials missing!');
    throw new Error('Email credentials not configured');
  }

  // 2. إنشاء Transporter مع تفعيل التسجيل
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    logger: true, // تسجيل تفاصيل الإرسال
    debug: true,  // تفعيل وضع التصحيح
  });

  // 3. إعداد خيارات البريد مع معلومات واضحة
  const mailOptions = {
    from: `"Cashier System" <${process.env.EMAIL_USERNAME}>`,
    to,
    subject,
    html,
  };

  // 4. محاولة الإرسال مع معالجة الأخطاء
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('📨 Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email send error:', error);
    throw new Error('Failed to send email');
  }
}