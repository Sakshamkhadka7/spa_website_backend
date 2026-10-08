const mongoose = require('mongoose');
const bookingServiceSchema = new mongoose.Schema({
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  name: { type: String, required: true }, price: { type: Number, required: true }, duration: { type: Number, required: true },
}, { _id: false });
const schema = new mongoose.Schema({
  bookingNumber: { type: String, required: true, unique: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  services: { type: [bookingServiceSchema], validate: [(v) => v.length > 0, 'At least one service is required'] },
  preferredDate: { type: Date, required: true, index: true },
  preferredTime: { type: String, required: true, trim: true },
  numberOfGuests: { type: Number, required: true, min: 1, max: 20, default: 1 },
  totalPrice: { type: Number, required: true, min: 0 },
  bookingStatus: { type: String, enum: ['pending', 'contacted', 'confirmed', 'completed', 'cancelled'], default: 'pending', index: true },
  paymentStatus: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid', index: true },
  specialRequest: { type: String, trim: true, maxlength: 1000, default: '' },
  internalNotes: { type: String, trim: true, maxlength: 2000, default: '' },
}, { timestamps: true, toJSON: { virtuals: true, transform: (_, ret) => {
  ret.id = ret._id.toString(); ret.userId = ret.user?.id || ret.user?._id?.toString?.() || ret.user?.toString?.();
  if (ret.user && ret.user.name) ret.customer = { name: ret.user.name, email: ret.user.email, phone: ret.user.phone };
  ret.services = ret.services.map((s) => ({ ...s, serviceId: s.service?.id || s.service?._id?.toString?.() || s.service?.toString?.() }));
  ret.date = ret.preferredDate instanceof Date ? ret.preferredDate.toISOString().slice(0, 10) : ret.preferredDate;
  ret.time = ret.preferredTime; ret.guests = ret.numberOfGuests; delete ret._id; delete ret.__v; return ret;
} } });
module.exports = mongoose.model('Booking', schema);
