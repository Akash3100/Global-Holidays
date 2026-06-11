# Final Report - Travel App

This workspace contains a React client and an Express/MongoDB backend with JWT auth and real-time booking notifications (Socket.io).

## Setup

1. Install dependencies for both server and client:

```bash
cd server
npm install
cd ../client
npm install
```

2. Create `.env` in `server/` (a sample exists at `server/.env.example`). Required vars:

```
MONGO_URI=mongodb://localhost:27017/finalreport
PORT=5000
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=30d
```

3. Seed the database (creates users, bookings, and a default admin `Global holidays` / `2026`):

```bash
cd server
node seed.js
```

4. Run the server and client (in separate terminals):

```bash
# terminal 1
cd server
npm run dev

# terminal 2
cd client
npm run dev
```

- The React dev server will prompt to run on another port if `3000` is already used (it will choose the next available port).
- Client uses `client/src/utils/api.js` which sends stored `authToken` or `adminToken` automatically in the `Authorization` header.

## API Endpoints

- POST `/api/auth/register` — register a user (returns `token`)
- POST `/api/auth/login` — login a user (returns `token`)
- POST `/api/bookings` — create booking (protected, requires Bearer token)
- GET `/api/bookings/mine` — get current user's bookings (protected)
- GET `/api/bookings` — get all bookings (public)

- POST `/api/admin/login` — admin login (returns `token` with `isAdmin`)
- GET `/api/admin/customers` — admin-only: users + their bookings (requires admin token)

## Notes & Suggestions

- Change the seeded admin password and remove seeding in production.
- Consider HTTPS, rate-limiting, input validation, and CSRF protections for production.
- Add server-side role checks if admins and users share the same model.

If you want, I can:
- Start both servers and run a full signup → booking → real-time notification demo.
- Add payment integration or admin dashboard user management endpoints.

# Global-Holidays
