require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../src/models/User');

async function main() {
  const [email, password, name = 'SPA Admin', phone = '+977 9800000000'] = process.argv.slice(2);
  if (!email || !password) throw new Error('Usage: node scripts/create-admin.js <email> <password> [name] [phone]');
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing from backend/.env');

  await mongoose.connect(process.env.MONGO_URI);
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 12);
  await User.collection.updateOne(
    { email: normalizedEmail },
    {
      $set: { name, phone, password: passwordHash, role: 'admin', isActive: true, updatedAt: new Date() },
      $setOnInsert: { email: normalizedEmail, createdAt: new Date() },
    },
    { upsert: true },
  );

  const admin = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!admin || admin.role !== 'admin' || !(await admin.comparePassword(password))) {
    throw new Error('Admin verification failed');
  }
  console.log(`Admin ready: ${normalizedEmail}`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
