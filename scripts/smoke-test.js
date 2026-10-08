require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs'); const path = require('path'); const mongoose = require('mongoose');
const User = require('../src/models/User');
const base = `http://localhost:${process.env.PORT || 5000}/api/v1`; const stamp = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const made = { users: [], service: null, team: null, gallery: null, booking: null };
async function request(url, options = {}, expected = 200) {
  const response = await fetch(`${base}${url}`, options); const body = await response.json().catch(() => ({}));
  if (response.status !== expected) throw new Error(`${options.method || 'GET'} ${url}: expected ${expected}, received ${response.status}: ${JSON.stringify(body)}`);
  return body.data;
}
const json = (method, body, token) => ({ method, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
const auth = (token) => ({ headers: { authorization: `Bearer ${token}` } });
function imageForm(fields = {}) { const form = new FormData(); Object.entries(fields).forEach(([k, v]) => form.append(k, String(v))); const bytes = fs.readFileSync(path.resolve(__dirname, '../../src/assets/team1.jpg')); form.append('image', new Blob([bytes], { type: 'image/jpeg' }), 'test.jpg'); return form; }
async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  await request('/health');
  const a = await request('/auth/register', json('POST', { name: 'Smoke Customer A', email: `smoke-a-${stamp}@example.com`, phone: '+977 9800000001', password: 'Testing123!' }), 201); made.users.push(a.user.id);
  const b = await request('/auth/register', json('POST', { name: 'Smoke Customer B', email: `smoke-b-${stamp}@example.com`, phone: '+977 9800000002', password: 'Testing123!' }), 201); made.users.push(b.user.id);
  const admin = await request('/auth/register', json('POST', { name: 'Smoke Admin', email: `smoke-admin-${stamp}@example.com`, phone: '+977 9800000003', password: 'Testing123!' }), 201); made.users.push(admin.user.id);
  // Direct collection update intentionally simulates an out-of-band, trusted
  // admin provisioning process; public registration can only create customers.
  await User.collection.updateOne({ _id: new mongoose.Types.ObjectId(admin.user.id) }, { $set: { role: 'admin' } });
  const loggedAdmin = await request('/auth/login', json('POST', { email: `smoke-admin-${stamp}@example.com`, password: 'Testing123!' }));
  const service = await request('/services', { method: 'POST', headers: { authorization: `Bearer ${loggedAdmin.token}` }, body: imageForm({ name: 'Smoke Massage', category: 'Test', description: 'Temporary service for automated smoke testing.', duration: 60, price: 125, active: true }) }, 201); made.service = service.id;
  const staticImage = await fetch(`http://localhost:${process.env.PORT || 5000}${service.image}`); if (!staticImage.ok || !staticImage.headers.get('content-type')?.startsWith('image/')) throw new Error('Static image serving failed');
  const team = await request('/team', { method: 'POST', headers: { authorization: `Bearer ${loggedAdmin.token}` }, body: imageForm({ name: 'Smoke Therapist', position: 'Therapist', specialization: 'Testing', experience: 4, bio: 'Temporary therapist for automated smoke testing.', status: true }) }, 201); made.team = team.id;
  const gallery = await request('/gallery', { method: 'POST', headers: { authorization: `Bearer ${loggedAdmin.token}` }, body: imageForm({ title: 'Smoke Gallery', caption: 'Temporary test gallery image', category: 'Test', visible: true }) }, 201); made.gallery = gallery.id;
  const booking = await request('/bookings', json('POST', { serviceIds: [service.id], date: new Date(Date.now() + 86400000).toISOString().slice(0, 10), time: '10:00', guests: 2, totalPrice: 1, paymentStatus: 'paid', bookingStatus: 'completed' }, a.token), 201); made.booking = booking.id;
  if (booking.totalPrice !== 250 || booking.paymentStatus !== 'unpaid' || booking.bookingStatus !== 'pending' || booking.userId !== a.user.id) throw new Error(`Server-side booking authority test failed: ${JSON.stringify(booking)}`);
  await request(`/bookings/me/${booking.id}`, auth(b.token), 404);
  const paid = await request(`/bookings/${booking.id}`, json('PATCH', { paymentStatus: 'paid', bookingStatus: 'contacted' }, loggedAdmin.token)); if (paid.paymentStatus !== 'paid') throw new Error('Paid update failed');
  await request('/users?search=Smoke%20Customer', auth(loggedAdmin.token)); await request('/dashboard', auth(loggedAdmin.token));
  await request(`/gallery/${gallery.id}`, { method: 'DELETE', ...auth(loggedAdmin.token) }); made.gallery = null;
  await request(`/team/${team.id}`, { method: 'DELETE', ...auth(loggedAdmin.token) }); made.team = null;
  await request(`/services/${service.id}`, { method: 'DELETE', ...auth(loggedAdmin.token) }); made.service = null;
  console.log('Smoke tests passed: auth, roles, ownership, server totals, CRUD, upload/static files, paid status, users, dashboard');
}
main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(async () => {
  const collections = { Booking: require('../src/models/Booking'), Service: require('../src/models/Service'), Team: require('../src/models/TeamMember'), Gallery: require('../src/models/Gallery') };
  if (made.booking) await collections.Booking.deleteOne({ _id: made.booking });
  if (made.users.length) await collections.Booking.deleteMany({ user: { $in: made.users } });
  if (made.service) await collections.Service.deleteOne({ _id: made.service }); if (made.team) await collections.Team.deleteOne({ _id: made.team }); if (made.gallery) await collections.Gallery.deleteOne({ _id: made.gallery }); if (made.users.length) await User.deleteMany({ _id: { $in: made.users } });
  await mongoose.disconnect();
});
