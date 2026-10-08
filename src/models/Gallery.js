const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    imagePublicId: { type: String, default: null, select: false },
    title: { type: String, trim: true, maxlength: 120, default: "" },
    caption: { type: String, trim: true, maxlength: 300, default: "" },
    category: { type: String, required: true, trim: true, maxlength: 40, index: true },
    isVisible: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id.toString();
        ret.visible = ret.isVisible;
        delete ret.imagePublicId;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);
module.exports = mongoose.model("Gallery", schema);
