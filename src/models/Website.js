const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "main" },
    spaName: { type: String, default: "Salus Per Aquam" },
    logo: { type: String, default: "" },
    logoPublicId: { type: String, default: null, select: false },
    heroImage: { type: String, default: "" },
    heroImagePublicId: { type: String, default: null, select: false },
    heroTitle: { type: String, default: "" },
    heroSubtitle: { type: String, default: "" },
    aboutContent: { type: String, default: "" },
    mission: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    openingHours: { type: mongoose.Schema.Types.Mixed, default: [] },
    socialLinks: { type: mongoose.Schema.Types.Mixed, default: {} },
    footerContent: { type: String, default: "" },
    currency: { type: String, default: "$" },
    timeSlots: { type: [String], default: [] },
    values: { type: [String], default: [] },
    facilities: { type: [String], default: [] },
    logoText: { type: String, default: "" },
    tagline: { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        ret.id = ret._id.toString();
        ret.hero = { title: ret.heroTitle, subtitle: ret.heroSubtitle, image: ret.heroImage };
        ret.about = {
          story: ret.aboutContent,
          mission: ret.mission,
          values: ret.values,
          facilities: ret.facilities,
        };
        ret.contact = {
          phone: ret.phone || "",
          email: ret.email || "",
          address: ret.address || "",
        };
        ret.social = ret.socialLinks || { facebook: "", instagram: "", twitter: "" };
        ret.openingHours = Array.isArray(ret.openingHours) ? ret.openingHours : [];
        ret.timeSlots = Array.isArray(ret.timeSlots) ? ret.timeSlots : [];
        ret.footerText = ret.footerContent || "";
        delete ret.logoPublicId;
        delete ret.heroImagePublicId;
        delete ret._id;
        delete ret.__v;
        delete ret.key;
        return ret;
      },
    },
  },
);
module.exports = mongoose.model("Website", schema);
