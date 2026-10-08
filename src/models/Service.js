const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    category: { type: String, required: true, trim: true, maxlength: 40, index: true },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    duration: { type: Number, required: true, min: 10, max: 600 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    imagePublicId: { type: String, default: null, select: false },
    status: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id.toString();
        ret.active = ret.status;
        delete ret.imagePublicId;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);
module.exports = mongoose.model("Service", schema);
