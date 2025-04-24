import { connect } from 'mongoose';

const connectDB = async () => {
  try {
    await connect(process.env.MONGODB_URI, {
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
  }
};

export default connectDB;