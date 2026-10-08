const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 255 },
  phone: { type: String, required: true, trim: true, maxlength: 20 },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer', immutable: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true, toJSON: { virtuals: true, transform: (_, ret) => { ret.id = ret._id.toString(); delete ret._id; delete ret.__v; delete ret.password; return ret; } } });

userSchema.pre('save', async function hashPassword() {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
});
userSchema.methods.comparePassword = function comparePassword(value) { return bcrypt.compare(value, this.password); };

module.exports = mongoose.model('User', userSchema);
