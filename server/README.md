# Express Backend for Final Report Project

## Setup
1. Open a terminal in `server/`
2. Run `npm install`
3. Copy `.env.example` to `.env` if needed
4. Update `MONGO_URI` in `.env` to your MongoDB connection string

## Run
- `npm run dev` for development with nodemon
- `npm start` for production

## API Endpoints
- `POST /api/auth/register` — register a new user
- `POST /api/auth/login` — login existing user
- `POST /api/bookings` — create a booking
- `GET /api/bookings` — list all bookings

## Notes
- Frontend proxy is configured in `client/package.json` to forward API calls to `http://localhost:5000`
- Booking requests come from `client/src/component/TourPackages/bookModel.jsx`
