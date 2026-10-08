const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  image: { type: String, required: true },
  imagePublicId: { type: String, default: null, select: false },
  position: { type: String, required: true, trim: true, maxlength: 60 },
  specialization: { type: String, required: true, trim: true, maxlength: 100 },
  experience: { type: Number, required: true, min: 0, max: 80 },
  bio: { type: String, required: true, trim: true, maxlength: 1000 },
  status: { type: Boolean, default: true, index: true },
}, { timestamps: true, toJSON: { virtuals: true, transform: (_, ret) => { ret.id = ret._id.toString(); ret.active = ret.status; delete ret.imagePublicId; delete ret._id; delete ret.__v; return ret; } } });
module.exports = mongoose.model('TeamMember', schema);
