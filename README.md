# Salus SPA API

Express/MongoDB backend for the Salus frontend. Copy `.env.example` to `.env`, provide real values, then run `npm install` and `npm run dev`.

Base URL: `http://localhost:5000/api/v1`. Protected endpoints accept `Authorization: Bearer <token>`. Uploads are available at `http://localhost:5000/uploads/...`. API responses use `{ success, message, data, pagination? }`.

Set the frontend variable `VITE_API_BASE_URL=http://localhost:5000/api/v1`. The backend emits aliases used by the current UI (`active`, `visible`, `date`, `time`, `guests`, and nested site content) while retaining the requested MongoDB fields.

Admin accounts are intentionally not creatable through the public registration endpoint. Promote a trusted user directly in MongoDB or through a controlled deployment seed/operations process.
