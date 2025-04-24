import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import  connectDB  from "../../../../server/db/connect";
import { User } from '../../../../server/db/userSchema';


  
export async function POST(request) {
    try {

        connectDB()

        const { email, password } = await request.json();
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return NextResponse.json(
                { success: false, message: 'Email already exists' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword });
        await user.save();

        return NextResponse.json(
            { success: true, message: 'User registered successfully' },
            { status: 200 }
        );
    } catch (err) {
        console.error('Register error:', err);
        return NextResponse.json(
            { success: false, message: 'Server error' },
            { status: 500 }
        );
    }
}
