import mongoose from 'mongoose';



const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });


export const User = mongoose.models.User || mongoose.model("User", userSchema);
