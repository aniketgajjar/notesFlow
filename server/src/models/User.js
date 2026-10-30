import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 254 },
  password: { type: String, required: true, select: false },
}, { timestamps: true });

userSchema.pre('validate', function validatePasswordLength() {
  if (this.password && Buffer.byteLength(this.password, 'utf8') > 72) {
    this.invalidate('password', 'Password must be 72 bytes or fewer');
  }
});

userSchema.pre('save', async function hashPassword() {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.set('toJSON', {
  transform(_document, result) {
    delete result.password;
    delete result.__v;
    return result;
  },
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
