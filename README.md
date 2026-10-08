# Salus SPA API

Express/MongoDB backend for the Salus frontend. Copy `.env.example` to `.env`, provide real values, then run `npm install` and `npm run dev`.

Base URL: `http://localhost:5000/api/v1`. Protected endpoints accept `Authorization: Bearer <token>`. Uploads are available at `http://localhost:5000/uploads/...`. API responses use `{ success, message, data, pagination? }`.

Set the frontend variable `VITE_API_BASE_URL=http://localhost:5000/api/v1`. The backend emits aliases used by the current UI (`active`, `visible`, `date`, `time`, `guests`, and nested site content) while retaining the requested MongoDB fields.

For deployments, set `CLIENT_URL` to a comma-separated list of permitted frontend origins. The deployed frontend `https://spa-websiite-freelance.vercel.app` and common local development origins are allowed by default. Do not include a trailing slash in an origin.

Admin accounts are intentionally not creatable through the public registration endpoint. Promote a trusted user directly in MongoDB or through a controlled deployment seed/operations process.
