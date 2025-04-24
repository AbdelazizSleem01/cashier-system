import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import  connectDB  from "../../../../server/db/connect";
import { User } from '../../../../server/db/userSchema';



export async function GET() {
    await connectDB();

  try {
    const users = await User.find({}, { email: 1, _id: 0 });
    return NextResponse.json(users);
  } catch (err) {
    console.error('GET users error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  await connectDB();

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    user.password = undefined;

    // Generate a session token using crypto
    const sessionToken = crypto.randomBytes(32).toString('hex');

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        email: user.email,
        initial: user.email.charAt(0).toUpperCase(),
      },
    });

    // Set the session token as a cookie
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}