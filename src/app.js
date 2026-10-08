const express = require('express'); const cors = require('cors'); const helmet = require('helmet'); const cookieParser = require('cookie-parser'); const morgan = require('morgan'); const path = require('path');
const { notFound, errorHandler } = require('./middleware/error');
const app = express();
app.disable('x-powered-by'); app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: (process.env.CLIENT_URL || 'http://localhost:3000').split(',').map((x) => x.trim()), credentials: true })); app.use(express.json({ limit: '1mb' })); app.use(express.urlencoded({ extended: true, limit: '1mb' })); app.use(cookieParser()); if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads'), { maxAge: '7d', immutable: false }));
app.get('/api/v1/health', (_req, res) => res.json({ success: true, message: 'API is healthy', data: { uptime: process.uptime() } }));
app.use('/api/v1/auth', require('./routes/auth.routes')); app.use('/api/v1/users', require('./routes/user.routes')); app.use('/api/v1/services', require('./routes/service.routes')); app.use('/api/v1/team', require('./routes/team.routes')); app.use('/api/v1/gallery', require('./routes/gallery.routes')); app.use('/api/v1/bookings', require('./routes/booking.routes')); app.use('/api/v1/website', require('./routes/website.routes')); app.use('/api/v1/dashboard', require('./routes/dashboard.routes'));
app.use(notFound); app.use(errorHandler); module.exports = app;
